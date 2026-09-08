/**
 * NISCALA FURNITURE - image pipeline
 *
 * Reads the raw photography in BAHAN/BAHAN PORTOFOLIO, derives real project
 * metadata from the file names, and emits:
 *
 *   public/images/portfolio/<category>/<project>-NN.webp
 *   public/logo/*                                          (brand marks)
 *   src/data/generated/portfolio-manifest.json             (data seed)
 *
 * Run with:  npm run prepare:images
 *
 * The raw folder never ships. This script is the only bridge between the
 * 342 MB source archive and the ~12 MB that actually gets deployed.
 */

import { mkdir, readdir, readFile, rm, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import heicConvert from "heic-convert";

// Keep libvips memory flat: the archive contains 3000px+ frames and the
// shared cache made the largest ones fail on Windows.
sharp.cache(false);
sharp.concurrency(1);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "BAHAN", "BAHAN PORTOFOLIO");
const LOGO_SOURCE = path.join(ROOT, "BAHAN", "LOGO");
const PROCESS_SOURCE = path.join(ROOT, "BAHAN", "ALUR KERJA");
const OUT_IMAGES = path.join(ROOT, "public", "images");
const OUT_LOGO = path.join(ROOT, "public", "logo");
const OUT_MANIFEST = path.join(ROOT, "src", "data", "generated");

/** Longest edge, in px, of the largest variant we ship. */
const MAX_EDGE = 1600;
/** Hard ceiling per file. Anything above is re-encoded at lower quality. */
const MAX_BYTES = 400 * 1024;
/** Never publish more than this many photos for a single project. */
const MAX_PHOTOS_PER_PROJECT = 6;

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".heic", ".webp"]);

/* ------------------------------------------------------------------ */
/* Category mapping                                                    */
/* ------------------------------------------------------------------ */

/**
 * Raw folder name -> canonical category. "BACDROP TV" is a typo in the source
 * archive and is corrected here rather than in the file system.
 */
const CATEGORIES = {
  KITCHENSET: {
    slug: "kitchen-set",
    name: "Kitchen Set & Pantry",
    short: "Kitchen Set",
  },
  WARDROBE: {
    slug: "wardrobe",
    name: "Custom Wardrobe & Closet",
    short: "Wardrobe",
  },
  BEDROOM: {
    slug: "bedroom",
    name: "Bedroom Interior",
    short: "Bedroom",
  },
  "BACDROP TV": {
    slug: "tv-backdrop",
    name: "TV Backdrop & Console",
    short: "TV Backdrop",
  },
  "LEMARI BAWAH TANGGA": {
    slug: "lemari-bawah-tangga",
    name: "Lemari Bawah Tangga",
    short: "Bawah Tangga",
  },
  "INTERIOR TOKO": {
    slug: "interior-komersial",
    name: "Interior Toko & Komersial",
    short: "Komersial",
  },
  APARTEMEN: {
    slug: "apartemen",
    name: "Interior Apartemen",
    short: "Apartemen",
  },
  "BEFORE-AFTER": {
    slug: "before-after",
    name: "Before & After",
    short: "Before After",
  },
};

