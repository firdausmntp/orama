/**
 * Convolution Filters — blur, sharpen, emboss, custom kernel, median
 */

export type FilterPreset =
  | "identity"
  | "boxBlur"
  | "gaussianBlur"
  | "sharpen"
  | "unsharpMask"
  | "emboss"
  | "edgeEnhance"
  | "median"
  | "custom";

export interface KernelDef {
  name: string;
  kernel: number[][];
  divisor?: number; // if omitted, auto-sum or 1
}

export const PRESET_KERNELS: Record<Exclude<FilterPreset, "custom" | "median">, KernelDef> = {
  identity: {
    name: "Identity",
    kernel: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
  },
  boxBlur: {
    name: "Box Blur",
    kernel: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    divisor: 9,
  },
  gaussianBlur: {
    name: "Gaussian Blur",
    kernel: [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1],
    ],
    divisor: 16,
  },
  sharpen: {
    name: "Sharpen",
    kernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
  unsharpMask: {
    name: "Unsharp Mask",
    kernel: [
      [-1, -1, -1],
      [-1, 9, -1],
      [-1, -1, -1],
    ],
  },
  emboss: {
    name: "Emboss",
    kernel: [
      [-2, -1, 0],
      [-1, 1, 1],
      [0, 1, 2],
    ],
  },
  edgeEnhance: {
    name: "Edge Enhance",
    kernel: [
      [0, 0, 0],
      [-1, 1, 0],
      [0, 0, 0],
    ],
  },
};

/** Apply a 3×3 convolution kernel to an image */
export function applyConvolution(
  imageData: ImageData,
  kernel: number[][],
  divisor?: number,
  iterations: number = 1
): ImageData {
  const { width, height } = imageData;
  let src = new Uint8ClampedArray(imageData.data);

  const kernelSize = kernel.length;
  const half = Math.floor(kernelSize / 2);
  const div =
    (divisor ?? Math.max(1, kernel.flat().reduce((a, b) => a + b, 0))) || 1;

  for (let iter = 0; iter < iterations; iter++) {
    const dst = new Uint8ClampedArray(src.length);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;

        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const px = Math.min(width - 1, Math.max(0, x + kx - half));
            const py = Math.min(height - 1, Math.max(0, y + ky - half));
            const idx = (py * width + px) * 4;
            const w = kernel[ky][kx];
            r += src[idx] * w;
            g += src[idx + 1] * w;
            b += src[idx + 2] * w;
          }
        }

        const idx = (y * width + x) * 4;
        dst[idx] = Math.min(255, Math.max(0, r / div));
        dst[idx + 1] = Math.min(255, Math.max(0, g / div));
        dst[idx + 2] = Math.min(255, Math.max(0, b / div));
        dst[idx + 3] = src[idx + 3];
      }
    }

    src = dst;
  }

  const out = new ImageData(width, height);
  out.data.set(src);
  return out;
}

export const FILTER_PRESETS: { value: FilterPreset; label: string }[] = [
  { value: "identity", label: "Identity (No Change)" },
  { value: "boxBlur", label: "Box Blur" },
  { value: "gaussianBlur", label: "Gaussian Blur" },
  { value: "sharpen", label: "Sharpen" },
  { value: "unsharpMask", label: "Unsharp Mask" },
  { value: "emboss", label: "Emboss" },
  { value: "edgeEnhance", label: "Edge Enhance" },
  { value: "median", label: "Median Filter" },
  { value: "custom", label: "Custom Kernel" },
];

/**
 * Median Filter — non-linear noise reduction
 * Replaces each pixel with the median of its neighborhood.
 * Excellent for salt-and-pepper noise removal while preserving edges.
 */
export function applyMedianFilter(
  imageData: ImageData,
  kernelSize: number = 3,
  iterations: number = 1
): ImageData {
  const { width, height } = imageData;
  let src = new Uint8ClampedArray(imageData.data);
  const half = Math.floor(kernelSize / 2);

  for (let iter = 0; iter < iterations; iter++) {
    const dst = new Uint8ClampedArray(src.length);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rArr: number[] = [];
        const gArr: number[] = [];
        const bArr: number[] = [];

        for (let ky = -half; ky <= half; ky++) {
          for (let kx = -half; kx <= half; kx++) {
            const px = Math.min(width - 1, Math.max(0, x + kx));
            const py = Math.min(height - 1, Math.max(0, y + ky));
            const idx = (py * width + px) * 4;
            rArr.push(src[idx]);
            gArr.push(src[idx + 1]);
            bArr.push(src[idx + 2]);
          }
        }

        rArr.sort((a, b) => a - b);
        gArr.sort((a, b) => a - b);
        bArr.sort((a, b) => a - b);

        const mid = Math.floor(rArr.length / 2);
        const idx = (y * width + x) * 4;
        dst[idx] = rArr[mid];
        dst[idx + 1] = gArr[mid];
        dst[idx + 2] = bArr[mid];
        dst[idx + 3] = src[idx + 3];
      }
    }

    src = dst;
  }

  const out = new ImageData(width, height);
  out.data.set(src);
  return out;
}
