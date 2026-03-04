/**
 * Document Scanner - Advanced edge detection + Perspective correction
 *
 * Pure TypeScript implementation with no external dependencies.
 *
 * Pipeline overview:
 *   1. Grayscale conversion (BT.601 luma)
 *   2. Canny-style edge detection
 *      a. 5×5 Gaussian blur (σ ≈ 1.4)
 *      b. Sobel gradient magnitude + direction
 *      c. Non-maximum suppression along gradient direction
 *      d. Hysteresis thresholding (auto low/high via Otsu)
 *   3. Morphological edge cleaning
 *      a. 3×3 cross-element dilation to bridge small gaps
 *      b. Single-pass thinning to restore 1-pixel-wide edges
 *   4. Corner detection
 *      a. Partition edge pixels into 4 quadrant groups (top/bottom/left/right)
 *      b. Fit a dominant line (least-squares) per side
 *      c. Intersect adjacent lines → precise corners
 *      d. Fallback to the quadrant-extreme method when fitting fails
 *   5. Perspective transform (DLT-normalised homography + bilinear interpolation)
 *   6. Adaptive threshold via integral image (O(1) per pixel local mean)
 */

// ────────────────────────────────────────────────────────────────────────────
// Public types
// ────────────────────────────────────────────────────────────────────────────

/** A 2-D point. */
export interface Point {
  x: number;
  y: number;
}

/** Result bundle returned by the full scan pipeline. */
export interface ScanResult {
  corners: Point[];
  edgeImageData: ImageData;
  scannedImageData: ImageData;
}

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

/**
 * Detect the four document corners from an input image.
 *
 * Uses Canny edge detection → morphological cleaning → line-based corner
 * detection.  Returns the four corners and an RGBA visualisation of the
 * detected edges with corner markers.
 *
 * @param imageData - Source RGBA `ImageData`.
 * @returns Object with `corners` (4 points) and `edgeImageData`.
 */
export function detectDocumentEdges(imageData: ImageData): {
  corners: Point[];
  edgeImageData: ImageData;
} {
  const { width, height, data } = imageData;

  // 1. Convert to grayscale (BT.601 luma)
  const gray = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i >> 2] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // 2. Canny edge detection --------------------------------------------------
  //    a. 5×5 Gaussian blur (σ ≈ 1.4)
  const blurred = gaussianBlur5x5(gray, width, height);

  //    b. Sobel gradients
  const { magnitude, direction } = sobelGradients(blurred, width, height);

  //    c. Non-maximum suppression
  const suppressed = nonMaximumSuppression(magnitude, direction, width, height);

  //    d. Hysteresis thresholding
  const otsu = computeOtsuThreshold(magnitude);
  const highT = otsu;
  const lowT = otsu * 0.4;
  const cannyEdges = hysteresisThreshold(suppressed, width, height, lowT, highT);

  // 3. Morphological cleaning -------------------------------------------------
  const dilated = dilate3x3Cross(cannyEdges, width, height);
  const thinned = thinEdges(dilated, width, height);

  // 4. Corner detection -------------------------------------------------------
  const corners = findDocumentCorners(thinned, width, height);

  // Build edge visualisation (green edges) ------------------------------------
  const edgeData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < thinned.length; i++) {
    const pi = i * 4;
    edgeData[pi] = thinned[i];                     // R
    edgeData[pi + 1] = thinned[i] > 0 ? 255 : 0;  // G
    edgeData[pi + 2] = 0;                          // B
    edgeData[pi + 3] = 255;                        // A
  }

  // Draw corner markers
  for (const corner of corners) {
    drawMarker(edgeData, width, height, corner.x, corner.y, [255, 95, 21]);
  }

  return {
    corners,
    edgeImageData: new ImageData(edgeData, width, height),
  };
}

/**
 * Warp the source image so that the quadrilateral defined by `corners`
 * maps onto a rectangle.
 *
 * Uses a DLT-normalised homography for numerical stability and bilinear
 * interpolation for smooth output.
 *
 * @param imageData   - Source RGBA `ImageData`.
 * @param corners     - Four corner points of the document.
 * @param outputWidth - Optional output width  (auto-detected from corner distances).
 * @param outputHeight - Optional output height (auto-detected from corner distances).
 * @returns The warped `ImageData`.
 */
