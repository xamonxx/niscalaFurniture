/**
 * NISCALA FURNITURE - blur placeholder (LQIP) generator
 *
 * Reads the images already published under `public/images`, derives a tiny
 * blurred stand-in for each, and writes it back into the two generated
 * manifests as `blurDataURL`.
 *
 * Run with:  npm run prepare:blur
 *
 * Why this is a separate pass and not part of `prepare:images`
 * -----------------------------------------------------------
 * `prepare:images` needs the 342 MB `BAHAN/` archive, which only exists on the
 * machine that owns the photography. This pass needs nothing but the committed
 * output, so the placeholders can be regenerated anywhere. `prepare:images`
 * still emits them itself when it runs, so the two never drift.
 *
 * Why the placeholder is worth its bytes
 * --------------------------------------
 * Every portfolio photograph is served through the Next image optimiser, which
 * on this host is a cold, CPU-bound AVIF encode the first time a variant is
 * asked for. Until it answers, the card is a flat grey rectangle. A 16px-wide
 * stand-in costs ~250 bytes of HTML and puts the actual composition of the
 * photograph on screen immediately, which is the part a visitor is scrolling
 * to see.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

sharp.cache(false);
sharp.concurrency(1);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const MANIFESTS = [
  path.join(ROOT, "src", "data", "generated", "portfolio-manifest.json"),
  path.join(ROOT, "src", "data", "generated", "interior-manifest.json"),
];

/**
 * Longest edge of the stand-in, in pixels.
 *
 * Sixteen is the point where the blur still reads as the right room in the
 * right colours but the base64 stays inside ~250 bytes. Going to 24 roughly
 * doubles the payload for a placeholder that is drawn at 400px and blurred by
 * the browser anyway.
 */
const LQIP_EDGE = 16;

/** Generates the data URI for one published image, or null if it is missing. */
async function lqip(src) {
  const file = path.join(PUBLIC, src.replace(/^\//, ""));

  try {
    const buffer = await sharp(await readFile(file))
      .resize(LQIP_EDGE, LQIP_EDGE, { fit: "inside" })
      .webp({ quality: 20, alphaQuality: 20, effort: 6 })
      .toBuffer();

    return `data:image/webp;base64,${buffer.toString("base64")}`;
  } catch {
    console.warn(`  ! missing, skipped: ${src}`);
    return null;
  }
}

/**
 * Every node in a manifest that describes a published image.
 *
 * The two manifests nest differently - one has a `process` array the other
 * does not - so this walks for the shape rather than for known keys.
 */
function* imageNodes(value) {
  if (Array.isArray(value)) {
    for (const item of value) yield* imageNodes(item);
    return;
  }

  if (value === null || typeof value !== "object") return;

  if (typeof value.src === "string" && value.src.startsWith("/images/")) {
    yield value;
  }

  for (const item of Object.values(value)) yield* imageNodes(item);
}

/**
 * Adds a `blurDataURL` to every published image in the given manifests.
 *
 * Exported so `prepare-images.mjs` can call it as its last step - regenerating
 * the photography without regenerating the placeholders would leave the two
 * out of step, and the mismatch would only show up as a wrong-coloured blur.
 */
export async function addBlurPlaceholders(manifestPaths = MANIFESTS) {
  let total = 0;

  for (const manifestPath of manifestPaths) {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const nodes = [...imageNodes(manifest)];

    console.log(`${path.basename(manifestPath)}: ${nodes.length} images`);

    let bytes = 0;

    for (const node of nodes) {
      const dataUrl = await lqip(node.src);
      if (!dataUrl) continue;

      node.blurDataURL = dataUrl;
      bytes += dataUrl.length;
      total += 1;
    }

    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(
      `  written, ${(bytes / 1024).toFixed(1)} KB of placeholders across ${nodes.length} entries`
    );
  }

  console.log(`\nDone: ${total} placeholders.`);
}

// Only self-executes when run directly, not when imported by the image pipeline.
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  addBlurPlaceholders().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
