/**
 * Morphological Operations — erosion, dilation, opening, closing
 * Operates on grayscale/binary images (converts internally)
 */

export type MorphOp = "erode" | "dilate" | "open" | "close" | "gradient" | "tophat" | "blackhat" | "regionGrowing";

export type StructShape = "square" | "cross" | "circle";

/** Generate structuring element */
function makeStructuringElement(size: number, shape: StructShape): boolean[][] {
  const se: boolean[][] = [];
  const half = Math.floor(size / 2);
  for (let y = 0; y < size; y++) {
    se[y] = [];
    for (let x = 0; x < size; x++) {
      if (shape === "square") {
        se[y][x] = true;
      } else if (shape === "cross") {
        se[y][x] = x === half || y === half;
      } else {
        // circle
        const dx = x - half;
        const dy = y - half;
        se[y][x] = dx * dx + dy * dy <= half * half;
      }
    }
  }
  return se;
}

/** Convert ImageData to grayscale buffer */
function toGray(imageData: ImageData): Uint8Array {
  const g = new Uint8Array(imageData.width * imageData.height);
  const d = imageData.data;
  for (let i = 0; i < g.length; i++) {
    g[i] = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]);
  }
  return g;
}

/** Threshold a grayscale buffer */
function threshold(gray: Uint8Array, thresh: number): Uint8Array {
  const out = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) {
    out[i] = gray[i] >= thresh ? 255 : 0;
  }
  return out;
}

/** Erosion on grayscale buffer */
function erode(buf: Uint8Array, w: number, h: number, se: boolean[][]): Uint8Array {
  const out = new Uint8Array(buf.length);
  const size = se.length;
  const half = Math.floor(size / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let minVal = 255;
      for (let sy = 0; sy < size; sy++) {
        for (let sx = 0; sx < size; sx++) {
          if (!se[sy][sx]) continue;
          const px = Math.min(w - 1, Math.max(0, x + sx - half));
          const py = Math.min(h - 1, Math.max(0, y + sy - half));
          minVal = Math.min(minVal, buf[py * w + px]);
        }
      }
      out[y * w + x] = minVal;
    }
  }
  return out;
}

/** Dilation on grayscale buffer */
function dilate(buf: Uint8Array, w: number, h: number, se: boolean[][]): Uint8Array {
  const out = new Uint8Array(buf.length);
  const size = se.length;
  const half = Math.floor(size / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let maxVal = 0;
      for (let sy = 0; sy < size; sy++) {
        for (let sx = 0; sx < size; sx++) {
          if (!se[sy][sx]) continue;
          const px = Math.min(w - 1, Math.max(0, x + sx - half));
          const py = Math.min(h - 1, Math.max(0, y + sy - half));
          maxVal = Math.max(maxVal, buf[py * w + px]);
        }
      }
      out[y * w + x] = maxVal;
    }
  }
  return out;
}

/** Region growing — seed at center, expands to neighbors within threshold */
function regionGrow(gray: Uint8Array, w: number, h: number, threshold: number): Uint8Array {
  const out = new Uint8Array(gray.length);
  const visited = new Uint8Array(gray.length);

  // Use center pixel as seed
  const seedX = Math.floor(w / 2);
  const seedY = Math.floor(h / 2);
  const seedVal = gray[seedY * w + seedX];

  const stack: [number, number][] = [[seedX, seedY]];
  const dx = [-1, 0, 1, -1, 1, -1, 0, 1];
  const dy = [-1, -1, -1, 0, 0, 1, 1, 1];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!;
    const idx = cy * w + cx;
    if (visited[idx]) continue;
    visited[idx] = 1;

    if (Math.abs(gray[idx] - seedVal) <= threshold) {
      out[idx] = 255;
      for (let d = 0; d < 8; d++) {
        const nx = cx + dx[d];
        const ny = cy + dy[d];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny * w + nx]) {
          stack.push([nx, ny]);
        }
      }
    }
  }
  return out;
}

/** Main morphological operation */
export function morphologicalOp(
  imageData: ImageData,
  op: MorphOp,
  kernelSize: number,
  shape: StructShape,
  binarize: boolean = true,
  binaryThreshold: number = 128
): { output: ImageData; binaryInput: ImageData } {
  const { width, height } = imageData;
  const se = makeStructuringElement(kernelSize, shape);

  let gray = toGray(imageData);
  if (binarize) gray = threshold(gray, binaryThreshold);

  // Build binary input ImageData for preview
  const binImg = new ImageData(width, height);
  for (let i = 0; i < gray.length; i++) {
    binImg.data[i * 4] = binImg.data[i * 4 + 1] = binImg.data[i * 4 + 2] = gray[i];
    binImg.data[i * 4 + 3] = 255;
  }

  let result: Uint8Array;

  switch (op) {
    case "erode":
      result = erode(gray, width, height, se);
      break;
    case "dilate":
      result = dilate(gray, width, height, se);
      break;
    case "open":
      result = dilate(erode(gray, width, height, se), width, height, se);
      break;
    case "close":
      result = erode(dilate(gray, width, height, se), width, height, se);
      break;
    case "gradient": {
      const e = erode(gray, width, height, se);
      const d2 = dilate(gray, width, height, se);
      result = new Uint8Array(gray.length);
      for (let i = 0; i < result.length; i++) result[i] = Math.max(0, d2[i] - e[i]);
      break;
    }
    case "tophat": {
      const opened = dilate(erode(gray, width, height, se), width, height, se);
      result = new Uint8Array(gray.length);
      for (let i = 0; i < result.length; i++) result[i] = Math.max(0, gray[i] - opened[i]);
      break;
    }
    case "blackhat": {
      const closed = erode(dilate(gray, width, height, se), width, height, se);
      result = new Uint8Array(gray.length);
      for (let i = 0; i < result.length; i++) result[i] = Math.max(0, closed[i] - gray[i]);
      break;
    }
    case "regionGrowing": {
      // Use binaryThreshold as similarity threshold for region growing
      result = regionGrow(gray, width, height, binaryThreshold / 4);
      break;
    }
  }

  const out = new ImageData(width, height);
  for (let i = 0; i < result.length; i++) {
    out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = result[i];
    out.data[i * 4 + 3] = 255;
  }

  return { output: out, binaryInput: binImg };
}

export const MORPH_OPS: { value: MorphOp; label: string; desc: string }[] = [
  { value: "erode", label: "Erosion", desc: "Shrinks bright regions — removes small noise" },
  { value: "dilate", label: "Dilation", desc: "Expands bright regions — fills small gaps" },
  { value: "open", label: "Opening", desc: "Erode then Dilate — removes small objects" },
  { value: "close", label: "Closing", desc: "Dilate then Erode — fills small holes" },
  { value: "gradient", label: "Morphological Gradient", desc: "Dilation − Erosion — outlines edges" },
  { value: "tophat", label: "Top Hat", desc: "Original − Opening — extracts bright details" },
  { value: "blackhat", label: "Black Hat", desc: "Closing − Original — extracts dark details" },
  { value: "regionGrowing", label: "Region Growing", desc: "Seed at center — grow region by similarity" },
];

export const STRUCT_SHAPES: { value: StructShape; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "cross", label: "Cross (+)" },
  { value: "circle", label: "Circle" },
];
