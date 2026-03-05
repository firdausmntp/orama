/**
 * Geometric Transforms — resize, rotate, flip, crop, shear, translate
 * Pure TypeScript, no external libraries.
 */

export type TransformType =
  | "resize"
  | "rotate"
  | "flip"
  | "crop"
  | "shear"
  | "translate";

export type InterpolationMethod = "nearest" | "bilinear";

export type FlipDirection = "horizontal" | "vertical" | "both";

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TransformOptions {
  type: TransformType;
  interpolation: InterpolationMethod;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
  flipDirection?: FlipDirection;
  cropRect?: CropRect;
  shearX?: number;
  shearY?: number;
  translateX?: number;
  translateY?: number;
}

export const TRANSFORM_TYPES: { value: TransformType; label: string }[] = [
  { value: "resize", label: "Resize" },
  { value: "rotate", label: "Rotate" },
  { value: "flip", label: "Flip" },
  { value: "crop", label: "Crop" },
  { value: "shear", label: "Shear" },
  { value: "translate", label: "Translate" },
];

export const INTERPOLATION_METHODS: {
  value: InterpolationMethod;
  label: string;
}[] = [
  { value: "nearest", label: "Nearest Neighbor" },
  { value: "bilinear", label: "Bilinear" },
];

/* ── Helpers ──────────────────────────────────────── */

/** Clamp value between min and max */
function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Read pixel (RGBA) from ImageData with boundary clamping */
function getPixel(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  x: number,
  y: number
): [number, number, number, number] {
  const cx = clamp(Math.floor(x), 0, w - 1);
  const cy = clamp(Math.floor(y), 0, h - 1);
  const idx = (cy * w + cx) * 4;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

/** Bilinear interpolation at fractional (x, y) */
function bilinearSample(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  x: number,
  y: number
): [number, number, number, number] {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const fx = x - x0;
  const fy = y - y0;

  const tl = getPixel(data, w, h, x0, y0);
  const tr = getPixel(data, w, h, x1, y0);
  const bl = getPixel(data, w, h, x0, y1);
  const br = getPixel(data, w, h, x1, y1);

  const out: [number, number, number, number] = [0, 0, 0, 0];
  for (let c = 0; c < 4; c++) {
    out[c] = Math.round(
      tl[c] * (1 - fx) * (1 - fy) +
        tr[c] * fx * (1 - fy) +
        bl[c] * (1 - fx) * fy +
        br[c] * fx * fy
    );
  }
  return out;
}

/** Sample a pixel using the selected interpolation method */
function samplePixel(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  x: number,
  y: number,
  method: InterpolationMethod
): [number, number, number, number] {
  if (method === "bilinear") {
    return bilinearSample(data, w, h, x, y);
  }
  return getPixel(data, w, h, x, y);
}

/* ── Transform functions ──────────────────────────── */

/**
 * Resize an image using nearest-neighbor or bilinear interpolation.
 */
export function resizeImage(
  imageData: ImageData,
  newWidth: number,
  newHeight: number,
  method: InterpolationMethod
): ImageData {
  const { width: srcW, height: srcH, data: srcData } = imageData;
  const nw = Math.max(1, Math.round(newWidth));
  const nh = Math.max(1, Math.round(newHeight));
  const dst = new ImageData(nw, nh);

  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const srcX = (x / nw) * srcW;
      const srcY = (y / nh) * srcH;
      const px = samplePixel(srcData, srcW, srcH, srcX, srcY, method);
      const idx = (y * nw + x) * 4;
      dst.data[idx] = px[0];
      dst.data[idx + 1] = px[1];
      dst.data[idx + 2] = px[2];
      dst.data[idx + 3] = px[3];
    }
  }
  return dst;
}

/**
 * Rotate an image by the given angle (degrees, CCW positive).
 * Canvas auto-expands to fit the rotated image. Empty space is transparent.
 */