export function perspectiveTransform(
  imageData: ImageData,
  corners: Point[],
  outputWidth?: number,
  outputHeight?: number,
): ImageData {
  // Sort corners: TL → TR → BR → BL (counter-clockwise from top-left)
  const sorted = sortCorners(corners);

  // Auto output dimensions
  const w =
    outputWidth ??
    Math.max(distance(sorted[0], sorted[1]), distance(sorted[3], sorted[2]));
  const h =
    outputHeight ??
    Math.max(distance(sorted[0], sorted[3]), distance(sorted[1], sorted[2]));

  const outW = Math.round(w);
  const outH = Math.round(h);

  // Destination rectangle
  const dst: Point[] = [
    { x: 0, y: 0 },
    { x: outW, y: 0 },
    { x: outW, y: outH },
    { x: 0, y: outH },
  ];

  // Compute the *inverse* homography (dst → sorted) via normalised DLT
  const matrix = computeHomographyDLT(dst, sorted);

  const { data } = imageData;
  const srcW = imageData.width;
  const srcH = imageData.height;
  const output = new Uint8ClampedArray(outW * outH * 4);

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const [srcX, srcY] = applyHomography(matrix, x, y);

      if (srcX >= 0 && srcX < srcW - 1 && srcY >= 0 && srcY < srcH - 1) {
        // Bilinear interpolation
        const x0 = Math.floor(srcX);
        const y0 = Math.floor(srcY);
        const x1 = x0 + 1;
        const y1 = y0 + 1;
        const fx = srcX - x0;
        const fy = srcY - y0;
        const outIdx = (y * outW + x) * 4;

        for (let c = 0; c < 4; c++) {
          const v00 = data[(y0 * srcW + x0) * 4 + c];
          const v10 = data[(y0 * srcW + x1) * 4 + c];
          const v01 = data[(y1 * srcW + x0) * 4 + c];
          const v11 = data[(y1 * srcW + x1) * 4 + c];

          output[outIdx + c] = Math.round(
            v00 * (1 - fx) * (1 - fy) +
            v10 * fx * (1 - fy) +
            v01 * (1 - fx) * fy +
            v11 * fx * fy,
          );
        }
      }
    }
  }

  return new ImageData(output, outW, outH);
}

/**
 * Binarise an image using an adaptive (local-mean) threshold.
 *
 * Uses an **integral image** so that the local mean of any block is computed
 * in O(1) instead of O(blockSize²).
 *
 * @param imageData - Source RGBA `ImageData`.
 * @param blockSize - Side length of the local neighbourhood (must be odd, default 15).
 * @param C         - Constant subtracted from the local mean (default 10).
 * @returns Binarised `ImageData`.
 */
export function adaptiveThreshold(
  imageData: ImageData,
  blockSize: number = 15,
  C: number = 10,
): ImageData {
  const { width, height, data } = imageData;

  // Grayscale
  const gray = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i >> 2] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Build integral image (padded by 1 row & col for simpler boundary logic)
  const iw = width + 1;
  const ih = height + 1;
  const integral = new Float64Array(iw * ih); // row-major, (0,0) = 0
  for (let y = 1; y < ih; y++) {
    let rowSum = 0;
    for (let x = 1; x < iw; x++) {
      rowSum += gray[(y - 1) * width + (x - 1)];
      integral[y * iw + x] = rowSum + integral[(y - 1) * iw + x];
    }
  }

  const half = Math.floor(blockSize / 2);
  const output = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    // Clamp window vertically
    const y0 = Math.max(0, y - half);
    const y1 = Math.min(height - 1, y + half);
    for (let x = 0; x < width; x++) {
      // Clamp window horizontally
      const x0 = Math.max(0, x - half);
      const x1 = Math.min(width - 1, x + half);

      // Sum in rectangle [x0..x1, y0..y1] from the integral image
      // integral is 1-indexed, so offset by +1
      const sum =
        integral[(y1 + 1) * iw + (x1 + 1)] -
        integral[y0 * iw + (x1 + 1)] -
        integral[(y1 + 1) * iw + x0] +
        integral[y0 * iw + x0];
      const count = (x1 - x0 + 1) * (y1 - y0 + 1);
      const mean = sum / count;

      const idx = y * width + x;
      const pi = idx * 4;
      const val = gray[idx] > mean - C ? 255 : 0;
      output[pi] = val;
      output[pi + 1] = val;
      output[pi + 2] = val;
      output[pi + 3] = 255;
    }
  }

  return new ImageData(output, width, height);
}

