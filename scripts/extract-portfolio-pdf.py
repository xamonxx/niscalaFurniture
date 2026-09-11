"""
Turn the studio's interior deck into portfolio images and a manifest.

The deck (BAHAN/PORTOFOLIO PROJECT INTERIOR.pdf) is a Photoshop PDF
Presentation: every page is a single flattened 2480x3508 JPEG holding a title
block and a collage of 3-9 photographs. There is no text layer and no embedded
per-photo image, so the individual photographs have to be cut back out of the
flattened page. The originals are not in BAHAN/ - this deck is the only copy
the studio still has.

Two signals find the cuts. Photographs carry texture and the cream paper does
not (mean |Laplacian| is about 60 inside a photo and about 3 on the page), so
low-texture rows and columns are gutters. That alone misses tiles that butt
together with only a hairline between them, so a second signal looks for
rows/columns where nearly every pixel sits on a strong Sobel edge - the shared
border of two touching photographs.

Detection is good but not perfect, so every editorial decision lives in
scripts/interior-pdf.config.json instead of here: explicit crop rectangles for
the pages the cut gets wrong, and an exclude list for tiles that must not ship
(photographs containing customers' faces, and any crop that came out dirty).
This script only derives; the config decides.

Output is deliberately kept off the BAHAN pipeline's territory:
public/images/interior/ and src/data/generated/interior-manifest.json are
written here and nowhere else, so `npm run prepare:images` cannot delete them.

    python scripts/extract-portfolio-pdf.py [--contact-sheets]

--contact-sheets writes numbered proof sheets to .tmp/interior-sheets/ instead
of images and a manifest. The numbers on those sheets are the indices the
config's `exclude` lists refer to.
"""

import io
import json
import os
import sys
from datetime import datetime, timezone
from shutil import rmtree

import cv2
import fitz
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, "scripts", "interior-pdf.config.json")
OUT_IMAGES = os.path.join(ROOT, "public", "images", "interior")
OUT_MANIFEST = os.path.join(ROOT, "src", "data", "generated", "interior-manifest.json")
SHEET_DIR = os.path.join(ROOT, ".tmp", "interior-sheets")

# Paper reads ~3, photographs ~60; 15 sits clear of JPEG noise in the margins.
TEXTURE_THRESHOLD = 15
# A shared border between two touching photos lights up nearly every pixel.
EDGE_THRESHOLD = 50
EDGE_COVERAGE = 0.90
# Below this, a run of clean pixels is page grain rather than a gutter.
GUTTER_COVERAGE = 0.10
# Smaller than this is a sliver of a neighbour, not a photograph worth shipping.
MIN_TILE = 250
MAX_DEPTH = 6
# The cut only accepts a split at least MIN_TILE in from a border, so a
# neighbour's edge closer than that survives as a stripe down the side of the
# crop. shave() sweeps exactly that blind band. The floor of 8 keeps it off the
# tile's own border, which is itself a full-span edge.
SEAM_MIN = 8
SEAM_MAX = MIN_TILE
SEAM_COVERAGE = 0.92
# Cards request around 384px wide, so anything narrower than this ships as an
# upscale. MIN_TILE stays lower because the cut still needs small tiles to
# reason about geometry - this only governs what is allowed to leave.
MIN_SHIP = 300


def load_page(doc, page_no, dpi):
    """Render one page and return it with its texture and edge masks."""
    pix = doc[page_no - 1].get_pixmap(dpi=dpi)
    rgb = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
        pix.height, pix.width, pix.n
    )[:, :, :3]
    grey = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    # A 3x3 box filter keeps texture from bleeding across a hairline gutter;
    # anything wider erases the thin gutters entirely.
    texture = cv2.boxFilter(
        np.abs(cv2.Laplacian(grey, cv2.CV_32F, ksize=3)), -1, (3, 3)
    )
    masks = {
        "texture": (texture > TEXTURE_THRESHOLD).astype(np.float32),
        "edge_x": (
            np.abs(cv2.Sobel(grey, cv2.CV_32F, 1, 0, ksize=3)) > EDGE_THRESHOLD
        ).astype(np.float32),
        "edge_y": (
            np.abs(cv2.Sobel(grey, cv2.CV_32F, 0, 1, ksize=3)) > EDGE_THRESHOLD
        ).astype(np.float32),
    }
    return rgb, masks


