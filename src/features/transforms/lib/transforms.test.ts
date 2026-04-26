import "@/test-utils";
import { describe, it, expect } from "vitest";
import {
  resizeImage,
  rotateImage,
  flipImage,
  cropImage,
  shearImage,
  translateImage,
  applyTransform,
  TRANSFORM_TYPES,
  INTERPOLATION_METHODS,
} from "./transforms";
import { createUniformImage, createRandomImage } from "@/test-utils";

describe("resizeImage", () => {
  it("changes dimensions correctly", () => {
    const img = createRandomImage(16, 16);
    const result = resizeImage(img, 32, 24, "nearest");
    expect(result.width).toBe(32);
    expect(result.height).toBe(24);
  });

  it("downscale works", () => {
    const img = createRandomImage(32, 32);
    const result = resizeImage(img, 8, 8, "nearest");
    expect(result.width).toBe(8);
    expect(result.height).toBe(8);
  });

  it("bilinear interpolation produces valid output", () => {
    const img = createRandomImage(16, 16);
    const result = resizeImage(img, 32, 32, "bilinear");
    expect(result.width).toBe(32);
    for (let i = 0; i < result.data.length; i += 4) {
      expect(result.data[i]).toBeGreaterThanOrEqual(0);
      expect(result.data[i]).toBeLessThanOrEqual(255);
    }
  });

  it("minimum size is 1x1", () => {
    const img = createRandomImage(8, 8);
    const result = resizeImage(img, 0, 0, "nearest");
    expect(result.width).toBeGreaterThanOrEqual(1);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });
});

describe("flipImage", () => {
  it("horizontal flip swaps left and right", () => {
    // Create image: left half red, right half blue
    const w = 4, h = 2;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (x < 2) {
          data[i] = 255; data[i + 1] = 0; data[i + 2] = 0;
        } else {
          data[i] = 0; data[i + 1] = 0; data[i + 2] = 255;
        }
        data[i + 3] = 255;
      }
    }
    const img = new ImageData(data, w, h);
    const result = flipImage(img, "horizontal");
    // After flip: left should be blue, right should be red
    expect(result.data[0]).toBe(0);   // first pixel R (was blue)
    expect(result.data[2]).toBe(255); // first pixel B
    expect(result.data[(w - 1) * 4]).toBe(255); // last pixel R (was red)
  });

  it("vertical flip swaps top and bottom", () => {
    const w = 2, h = 4;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        data[i] = y < 2 ? 255 : 0; // top=red, bottom=black
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
    }
    const img = new ImageData(data, w, h);
    const result = flipImage(img, "vertical");
    expect(result.data[0]).toBe(0);   // top-left was bottom (black)
    expect(result.data[((h - 1) * w) * 4]).toBe(255); // bottom-left was top (red)
  });

  it("double horizontal flip returns original", () => {
    const img = createRandomImage(8, 8);
    const flipped = flipImage(flipImage(img, "horizontal"), "horizontal");
    for (let i = 0; i < img.data.length; i++) {
      expect(flipped.data[i]).toBe(img.data[i]);
    }
  });

  it("preserves dimensions", () => {
    const img = createRandomImage(16, 8);
    expect(flipImage(img, "horizontal").width).toBe(16);
    expect(flipImage(img, "horizontal").height).toBe(8);
    expect(flipImage(img, "both").width).toBe(16);
  });
});

describe("cropImage", () => {
  it("produces correct dimensions", () => {
    const img = createRandomImage(32, 32);
    const result = cropImage(img, 5, 5, 10, 10);
    expect(result.width).toBe(10);
    expect(result.height).toBe(10);
  });

  it("clamps to image bounds", () => {
    const img = createRandomImage(16, 16);
    const result = cropImage(img, 10, 10, 100, 100);
    expect(result.width).toBeLessThanOrEqual(16);
    expect(result.height).toBeLessThanOrEqual(16);
  });

  it("extracts correct pixel data", () => {
    const img = createUniformImage(8, 8, 200, 100, 50);
    const result = cropImage(img, 2, 2, 4, 4);
    expect(result.data[0]).toBe(200);
    expect(result.data[1]).toBe(100);
    expect(result.data[2]).toBe(50);
  });
});

describe("rotateImage", () => {
  it("0 degree rotation preserves dimensions", () => {
    const img = createRandomImage(8, 8);
    const result = rotateImage(img, 0, "nearest");
    expect(result.width).toBe(8);
    expect(result.height).toBe(8);
  });

  it("90 degree rotation swaps width and height", () => {
    const img = createRandomImage(8, 16);
    const result = rotateImage(img, 90, "nearest");
    // Rotated bounding box should swap dimensions (approximately)
    expect(result.width).toBeGreaterThanOrEqual(15);
    expect(result.height).toBeGreaterThanOrEqual(7);
  });
});

describe("translateImage", () => {
  it("preserves dimensions", () => {
    const img = createRandomImage(16, 16);
    const result = translateImage(img, 5, 5);
    expect(result.width).toBe(16);
    expect(result.height).toBe(16);
  });

  it("shifted pixels are transparent", () => {
    const img = createUniformImage(8, 8, 255, 0, 0);
    const result = translateImage(img, 4, 0);
    // Left 4 columns should be transparent (alpha=0)
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 4; x++) {
        const i = (y * 8 + x) * 4;
        expect(result.data[i + 3]).toBe(0);
      }
    }
  });
});

describe("shearImage", () => {
  it("zero shear preserves image", () => {
    const img = createRandomImage(8, 8);
    const result = shearImage(img, 0, 0, "nearest");
    expect(result.width).toBe(8);
    expect(result.height).toBe(8);
  });
});

describe("applyTransform", () => {
  it("dispatches resize correctly", () => {
    const img = createRandomImage(16, 16);
    const result = applyTransform(img, {
      type: "resize",
      interpolation: "nearest",
      scaleX: 2,
      scaleY: 2,
    });
    expect(result.width).toBe(32);
    expect(result.height).toBe(32);
  });

  it("dispatches flip correctly", () => {
    const img = createRandomImage(8, 8);
    const result = applyTransform(img, {
      type: "flip",
      interpolation: "nearest",
      flipDirection: "horizontal",
    });
    expect(result.width).toBe(8);
  });
});

describe("constants", () => {
  it("TRANSFORM_TYPES has 6 entries", () => {
    expect(TRANSFORM_TYPES).toHaveLength(6);
  });

  it("INTERPOLATION_METHODS has 2 entries", () => {
    expect(INTERPOLATION_METHODS).toHaveLength(2);
  });
});
