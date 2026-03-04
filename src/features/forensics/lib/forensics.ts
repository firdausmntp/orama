/* ──────────────────────────────────────────────────────────
   IMAGE FORENSICS  —  Pure TypeScript, 100 % client-side
   ───────────────────────────────────────────────────────── */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface ELAResult {
  canvas: HTMLCanvasElement;          // heatmap visualisation
  maxDiff: number;                    // 0–255
  avgDiff: number;
  suspiciousPercent: number;          // % of pixels with diff > threshold
}

export interface BlurMapResult {
  canvas: HTMLCanvasElement;          // per-block variance map
  globalVariance: number;
  isBlurry: boolean;                  // global verdict
  blurryPercent: number;              // % of blocks considered blurry
}

export interface NoiseResult {
  canvas: HTMLCanvasElement;          // high-pass filtered residual
  noiseLevel: number;                 // avg magnitude  0-255
  uniformity: number;                 // 0-1  (1 = perfectly uniform noise)
  verdict: string;
}

export interface MetadataEntry {
  key: string;
  value: string;
}

// ━━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Load an HTMLImageElement into a canvas and return its ImageData. */
function imageToData(img: HTMLImageElement): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  data: ImageData;
} {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { canvas, ctx, data };
}

/** Clamp a value to [0, 255]. */
function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

// ━━━ ERROR LEVEL ANALYSIS (ELA) ━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Re-compress the image as JPEG at `quality` (0-1),
 * then compute the absolute pixel-level difference and
 * amplify by `scale` to produce a heat-map.
 */
export async function errorLevelAnalysis(
  img: HTMLImageElement,
  quality = 0.75,
  scale = 15,
  threshold = 30,
): Promise<ELAResult> {
  const { canvas: origCanvas, ctx: origCtx, data: origData } = imageToData(img);
  const w = origCanvas.width;
  const h = origCanvas.height;

  // Re-compress via canvas → JPEG blob → reload
  const blob: Blob = await new Promise((res) =>
    origCanvas.toBlob((b) => res(b!), "image/jpeg", quality),
  );
  const reImg = await loadBlob(blob);
  const reCanvas = document.createElement("canvas");
  reCanvas.width = w;
  reCanvas.height = h;
  const reCtx = reCanvas.getContext("2d")!;
  reCtx.drawImage(reImg, 0, 0, w, h);
  const reData = reCtx.getImageData(0, 0, w, h);

  // Difference
  const out = origCtx.createImageData(w, h);
  const od = origData.data;
  const rd = reData.data;
  const od2 = out.data;
  let sumDiff = 0;
  let maxDiff = 0;
  let suspCount = 0;
  const total = w * h;

  for (let i = 0; i < od.length; i += 4) {
    const dr = Math.abs(od[i] - rd[i]);
    const dg = Math.abs(od[i + 1] - rd[i + 1]);
    const db = Math.abs(od[i + 2] - rd[i + 2]);
    const avg = (dr + dg + db) / 3;
    const amplified = clamp(avg * scale);

    // Heat-map colouring: green → yellow → red
    if (amplified < 85) {
      od2[i] = 0;
      od2[i + 1] = clamp(amplified * 3);
      od2[i + 2] = 0;
    } else if (amplified < 170) {
      od2[i] = clamp((amplified - 85) * 3);
      od2[i + 1] = 255;
      od2[i + 2] = 0;
    } else {
      od2[i] = 255;
      od2[i + 1] = clamp(255 - (amplified - 170) * 3);
      od2[i + 2] = 0;
    }
    od2[i + 3] = 255;

    sumDiff += avg;
    if (avg > maxDiff) maxDiff = avg;
    if (avg > threshold) suspCount++;
  }

  origCtx.putImageData(out, 0, 0);

  return {
    canvas: origCanvas,
    maxDiff: Math.round(maxDiff),
    avgDiff: +(sumDiff / total).toFixed(2),
    suspiciousPercent: +((suspCount / total) * 100).toFixed(2),
  };
}