// ════════════════════════════════════════════════════════════════════════════
// Internal helpers
// ════════════════════════════════════════════════════════════════════════════

// ── Gaussian blur (5×5, σ ≈ 1.4) ──────────────────────────────────────────

/**
 * Apply a 5×5 Gaussian blur to a grayscale buffer.
 *
 * Kernel (σ ≈ 1.4):
 * ```
 *  2  4  5  4  2
 *  4  9 12  9  4
 *  5 12 15 12  5
 *  4  9 12  9  4
 *  2  4  5  4  2
 * ```
 * Sum = 159
 */
function gaussianBlur5x5(src: Float32Array, w: number, h: number): Float32Array {
  const kernel = [
    2, 4, 5, 4, 2,
    4, 9, 12, 9, 4,
    5, 12, 15, 12, 5,
    4, 9, 12, 9, 4,
    2, 4, 5, 4, 2,
  ];
  const kSum = 159;
  const out = new Float32Array(w * h);

  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      let sum = 0;
      let ki = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          sum += src[(y + dy) * w + (x + dx)] * kernel[ki++];
        }
      }
      out[y * w + x] = sum / kSum;
    }
  }

  // Copy border pixels from source (no blur at edges)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (y < 2 || y >= h - 2 || x < 2 || x >= w - 2) {
        out[y * w + x] = src[y * w + x];
      }
    }
  }

  return out;
}

// ── Sobel gradients ────────────────────────────────────────────────────────

/** Compute Sobel gradient magnitude and direction for every pixel. */
function sobelGradients(
  gray: Float32Array,
  w: number,
  h: number,
): { magnitude: Float32Array; direction: Float32Array } {
  const magnitude = new Float32Array(w * h);
  const direction = new Float32Array(w * h);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const gx =
        -gray[idx - w - 1] + gray[idx - w + 1] -
        2 * gray[idx - 1] + 2 * gray[idx + 1] -
        gray[idx + w - 1] + gray[idx + w + 1];
      const gy =
        -gray[idx - w - 1] - 2 * gray[idx - w] - gray[idx - w + 1] +
        gray[idx + w - 1] + 2 * gray[idx + w] + gray[idx + w + 1];
      magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
      direction[idx] = Math.atan2(gy, gx);
    }
  }

  return { magnitude, direction };
}

// ── Non-maximum suppression ────────────────────────────────────────────────

/**
 * Thin edges by suppressing pixels that are not local maxima along the
 * gradient direction. Gradient angle is quantised to 4 directions (0°,
 * 45°, 90°, 135°).
 */
function nonMaximumSuppression(
  mag: Float32Array,
  dir: Float32Array,
  w: number,
  h: number,
): Float32Array {
  const out = new Float32Array(w * h);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const m = mag[idx];
      if (m === 0) continue;

      // Quantise angle to nearest 0°/45°/90°/135°
      let angle = dir[idx] * (180 / Math.PI);
      if (angle < 0) angle += 180;

      let n1 = 0;
      let n2 = 0;
      if ((angle >= 0 && angle < 22.5) || (angle >= 157.5 && angle <= 180)) {
        // 0° — compare left/right
        n1 = mag[idx - 1];
        n2 = mag[idx + 1];
      } else if (angle >= 22.5 && angle < 67.5) {
        // 45° — compare top-right / bottom-left
        n1 = mag[idx - w + 1];
        n2 = mag[idx + w - 1];
      } else if (angle >= 67.5 && angle < 112.5) {
        // 90° — compare top / bottom
        n1 = mag[idx - w];
        n2 = mag[idx + w];
      } else {
        // 135° — compare top-left / bottom-right
        n1 = mag[idx - w - 1];
        n2 = mag[idx + w + 1];
      }

      out[idx] = m >= n1 && m >= n2 ? m : 0;
    }
  }
  return out;
}

// ── Hysteresis thresholding ────────────────────────────────────────────────

/**
 * Two-pass hysteresis thresholding.
 * - Strong pixels (≥ highT) are accepted immediately.
 * - Weak pixels (≥ lowT) are accepted only if connected to a strong pixel.
 */