/** Finishing styles that appear as sub-folders or filename prefixes. */
const STYLES = {
  MODERN: "Modern",
  "SEMI CLASSIC": "Semi Classic",
  SEMIKLASIK: "Semi Klasik",
  KLASIK: "Klasik",
  MINIMALIS: "Minimalis",
  "FINISHING DUCO": "Finishing Duco",
  "SEMI & FULLHOME": "Semi & Full Home",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Honorifics carry meaning in Indonesian and should survive title-casing
 * intact rather than becoming "Bpk" -> "Bpk".
 */
function normaliseClient(raw) {
  let name = raw
    .replace(/^\d+\s*[.\-]?\s*/, "") // strip the leading project number
    .replace(/\.(jpe?g|png|heic)$/i, "")
    .trim();

  name = name
    .replace(/^bpk\.?\s+/i, "Bpk. ")
    .replace(/^ibu\s+/i, "Ibu ")
    .replace(/^pak\s+/i, "Pak ")
    .replace(/^bu\s+/i, "Ibu ");

  const hasHonorific = /^(Bpk\.|Ibu|Pak)\s/.test(name);
  if (hasHonorific) {
    const [honorific, ...rest] = name.split(/\s+/);
    return `${honorific} ${titleCase(rest.join(" "))}`.trim();
  }
  return titleCase(name);
}

/** Locations are proper nouns; a few need a canonical spelling. */
const LOCATION_FIXES = {
  jakpus: "Jakarta Pusat",
  jaksel: "Jakarta Selatan",
  ciskul: "Cisitu Lama",
  "bojong soang": "Bojongsoang",
  "buah batu regensi": "Buah Batu Regensi",
  "prima amerta residence, soreang": "Soreang",
  "perum. teduh sariwangi": "Sariwangi",
  "subang, pantura": "Subang",
  banjarnegara: "Banjarnegara",
};

/**
 * Tokens that are archive housekeeping rather than project metadata. They must
 * never surface as a client name on the public site.
 */
const NOISE = new Set([
  "new folder",
  "folder",
  "untitled",
  "img",
  "image",
  "copy",
]);

/** True when a token is really a category or finishing-style label. */
function isLabelToken(value) {
  const key = String(value).trim().toUpperCase();
  if (Object.prototype.hasOwnProperty.call(CATEGORIES, key)) return true;
  if (Object.prototype.hasOwnProperty.call(STYLES, key)) return true;
  return NOISE.has(String(value).trim().toLowerCase());
}

function normaliseLocation(raw) {
  let cleaned = raw.replace(/\.(jpe?g|png|heic)$/i, "").trim();

  // "Batujajar finishing duco" -> "Batujajar": the archive often appends the
  // finishing style to the location segment.
  for (const key of Object.keys(STYLES)) {
    cleaned = cleaned.replace(new RegExp(`\\s*${key}\\s*$`, "i"), "").trim();
  }
  cleaned = cleaned.replace(/\s*finishing\s+\w+\s*$/i, "").trim();

  if (!cleaned || isLabelToken(cleaned)) return null;

  const key = cleaned.toLowerCase();
  if (LOCATION_FIXES[key]) return LOCATION_FIXES[key];
  for (const [needle, fixed] of Object.entries(LOCATION_FIXES)) {
    if (key.includes(needle)) return fixed;
  }
  return titleCase(cleaned);
}

/**
 * Split a folder-style token that packs a client and a location together:
 *
 *   "12.IBU YENI - RANCAEKEK"   -> Ibu Yeni    / Rancaekek
 *   "10.pak yuki- soreang"      -> Pak Yuki    / Soreang   (no space before -)
 *   "23.Pak Yudi jakpus"        -> Pak Yudi    / Jakarta Pusat
 *   "New folder"                -> null        / null
 */
function parseClientLocationToken(token) {
  const empty = { client: null, location: null };
  if (!token || isLabelToken(token)) return empty;

  const parts = token
    .split(/\s*-\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const client = normaliseClient(parts[0]);
    const location = normaliseLocation(parts.slice(1).join(" - "));
    return {
      client: client && !isLabelToken(client) ? client : null,
      location,
    };
  }

  // Single part: the trailing word may still be a known location shorthand.
  const withoutNumber = token.replace(/^\d+\s*[.\-]?\s*/, "").trim();
  if (!withoutNumber || isLabelToken(withoutNumber)) return empty;

  const tokens = withoutNumber.split(/\s+/);
  if (tokens.length > 1) {
    const tail = tokens[tokens.length - 1].toLowerCase();
    if (LOCATION_FIXES[tail]) {
      return {
        client: normaliseClient(tokens.slice(0, -1).join(" ")),
        location: LOCATION_FIXES[tail],
      };
    }
  }

  const client = normaliseClient(withoutNumber);
  return { client: client && !isLabelToken(client) ? client : null, location: null };
}

/**
 * Source file names encode genuine project metadata, in two shapes:
 *
 *   "LEMARI BAWAH TANGGA - 14.Dara - Arcamanik - 23 - 05 - 2023 - 001.jpg"
 *   "WARDROBE - 7. Ira - Ciwastra - 19 - 10 - 2023 - 002.jpg"
 *
 * i.e. <prefix> - <n.client> - <location> - <dd> - <mm> - <yyyy> - <seq>
 *
 * Numbered files inside a named sub-folder ("MODERN/3.jpeg") carry no metadata
 * of their own, so the parent folder supplies it.
 */
function parseMetadata(fileName, folderChain) {
  const base = fileName.replace(/\.[^.]+$/, "");
  const segments = base.split(/\s+-\s+/).map((s) => s.trim());

  const result = {
    client: null,
    location: null,
    year: null,
    month: null,
    day: null,
    style: null,
    sequence: null,
  };

  // Style prefix, wherever it appears in the chain or the filename.
  const haystack = [...folderChain, base].join(" | ").toUpperCase();
  for (const [key, label] of Object.entries(STYLES)) {
    if (haystack.includes(key)) {
      result.style = label;
      break;
    }
  }

  // dd - mm - yyyy triple anywhere in the segment list.
  for (let i = 0; i < segments.length - 2; i += 1) {
    const [d, m, y] = segments.slice(i, i + 3);
    if (/^\d{1,2}$/.test(d) && /^\d{1,2}$/.test(m) && /^\d{4}$/.test(y)) {
      result.day = Number(d);
      result.month = Number(m);
      result.year = Number(y);
      const seq = segments[i + 3];
      if (seq && /^\d+$/.test(seq)) result.sequence = Number(seq);

      // The two segments before the date are client and location - unless the
      // first of them is just the category or style prefix the archive puts in
      // front of every file, in which case the single remaining segment packs
      // both ("APARTEMEN - 23.Pak Yudi jakpus - 03 - 04 - 2024 - 010").
      const clientSegment = i >= 2 ? segments[i - 2] : null;
      const locationSegment = i >= 1 ? segments[i - 1] : null;

      if (clientSegment && !isLabelToken(clientSegment)) {
        const client = normaliseClient(clientSegment);
        result.client = isLabelToken(client) ? null : client;
        result.location = normaliseLocation(locationSegment ?? "");
      } else if (locationSegment) {
        const packed = parseClientLocationToken(locationSegment);
        result.client = packed.client;
        result.location = packed.location;
      }
      break;
    }
  }

  // Folder-derived metadata: "23.Pak Yudi jakpus", "8 .Ibu Qisty - Soreang".
  if (!result.client || !result.location) {
    for (const folder of [...folderChain].reverse()) {
      if (isLabelToken(folder)) continue;
      const packed = parseClientLocationToken(folder);
      result.client ??= packed.client;
      result.location ??= packed.location;
      break;
    }
  }

  // Filename-only date, e.g. "2024_07_26_17_26_IMG_5542.JPG".
  if (!result.year) {
    const stamp = base.match(/^(\d{4})_(\d{2})_(\d{2})/);
    if (stamp) {
      result.year = Number(stamp[1]);
      result.month = Number(stamp[2]);
      result.day = Number(stamp[3]);
    }
  }

  return result;
}

async function collectFiles(dir, chain = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(full, [...chain, entry.name])));
    } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push({ full, name: entry.name, chain });
    }
  }
  return files;
}