// ━━━ BLUR / SHARPNESS MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Divide the image into blocks and compute the Laplacian
 * variance for each block.  Low variance → blurry region.
 */
export function blurMap(
  img: HTMLImageElement,
  blockSize = 16,
  blurThreshold = 100,
): BlurMapResult {
  const { data } = imageToData(img);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const px = data.data;

  // Convert to greyscale
  const grey = new Float32Array(w * h);
  for (let i = 0; i < grey.length; i++) {
    const j = i * 4;
    grey[i] = 0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2];
  }

  // Laplacian kernel  [0,1,0 ; 1,-4,1 ; 0,1,0]
  function laplacianVariance(
    startX: number,
    startY: number,
    bw: number,
    bh: number,
  ): number {
    let sum = 0;
    let sumSq = 0;
    let count = 0;
    for (let y = startY + 1; y < startY + bh - 1; y++) {
      for (let x = startX + 1; x < startX + bw - 1; x++) {
        const lap =
          grey[y * w + x - 1] +
          grey[y * w + x + 1] +
          grey[(y - 1) * w + x] +
          grey[(y + 1) * w + x] -
          4 * grey[y * w + x];
        sum += lap;
        sumSq += lap * lap;
        count++;
      }
    }
    if (count === 0) return 0;
    const mean = sum / count;
    return sumSq / count - mean * mean;
  }

  // Compute per block
  const bCols = Math.ceil(w / blockSize);
  const bRows = Math.ceil(h / blockSize);
  const vars: number[] = [];
  let blurryBlocks = 0;
  for (let by = 0; by < bRows; by++) {
    for (let bx = 0; bx < bCols; bx++) {
      const sx = bx * blockSize;
      const sy = by * blockSize;
      const bw = Math.min(blockSize, w - sx);
      const bh = Math.min(blockSize, h - sy);
      const v = laplacianVariance(sx, sy, bw, bh);
      vars.push(v);
      if (v < blurThreshold) blurryBlocks++;
    }
  }

  const maxVar = Math.max(...vars, 1);
  const globalVar = vars.reduce((a, b) => a + b, 0) / vars.length;

  // Build visualisation
  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext("2d")!;

  for (let by = 0; by < bRows; by++) {
    for (let bx = 0; bx < bCols; bx++) {
      const v = vars[by * bCols + bx];
      const t = Math.min(v / maxVar, 1);      // 0=blurry  1=sharp
      // We colour blurry (low var) = red, sharp (high var) = blue
      const r = clamp((1 - t) * 255);
      const g = 0;
      const b = clamp(t * 255);
      outCtx.fillStyle = `rgb(${r},${g},${b})`;
      outCtx.fillRect(
        bx * blockSize,
        by * blockSize,
        Math.min(blockSize, w - bx * blockSize),
        Math.min(blockSize, h - by * blockSize),
      );
    }
  }

  return {
    canvas: outCanvas,
    globalVariance: +globalVar.toFixed(2),
    isBlurry: globalVar < blurThreshold,
    blurryPercent: +((blurryBlocks / vars.length) * 100).toFixed(1),
  };
}

// ━━━ NOISE ANALYSIS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extract the high-frequency residual (noise) of an image via
 * a simple 3×3 mean-subtraction filter.  The uniformity metric
 * checks how evenly the noise is distributed (spliced regions
 * often have different noise patterns).
 */