function hysteresisThreshold(
  img: Float32Array,
  w: number,
  h: number,
  lowT: number,
  highT: number,
): Uint8Array {
  const STRONG = 255;
  const WEAK = 128;
  const out = new Uint8Array(w * h);

  // Mark strong / weak pixels
  for (let i = 0; i < img.length; i++) {
    if (img[i] >= highT) out[i] = STRONG;
    else if (img[i] >= lowT) out[i] = WEAK;
  }

  // BFS from strong pixels to promote connected weak pixels
  const queue: number[] = [];
  for (let i = 0; i < out.length; i++) {
    if (out[i] === STRONG) queue.push(i);
  }

  const dx8 = [-1, 0, 1, -1, 1, -1, 0, 1];
  const dy8 = [-1, -1, -1, 0, 0, 1, 1, 1];

  while (queue.length > 0) {
    const idx = queue.pop()!;
    const px = idx % w;
    const py = (idx - px) / w;
    for (let k = 0; k < 8; k++) {
      const nx = px + dx8[k];
      const ny = py + dy8[k];
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const ni = ny * w + nx;
      if (out[ni] === WEAK) {
        out[ni] = STRONG;
        queue.push(ni);
      }
    }
  }

  // Remove remaining weak pixels
  for (let i = 0; i < out.length; i++) {
    if (out[i] !== STRONG) out[i] = 0;
  }

  return out;
}

// ── Otsu threshold ─────────────────────────────────────────────────────────

/** Compute the Otsu threshold for a floating-point buffer (values clamped to 0-255). */
function computeOtsuThreshold(data: Float32Array): number {
  const histogram = new Array<number>(256).fill(0);
  for (let i = 0; i < data.length; i++) {
    histogram[Math.min(255, Math.max(0, Math.round(data[i])))]++;
  }

  const total = data.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let threshold = 0;

  for (let i = 0; i < 256; i++) {
    wB += histogram[i];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += i * histogram[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maxVar) {
      maxVar = between;
      threshold = i;
    }
  }
  return threshold;
}

// ── Morphological operations ───────────────────────────────────────────────

/**
 * Dilate a binary image with a 3×3 cross structuring element.
 *
 * ```
 *  0 1 0
 *  1 1 1
 *  0 1 0
 * ```
 *
 * Bridges small 1-pixel gaps in edge maps.
 */
function dilate3x3Cross(src: Uint8Array, w: number, h: number): Uint8Array {
  const out = new Uint8Array(w * h);
  const crossDx = [0, -1, 0, 1, 0];
  const crossDy = [0, 0, -1, 0, 1];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let hit = false;
      for (let k = 0; k < 5; k++) {
        if (src[(y + crossDy[k]) * w + (x + crossDx[k])] > 0) {
          hit = true;
          break;
        }
      }
      out[y * w + x] = hit ? 255 : 0;
    }
  }
  return out;
}

/**
 * Simple single-pass morphological thinning.
 *
 * After dilation edges may be 2-3 px wide; this pass removes border pixels
 * that have at least one background 4-neighbour **and** whose removal does
 * not break connectivity (i.e. the pixel has at most 6 foreground 8-neighbours).
 */
function thinEdges(src: Uint8Array, w: number, h: number): Uint8Array {
  const out = Uint8Array.from(src);
  const dx8 = [-1, 0, 1, -1, 1, -1, 0, 1];
  const dy8 = [-1, -1, -1, 0, 0, 1, 1, 1];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (src[idx] === 0) continue;

      // Check if this is a border pixel (has a 4-connected bg neighbour)
      const isBorder =
        src[idx - 1] === 0 ||
        src[idx + 1] === 0 ||
        src[idx - w] === 0 ||
        src[idx + w] === 0;
      if (!isBorder) continue;

      // Count 8-connected foreground neighbours
      let count = 0;
      for (let k = 0; k < 8; k++) {
        if (src[(y + dy8[k]) * w + (x + dx8[k])] > 0) count++;
      }

      // Remove if doing so doesn't isolate parts (heuristic: keep if ≤ 6 neighbours)
      if (count >= 2 && count <= 6) {
        out[idx] = 0;
      }
    }
  }
  return out;
}

// ── Corner detection (line-fitting + fallback) ─────────────────────────────

/**
 * Represents a 2-D line in the form  `ax + by + c = 0` (normalised so
 * that `a² + b² = 1`).
 */
interface Line {
  a: number;
  b: number;
  c: number;
}

/**
 * Fit a line to a set of 2-D points using ordinary least-squares.
 *
 * For near-vertical sets (small x-variance) we regress x on y instead.
 * Returns `null` if fewer than 2 points are supplied.
 */