def candidates(texture_profile, edge_profile, span):
    """Cut positions along one axis, as (start, end, score) in profile space."""
    found = []

    clean = np.where(texture_profile < GUTTER_COVERAGE)[0]
    if len(clean):
        start = previous = clean[0]
        for value in clean[1:]:
            if value != previous + 1:
                # Wider gutters are likelier to be real, hence the width bonus.
                found.append((start, previous, (previous - start) + 40))
                start = value
            previous = value
        found.append((start, previous, (previous - start) + 40))

    for line in np.where(edge_profile > EDGE_COVERAGE)[0]:
        found.append((int(line), int(line), 30))

    return [c for c in found if c[0] >= MIN_TILE and c[1] <= span - MIN_TILE]


def split(masks, box, depth=0):
    """Recursive X-Y cut of one region into tile boxes."""
    x0, y0, x1, y1 = box
    texture = masks["texture"][y0:y1, x0:x1]
    height, width = texture.shape
    best = None

    if height >= MIN_TILE * 2:
        for cut in candidates(
            texture.mean(axis=1), masks["edge_y"][y0:y1, x0:x1].mean(axis=1), height
        ):
            if best is None or cut[2] > best[3]:
                best = ("h", cut[0], cut[1], cut[2])

    if width >= MIN_TILE * 2:
        for cut in candidates(
            texture.mean(axis=0), masks["edge_x"][y0:y1, x0:x1].mean(axis=0), width
        ):
            if best is None or cut[2] > best[3]:
                best = ("v", cut[0], cut[1], cut[2])

    if best is None or depth >= MAX_DEPTH:
        return [box]

    axis, start, end, _ = best
    middle = (start + end) // 2
    if axis == "h":
        return split(masks, (x0, y0, x1, y0 + middle), depth + 1) + split(
            masks, (x0, y0 + middle, x1, y1), depth + 1
        )
    return split(masks, (x0, y0, x0 + middle, y1), depth + 1) + split(
        masks, (x0 + middle, y0, x1, y1), depth + 1
    )


def trim(masks, box):
    """Shrink a box onto its content, twice - one pass leaves a pale rim."""
    texture = masks["texture"]
    for threshold in (GUTTER_COVERAGE, 0.25):
        x0, y0, x1, y1 = box
        region = texture[y0:y1, x0:x1]
        if region.size == 0:
            return None
        columns = np.where(region.mean(axis=0) > threshold)[0]
        rows = np.where(region.mean(axis=1) > threshold)[0]
        if not len(columns) or not len(rows):
            return None
        box = (
            x0 + int(columns[0]),
            y0 + int(rows[0]),
            x0 + int(columns[-1]) + 1,
            y0 + int(rows[-1]) + 1,
        )
    return box


def shave(masks, box):
    """Cut a neighbouring tile's stripe off the edge of a crop.

    Looks for a full-span straight edge in the band the recursive cut cannot
    reach, and drops everything outside it. One side per pass, because removing
    a stripe changes the profiles for every other side; a crop can carry one on
    three sides at once.
    """
    x0, y0, x1, y1 = box
    for _ in range(8):
        width, height = x1 - x0, y1 - y0
        if width < MIN_TILE or height < MIN_TILE:
            break

        columns = masks["edge_x"][y0:y1, x0:x1].mean(axis=0)
        rows = masks["edge_y"][y0:y1, x0:x1].mean(axis=1)
        limit_x = min(SEAM_MAX, width - MIN_TILE)
        limit_y = min(SEAM_MAX, height - MIN_TILE)
        moved = False

        for offset in range(SEAM_MIN, max(SEAM_MIN, limit_x)):
            if columns[offset] > SEAM_COVERAGE:
                x0 += offset + 2
                moved = True
                break
        if not moved:
            for offset in range(SEAM_MIN, max(SEAM_MIN, limit_x)):
                if columns[width - 1 - offset] > SEAM_COVERAGE:
                    x1 -= offset + 2
                    moved = True
                    break
        if not moved:
            for offset in range(SEAM_MIN, max(SEAM_MIN, limit_y)):
                if rows[offset] > SEAM_COVERAGE:
                    y0 += offset + 2
                    moved = True
                    break
        if not moved:
            for offset in range(SEAM_MIN, max(SEAM_MIN, limit_y)):
                if rows[height - 1 - offset] > SEAM_COVERAGE:
                    y1 -= offset + 2
                    moved = True
                    break

        if not moved:
            break

    return (x0, y0, x1, y1)