export function noiseAnalysis(img: HTMLImageElement): NoiseResult {
  const { data } = imageToData(img);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const px = data.data;

  // Grey
  const grey = new Float32Array(w * h);
  for (let i = 0; i < grey.length; i++) {
    const j = i * 4;
    grey[i] = 0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2];
  }

  // High-pass (pixel - local mean of 3x3)
  const residual = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += grey[(y + dy) * w + (x + dx)];
        }
      }
      const mean = sum / 9;
      residual[y * w + x] = grey[y * w + x] - mean;
    }
  }

  // Statistics
  let absSum = 0;
  let count = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      absSum += Math.abs(residual[y * w + x]);
      count++;
    }
  }
  const noiseLevel = absSum / count;

  // Uniformity: compare noise in 4 quadrants
  function quadNoise(sx: number, sy: number, ex: number, ey: number) {
    let s = 0;
    let c = 0;
    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        s += Math.abs(residual[y * w + x]);
        c++;
      }
    }
    return c > 0 ? s / c : 0;
  }
  const hw = w >> 1;
  const hh = h >> 1;
  const q = [
    quadNoise(1, 1, hw, hh),
    quadNoise(hw, 1, w - 1, hh),
    quadNoise(1, hh, hw, h - 1),
    quadNoise(hw, hh, w - 1, h - 1),
  ];
  const qMax = Math.max(...q, 0.001);
  const qMin = Math.min(...q);
  const uniformity = qMin / qMax;   // 1 = perfectly uniform

  // Visualisation: amplified residual
  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext("2d")!;
  const outData = outCtx.createImageData(w, h);
  const od = outData.data;
  for (let i = 0; i < grey.length; i++) {
    const v = clamp(128 + residual[i] * 10);   // centre at 128, amplify ×10
    od[i * 4] = v;
    od[i * 4 + 1] = v;
    od[i * 4 + 2] = v;
    od[i * 4 + 3] = 255;
  }
  outCtx.putImageData(outData, 0, 0);

  let verdict: string;
  if (uniformity > 0.85) {
    verdict = noiseLevel < 2
      ? "Very clean — possibly processed or AI-generated"
      : "Natural noise pattern — no obvious manipulation";
  } else if (uniformity > 0.6) {
    verdict = "Slight noise inconsistency — worth investigating";
  } else {
    verdict = "Significant noise inconsistency — possible splice or compositing";
  }

  return {
    canvas: outCanvas,
    noiseLevel: +noiseLevel.toFixed(2),
    uniformity: +uniformity.toFixed(3),
    verdict,
  };
}

// ━━━ BASIC METADATA EXTRACTION ━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extract metadata from a JPEG / PNG file.
 * This is a lightweight EXIF / file-header parser —
 * for full EXIF we'd need a library, but this covers
 * the most common fields from JPEG APP1 segments.
 */
export async function extractMetadata(
  file: File,
): Promise<MetadataEntry[]> {
  const entries: MetadataEntry[] = [];

  entries.push({ key: "File Name", value: file.name });
  entries.push({ key: "File Size", value: formatBytes(file.size) });
  entries.push({ key: "MIME Type", value: file.type || "unknown" });
  entries.push({
    key: "Last Modified",
    value: new Date(file.lastModified).toLocaleString(),
  });

  // Read dimensions via Image element
  const url = URL.createObjectURL(file);
  try {
    const dim = await getImageDimensions(url);
    entries.push({ key: "Width", value: `${dim.w} px` });
    entries.push({ key: "Height", value: `${dim.h} px` });
    entries.push({
      key: "Megapixels",
      value: ((dim.w * dim.h) / 1_000_000).toFixed(2) + " MP",
    });
    entries.push({
      key: "Aspect Ratio",
      value: simplifyRatio(dim.w, dim.h),
    });
  } finally {
    URL.revokeObjectURL(url);
  }

  // Try to extract EXIF from JPEG
  if (file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg")) {
    const buf = await file.arrayBuffer();
    const exif = parseBasicExif(new Uint8Array(buf));
    entries.push(...exif);
  }

  return entries;
}

// ━━━ Internal Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function loadBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      res(img);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(blob);
  });
}

function formatBytes(b: number): string {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(2) + " MB";
}

function getImageDimensions(
  url: string,
): Promise<{ w: number; h: number }> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = rej;
    img.src = url;
  });
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
function simplifyRatio(w: number, h: number): string {
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}

