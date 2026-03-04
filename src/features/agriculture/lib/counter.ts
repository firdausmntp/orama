/**
 * Object Counter - Connected Component Analysis
 * Uses canvas pixel analysis to count objects by color segmentation
 */

export interface CountResult {
  count: number;
  objects: { x: number; y: number; width: number; height: number; area: number }[];
  processedImageData: ImageData;
}

/**
 * Count objects using color-based segmentation and connected components
 */
export function countObjects(
  imageData: ImageData,
  threshold: number = 128,
  minArea: number = 100
): CountResult {
  const { width, height, data } = imageData;

  // Step 1: Convert to grayscale and apply threshold
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    binary[i / 4] = gray < threshold ? 1 : 0;
  }

  // Step 2: Connected Component Labeling (Two-pass algorithm)
  const labels = new Int32Array(width * height);
  let nextLabel = 1;
  const equivalences = new Map<number, number>();

  function find(x: number): number {
    while (equivalences.has(x)) {
      x = equivalences.get(x)!;
    }
    return x;
  }

  function union(a: number, b: number) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      equivalences.set(Math.max(rootA, rootB), Math.min(rootA, rootB));
    }
  }

  // First pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (binary[idx] === 0) continue;

      const left = x > 0 ? labels[idx - 1] : 0;
      const top = y > 0 ? labels[idx - width] : 0;

      if (left === 0 && top === 0) {
        labels[idx] = nextLabel++;
      } else if (left > 0 && top === 0) {
        labels[idx] = left;
      } else if (left === 0 && top > 0) {
        labels[idx] = top;
      } else {
        labels[idx] = Math.min(left, top);
        if (left !== top) union(left, top);
      }
    }
  }

  // Second pass - resolve equivalences
  const componentStats = new Map<
    number,
    { minX: number; minY: number; maxX: number; maxY: number; area: number }
  >();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (labels[idx] === 0) continue;

      const resolved = find(labels[idx]);
      labels[idx] = resolved;

      if (!componentStats.has(resolved)) {
        componentStats.set(resolved, {
          minX: x, minY: y, maxX: x, maxY: y, area: 0,
        });
      }
      const stats = componentStats.get(resolved)!;
      stats.minX = Math.min(stats.minX, x);
      stats.minY = Math.min(stats.minY, y);
      stats.maxX = Math.max(stats.maxX, x);
      stats.maxY = Math.max(stats.maxY, y);
      stats.area++;
    }
  }

  // Filter by minimum area
  const objects = Array.from(componentStats.values())
    .filter((s) => s.area >= minArea)
    .map((s) => ({
      x: s.minX,
      y: s.minY,
      width: s.maxX - s.minX,
      height: s.maxY - s.minY,
      area: s.area,
    }));

  // Create visualization
  const outputData = new Uint8ClampedArray(data);
  const colors = generateColors(objects.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const label = labels[idx];
      if (label === 0) continue;

      const objIndex = objects.findIndex(
        (o) => x >= o.x && x <= o.x + o.width && y >= o.y && y <= o.y + o.height
      );
      if (objIndex >= 0) {
        const c = colors[objIndex % colors.length];
        const pi = idx * 4;
        outputData[pi] = Math.min(255, data[pi] * 0.5 + c[0] * 0.5);
        outputData[pi + 1] = Math.min(255, data[pi + 1] * 0.5 + c[1] * 0.5);
        outputData[pi + 2] = Math.min(255, data[pi + 2] * 0.5 + c[2] * 0.5);
      }
    }
  }

  // Draw bounding boxes
  for (let i = 0; i < objects.length; i++) {
    const o = objects[i];
    const c = colors[i % colors.length];
    drawRect(outputData, width, height, o.x, o.y, o.width, o.height, c);
  }

  return {
    count: objects.length,
    objects,
    processedImageData: new ImageData(outputData, width, height),
  };
}

/**
 * Detect circles using a simplified Hough-like approach for coin detection
 */