async function loadPixels(filePath) {
  if (path.extname(filePath).toLowerCase() === ".heic") {
    const raw = await readFile(filePath);
    const jpeg = await heicConvert({
      buffer: raw,
      format: "JPEG",
      quality: 0.94,
    });
    return sharp(Buffer.from(jpeg));
  }
  return sharp(filePath, { failOn: "none" });
}

/**
 * Encode one already-decoded frame to webp, dropping quality until it fits the
 * budget.
 *
 * Takes raw pixels rather than a sharp pipeline: re-cloning a pipeline decodes
 * the 3000px source once per attempt, which exhausted libvips memory on the
 * largest files ("VipsJpeg: Insufficient memory"). Decoding once and encoding
 * from the pixel buffer keeps peak memory flat.
 *
 * Only webp is written. `next/image` derives the avif/webp variants browsers
 * actually receive from this file, so a second static format here would be
 * megabytes that nothing ever references.
 */
async function encode(frame, outBase) {
  const fromRaw = () =>
    sharp(frame.data, {
      raw: {
        width: frame.info.width,
        height: frame.info.height,
        channels: frame.info.channels,
      },
    });

  let quality = 78;
  let webpBuffer = await fromRaw().webp({ quality, effort: 5 }).toBuffer();

  while (webpBuffer.length > MAX_BYTES && quality > 45) {
    quality -= 10;
    webpBuffer = await fromRaw().webp({ quality, effort: 5 }).toBuffer();
  }

  await writeFile(`${outBase}.webp`, webpBuffer);

  return { webpBytes: webpBuffer.length };
}