function fitLine(pts: Point[]): Line | null {
  if (pts.length < 2) return null;

  const n = pts.length;
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (const p of pts) {
    sx += p.x;
    sy += p.y;
    sxx += p.x * p.x;
    syy += p.y * p.y;
    sxy += p.x * p.y;
  }

  const varX = sxx - (sx * sx) / n;
  const varY = syy - (sy * sy) / n;

  if (varX > varY) {
    // Regress y = mx + b → mx - y + b = 0
    const m = (sxy - (sx * sy) / n) / varX;
    const b = (sy - m * sx) / n;
    const len = Math.sqrt(m * m + 1);
    return { a: m / len, b: -1 / len, c: b / len };
  } else {
    // Regress x = my + b → x - my - b = 0
    if (varY < 1e-8) return null;
    const m = (sxy - (sx * sy) / n) / varY;
    const b = (sx - m * sy) / n;
    const len = Math.sqrt(1 + m * m);
    return { a: 1 / len, b: -m / len, c: -b / len };
  }
}

/**
 * Intersect two lines (each in `ax + by + c = 0` form).
 * Returns `null` if the lines are (near-)parallel.
 */
function intersectLines(l1: Line, l2: Line): Point | null {
  const det = l1.a * l2.b - l2.a * l1.b;
  if (Math.abs(det) < 1e-8) return null;
  return {
    x: (l1.b * l2.c - l2.b * l1.c) / det,
    y: (l2.a * l1.c - l1.a * l2.c) / det,
  };
}

/**
 * Find the four document corners from a binary edge map.
 *
 * Strategy:
 * 1. Collect edge pixels and split them into four groups by proximity to
 *    each image side (top / right / bottom / left).
 * 2. Fit a line to each side's edge pixels.
 * 3. Intersect adjacent lines: top∩left → TL, top∩right → TR, etc.
 * 4. Validate that corners lie within a reasonable margin of the image.
 * 5. If any step fails, fall back to the simple quadrant-extreme method.
 */
function findDocumentCorners(edges: Uint8Array, w: number, h: number): Point[] {
  // Attempt the line-fitting approach first
  const lineFit = findCornersViaLineFitting(edges, w, h);
  if (lineFit) return lineFit;

  // Fallback: pick the outermost edge point in each quadrant
  return findCornersFallback(edges, w, h);
}

/**
 * Line-fitting corner detection.
 *
 * Edge pixels are assigned to the side (top / right / bottom / left) whose
 * image border they are closest to *by normalised distance*.  We discard
 * pixels in the central 40 % of the image to avoid interior noise.
 */
function findCornersViaLineFitting(
  edges: Uint8Array,
  w: number,
  h: number,
): Point[] | null {
  // Margin: ignore points in the central region
  const marginX = w * 0.15;
  const marginY = h * 0.15;

  const topPts: Point[] = [];
  const rightPts: Point[] = [];
  const bottomPts: Point[] = [];
  const leftPts: Point[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (edges[y * w + x] === 0) continue;

      // Skip interior points
      if (x > marginX && x < w - marginX && y > marginY && y < h - marginY) continue;

      // Normalised distances to each border
      const dTop = y / h;
      const dBottom = (h - 1 - y) / h;
      const dLeft = x / w;
      const dRight = (w - 1 - x) / w;

      const minD = Math.min(dTop, dBottom, dLeft, dRight);

      if (minD === dTop) topPts.push({ x, y });
      else if (minD === dBottom) bottomPts.push({ x, y });
      else if (minD === dLeft) leftPts.push({ x, y });
      else rightPts.push({ x, y });
    }
  }

  const topLine = fitLine(topPts);
  const bottomLine = fitLine(bottomPts);
  const leftLine = fitLine(leftPts);
  const rightLine = fitLine(rightPts);

  if (!topLine || !bottomLine || !leftLine || !rightLine) return null;

  // Intersect adjacent lines
  const tl = intersectLines(topLine, leftLine);
  const tr = intersectLines(topLine, rightLine);
  const br = intersectLines(bottomLine, rightLine);
  const bl = intersectLines(bottomLine, leftLine);

  if (!tl || !tr || !br || !bl) return null;

  // Validate corners are within a generous margin of the image
  const margin = Math.max(w, h) * 0.25;
  const valid = [tl, tr, br, bl].every(
    (p) => p.x >= -margin && p.x <= w + margin && p.y >= -margin && p.y <= h + margin,
  );
  if (!valid) return null;

  // Clamp to image bounds
  const clamp = (p: Point): Point => ({
    x: Math.max(0, Math.min(w - 1, p.x)),
    y: Math.max(0, Math.min(h - 1, p.y)),
  });

  return [clamp(tl), clamp(tr), clamp(br), clamp(bl)];
}