export function rotateImage(
  imageData: ImageData,
  angleDegrees: number,
  method: InterpolationMethod
): ImageData {
  const { width: srcW, height: srcH, data: srcData } = imageData;
  const rad = (angleDegrees * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  // Compute bounding box of rotated corners
  const cx = srcW / 2;
  const cy = srcH / 2;
  const corners = [
    [-cx, -cy],
    [srcW - cx, -cy],
    [-cx, srcH - cy],
    [srcW - cx, srcH - cy],
  ];

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const [px, py] of corners) {
    const rx = cosA * px - sinA * py;
    const ry = sinA * px + cosA * py;
    minX = Math.min(minX, rx);
    maxX = Math.max(maxX, rx);
    minY = Math.min(minY, ry);
    maxY = Math.max(maxY, ry);
  }

  const dstW = Math.ceil(maxX - minX);
  const dstH = Math.ceil(maxY - minY);
  const dst = new ImageData(dstW, dstH);

  const dstCx = dstW / 2;
  const dstCy = dstH / 2;

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      // Map destination back to source
      const dx = x - dstCx;
      const dy = y - dstCy;
      const srcX = cosA * dx + sinA * dy + cx;
      const srcY = -sinA * dx + cosA * dy + cy;

      if (srcX < -0.5 || srcX > srcW - 0.5 || srcY < -0.5 || srcY > srcH - 0.5) {
        // Outside source bounds — transparent
        const idx = (y * dstW + x) * 4;
        dst.data[idx] = 255;
        dst.data[idx + 1] = 255;
        dst.data[idx + 2] = 255;
        dst.data[idx + 3] = 0;
      } else {
        const px = samplePixel(srcData, srcW, srcH, srcX, srcY, method);
        const idx = (y * dstW + x) * 4;
        dst.data[idx] = px[0];
        dst.data[idx + 1] = px[1];
        dst.data[idx + 2] = px[2];
        dst.data[idx + 3] = px[3];
      }
    }
  }
  return dst;
}

/**
 * Flip an image horizontally, vertically, or both.
 */
export function flipImage(
  imageData: ImageData,
  direction: FlipDirection
): ImageData {
  const { width: w, height: h, data: srcData } = imageData;
  const dst = new ImageData(w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = direction === "horizontal" || direction === "both" ? w - 1 - x : x;
      const sy = direction === "vertical" || direction === "both" ? h - 1 - y : y;
      const srcIdx = (sy * w + sx) * 4;
      const dstIdx = (y * w + x) * 4;
      dst.data[dstIdx] = srcData[srcIdx];
      dst.data[dstIdx + 1] = srcData[srcIdx + 1];
      dst.data[dstIdx + 2] = srcData[srcIdx + 2];
      dst.data[dstIdx + 3] = srcData[srcIdx + 3];
    }
  }
  return dst;
}

/**
 * Crop a rectangular region from the image.
 */
export function cropImage(
  imageData: ImageData,
  x: number,
  y: number,
  w: number,
  h: number
): ImageData {
  const { width: srcW, height: srcH, data: srcData } = imageData;

  const cx = clamp(Math.round(x), 0, srcW - 1);
  const cy = clamp(Math.round(y), 0, srcH - 1);
  const cw = clamp(Math.round(w), 1, srcW - cx);
  const ch = clamp(Math.round(h), 1, srcH - cy);

  const dst = new ImageData(cw, ch);
  for (let row = 0; row < ch; row++) {
    for (let col = 0; col < cw; col++) {
      const srcIdx = ((cy + row) * srcW + (cx + col)) * 4;
      const dstIdx = (row * cw + col) * 4;
      dst.data[dstIdx] = srcData[srcIdx];
      dst.data[dstIdx + 1] = srcData[srcIdx + 1];
      dst.data[dstIdx + 2] = srcData[srcIdx + 2];
      dst.data[dstIdx + 3] = srcData[srcIdx + 3];
    }
  }
  return dst;
}

/**
 * Shear an image along X and/or Y axes.
 * Canvas auto-expands to contain the sheared result.
 */