/* ------------------------------------------------------------------ */
/* Order process                                                       */
/* ------------------------------------------------------------------ */

/**
 * The six frames that illustrate the order process, in the order the steps
 * appear in `processSteps`.
 *
 * These are staged studio photographs rather than portfolio work, so they live
 * outside BAHAN PORTOFOLIO and never enter the project grouping. `match` lists
 * the file names accepted for a step - the archive spells step 04 with a typo
 * ("PERNAWARAN"), which is tolerated here rather than renamed on disk.
 */
const PROCESS_FRAMES = [
  {
    index: "01",
    slug: "konsultasi",
    match: ["KONSULTASI"],
    alt: "Konsultan Niscala menjelaskan sampel material HPL kepada pasangan klien di studio",
  },
  {
    index: "02",
    slug: "survey-lokasi",
    match: ["SURVEY-LOKASI", "SURVEY LOKASI"],
    alt: "Tim teknis Niscala mengukur dinding dengan laser meter dan mencatat posisi stop kontak di lokasi",
  },
  {
    index: "03",
    slug: "desain",
    match: ["DESAIN"],
    alt: "Desainer Niscala menyusun visual 3D kitchen set di studio",
  },
  {
    index: "04",
    slug: "penawaran-rab",
    match: ["PENAWARAN-RAB", "PERNAWARAN-RAB", "PENAWARAN RAB"],
    alt: "Presentasi Rancangan Anggaran Biaya beserta rincian material dan estimasi waktu kepada klien",
  },
  {
    index: "05",
    slug: "produksi",
    match: ["PRODUKSI"],
    alt: "Pengrajin memotong panel di workshop Niscala",
  },
  {
    index: "06",
    slug: "pengiriman-pemasangan",
    match: ["PENGIRIMAN PEMASANGAN", "PENGIRIMAN-PEMASANGAN"],
    alt: "Modul dikirim terbungkus pelindung, dipasang di lokasi, lalu berita acara serah terima ditandatangani bersama klien",
  },
];

/**
 * Encode the order-process frames into public/images/process.
 *
 * Runs after the portfolio pass, which wipes OUT_IMAGES wholesale, so these
 * files are written rather than merely left in place.
 */
async function buildProcessImages() {
  const outDir = path.join(OUT_IMAGES, "process");
  await mkdir(outDir, { recursive: true });

  let available;
  try {
    available = await collectFiles(PROCESS_SOURCE);
  } catch {
    console.warn(`  skip process frames: ${PROCESS_SOURCE} not found`);
    return [];
  }

  const frames = [];

  for (const step of PROCESS_FRAMES) {
    const file = available.find((candidate) =>
      step.match.includes(path.parse(candidate.name).name.toUpperCase())
    );

    if (!file) {
      console.warn(`  missing process frame ${step.index}: ${step.match[0]}`);
      continue;
    }

    const outBase = path.join(outDir, `${step.index}-${step.slug}`);
    const input = await loadPixels(file.full);
    const frame = await input
      .rotate()
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { webpBytes } = await encode(frame, outBase);
    const { width, height } = frame.info;
    const ratio = width / height;

    frames.push({
      step: step.index,
      src: `/images/process/${path.basename(outBase)}.webp`,
      width,
      height,
      orientation:
        ratio > 1.15 ? "landscape" : ratio < 0.87 ? "portrait" : "square",
      bytes: webpBytes,
      alt: step.alt,
      source: path.relative(ROOT, file.full).replace(/\\/g, "/"),
    });
  }

  return frames;
}