/**
 * Fallback corner detection: find the edge pixel in each quadrant that is
 * farthest from the image centre.
 */
function findCornersFallback(edges: Uint8Array, w: number, h: number): Point[] {
  const midX = w / 2;
  const midY = h / 2;

  const quadrants: { point: Point; score: number }[] = [
    { point: { x: w * 0.1, y: h * 0.1 }, score: 0 }, // TL
    { point: { x: w * 0.9, y: h * 0.1 }, score: 0 }, // TR
    { point: { x: w * 0.9, y: h * 0.9 }, score: 0 }, // BR
    { point: { x: w * 0.1, y: h * 0.9 }, score: 0 }, // BL
  ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (edges[y * w + x] === 0) continue;
      const qIdx = (y < midY ? 0 : 2) + (x < midX ? 0 : 1);
      const dist = Math.sqrt((x - midX) ** 2 + (y - midY) ** 2);
      if (dist > quadrants[qIdx].score) {
        quadrants[qIdx].score = dist;
        quadrants[qIdx].point = { x, y };
      }
    }
  }

  return quadrants.map((q) => q.point);
}

// ── Geometry helpers ───────────────────────────────────────────────────────

/** Euclidean distance between two points. */
function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Sort four points into order: TL → TR → BR → BL.
 *
 * Works by computing the angle from each point to the centroid and sorting
 * in ascending angular order (atan2 gives −π..π, TL ≈ −135°).
 */
function sortCorners(corners: Point[]): Point[] {
  const cx = corners.reduce((s, p) => s + p.x, 0) / corners.length;
  const cy = corners.reduce((s, p) => s + p.y, 0) / corners.length;

  return [...corners].sort((a, b) => {
    const aa = Math.atan2(a.y - cy, a.x - cx);
    const ab = Math.atan2(b.y - cy, b.x - cx);
    return aa - ab;
  });
}

// ── DLT-normalised homography ──────────────────────────────────────────────

/**
 * Compute the 3×3 homography mapping `src` → `dst` (4 point correspondences)
 * using the **normalised Direct Linear Transform (DLT)**.
 *
 * Normalisation translates + scales each point set so that the centroid
 * is at the origin and the mean distance from the origin is √2. This
 * dramatically improves numerical conditioning.
 *
 * The returned array has 9 elements stored row-major:
 * `[h0 h1 h2 h3 h4 h5 h6 h7 h8]` representing the matrix
 * ```
 *  ⎡ h0  h1  h2 ⎤
 *  ⎢ h3  h4  h5 ⎥
 *  ⎣ h6  h7  h8 ⎦
 * ```
 * with `h8` normalised to 1.
 */
function computeHomographyDLT(src: Point[], dst: Point[]): number[] {
  // ---------- normalise src ----------
  const srcN = normalisePoints(src);
  // ---------- normalise dst ----------
  const dstN = normalisePoints(dst);

  // Build the 8×9 matrix A for the DLT (Ah = 0)
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const sx = srcN.pts[i].x;
    const sy = srcN.pts[i].y;
    const dx = dstN.pts[i].x;
    const dy = dstN.pts[i].y;

    A.push([-sx, -sy, -1, 0, 0, 0, dx * sx, dx * sy, dx]);
    A.push([0, 0, 0, -sx, -sy, -1, dy * sx, dy * sy, dy]);
  }

  // Solve via SVD-free approach: convert to 8×8 system by setting h8 = 1
  // Rearrange: A'·h' = -a9  where h' = [h0..h7] and a9 is the 9th column
  const n = 8;
  const aug: number[][] = [];
  for (let r = 0; r < n; r++) {
    const row: number[] = [];
    for (let c = 0; c < n; c++) row.push(A[r][c]);
    row.push(-A[r][8]); // rhs
    aug.push(row);
  }

  // Gaussian elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) continue;

    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / pivot;
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  // Back-substitution
  const hNorm = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    hNorm[i] = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      hNorm[i] -= aug[i][j] * hNorm[j];
    }
    hNorm[i] /= aug[i][i];
  }

  // Assemble the normalised 3×3 homography (row-major)
  // Hn = [h0..h7, 1]
  const Hn = [...hNorm, 1];

  // De-normalise: H = Tdst⁻¹ · Hn · Tsrc
  const H = denormaliseHomography(Hn, srcN.T, dstN.T);

  // Scale so that H[8] = 1
  const s = H[8];
  if (Math.abs(s) < 1e-14) return H; // degenerate, return as-is
  for (let i = 0; i < 9; i++) H[i] /= s;
  return H;
}

