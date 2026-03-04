/**
 * Edge Detection algorithms — Sobel, Prewitt, Laplacian, Roberts
 */

export type EdgeMethod = "sobel" | "prewitt" | "laplacian" | "roberts";

const KERNELS: Record<EdgeMethod, { x: number[][]; y: number[][] }> = {
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

  const out = new ImageData(width, height);
  const od = out.data;
  const kx = KERNELS[method].x;
  const ky = KERNELS[method].y;
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

export const EDGE_METHODS: { value: EdgeMethod; label: string; desc: string }[] = [
  { value: "sobel", label: "Sobel", desc: "First-order derivative — most common edge detector" },
  { value: "prewitt", label: "Prewitt", desc: "Similar to Sobel but uniform weighting" },
  { value: "laplacian", label: "Laplacian", desc: "Second-order derivative — detects all edges" },
  { value: "roberts", label: "Roberts Cross", desc: "2×2 diagonal gradient operator" },
];