// ── Tiny EXIF tag reader (JPEG APP1) ────────────────────

const EXIF_TAGS: Record<number, string> = {
  0x010f: "Camera Make",
  0x0110: "Camera Model",
  0x0112: "Orientation",
  0x011a: "X Resolution",
  0x011b: "Y Resolution",
  0x0128: "Resolution Unit",
  0x0131: "Software",
  0x0132: "DateTime",
  0x0213: "YCbCr Positioning",
  0x8769: "Exif IFD Pointer",
  0x8825: "GPS IFD Pointer",
  0x829a: "Exposure Time",
  0x829d: "F-Number",
  0x8827: "ISO Speed",
  0x9003: "Date Original",
  0x9004: "Date Digitized",
  0x920a: "Focal Length",
  0xa002: "Pixel X Dimension",
  0xa003: "Pixel Y Dimension",
  0xa405: "Focal Length In 35mm",
};

function parseBasicExif(buffer: Uint8Array): MetadataEntry[] {
  const entries: MetadataEntry[] = [];
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return entries; // not JPEG

  let offset = 2;
  while (offset < buffer.length - 4) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    if (marker === 0xda) break; // SOS — stop
    const segLen = (buffer[offset + 2] << 8) | buffer[offset + 3];

    if (marker === 0xe1) {
      // APP1 — potential EXIF
      const exifStr = String.fromCharCode(
        buffer[offset + 4],
        buffer[offset + 5],
        buffer[offset + 6],
        buffer[offset + 7],
      );
      if (exifStr === "Exif") {
        const tiffStart = offset + 10; // after "Exif\0\0"
        const bigEndian = buffer[tiffStart] === 0x4d; // "MM"
        const read16 = bigEndian
          ? (o: number) => (buffer[o] << 8) | buffer[o + 1]
          : (o: number) => buffer[o] | (buffer[o + 1] << 8);
        const read32 = bigEndian
          ? (o: number) =>
              (buffer[o] << 24) |
              (buffer[o + 1] << 16) |
              (buffer[o + 2] << 8) |
              buffer[o + 3]
          : (o: number) =>
              buffer[o] |
              (buffer[o + 1] << 8) |
              (buffer[o + 2] << 16) |
              (buffer[o + 3] << 24);

        const ifdOffset = read32(tiffStart + 4);
        const ifdPtr = tiffStart + ifdOffset;
        const count = read16(ifdPtr);

        for (let i = 0; i < count; i++) {
          const entryOff = ifdPtr + 2 + i * 12;
          if (entryOff + 12 > buffer.length) break;
          const tag = read16(entryOff);
          const type = read16(entryOff + 2);
          const numValues = read32(entryOff + 4);
          const tagName = EXIF_TAGS[tag];
          if (!tagName) continue;

          let value = "";
          if (type === 2) {
            // ASCII
            let strPtr: number;
            if (numValues <= 4) {
              strPtr = entryOff + 8;
            } else {
              strPtr = tiffStart + read32(entryOff + 8);
            }
            const chars: string[] = [];
            for (let c = 0; c < numValues - 1 && strPtr + c < buffer.length; c++) {
              chars.push(String.fromCharCode(buffer[strPtr + c]));
            }
            value = chars.join("");
          } else if (type === 3) {
            value = String(read16(entryOff + 8));
          } else if (type === 4) {
            value = String(read32(entryOff + 8));
          } else if (type === 5) {
            // RATIONAL
            const rPtr = tiffStart + read32(entryOff + 8);
            if (rPtr + 8 <= buffer.length) {
              const num = read32(rPtr);
              const den = read32(rPtr + 4);
              value = den !== 0 ? (num / den).toFixed(4) : String(num);
            }
          }

          if (value) entries.push({ key: tagName, value });
        }
      }
      break; // only one APP1
    }

    offset += 2 + segLen;
  }

  return entries;
}