/** Normalisation result: transformed points and the 3×3 transform T (row-major). */
interface NormResult {
  pts: Point[];
  /** The 3×3 normalisation matrix (row-major, 9 elements). */
  T: number[];
}

/**
 * Normalise a set of 2-D points so that the centroid is at the origin and
 * the mean distance from the origin is √2.
 */
function normalisePoints(pts: Point[]): NormResult {
  const n = pts.length;
  let cx = 0;
  let cy = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
  }
  cx /= n;
  cy /= n;

  let meanDist = 0;
  for (const p of pts) {
    meanDist += Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
  }
  meanDist /= n;

  const scale = meanDist > 1e-10 ? Math.SQRT2 / meanDist : 1;

  const out: Point[] = pts.map((p) => ({
    x: (p.x - cx) * scale,
    y: (p.y - cy) * scale,
  }));

  // T maps original → normalised:  p' = T · p
  // T = [[s, 0, -s·cx], [0, s, -s·cy], [0, 0, 1]]
  const T = [scale, 0, -scale * cx, 0, scale, -scale * cy, 0, 0, 1];

  return { pts: out, T };
}

/**
 * De-normalise a homography: `H = inv(Tdst) · Hn · Tsrc`
 *
 * All matrices are 3×3 row-major arrays of 9 elements.
 */
function denormaliseHomography(Hn: number[], Tsrc: number[], Tdst: number[]): number[] {
  // inv(Tdst)
  const Ti = invert3x3(Tdst);
  // Ti · Hn
  const M1 = mul3x3(Ti, Hn);
  // M1 · Tsrc
  return mul3x3(M1, Tsrc);
}

/** Invert a 3×3 matrix stored row-major (9 elements). */
function invert3x3(m: number[]): number[] {
  const [a, b, c, d, e, f, g, h, i] = m;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  const id = 1 / det;
  return [
    (e * i - f * h) * id,
    (c * h - b * i) * id,
    (b * f - c * e) * id,
    (f * g - d * i) * id,
    (a * i - c * g) * id,
    (c * d - a * f) * id,
    (d * h - e * g) * id,
    (b * g - a * h) * id,
    (a * e - b * d) * id,
  ];
}

/** Multiply two 3×3 row-major matrices. */
function mul3x3(a: number[], b: number[]): number[] {
  const o = new Array<number>(9);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      o[r * 3 + c] =
        a[r * 3 + 0] * b[0 * 3 + c] +
        a[r * 3 + 1] * b[1 * 3 + c] +
        a[r * 3 + 2] * b[2 * 3 + c];
    }
  }
  return o;
}

/**
 * Apply a 3×3 homography (row-major, 9 elements) to a point.
 * Performs the perspective divide and returns the projected 2-D position.
 */
function applyHomography(H: number[], x: number, y: number): [number, number] {
  const w = H[6] * x + H[7] * y + H[8];
  return [
    (H[0] * x + H[1] * y + H[2]) / w,
    (H[3] * x + H[4] * y + H[5]) / w,
  ];
}

// ── Visualisation ──────────────────────────────────────────────────────────

/**
 * Draw a diamond-shaped marker onto an RGBA buffer.
 *
 * @param data  - RGBA pixel buffer.
 * @param w     - Image width.
 * @param h     - Image height.
 * @param cx    - Centre x.
 * @param cy    - Centre y.
 * @param color - RGB colour triple.
 */
function drawMarker(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  cx: number,
  cy: number,
  color: [number, number, number],
): void {
  const size = 8;
  for (let dy = -size; dy <= size; dy++) {
    for (let dx = -size; dx <= size; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > size) continue;
      const x = Math.round(cx) + dx;
      const y = Math.round(cy) + dy;
      if (x >= 0 && x < w && y >= 0 && y < h) {
        const idx = (y * w + x) * 4;
        data[idx] = color[0];
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = 255;
      }
    }
  }
}
