#!/usr/bin/env node
/**
 * Download COCO-SSD model files for local serving on Vercel.
 * Run: node scripts/download-model.mjs
 */
import { mkdir, writeFile, readFile, stat, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "models", "coco-ssd");
const BASE = "https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2";

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const get = (u) => {
      https.get(u, (res) => {
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
  if (!existsSync(OUT)) {
    await mkdir(OUT, { recursive: true });
    console.log(`Created ${OUT}`);
  }

  // Download model.json
  console.log("Downloading model.json...");
  const modelBuf = await fetchBuffer(`${BASE}/model.json`);
  await writeFile(join(OUT, "model.json"), modelBuf);
  console.log(`  model.json (${(modelBuf.length / 1024).toFixed(0)} KB)`);

  // Parse model.json to find weight shard filenames
  const modelJson = JSON.parse(modelBuf.toString("utf8"));
  const shards = [];
  for (const group of modelJson.weightsManifest) {
    for (const p of group.paths) shards.push(p);
  }
  console.log(`Found ${shards.length} weight shards`);

  // Download each shard
  for (const shard of shards) {
    process.stdout.write(`  Downloading ${shard}...`);
    const buf = await fetchBuffer(`${BASE}/${shard}`);
    await writeFile(join(OUT, shard), buf);
    console.log(` OK (${(buf.length / 1024).toFixed(0)} KB)`);
  }

  // Summary
  const files = await readdir(OUT);
  let totalSize = 0;
  for (const f of files) {
    const s = await stat(join(OUT, f));
    totalSize += s.size;
  }
  console.log(`\nDone! ${files.length} files, total ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Saved to: public/models/coco-ssd/`);
}

main().catch(console.error);
