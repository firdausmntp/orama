/**
 * Document Scanner - Edge detection + Perspective correction
 * Pure Canvas/JS implementation (no OpenCV.js dependency)
 */

export interface Point {
  x: number;
  y: number;
}

export interface ScanResult {
  corners: Point[];
  edgeImageData: ImageData;
  scannedImageData: ImageData;
}

/**
 * Auto-detect document corners using edge detection + contour finding
 */
export function detectDocumentEdges(imageData: ImageData): {
  corners: Point[];
  edgeImageData: ImageData;
} {
  const { width, height, data } = imageData;

  // 1. Grayscale
  const gray = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // 2. Gaussian blur (3x3)
  const blurred = gaussianBlur(gray, width, height);

  // 3. Sobel edge detection
  const edges = sobelEdgeDetection(blurred, width, height);

  // 4. Non-maximum suppression + threshold
  const threshold = computeOtsuThreshold(edges);
  const binaryEdges = new Uint8Array(width * height);
  for (let i = 0; i < edges.length; i++) {
    binaryEdges[i] = edges[i] > threshold * 0.5 ? 255 : 0;
  }

  // 5. Find corners (simplified: find extreme edge points in each quadrant)
  const corners = findDocumentCorners(binaryEdges, width, height);

  // Create edge visualization
  const edgeData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < binaryEdges.length; i++) {
    const pi = i * 4;
    edgeData[pi] = binaryEdges[i];
    edgeData[pi + 1] = binaryEdges[i] > 0 ? 255 : 0;
    edgeData[pi + 2] = 0;
    edgeData[pi + 3] = 255;
  }

  // Draw detected corners
  for (const corner of corners) {
    drawMarker(edgeData, width, height, corner.x, corner.y, [255, 95, 21]);
  }

  return {
    corners,
    edgeImageData: new ImageData(edgeData, width, height),
  };
}

/**
 * Apply perspective transform to crop and straighten a document
 */
export function perspectiveTransform(
  imageData: ImageData,
  corners: Point[],
  outputWidth?: number,
  outputHeight?: number
): ImageData {
  // Sort corners: top-left, top-right, bottom-right, bottom-left
  const sorted = sortCorners(corners);

  // Calculate output dimensions if not specified
  const w =
    outputWidth ||
    Math.max(
      distance(sorted[0], sorted[1]),
      distance(sorted[3], sorted[2])
    );
  const h =
    outputHeight ||
    Math.max(
      distance(sorted[0], sorted[3]),
      distance(sorted[1], sorted[2])
    );

  const outW = Math.round(w);
  const outH = Math.round(h);

  // Destination points
  const dst: Point[] = [
    { x: 0, y: 0 },
    { x: outW, y: 0 },
    { x: outW, y: outH },
    { x: 0, y: outH },
  ];

  // Compute inverse perspective transform matrix
  const matrix = computePerspectiveMatrix(dst, sorted);

  // Apply transform
  const { data } = imageData;
  const { width: srcW } = imageData;
  const output = new Uint8ClampedArray(outW * outH * 4);

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const [srcX, srcY] = applyMatrix(matrix, x, y);

      if (srcX >= 0 && srcX < imageData.width - 1 && srcY >= 0 && srcY < imageData.height - 1) {
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
            v11 * fx * fy
          );
        }
      }
    }
  }

  return new ImageData(output, outW, outH);
}

/**
 * Apply adaptive threshold for clean document output
 */
export function adaptiveThreshold(
  imageData: ImageData,
  blockSize: number = 15,
  C: number = 10
): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data.length);

  const gray = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  const half = Math.floor(blockSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Compute local mean
      let sum = 0;
      let count = 0;
      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            sum += gray[ny * width + nx];
            count++;
          }
        }
      }
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

// ── Helper Functions ──

function gaussianBlur(gray: Float32Array, w: number, h: number): Float32Array {
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const kSum = 16;
  const result = new Float32Array(w * h);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sum = 0;
      let ki = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += gray[(y + dy) * w + (x + dx)] * kernel[ki++];
        }
      }
      result[y * w + x] = sum / kSum;
    }
  }
  return result;
}

function sobelEdgeDetection(gray: Float32Array, w: number, h: number): Float32Array {
  const edges = new Float32Array(w * h);
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
      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return edges;
}

function computeOtsuThreshold(data: Float32Array): number {
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) {
    histogram[Math.min(255, Math.round(data[i]))]++;
  }

  const total = data.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0, wB = 0, max = 0, threshold = 0;
  for (let i = 0; i < 256; i++) {
    wB += histogram[i];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += i * histogram[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > max) {
      max = between;
      threshold = i;
    }
  }
  return threshold;
}

function findDocumentCorners(edges: Uint8Array, w: number, h: number): Point[] {
  const midX = w / 2;
  const midY = h / 2;

  // Find strongest edge points in each quadrant
  const quadrants: { point: Point; score: number }[] = [
    { point: { x: w * 0.1, y: h * 0.1 }, score: 0 },   // TL
    { point: { x: w * 0.9, y: h * 0.1 }, score: 0 },   // TR
    { point: { x: w * 0.9, y: h * 0.9 }, score: 0 },   // BR
    { point: { x: w * 0.1, y: h * 0.9 }, score: 0 },   // BL
  ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (edges[y * w + x] === 0) continue;

      const qIdx = (y < midY ? 0 : 2) + (x < midX ? 0 : 1);
      // Score by distance from center (prefer corners)
      const dist = Math.sqrt((x - midX) ** 2 + (y - midY) ** 2);
      if (dist > quadrants[qIdx].score) {
        quadrants[qIdx].score = dist;
        quadrants[qIdx].point = { x, y };
      }
    }
  }

  return quadrants.map((q) => q.point);
}

function sortCorners(corners: Point[]): Point[] {
  const center = {
    x: corners.reduce((s, p) => s + p.x, 0) / 4,
    y: corners.reduce((s, p) => s + p.y, 0) / 4,
  };

  return corners.sort((a, b) => {
    const angleA = Math.atan2(a.y - center.y, a.x - center.x);
    const angleB = Math.atan2(b.y - center.y, b.x - center.x);
    return angleA - angleB;
  });
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function computePerspectiveMatrix(src: Point[], dst: Point[]): number[] {
  // Simplified perspective transform using 8-parameter homography
  // Solves Ax = b for the 8 unknowns
  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const sx = src[i].x, sy = src[i].y;
    const dx = dst[i].x, dy = dst[i].y;

    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    b.push(dx);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    b.push(dy);
  }

  // Solve using Gaussian elimination
  const n = 8;
  const aug = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    if (Math.abs(aug[col][col]) < 1e-10) continue;

    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= aug[i][j] * x[j];
    }
    x[i] /= aug[i][i];
  }

  return x;
}

function applyMatrix(m: number[], x: number, y: number): [number, number] {
  const w = m[6] * x + m[7] * y + 1;
  return [
    (m[0] * x + m[1] * y + m[2]) / w,
    (m[3] * x + m[4] * y + m[5]) / w,
  ];
}

function drawMarker(
  data: Uint8ClampedArray, w: number, h: number,
  cx: number, cy: number, color: [number, number, number]
) {
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