/* ------------------------------------------------------------------ */
/* Logo                                                                */
/* ------------------------------------------------------------------ */

async function buildLogos() {
  await mkdir(OUT_LOGO, { recursive: true });

  const source = path.join(LOGO_SOURCE, "niscalafurniture.png");
  const base = sharp(source).trim({ threshold: 5 });
  const { width, height } = await base.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);

  // The supplied PNG is a white wordmark on transparency: perfect on dark or
  // yellow, invisible on the warm-white surface. Recolour a dark twin for
  // light backgrounds by tinting the alpha mask.
  const trimmed = await base.clone().resize({ width: 1200, withoutEnlargement: true }).png().toBuffer();
  await writeFile(path.join(OUT_LOGO, "niscala-wordmark-light.png"), trimmed);

  const alpha = await sharp(trimmed).extractChannel("alpha").toBuffer();
  const { width: w, height: h } = await sharp(trimmed).metadata();
  const dark = await sharp({
    create: { width: w, height: h, channels: 3, background: "#111315" },
  })
    .joinChannel(alpha)
    .png()
    .toBuffer();
  await writeFile(path.join(OUT_LOGO, "niscala-wordmark-dark.png"), dark);

  return { sourceWidth: width, sourceHeight: height, wordmark: trimmed };
}

/* ------------------------------------------------------------------ */
/* App icons                                                           */
/* ------------------------------------------------------------------ */

/** Brand yellow, from DESIGN.md (the source JPEG samples as rgb(253,180,5)). */
const BRAND_YELLOW = "#feb302";

/** The circular logo, supplied as artwork rather than composed here. */
const ROUND_MARK_FILE = "favicon.png";

/**
 * How much of a square tile the monogram takes up.
 *
 * Matched to the round mark, where the letter is 50.9% of the disc. A touch
 * under that here, because iOS and Android crop these tiles with their own
 * mask and the corners have to stay clear.
 */
const TILE_COVERAGE = 0.47;

/**
 * Lift the white "n" out of the round mark as a tight, transparent PNG.
 *
 * The square tiles cannot use the round artwork directly - iOS and Android
 * apply their own mask, so a circle inside would leave a ring of dead corners.
 * They get the letterform on a full-bleed yellow ground instead, and taking it
 * from the finished mark keeps it identical to the round version.
 *
 * The box is measured from the glyph itself rather than trimmed, so what gets
 * centred later is the letter, not a buffer with padding around it.
 */
async function monogramFromMark(source) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const isInk = (i) =>
    data[i + 3] > 200 &&
    data[i] > 230 &&
    data[i + 1] > 230 &&
    data[i + 2] > 230;

  let minX = info.width;
  let maxX = -1;
  let minY = info.height;
  let maxY = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (!isInk((y * info.width + x) * info.channels)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) throw new Error(`No white monogram found in ${source}`);

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const alpha = Buffer.alloc(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = ((y + minY) * info.width + (x + minX)) * info.channels;
      alpha[y * width + x] = isInk(i) ? 255 : 0;
    }
  }

  return sharp({
    create: { width, height, channels: 3, background: "#ffffff" },
  })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
}

/**
 * Measure the supplied round mark: the disc, the glyph, and the disc colour.
 *
 * The colour is sampled from the artwork rather than taken from the brand
 * token, because the two differ by a hair (#fdb703 against #feb302) and the
 * rebuilt disc has to be indistinguishable from the file it came from.
 */
