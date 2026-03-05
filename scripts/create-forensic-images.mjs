/**
 * Generate forensic test images with detectable manipulations.
 *
 * Produces images that trigger ELA, blur-map, and noise-analysis detectors
 * by applying targeted edits (splicing, selective blur, brightness patches).
 *
 * Requires: sharp (already in devDependencies)
 * Usage  : node scripts/create-forensic-images.mjs
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXAMPLES = path.join(__dirname, "..", "public", "examples");

/* ── Utility ─────────────────────────────────────── */

async function loadPixels(filePath) {
  const img = sharp(filePath);
  const meta = await img.metadata();
  const { data, info } = await img
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels, meta };
}

/* ── 1. ELA-detectable: brightness-patched JPEG ──── */

async function createElaPatch() {
  const src = path.join(EXAMPLES, "forensics-nature.jpg");
  const { data, width, height, channels } = await loadPixels(src);

  const buf = Buffer.from(data);
  // Brighten a rectangular patch in the center-right area
  const px = Math.floor(width * 0.55);
  const py = Math.floor(height * 0.25);
  const pw = Math.floor(width * 0.30);
  const ph = Math.floor(height * 0.40);

  for (let y = py; y < py + ph && y < height; y++) {
    for (let x = px; x < px + pw && x < width; x++) {
      const i = (y * width + x) * channels;
      buf[i]     = Math.min(255, buf[i] + 60);     // R
      buf[i + 1] = Math.min(255, buf[i + 1] + 60); // G
      buf[i + 2] = Math.min(255, buf[i + 2] + 60); // B
    }
  }

  // Save as JPEG (re-compress creates ELA-detectable artifact)
  const outPath = path.join(EXAMPLES, "forensics-edited-ela.jpg");
  await sharp(buf, { raw: { width, height, channels } })
    .jpeg({ quality: 85 })
    .toFile(outPath);

  // Re-save JPEG again to deepen compression mismatch in edited region
  await sharp(outPath).jpeg({ quality: 90 }).toFile(outPath + ".tmp");
  fs.renameSync(outPath + ".tmp", outPath);

  console.log("  ✓ forensics-edited-ela.jpg  (brightness patch → triggers ELA)");
}

/* ── 2. Blur-map-detectable: selective Gaussian blur ─ */

async function createSelectiveBlur() {
  const src = path.join(EXAMPLES, "forensics-city.jpg");
  const meta = await sharp(src).metadata();
  const w = meta.width;
  const h = meta.height;

  // Extract a region, blur it, composite it back
  const regionLeft = Math.floor(w * 0.1);
  const regionTop = Math.floor(h * 0.3);
  const regionW = Math.floor(w * 0.35);
  const regionH = Math.floor(h * 0.4);

  const blurredRegion = await sharp(src)
    .extract({ left: regionLeft, top: regionTop, width: regionW, height: regionH })
    .blur(12)
    .toBuffer();

  const outPath = path.join(EXAMPLES, "forensics-edited-blur.jpg");
  await sharp(src)
    .composite([
      { input: blurredRegion, left: regionLeft, top: regionTop },
    ])
    .jpeg({ quality: 92 })
    .toFile(outPath);

  console.log("  ✓ forensics-edited-blur.jpg (selective blur → triggers blur map)");
}

/* ── 3. Noise-detectable: splice from different image ─ */

async function createSplice() {
  const src1 = path.join(EXAMPLES, "forensics-nature.jpg");
  const src2 = path.join(EXAMPLES, "forensics-city.jpg");

  const meta1 = await sharp(src1).metadata();
  const w = meta1.width;
  const h = meta1.height;

  // Take a patch from src2, resize to fit, composite onto src1
  const patchW = Math.floor(w * 0.30);
  const patchH = Math.floor(h * 0.30);
  const patchLeft = Math.floor(w * 0.60);
  const patchTop = Math.floor(h * 0.60);

  const patch = await sharp(src2)
    .resize(patchW, patchH, { fit: "cover" })
    .toBuffer();

  const outPath = path.join(EXAMPLES, "forensics-edited-splice.jpg");
  await sharp(src1)
    .composite([
      { input: patch, left: patchLeft, top: patchTop },
    ])
    .jpeg({ quality: 88 })
    .toFile(outPath);

  console.log("  ✓ forensics-edited-splice.jpg (splice → triggers noise analysis)");
}

/* ── 4. Copy-move: duplicate a region within the same image ── */

async function createCopyMove() {
  const src = path.join(EXAMPLES, "forensics-nature.jpg");
  const meta = await sharp(src).metadata();
  const w = meta.width;
  const h = meta.height;

  // Copy a region from top-left, paste it in the center
  const regionW = Math.floor(w * 0.20);
  const regionH = Math.floor(h * 0.20);

  const region = await sharp(src)
    .extract({ left: 10, top: 10, width: regionW, height: regionH })
    .toBuffer();

  const outPath = path.join(EXAMPLES, "forensics-edited-copymove.jpg");
  await sharp(src)
    .composite([
      { input: region, left: Math.floor(w * 0.5), top: Math.floor(h * 0.5) },
    ])
    .jpeg({ quality: 85 })
    .toFile(outPath);

  console.log("  ✓ forensics-edited-copymove.jpg (copy-move forgery → triggers ELA + noise)");
}

/* ── Main ─────────────────────────────────────────── */

async function main() {
  console.log("Creating forensic test images...\n");

  await createElaPatch();
  await createSelectiveBlur();
  await createSplice();
  await createCopyMove();

  console.log("\nDone! 4 forensic test images created in public/examples/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