export function detectCircles(
  imageData: ImageData,
  minRadius: number = 15,
  maxRadius: number = 80
): CountResult {
  const { width, height, data } = imageData;

  // Grayscale
  const gray = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Simple edge detection (Sobel approximation)
  const edges = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -gray[idx - width - 1] + gray[idx - width + 1] -
        2 * gray[idx - 1] + 2 * gray[idx + 1] -
        gray[idx + width - 1] + gray[idx + width + 1];
      const gy =
        -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1] +
        gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1];
      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Threshold edges
  const edgeThreshold = 50;
  const binaryEdges = edges.map((v) => (v > edgeThreshold ? 1 : 0));

  // Simple circle accumulator
  const circles: { x: number; y: number; r: number; votes: number }[] = [];
  const stepR = 3;
  const stepAngle = 15;

  for (let r = minRadius; r <= maxRadius; r += stepR) {
    const accumulator = new Float32Array(width * height);

    for (let y = r; y < height - r; y += 2) {
      for (let x = r; x < width - r; x += 2) {
        if (binaryEdges[y * width + x] === 0) continue;

        for (let angle = 0; angle < 360; angle += stepAngle) {
          const rad = (angle * Math.PI) / 180;
          const cx = Math.round(x - r * Math.cos(rad));
          const cy = Math.round(y - r * Math.sin(rad));
          if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
            accumulator[cy * width + cx]++;
          }
        }
      }
    }

    // Find peaks
    const threshold = (360 / stepAngle) * 0.4;
    for (let y = r; y < height - r; y++) {
      for (let x = r; x < width - r; x++) {
        if (accumulator[y * width + x] > threshold) {
          // Check if too close to existing circle
          const tooClose = circles.some(
            (c) => Math.sqrt((c.x - x) ** 2 + (c.y - y) ** 2) < minRadius
          );
          if (!tooClose) {
            circles.push({ x, y, r, votes: accumulator[y * width + x] });
          }
        }
      }
    }
  }

  // Convert to objects format
  const objects = circles.map((c) => ({
    x: c.x - c.r,
    y: c.y - c.r,
    width: c.r * 2,
    height: c.r * 2,
    area: Math.PI * c.r * c.r,
  }));

  // Visualization
  const outputData = new Uint8ClampedArray(data);
  const colors = generateColors(objects.length);

  for (let i = 0; i < circles.length; i++) {
    const c = circles[i];
    const col = colors[i % colors.length];
    drawCircle(outputData, width, height, c.x, c.y, c.r, col);
  }

  return {
    count: circles.length,
    objects,
    processedImageData: new ImageData(outputData, width, height),
  };
}

function generateColors(count: number): [number, number, number][] {
  const colors: [number, number, number][] = [];
  for (let i = 0; i < Math.max(count, 1); i++) {
    const hue = (i * 137.5) % 360;
    const [r, g, b] = hslToRgb(hue / 360, 0.8, 0.6);
    colors.push([r, g, b]);
  }
  return colors;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 1/6) { r = c; g = x; }
  else if (h < 2/6) { r = x; g = c; }
  else if (h < 3/6) { g = c; b = x; }
  else if (h < 4/6) { g = x; b = c; }
  else if (h < 5/6) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function drawRect(
  data: Uint8ClampedArray, w: number, h: number,
  x: number, y: number, rw: number, rh: number,
  color: [number, number, number]
) {
  const thickness = 3;
  for (let t = 0; t < thickness; t++) {
    for (let i = x; i <= x + rw; i++) {
      setPixel(data, w, h, i, y + t, color);
      setPixel(data, w, h, i, y + rh - t, color);
    }
    for (let j = y; j <= y + rh; j++) {
      setPixel(data, w, h, x + t, j, color);
      setPixel(data, w, h, x + rw - t, j, color);
    }
  }
}

function drawCircle(
  data: Uint8ClampedArray, w: number, h: number,
  cx: number, cy: number, r: number,
  color: [number, number, number]
) {
  for (let angle = 0; angle < 360; angle += 0.5) {
    const rad = (angle * Math.PI) / 180;
    for (let t = -1; t <= 1; t++) {
      const x = Math.round(cx + (r + t) * Math.cos(rad));
      const y = Math.round(cy + (r + t) * Math.sin(rad));
      setPixel(data, w, h, x, y, color);
    }
  }
}

function setPixel(
  data: Uint8ClampedArray, w: number, h: number,
  x: number, y: number, color: [number, number, number]
) {
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  const idx = (y * w + x) * 4;
  data[idx] = color[0];
  data[idx + 1] = color[1];
  data[idx + 2] = color[2];
  data[idx + 3] = 255;
}
