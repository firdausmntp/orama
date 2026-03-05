/**
 * Edge Detection algorithms — Sobel, Prewitt, Laplacian, Roberts, Harris Corner, Canny
 */

export type EdgeMethod = "sobel" | "prewitt" | "laplacian" | "roberts" | "harris" | "canny";

const KERNELS: Record<Exclude<EdgeMethod, "harris" | "canny">, { x: number[][]; y: number[][] }> = {
  sobel: {
    x: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
    y: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ],
  },
  prewitt: {
    x: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
    y: [
      [-1, -1, -1],
      [0, 0, 0],
      [1, 1, 1],
    ],
  },
  laplacian: {
    x: [
      [0, 1, 0],
      [1, -4, 1],
      [0, 1, 0],
    ],
    y: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ], // identity (unused, Laplacian is single-kernel)
  },
  roberts: {
    x: [
      [1, 0],
      [0, -1],
    ],
    y: [
      [0, 1],
      [-1, 0],
    ],
  },
};

/** Convert to grayscale first, then apply edge detection */
export function detectEdges(
  imageData: ImageData,
  method: EdgeMethod,
  invert: boolean = false
): ImageData {
  const { width, height } = imageData;
  const d = imageData.data;

  // grayscale buffer
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
  }

  if (method === "harris") return harrisCornerDetect(gray, width, height, invert);
  if (method === "canny") return cannyEdgeDetect(gray, width, height, invert);

  const kMethod = method as Exclude<EdgeMethod, "harris" | "canny">;
  const out = new ImageData(width, height);
  const od = out.data;
  const kx = KERNELS[kMethod].x;
  const ky = KERNELS[kMethod].y;
  const kSize = kx.length;
  const half = Math.floor(kSize / 2);
  const isLaplacian = method === "laplacian";

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky2 = 0; ky2 < kSize; ky2++) {
        for (let kx2 = 0; kx2 < kSize; kx2++) {
          const px = Math.min(width - 1, Math.max(0, x + kx2 - half));
          const py = Math.min(height - 1, Math.max(0, y + ky2 - half));
          const val = gray[py * width + px];
          gx += val * kx[ky2][kx2];
          if (!isLaplacian) gy += val * ky[ky2][kx2];
        }
      }

      let mag = isLaplacian
        ? Math.abs(gx)
        : Math.sqrt(gx * gx + gy * gy);
      mag = Math.min(255, mag);

      if (invert) mag = 255 - mag;

      const idx = (y * width + x) * 4;
      od[idx] = od[idx + 1] = od[idx + 2] = mag;
      od[idx + 3] = 255;
    }
  }

  return out;
}

/**
 * Harris Corner Detection
 * Uses structure tensor M = [[Ix², IxIy], [IxIy, Iy²]]
 * Corner response: R = det(M) - k * trace(M)²
 * Where k ∈ [0.04, 0.06]
 */
function harrisCornerDetect(
  gray: Float32Array,
  width: number,
  height: number,
  invert: boolean
): ImageData {
  const k = 0.04;
  const windowSize = 3;
  const half = Math.floor(windowSize / 2);

  // Compute gradients Ix, Iy using Sobel
  const Ix = new Float32Array(width * height);
  const Iy = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      Ix[y * width + x] =
        -gray[(y - 1) * width + (x - 1)] + gray[(y - 1) * width + (x + 1)]
        - 2 * gray[y * width + (x - 1)] + 2 * gray[y * width + (x + 1)]
        - gray[(y + 1) * width + (x - 1)] + gray[(y + 1) * width + (x + 1)];
      Iy[y * width + x] =
        -gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - gray[(y - 1) * width + (x + 1)]
        + gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + gray[(y + 1) * width + (x + 1)];
    }
  }

  // Compute corner response
  const response = new Float32Array(width * height);
  let maxR = 0;
  for (let y = half; y < height - half; y++) {
    for (let x = half; x < width - half; x++) {
      let sumIx2 = 0, sumIy2 = 0, sumIxIy = 0;
      for (let wy = -half; wy <= half; wy++) {
        for (let wx = -half; wx <= half; wx++) {
          const idx = (y + wy) * width + (x + wx);
          sumIx2 += Ix[idx] * Ix[idx];
          sumIy2 += Iy[idx] * Iy[idx];
          sumIxIy += Ix[idx] * Iy[idx];
        }
      }
      const det = sumIx2 * sumIy2 - sumIxIy * sumIxIy;
      const trace = sumIx2 + sumIy2;
      const R = det - k * trace * trace;
      response[y * width + x] = R;
      if (R > maxR) maxR = R;
    }
  }

  // Threshold and visualize: corners in red on gray background
  const threshold = maxR * 0.01;
  const out = new ImageData(width, height);
  const od = out.data;
  for (let i = 0; i < gray.length; i++) {
    const v = invert ? 255 - gray[i] : gray[i];
    od[i * 4] = v;
    od[i * 4 + 1] = v;
    od[i * 4 + 2] = v;
    od[i * 4 + 3] = 255;
    if (response[i] > threshold) {
      // Mark corners as red dots
      od[i * 4] = 255;
      od[i * 4 + 1] = 0;
      od[i * 4 + 2] = 0;
    }
  }

  return out;
}

