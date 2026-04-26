import "@/test-utils";
import { describe, it, expect } from "vitest";
import {
  applyConvolution,
  applyMedianFilter,
  PRESET_KERNELS,
  FILTER_PRESETS,
} from "./filters";
import { createUniformImage, createRandomImage } from "@/test-utils";

describe("applyConvolution", () => {
  it("identity kernel returns same pixel values", () => {
    const img = createRandomImage(8, 8);
    const result = applyConvolution(img, PRESET_KERNELS.identity.kernel);
    for (let i = 0; i < img.data.length; i += 4) {
      expect(result.data[i]).toBe(img.data[i]);
      expect(result.data[i + 1]).toBe(img.data[i + 1]);
      expect(result.data[i + 2]).toBe(img.data[i + 2]);
    }
  });

  it("box blur on uniform image returns same image", () => {
    const img = createUniformImage(8, 8, 100, 150, 200);
    const result = applyConvolution(
      img,
      PRESET_KERNELS.boxBlur.kernel,
      PRESET_KERNELS.boxBlur.divisor
    );
    for (let i = 0; i < result.data.length; i += 4) {
      expect(result.data[i]).toBe(100);
      expect(result.data[i + 1]).toBe(150);
      expect(result.data[i + 2]).toBe(200);
    }
  });

  it("preserves image dimensions", () => {
    const img = createRandomImage(16, 16);
    const result = applyConvolution(img, PRESET_KERNELS.sharpen.kernel);
    expect(result.width).toBe(16);
    expect(result.height).toBe(16);
  });

  it("preserves alpha channel", () => {
    const img = createRandomImage(8, 8);
    const result = applyConvolution(img, PRESET_KERNELS.sharpen.kernel);
    for (let i = 3; i < result.data.length; i += 4) {
      expect(result.data[i]).toBe(img.data[i]);
    }
  });

  it("output values are clamped to 0-255", () => {
    const img = createRandomImage(8, 8);
    const result = applyConvolution(img, PRESET_KERNELS.emboss.kernel);
    for (let i = 0; i < result.data.length; i += 4) {
      expect(result.data[i]).toBeGreaterThanOrEqual(0);
      expect(result.data[i]).toBeLessThanOrEqual(255);
    }
  });

  it("supports multiple iterations", () => {
    const img = createRandomImage(8, 8);
    const single = applyConvolution(
      img,
      PRESET_KERNELS.gaussianBlur.kernel,
      PRESET_KERNELS.gaussianBlur.divisor,
      1
    );
    const double = applyConvolution(
      img,
      PRESET_KERNELS.gaussianBlur.kernel,
      PRESET_KERNELS.gaussianBlur.divisor,
      2
    );
    // Double blur should be smoother (different from single)
    let diffCount = 0;
    for (let i = 0; i < single.data.length; i += 4) {
      if (single.data[i] !== double.data[i]) diffCount++;
    }
    expect(diffCount).toBeGreaterThan(0);
  });

  it("custom kernel works", () => {
    const img = createRandomImage(8, 8);
    const customKernel = [
      [0, 0, 0],
      [0, 2, 0],
      [0, 0, 0],
    ];
    const result = applyConvolution(img, customKernel, 2);
    expect(result.width).toBe(8);
    expect(result.height).toBe(8);
  });
});

describe("applyMedianFilter", () => {
  it("preserves dimensions", () => {
    const img = createRandomImage(16, 16);
    const result = applyMedianFilter(img, 3, 1);
    expect(result.width).toBe(16);
    expect(result.height).toBe(16);
  });

  it("uniform image stays the same", () => {
    const img = createUniformImage(8, 8, 100, 100, 100);
    const result = applyMedianFilter(img, 3, 1);
    for (let i = 0; i < result.data.length; i += 4) {
      expect(result.data[i]).toBe(100);
    }
  });

  it("preserves alpha channel", () => {
    const img = createRandomImage(8, 8);
    const result = applyMedianFilter(img, 3, 1);
    for (let i = 3; i < result.data.length; i += 4) {
      expect(result.data[i]).toBe(img.data[i]);
    }
  });
});

describe("PRESET_KERNELS", () => {
  it("has 7 preset kernels", () => {
    expect(Object.keys(PRESET_KERNELS)).toHaveLength(7);
  });

  it("each kernel is a 2D array", () => {
    for (const key of Object.keys(PRESET_KERNELS)) {
      const k = PRESET_KERNELS[key as keyof typeof PRESET_KERNELS];
      expect(Array.isArray(k.kernel)).toBe(true);
      expect(k.kernel.length).toBeGreaterThan(0);
      expect(Array.isArray(k.kernel[0])).toBe(true);
    }
  });
});

describe("FILTER_PRESETS", () => {
  it("has 9 entries (7 kernels + median + custom)", () => {
    expect(FILTER_PRESETS).toHaveLength(9);
  });
});
