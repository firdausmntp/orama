/**
 * Template Matching — Normalized Cross-Correlation (NCC)
 * Pure TypeScript implementation, no external dependencies
 * Slides a template over a source image and finds the best match
 */

export interface TemplateMatchResult {
  /** X coordinate of the best match (top-left corner) */
  x: number;
  /** Y coordinate of the best match (top-left corner) */
  y: number;
  /** NCC score of the best match (range -1 to 1, higher is better) */
  score: number;
  /** Source image with a red rectangle drawn at the match location */
  resultImageData: ImageData;
}

/**
 * Convert RGBA image data to a grayscale Float64Array
 */
function toGrayscale(imageData: ImageData): Float64Array {
  const { width, height, data } = imageData;
  const gray = new Float64Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const off = i * 4;
    gray[i] = 0.299 * data[off] + 0.587 * data[off + 1] + 0.114 * data[off + 2];
  }
  return gray;
}

/**
 * Compute mean of a grayscale buffer
 */
function mean(buf: Float64Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    sum += buf[i];
  }
  return sum / buf.length;
}

/**
 * Compute standard deviation of a grayscale buffer given its mean
 */
function std(buf: Float64Array, m: number): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    const d = buf[i] - m;
    sum += d * d;
  }
  return Math.sqrt(sum / buf.length);
}

/**
 * Draw a red rectangle (2 px thick) on RGBA pixel data
 */
function drawRect(
  data: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): void {
  const thickness = 2;

  const setPixel = (px: number, py: number) => {
    if (px < 0 || py < 0 || px >= imgWidth || py >= imgHeight) return;
    const off = (py * imgWidth + px) * 4;
    data[off] = 255;     // R
    data[off + 1] = 0;   // G
    data[off + 2] = 0;   // B
    data[off + 3] = 255; // A
  };

  for (let t = 0; t < thickness; t++) {
    // Top & bottom edges
    for (let x = rx; x < rx + rw; x++) {
      setPixel(x, ry + t);
      setPixel(x, ry + rh - 1 - t);
    }
    // Left & right edges
    for (let y = ry; y < ry + rh; y++) {
      setPixel(rx + t, y);
      setPixel(rx + rw - 1 - t, y);
    }
  }
}

/**
 * Perform template matching using Normalized Cross-Correlation (NCC).
 *
 * Slides the template over every valid position of the source image and
 * computes the NCC score at each position:
 *
 *   NCC = Σ((I - meanI) * (T - meanT)) / sqrt(Σ(I - meanI)² * Σ(T - meanT)²)
 *
 * The position with the highest score is returned together with an annotated
 * copy of the source image showing a red rectangle at the match location.
 *
 * @param source - Source image to search within
 * @param template - Template image to search for
 * @returns Best match position, NCC score, and annotated image
 */
export function templateMatch(
  source: ImageData,
  template: ImageData
): TemplateMatchResult {
  const srcW = source.width;
  const srcH = source.height;
  const tplW = template.width;
  const tplH = template.height;

  // Convert to grayscale
  const srcGray = toGrayscale(source);
  const tplGray = toGrayscale(template);

  // Pre-compute template statistics
  const tplMean = mean(tplGray);
  const tplStd = std(tplGray, tplMean);
  const tplSize = tplW * tplH;

  // Pre-compute (T - meanT) for every template pixel
  const tplDiff = new Float64Array(tplSize);
  for (let i = 0; i < tplSize; i++) {
    tplDiff[i] = tplGray[i] - tplMean;
  }

  let bestScore = -Infinity;
  let bestX = 0;
  let bestY = 0;

  // Slide template over source
  const maxX = srcW - tplW;
  const maxY = srcH - tplH;

  for (let sy = 0; sy <= maxY; sy++) {
    for (let sx = 0; sx <= maxX; sx++) {
      // Compute local mean of the source patch
      let patchSum = 0;
      for (let ty = 0; ty < tplH; ty++) {
        const srcRow = (sy + ty) * srcW + sx;
        for (let tx = 0; tx < tplW; tx++) {
          patchSum += srcGray[srcRow + tx];
        }
      }
      const patchMean = patchSum / tplSize;

      // Compute NCC numerator and source patch variance
      let numerator = 0;
      let srcVar = 0;

      for (let ty = 0; ty < tplH; ty++) {
        const srcRow = (sy + ty) * srcW + sx;
        const tplRow = ty * tplW;
        for (let tx = 0; tx < tplW; tx++) {
          const srcDiff = srcGray[srcRow + tx] - patchMean;
          numerator += srcDiff * tplDiff[tplRow + tx];
          srcVar += srcDiff * srcDiff;
        }
      }

      // Avoid division by zero for flat regions
      const denom = Math.sqrt(srcVar) * tplStd * Math.sqrt(tplSize);
      if (denom === 0) continue;

      const ncc = numerator / denom;

      if (ncc > bestScore) {
        bestScore = ncc;
        bestX = sx;
        bestY = sy;
      }
    }
  }

  // Build annotated result image
  const resultData = new Uint8ClampedArray(source.data);
  drawRect(resultData, srcW, srcH, bestX, bestY, tplW, tplH);
  const resultImageData = new ImageData(resultData, srcW, srcH);

  return {
    x: bestX,
    y: bestY,
    score: bestScore === -Infinity ? 0 : bestScore,
    resultImageData,
  };
}