async function measureRoundMark(source) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const at = (x, y) => (y * info.width + x) * info.channels;
  const isInk = (i) =>
    data[i + 3] > 200 &&
    data[i] > 230 &&
    data[i + 1] > 230 &&
    data[i + 2] > 230;

  const disc = { minX: info.width, maxX: -1, minY: info.height, maxY: -1 };
  const glyph = { minX: info.width, maxX: -1, minY: info.height, maxY: -1 };

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = at(x, y);
      if (data[i + 3] > 32) {
        if (x < disc.minX) disc.minX = x;
        if (x > disc.maxX) disc.maxX = x;
        if (y < disc.minY) disc.minY = y;
        if (y > disc.maxY) disc.maxY = y;
      }
      if (isInk(i)) {
        if (x < glyph.minX) glyph.minX = x;
        if (x > glyph.maxX) glyph.maxX = x;
        if (y < glyph.minY) glyph.minY = y;
        if (y > glyph.maxY) glyph.maxY = y;
      }
    }
  }

  const discWidth = disc.maxX - disc.minX + 1;
  const glyphWidth = glyph.maxX - glyph.minX + 1;

  // Average a few points on the disc, well clear of the letter.
  const cx = Math.round((disc.minX + disc.maxX) / 2);
  const cy = Math.round((disc.minY + disc.maxY) / 2);
  const inset = Math.round(discWidth * 0.12);
  const points = [
    [cx, disc.minY + inset],
    [cx, disc.maxY - inset],
    [disc.minX + inset, cy],
    [disc.maxX - inset, cy],
  ];
  const total = points.reduce(
    (sum, [x, y]) => {
      const i = at(x, y);
      return [sum[0] + data[i], sum[1] + data[i + 1], sum[2] + data[i + 2]];
    },
    [0, 0, 0]
  );
  const channel = (v) =>
    Math.round(v / points.length)
      .toString(16)
      .padStart(2, "0");

  return {
    fill: `#${channel(total[0])}${channel(total[1])}${channel(total[2])}`,
    /** What share of the disc the letter occupies in the original. */
    glyphShare: glyphWidth / discWidth,
  };
}

/**
 * Redraw the round mark with the letter dead centre.
 *
 * The supplied artwork sits about 0.8% of its width low - imperceptible at
 * full size, plainly off at 16px. Rather than nudge a bitmap, the disc is
 * redrawn in its own sampled colour and the letter, lifted from that same
 * artwork, is placed on the exact centre.
 */
