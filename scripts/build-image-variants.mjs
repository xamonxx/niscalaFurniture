/**
 * NISCALA FURNITURE - responsive variant builder
 *
 * Pre-renders every width the site can ask for into `public/v`, so that
 * `sharp` never runs while a visitor is waiting.
 *
 * Run with:  npm run prepare:variants   (the build runs it automatically)
 *
 * Why this exists
 * ---------------
 * The site ships on Hostinger shared hosting. With the built-in optimiser,
 * the first request for any variant was a cold, CPU-bound encode - measured
 * at 1.8-2.8s of TTFB against production - and the on-disk cache under
 * `.next/cache/images` is wiped by every rebuild, so the first visitor after
 * each deploy paid it again. Doing the work at build time moves that cost to
 * a machine and a moment where nobody is waiting.
 *
 * Why WebP and not AVIF
 * ---------------------
 * Measured on the project's own photography, at 1280px:
 *
 *   webp  202ms  79.6 KB
 *   avif 5081ms  65.5 KB
 *
 * AVIF is twenty-five times slower to encode for eighteen percent fewer
 * bytes. Across the full ladder that is a three-minute build against a
 * three-quarter-hour one, which shared hosting will not sit through. WebP is
 * also universally supported, so a single file per width serves every
 * browser and no content negotiation is needed.
 *
 * The output is derived, not source: `public/v` is git-ignored and rebuilt.
 */

import { copyFile, link, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { IMAGE_LADDER, VARIANT_SOURCES, variantUrl } from "../src/lib/image-ladder.mjs";

// Same reasoning as the main pipeline: libvips' shared cache made the largest
// frames fail on Windows.
sharp.cache(false);
sharp.concurrency(1);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const OUT_ROOT = path.join(PUBLIC, "v");

/**
 * Directories under `public` whose images are rendered through next/image.
 *
 * Taken from the shared module rather than restated, so this script can only
 * ever build the paths the loader will actually ask for.
 */
const SOURCE_DIRS = VARIANT_SOURCES.map((prefix) => prefix.replace(/^\/|\/$/g, ""));

/**
 * Re-encode quality.
 *
 * The sources are already lossy WebP, so a variant is a second generation.
 * 72 is where the downscale hides that on this photography; the widths at or
 * above the source are copied rather than re-encoded, so they never pay it.
 */
const QUALITY = 72;

/* ------------------------------------------------------------------ */

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

/** `images/a/b.webp` + 640 -> the absolute path the loader will point at. */
function variantPath(relative, width) {
  const url = variantUrl(`/${relative}`, width);
  if (!url) throw new Error(`Not inside the variant tree: ${relative}`);
  return path.join(PUBLIC, url.replace(/^\//, ""));
}

/**
 * A second name for a file we already wrote, rather than a second copy of it.
 *
 * Almost every source photograph is 1280px wide or narrower, so both the 1280
 * and the 1600 rung resolve to the same untouched original - 19 MB of the tree
 * was one file written twice. A hard link keeps both paths valid, because the
 * loader has no way to know a given photo tops out early. Falls back to a copy
 * on filesystems that will not link.
 */
async function linkOrCopy(existing, outFile) {
  await rm(outFile, { force: true });
  try {
    await link(existing, outFile);
    return true;
  } catch {
    await copyFile(existing, outFile);
    return false;
  }
}

/** Newer output than input means nothing changed since the last build. */
async function isFresh(outFile, sourceMtime) {
  try {
    return (await stat(outFile)).mtimeMs >= sourceMtime;
  } catch {
    return false;
  }
}

async function run() {
  const started = Date.now();
  let written = 0;
  let copied = 0;
  let linked = 0;
  let skipped = 0;
  let bytes = 0;

  for (const dirName of SOURCE_DIRS) {
    const sourceDir = path.join(PUBLIC, dirName);

    for await (const file of walk(sourceDir)) {
      if (!/\.(webp|png|jpe?g)$/i.test(file)) continue;

      const relative = path.relative(PUBLIC, file).split(path.sep).join("/");
      const info = await stat(file);
      const source = sharp(file);
      const { width: sourceWidth } = await source.metadata();

      /** The rung that first took the copy path, for the ones above it to link to. */
      let canonical = null;

      for (const width of IMAGE_LADDER) {
        const outFile = variantPath(relative, width);

        /*
          Decided before the freshness check, not inside the write branch, so
          the byte total means the same thing on a cold build and on a run
          that skips everything: distinct data, counting a hard link once.
        */
        const isCopy = width >= sourceWidth && /\.webp$/i.test(file);
        const isLink = isCopy && canonical !== null;

        if (await isFresh(outFile, info.mtimeMs)) {
          skipped += 1;
          if (!isLink) bytes += (await stat(outFile)).size;
          if (isCopy && !canonical) canonical = outFile;
          continue;
        }

        await mkdir(path.dirname(outFile), { recursive: true });

        /*
          At or above the source width there is nothing to resize, and
          re-encoding an already-lossy WebP would only add generation loss for
          no saving. Copy it instead - faster and strictly better looking.
          PNG sources still have to be converted, so they take the encode path.
        */
        if (isCopy) {
          if (isLink) {
            await linkOrCopy(canonical, outFile);
            linked += 1;
            continue;
          }
          await copyFile(file, outFile);
          canonical = outFile;
          copied += 1;
        } else {
          await source
            .clone()
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: QUALITY, effort: 4 })
            .toFile(outFile);
          written += 1;
        }

        bytes += (await stat(outFile)).size;
      }
    }
  }

  /*
    A stamp the loader is not allowed to read but a human can: it records what
    the tree was built from, so a stale `public/v` is diagnosable rather than
    mysterious.
  */
  await writeFile(
    path.join(OUT_ROOT, "manifest.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), ladder: IMAGE_LADDER, quality: QUALITY }, null, 2)}\n`,
    "utf8"
  );

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `Image variants: ${written} encoded, ${copied} copied, ${linked} linked,` +
      ` ${skipped} already current - ${(bytes / 1024 / 1024).toFixed(1)} MB` +
      ` of distinct data in public/v, ${seconds}s`
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
