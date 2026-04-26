/**
 * Shared test utilities — ImageData polyfill & helpers
 */

// Polyfill ImageData for Node.js test environment
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as unknown as Record<string, unknown>).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    colorSpace: string = "srgb";
    constructor(
      dataOrWidth: Uint8ClampedArray | number,
      widthOrHeight: number,
      height?: number
    ) {
      if (typeof dataOrWidth === "number") {
        this.width = dataOrWidth;
        this.height = widthOrHeight;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      } else {
        this.data = dataOrWidth;
        this.width = widthOrHeight;
        this.height = height!;
      }
    }
  };
}

/** Create a uniform-color ImageData */
export function createUniformImage(
  w: number,
  h: number,
  r: number,
  g: number,
  b: number,
  a = 255
): ImageData {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  }
  return new ImageData(data, w, h);
}

/** Create an image with a sharp vertical edge at x = midpoint */
export function createVerticalEdgeImage(w: number, h: number): ImageData {
  const data = new Uint8ClampedArray(w * h * 4);
  const mid = Math.floor(w / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = x < mid ? 0 : 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return new ImageData(data, w, h);
}

/** Create a checkerboard pattern */
export function createCheckerboard(w: number, h: number, blockSize = 4): ImageData {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = (Math.floor(x / blockSize) + Math.floor(y / blockSize)) % 2 === 0 ? 255 : 0;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return new ImageData(data, w, h);
}

/** Create a random noise image */
export function createRandomImage(w: number, h: number, seed = 42): ImageData {
  const data = new Uint8ClampedArray(w * h * 4);
  let s = seed;
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s / 2147483647) * 255;
  };
  for (let i = 0; i < data.length; i += 4) {
    data[i] = rand();
    data[i + 1] = rand();
    data[i + 2] = rand();
    data[i + 3] = 255;
  }
  return new ImageData(data, w, h);
}

/** Create a gradient image (left=black, right=white) */
export function createGradientImage(w: number, h: number): ImageData {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = Math.round((x / (w - 1)) * 255);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return new ImageData(data, w, h);
}
