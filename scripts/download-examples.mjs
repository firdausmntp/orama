#!/usr/bin/env node
/**
 * Download example images from Unsplash/Pexels for ORAMA.vision modules.
 * Run: node scripts/download-examples.mjs
 *
 * Uses free, license-friendly sources (Unsplash API / direct Pexels links).
 * All images are resized to 800×600 for fast loading.
 */

import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "examples");

/** Example images — using picsum.photos (backed by Unsplash, no API key needed) */
const EXAMPLES = [
  // Steganography — need a clean photo to hide messages in
  { name: "steg-landscape.jpg", url: "https://picsum.photos/id/10/800/600", desc: "Forest landscape for steganography" },
  { name: "steg-portrait.jpg", url: "https://picsum.photos/id/342/800/600", desc: "Portrait for steganography" },

  // Agriculture — objects to count, coins/circles
  { name: "agri-fruits.jpg", url: "https://picsum.photos/id/1080/800/600", desc: "Nature scene for object counting" },
  { name: "agri-objects.jpg", url: "https://picsum.photos/id/225/800/600", desc: "Multiple objects for counting" },

  // Document scanner — documents, paper, text
  { name: "doc-notebook.jpg", url: "https://picsum.photos/id/20/800/600", desc: "Notebook for document scanning" },
  { name: "doc-desk.jpg", url: "https://picsum.photos/id/164/800/600", desc: "Desk with paper for scanning" },

  // Enhancement — dark/bright images needing improvement
  { name: "enhance-dark.jpg", url: "https://picsum.photos/id/24/800/600", desc: "Dark silhouette for enhancement" },
  { name: "enhance-sunset.jpg", url: "https://picsum.photos/id/119/800/600", desc: "Sunset for enhancement" },

  // Forensics — any photos for analysis
  { name: "forensics-city.jpg", url: "https://picsum.photos/id/200/800/600", desc: "City skyline for forensic analysis" },
  { name: "forensics-nature.jpg", url: "https://picsum.photos/id/15/800/600", desc: "Hilltop for forensic analysis" },

  // Histogram — high/low contrast images
  { name: "histogram-flower.jpg", url: "https://picsum.photos/id/433/800/600", desc: "Flower for histogram analysis" },
  { name: "histogram-snow.jpg", url: "https://picsum.photos/id/429/800/600", desc: "Snow scene (low contrast)" },

  // Color space — colorful images
  { name: "color-neon.jpg", url: "https://picsum.photos/id/1059/800/600", desc: "Neon colors for color space" },
  { name: "color-autumn.jpg", url: "https://picsum.photos/id/1084/800/600", desc: "Autumn leaves (warm palette)" },

  // Edge detection — architectural/geometric scenes
  { name: "edge-bridge.jpg", url: "https://picsum.photos/id/766/800/600", desc: "Bridge for edge detection" },
  { name: "edge-church.jpg", url: "https://picsum.photos/id/582/800/600", desc: "Church architecture for edges" },

  // Filters — detailed textures
  { name: "filter-tiles.jpg", url: "https://picsum.photos/id/54/800/600", desc: "Tiles for convolution filters" },
  { name: "filter-moss.jpg", url: "https://picsum.photos/id/823/800/600", desc: "Moss texture for filters" },

  // Morphology — binary-friendly images
  { name: "morph-coast.jpg", url: "https://picsum.photos/id/1074/800/600", desc: "Coastline for morphology" },
  { name: "morph-road.jpg", url: "https://picsum.photos/id/493/800/600", desc: "Road for morphological ops" },
];

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const get = (u) => {
      https.get(u, (res) => {
        // Follow redirects (picsum uses 302)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${u}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }).on("error", reject);
    };
    get(url);
  });
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
    console.log(`Created ${OUT_DIR}`);
  }

  console.log(`Downloading ${EXAMPLES.length} example images...\n`);

  let success = 0;
  let failed = 0;

  for (const { name, url, desc } of EXAMPLES) {
    const outPath = join(OUT_DIR, name);
    if (existsSync(outPath)) {
      console.log(`  [SKIP] ${name} (already exists)`);
      success++;
      continue;
    }
    try {
      process.stdout.write(`  [DOWN] ${name} ...`);
      const buf = await fetchBuffer(url);
      await writeFile(outPath, buf);
      console.log(` OK (${(buf.length / 1024).toFixed(0)} KB) — ${desc}`);
      success++;
    } catch (err) {
      console.log(` FAIL: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} downloaded, ${failed} failed.`);
  console.log(`Images saved to: public/examples/`);
}

main().catch(console.error);