async function roundIcon(source, size, { fill, glyphShare }, mark) {
  const markMeta = await sharp(mark).metadata();
  const width = Math.max(1, Math.round(size * glyphShare));
  const height = Math.max(
    1,
    Math.round((markMeta.height / markMeta.width) * width)
  );

  const glyph = await sharp(mark)
    .resize(width, height, { fit: "fill" })
    .toBuffer();

  const disc = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${fill}"/></svg>`
  );

  return sharp(disc)
    .composite([
      {
        input: glyph,
        left: Math.round((size - width) / 2),
        top: Math.round((size - height) / 2),
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Compose a square tile: brand-yellow ground, white mark centred on it.
 *
 * `coverage` is the share of the tile the mark's longest side takes up.
 */
async function composeTile({ size, mark, coverage }) {
  const markMeta = await sharp(mark).metadata();
  const target = Math.round(size * coverage);
  const scale = Math.min(target / markMeta.width, target / markMeta.height);
  const markWidth = Math.max(1, Math.round(markMeta.width * scale));
  const markHeight = Math.max(1, Math.round(markMeta.height * scale));

  const resized = await sharp(mark)
    .resize(markWidth, markHeight, { fit: "fill" })
    .toBuffer();

  const ground = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${BRAND_YELLOW}"/></svg>`
  );

  return sharp(ground)
    .composite([
      {
        input: resized,
        left: Math.round((size - markWidth) / 2),
        top: Math.round((size - markHeight) / 2),
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Pack PNGs into a classic .ico.
 *
 * sharp cannot write ICO, and the format is small enough to assemble by hand:
 * a 6-byte header, one 16-byte directory entry per size, then the PNG blobs
 * (Vista and later accept PNG-compressed entries).
 */
function encodeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];

  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette size
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function buildIcons(wordmark) {
  // The finished round mark, drawn by the studio. Everything below is derived
  // from it, so the tab icon is the real artwork rather than a reconstruction.
  const roundMark = path.join(LOGO_SOURCE, ROUND_MARK_FILE);
  try {
    await stat(roundMark);
  } catch {
    throw new Error(
      `Round mark not found: ${roundMark}. Drop the circular logo there as ${ROUND_MARK_FILE}.`
    );
  }

  const mark = await monogramFromMark(roundMark);
  const disc = await measureRoundMark(roundMark);

  // Browser tab and bookmark icon.
  await writeFile(
    path.join(ROOT, "src", "app", "icon.png"),
    await roundIcon(roundMark, 512, disc, mark)
  );

  // iOS masks the artwork itself, so this one must be a full-bleed square.
  await writeFile(
    path.join(ROOT, "src", "app", "apple-icon.png"),
    await composeTile({ size: 180, mark, coverage: TILE_COVERAGE })
  );

  // Installable-app icons. At 512px the full wordmark is finally legible, so
  // the large tile carries the name rather than the monogram.
  await writeFile(
    path.join(OUT_LOGO, "icon-192.png"),
    await composeTile({ size: 192, mark, coverage: TILE_COVERAGE })
  );
  await writeFile(
    path.join(OUT_LOGO, "icon-512.png"),
    await composeTile({ size: 512, mark: wordmark, coverage: 0.78 })
  );

  // Legacy /favicon.ico, still probed by crawlers and older browsers. Same
  // artwork at three sizes, so the tab shows one mark whichever file the
  // browser decides to use.
  const icoImages = [];
  for (const size of [16, 32, 48]) {
    icoImages.push({ size, data: await roundIcon(roundMark, size, disc, mark) });
  }
  await writeFile(
    path.join(ROOT, "src", "app", "favicon.ico"),
    encodeIco(icoImages)
  );

  return { monogramWidth: (await sharp(mark).metadata()).width };
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  try {
    await stat(SOURCE);
  } catch {
    console.error(`Source archive not found: ${SOURCE}`);
    console.error("This script only runs on a machine that has BAHAN/ present.");
    process.exit(1);
  }

  // Redrawing the icons must not mean reprocessing the whole photo archive:
  // `npm run prepare:images -- --icons-only` touches nothing else.
  if (process.argv.includes("--icons-only")) {
    const logoInfo = await buildLogos();
    const iconInfo = await buildIcons(logoInfo.wordmark);
    console.log(
      `Icons only: monogram ${iconInfo.monogramWidth}px wide -> favicon.ico, icon.png, apple-icon.png, icon-192/512`
    );
    return;
  }

  console.log("Cleaning previous output...");
  await rm(OUT_IMAGES, { recursive: true, force: true });
  await mkdir(OUT_IMAGES, { recursive: true });
  await mkdir(OUT_MANIFEST, { recursive: true });

  const files = await collectFiles(SOURCE);
  console.log(`Found ${files.length} source images.`);

  /** projectKey -> project record */
  const projects = new Map();

  for (const file of files) {
    const categoryFolder = file.chain[0];
    const category = CATEGORIES[categoryFolder];
    if (!category) {
      console.warn(`  skip (unknown category): ${file.chain.join("/")}`);
      continue;
    }

    const meta = parseMetadata(file.name, file.chain);

    // Group photos into projects. A named client is the strongest signal.
    // Failing that, a style sub-folder ("KITCHENSET/MODERN") is one gallery.
    // Failing that, fall back to the shoot month so photos taken years apart
    // do not collapse into a single fictional "project".
    let groupLabel;
    if (meta.client) {
      groupLabel = meta.client;
    } else if (file.chain[1]) {
      groupLabel = file.chain[1];
    } else if (meta.year) {
      groupLabel = `${category.short} ${meta.year}-${String(meta.month ?? 0).padStart(2, "0")}`;
    } else {
      groupLabel = category.short;
    }

    const projectKey = `${category.slug}/${slugify(groupLabel)}${
      meta.client && meta.location ? `-${slugify(meta.location)}` : ""
    }`;

    if (!projects.has(projectKey)) {
      projects.set(projectKey, {
        key: projectKey,
        category,
        client: meta.client,
        location: meta.location,
        style: meta.style,
        year: meta.year,
        photos: [],
      });
    }

    const project = projects.get(projectKey);
    project.client ??= meta.client;
    project.location ??= meta.location;
    project.style ??= meta.style;
    project.year ??= meta.year;
    project.photos.push({ file, meta });
  }

  console.log(`Grouped into ${projects.size} projects.`);

  const manifest = { generatedAt: new Date().toISOString(), projects: [] };
  let totalBytes = 0;
  let written = 0;

  for (const project of projects.values()) {
    project.photos.sort(
      (a, b) => (a.meta.sequence ?? 0) - (b.meta.sequence ?? 0)
    );

    const projectSlug = project.key.split("/")[1];
    const outDir = path.join(OUT_IMAGES, "portfolio", project.category.slug);
    await mkdir(outDir, { recursive: true });

    const images = [];
    let index = 0;

    for (const photo of project.photos) {
      if (images.length >= MAX_PHOTOS_PER_PROJECT) break;
      index += 1;

      const outBase = path.join(
        outDir,
        `${projectSlug}-${String(index).padStart(2, "0")}`
      );

      try {
        const input = await loadPixels(photo.file.full);
        const frame = await input
          .rotate()
          .resize({
            width: MAX_EDGE,
            height: MAX_EDGE,
            fit: "inside",
            withoutEnlargement: true,
          })
          .raw()
          .toBuffer({ resolveWithObject: true });

        const { webpBytes } = await encode(frame, outBase);
        const { width, height } = frame.info;
        const ratio = width / height;

        totalBytes += webpBytes;
        written += 1;

        images.push({
          src: `/images/portfolio/${project.category.slug}/${path.basename(outBase)}.webp`,
          width,
          height,
          orientation:
            ratio > 1.15 ? "landscape" : ratio < 0.87 ? "portrait" : "square",
          bytes: webpBytes,
          source: path.relative(ROOT, photo.file.full).replace(/\\/g, "/"),
        });
      } catch (error) {
        console.warn(`  failed: ${photo.file.name} - ${error.message}`);
      }
    }

    if (images.length === 0) continue;

    // The cover is the widest available frame: landscape crops read better in
    // the editorial hero and card slots.
    const cover =
      images.find((image) => image.orientation === "landscape") ?? images[0];

    manifest.projects.push({
      slug: projectSlug,
      categorySlug: project.category.slug,
      categoryName: project.category.name,
      categoryShort: project.category.short,
      client: project.client,
      location: project.location,
      style: project.style,
      year: project.year,
      coverImage: cover.src,
      coverOrientation: cover.orientation,
      images,
    });
  }

  manifest.projects.sort((a, b) => {
    if (a.categorySlug !== b.categorySlug)
      return a.categorySlug.localeCompare(b.categorySlug);
    return (b.year ?? 0) - (a.year ?? 0);
  });

  const processFrames = await buildProcessImages();
  manifest.process = processFrames;
  totalBytes += processFrames.reduce((sum, frame) => sum + frame.bytes, 0);
  written += processFrames.length;

  const logoInfo = await buildLogos();
  const iconInfo = await buildIcons(logoInfo.wordmark);

  await writeFile(
    path.join(OUT_MANIFEST, "portfolio-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  const mb = (totalBytes / 1024 / 1024).toFixed(2);
  console.log("");
  console.log(`Wrote ${written} webp images, ${mb} MB total.`);
  console.log(`Projects in manifest: ${manifest.projects.length}`);
  console.log(`Process frames: ${processFrames.length}/${PROCESS_FRAMES.length}`);
  console.log(`Logo source: ${logoInfo.sourceWidth}x${logoInfo.sourceHeight}`);
  console.log(`Icons: monogram ${iconInfo.monogramWidth}px wide -> favicon.ico, icon.png, apple-icon.png, icon-192/512`);
  console.log("Manifest: src/data/generated/portfolio-manifest.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