def tiles_for_page(masks, frame, override):
    """Tile boxes in reading order: banded top-to-bottom, then left-to-right."""
    if override:
        boxes = [tuple(box) for box in override]
    else:
        boxes = []
        for box in split(masks, tuple(frame)):
            trimmed = trim(masks, box)
            if trimmed is None:
                continue
            x0, y0, x1, y1 = trimmed
            if (x1 - x0) < MIN_TILE or (y1 - y0) < MIN_TILE:
                continue
            if masks["texture"][y0:y1, x0:x1].mean() < 0.30:
                continue
            boxes.append(trimmed)

    # Hand-authored rectangles get shaved too: they are drawn off a scaled
    # preview, so they land a few pixels into the neighbour just as often.
    cleaned = []
    for box in boxes:
        shaved = trim(masks, shave(masks, box))
        if shaved is None:
            continue
        x0, y0, x1, y1 = shaved
        if (x1 - x0) < MIN_TILE or (y1 - y0) < MIN_TILE:
            continue
        cleaned.append(shaved)

    # Band the rows so a slightly higher neighbour stays on the same line.
    cleaned.sort(key=lambda b: (b[1] // 200, b[0]))
    return cleaned


def orientation_of(width, height):
    ratio = width / height
    if ratio > 1.15:
        return "landscape"
    if ratio < 0.87:
        return "portrait"
    return "square"


def encode_webp(rgb, box, max_edge, max_bytes):
    """Match the archive pipeline's ladder: q78, step down by 10, floor 45."""
    x0, y0, x1, y1 = box
    image = Image.fromarray(rgb[y0:y1, x0:x1])
    image.thumbnail((max_edge, max_edge), Image.LANCZOS)

    quality = 78
    while True:
        buffer = io.BytesIO()
        image.save(buffer, "WEBP", quality=quality, method=5)
        data = buffer.getvalue()
        if len(data) <= max_bytes or quality <= 45:
            return data, image.width, image.height
        quality -= 10


def collect(doc, config, project):
    """Every tile of every page of one project, in order, before the cap."""
    out = []
    for page_no in project["pages"]:
        rgb, masks = load_page(doc, page_no, config["dpi"])
        override = project.get("boxes", {}).get(str(page_no))
        dropped = set(project.get("exclude", {}).get(str(page_no), []))
        boxes = tiles_for_page(masks, config["frame"], override)

        # exclude is positional, so a change in how a page tiles silently moves
        # every index after it - which once quietly dropped two good frames and
        # kept two broken ones. An out-of-range index is the visible half of
        # that failure, so it stops the run rather than warning.
        if dropped and max(dropped) > len(boxes):
            raise SystemExit(
                "%s: page %d excludes tile #%d but the page yields only %d. "
                "The tiling changed - re-check the exclude list against fresh "
                "contact sheets." % (project["slug"], page_no, max(dropped), len(boxes))
            )

        for index, box in enumerate(boxes, 1):
            undersized = (box[2] - box[0]) < MIN_SHIP or (box[3] - box[1]) < MIN_SHIP
            # Dropped rather than removed, so the indices `exclude` refers to
            # stay put.
            out.append((page_no, index, box, rgb, index in dropped or undersized))
    return out


def contact_sheets(doc, config):
    """A proof sheet per project, numbered as the config's exclude list sees it."""
    os.makedirs(SHEET_DIR, exist_ok=True)
    for project in config["projects"]:
        thumbs = []
        for page_no, index, box, rgb, dropped in collect(doc, config, project):
            x0, y0, x1, y1 = box
            crop = cv2.cvtColor(rgb[y0:y1, x0:x1], cv2.COLOR_RGB2BGR)
            scale = 320.0 / crop.shape[0]
            crop = cv2.resize(crop, (max(1, int(crop.shape[1] * scale)), 320))
            label = "p%d #%d%s" % (page_no, index, " DROP" if dropped else "")
            colour = (0, 0, 220) if dropped else (40, 40, 40)
            cv2.rectangle(crop, (0, 0), (crop.shape[1] - 1, 319), colour, 3)
            cv2.rectangle(crop, (0, 0), (168, 32), colour, -1)
            cv2.putText(
                crop, label, (6, 23), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2
            )
            thumbs.append(crop)

        if not thumbs:
            print("  !! %s produced no tiles" % project["slug"])
            continue

        width = sum(t.shape[1] + 8 for t in thumbs)
        sheet = np.full((320, width, 3), 255, np.uint8)
        offset = 0
        for thumb in thumbs:
            sheet[:, offset : offset + thumb.shape[1]] = thumb
            offset += thumb.shape[1] + 8
        cv2.imwrite(os.path.join(SHEET_DIR, project["slug"] + ".png"), sheet)
        print("  %-52s %d tiles" % (project["slug"], len(thumbs)))


def build(doc, config):
    if os.path.isdir(OUT_IMAGES):
        rmtree(OUT_IMAGES)

    entries = []
    total_bytes = 0
    source_name = os.path.basename(config["source"])

    for project in config["projects"]:
        # Excluding before the cap matters: a face-bearing tile must not eat one
        # of the six slots and push a usable photograph off the end.
        selected = [t for t in collect(doc, config, project) if not t[4]]
        selected = selected[: config["maxPhotos"]]
        if not selected:
            print("  !! %s produced no usable tiles" % project["slug"])
            continue

        out_dir = os.path.join(OUT_IMAGES, project["categorySlug"])
        os.makedirs(out_dir, exist_ok=True)

        images = []
        for position, (page_no, index, box, rgb, _) in enumerate(selected, 1):
            data, width, height = encode_webp(
                rgb, box, config["maxEdge"], config["maxBytes"]
            )
            name = "%s-%02d.webp" % (project["slug"], position)
            with open(os.path.join(out_dir, name), "wb") as handle:
                handle.write(data)
            total_bytes += len(data)
            images.append(
                {
                    "src": "/images/interior/%s/%s" % (project["categorySlug"], name),
                    "width": width,
                    "height": height,
                    "orientation": orientation_of(width, height),
                    "bytes": len(data),
                    # A real re-crop instruction, so every image traces back to
                    # the exact rectangle of the exact page it came from.
                    "source": "%s#page=%d&box=%d,%d,%d,%d"
                    % (source_name, page_no, box[0], box[1], box[2], box[3]),
                }
            )

        if project.get("cover"):
            wanted = "%s-%s.webp" % (project["slug"], project["cover"])
            cover = next((i for i in images if i["src"].endswith(wanted)), images[0])
        else:
            cover = next(
                (i for i in images if i["orientation"] == "landscape"), images[0]
            )

        entries.append(
            {
                "slug": project["slug"],
                "categorySlug": project["categorySlug"],
                "client": None,
                "venue": project["venue"],
                "location": project["location"],
                "style": None,
                "year": None,
                "coverImage": cover["src"],
                "coverOrientation": cover["orientation"],
                "images": images,
            }
        )
        print("  %-52s %d photos" % (project["slug"], len(images)))

    slugs = [entry["slug"] for entry in entries]
    duplicates = sorted({s for s in slugs if slugs.count(s) > 1})
    if duplicates:
        raise SystemExit("Duplicate slugs in config: %s" % ", ".join(duplicates))

    stamp = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
    manifest = {
        "generatedAt": stamp.replace("+00:00", "Z"),
        "source": config["source"],
        "projects": entries,
    }
    with io.open(OUT_MANIFEST, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")

    photos = sum(len(e["images"]) for e in entries)
    print("")
    print("Wrote %d webp images, %.2f MB total." % (photos, total_bytes / 1024 / 1024))
    print("Projects in manifest: %d" % len(entries))
    print("Manifest: src/data/generated/interior-manifest.json")


def main():
    with io.open(CONFIG, encoding="utf-8") as handle:
        config = json.load(handle)

    pdf = os.path.join(ROOT, config["source"])
    if not os.path.isfile(pdf):
        print("Source deck not found: %s" % config["source"], file=sys.stderr)
        print("This script only runs where BAHAN/ is present.", file=sys.stderr)
        raise SystemExit(1)

    doc = fitz.open(pdf)
    if "--contact-sheets" in sys.argv:
        contact_sheets(doc, config)
        print("")
        print("Sheets: .tmp/interior-sheets/")
    else:
        build(doc, config)


if __name__ == "__main__":
    main()