/**
 * Canny Edge Detection — multi-stage edge detector
 * 1. Gaussian smooth  2. Gradient magnitude & direction
 * 3. Non-maximum suppression  4. Double threshold + hysteresis
 */
function cannyEdgeDetect(
  gray: Float32Array,
  width: number,
  height: number,
  invert: boolean
): ImageData {
  // 1. Gaussian blur (3×3)
  const blurred = new Float32Array(width * height);
  const gk = [1, 2, 1, 2, 4, 2, 1, 2, 1]; // Gaussian 3×3 / 16
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0, ki = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          sum += gray[(y + dy) * width + (x + dx)] * gk[ki++];
      blurred[y * width + x] = sum / 16;
    }
  }

  // 2. Sobel gradients
  const mag = new Float32Array(width * height);
  const dir = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx =
        -blurred[(y-1)*width+(x-1)] + blurred[(y-1)*width+(x+1)]
        -2*blurred[y*width+(x-1)] + 2*blurred[y*width+(x+1)]
        -blurred[(y+1)*width+(x-1)] + blurred[(y+1)*width+(x+1)];
      const gy =
        -blurred[(y-1)*width+(x-1)] - 2*blurred[(y-1)*width+x] - blurred[(y-1)*width+(x+1)]
        +blurred[(y+1)*width+(x-1)] + 2*blurred[(y+1)*width+x] + blurred[(y+1)*width+(x+1)];
      mag[y*width+x] = Math.sqrt(gx*gx + gy*gy);
      dir[y*width+x] = Math.atan2(gy, gx);
    }
  }

  // 3. Non-maximum suppression
  const nms = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const angle = ((dir[y*width+x] * 180 / Math.PI) + 180) % 180;
      const m = mag[y*width+x];
      let m1 = 0, m2 = 0;
      if (angle < 22.5 || angle >= 157.5) { m1 = mag[y*width+(x-1)]; m2 = mag[y*width+(x+1)]; }
      else if (angle < 67.5) { m1 = mag[(y-1)*width+(x+1)]; m2 = mag[(y+1)*width+(x-1)]; }
      else if (angle < 112.5) { m1 = mag[(y-1)*width+x]; m2 = mag[(y+1)*width+x]; }
      else { m1 = mag[(y-1)*width+(x-1)]; m2 = mag[(y+1)*width+(x+1)]; }
      nms[y*width+x] = (m >= m1 && m >= m2) ? m : 0;
    }
  }

  // 4. Double threshold + hysteresis
  let maxMag = 0;
  for (let i = 0; i < nms.length; i++) if (nms[i] > maxMag) maxMag = nms[i];
  const highT = maxMag * 0.15;
  const lowT = highT * 0.4;
  const edge = new Uint8Array(width * height);
  for (let i = 0; i < nms.length; i++) {
    if (nms[i] >= highT) edge[i] = 255;
    else if (nms[i] >= lowT) edge[i] = 128; // weak
  }
  // Hysteresis: promote weak edges connected to strong edges
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (edge[y*width+x] === 128) {
        let hasStrong = false;
        for (let dy = -1; dy <= 1 && !hasStrong; dy++)
          for (let dx = -1; dx <= 1 && !hasStrong; dx++)
            if (edge[(y+dy)*width+(x+dx)] === 255) hasStrong = true;
        edge[y*width+x] = hasStrong ? 255 : 0;
      }
    }
  }

  const out = new ImageData(width, height);
  const od = out.data;
  for (let i = 0; i < edge.length; i++) {
    const v = invert ? 255 - edge[i] : edge[i];
    od[i*4] = od[i*4+1] = od[i*4+2] = v;
    od[i*4+3] = 255;
  }
  return out;
}

export const EDGE_METHODS: { value: EdgeMethod; label: string; desc: string }[] = [
  { value: "sobel", label: "Sobel", desc: "First-order derivative — most common edge detector" },
  { value: "prewitt", label: "Prewitt", desc: "Similar to Sobel but uniform weighting" },
  { value: "laplacian", label: "Laplacian", desc: "Second-order derivative — detects all edges" },
  { value: "roberts", label: "Roberts Cross", desc: "2×2 diagonal gradient operator" },
  { value: "harris", label: "Harris Corner", desc: "Corner detection via structure tensor — R = det(M) − k·trace(M)²" },
  { value: "canny", label: "Canny", desc: "Multi-stage: Gaussian → gradient → NMS → hysteresis" },
];