export function shearImage(
  imageData: ImageData,
  shearX: number,
  shearY: number,
  method: InterpolationMethod
): ImageData {
  const { width: srcW, height: srcH, data: srcData } = imageData;

  // Compute bounding box
  const corners = [
    [0, 0],
    [srcW, 0],
    [0, srcH],
    [srcW, srcH],
  ];

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (const [px, py] of corners) {
    const sx = px + shearX * py;
    const sy = py + shearY * px;
    minX = Math.min(minX, sx);
    maxX = Math.max(maxX, sx);
    minY = Math.min(minY, sy);
    maxY = Math.max(maxY, sy);
  }

  const dstW = Math.ceil(maxX - minX);
  const dstH = Math.ceil(maxY - minY);
  const dst = new ImageData(dstW, dstH);

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      // Inverse shear to find source pixel
      const dx = x + minX;
      const dy = y + minY;
      // Forward: dx = srcX + shearX * srcY, dy = srcY + shearY * srcX
      // Inverse: solve for srcX, srcY
      const det = 1 - shearX * shearY;
      if (Math.abs(det) < 1e-10) continue; // degenerate
      const srcX = (dx - shearX * dy) / det;
      const srcY = (dy - shearY * dx) / det;

      if (srcX < -0.5 || srcX > srcW - 0.5 || srcY < -0.5 || srcY > srcH - 0.5) {
        const idx = (y * dstW + x) * 4;
        dst.data[idx] = 255;
        dst.data[idx + 1] = 255;
        dst.data[idx + 2] = 255;
        dst.data[idx + 3] = 0;
      } else {
        const px = samplePixel(srcData, srcW, srcH, srcX, srcY, method);
        const idx = (y * dstW + x) * 4;
        dst.data[idx] = px[0];
        dst.data[idx + 1] = px[1];
        dst.data[idx + 2] = px[2];
        dst.data[idx + 3] = px[3];
      }
    }
  }
  return dst;
}

/**
 * Translate (shift) an image by (tx, ty) pixels.
 * Canvas size stays the same; areas outside are transparent.
 */
export function translateImage(
  imageData: ImageData,
  tx: number,
  ty: number
): ImageData {
  const { width: w, height: h, data: srcData } = imageData;
  const dst = new ImageData(w, h);

  const itx = Math.round(tx);
  const ity = Math.round(ty);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcX = x - itx;
      const srcY = y - ity;
      if (srcX >= 0 && srcX < w && srcY >= 0 && srcY < h) {
        const srcIdx = (srcY * w + srcX) * 4;
        const dstIdx = (y * w + x) * 4;
        dst.data[dstIdx] = srcData[srcIdx];
        dst.data[dstIdx + 1] = srcData[srcIdx + 1];
        dst.data[dstIdx + 2] = srcData[srcIdx + 2];
        dst.data[dstIdx + 3] = srcData[srcIdx + 3];
      } else {
        const dstIdx = (y * w + x) * 4;
        dst.data[dstIdx] = 255;
        dst.data[dstIdx + 1] = 255;
        dst.data[dstIdx + 2] = 255;
        dst.data[dstIdx + 3] = 0;
      }
    }
  }
  return dst;
}

/**
 * Unified transform dispatcher.
 */
export function applyTransform(
  imageData: ImageData,
  options: TransformOptions
): ImageData {
  switch (options.type) {
    case "resize": {
      const sx = options.scaleX ?? 1;
      const sy = options.scaleY ?? 1;
      return resizeImage(
        imageData,
        imageData.width * sx,
        imageData.height * sy,
        options.interpolation
      );
    }
    case "rotate":
      return rotateImage(
        imageData,
        options.angle ?? 0,
        options.interpolation
      );
    case "flip":
      return flipImage(imageData, options.flipDirection ?? "horizontal");
    case "crop": {
      const r = options.cropRect ?? {
        x: 0,
        y: 0,
        w: imageData.width,
        h: imageData.height,
      };
      return cropImage(imageData, r.x, r.y, r.w, r.h);
    }
    case "shear":
      return shearImage(
        imageData,
        options.shearX ?? 0,
        options.shearY ?? 0,
        options.interpolation
      );
    case "translate":
      return translateImage(
        imageData,
        options.translateX ?? 0,
        options.translateY ?? 0
      );
    default:
      return imageData;
  }
}
