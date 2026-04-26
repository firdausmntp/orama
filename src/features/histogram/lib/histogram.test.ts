import "@/test-utils";
import { describe, it, expect } from "vitest";
import { computeHistogram, equalizeHistogram } from "./histogram";
import { createUniformImage, createGradientImage } from "@/test-utils";

describe("computeHistogram", () => {
  it("all histogram arrays have length 256", () => {
    const img = createUniformImage(8, 8, 100, 150, 200);
    const hist = computeHistogram(img);
    expect(hist.red).toHaveLength(256);
    expect(hist.green).toHaveLength(256);
    expect(hist.blue).toHaveLength(256);
    expect(hist.luminance).toHaveLength(256);
  });

  it("histogram bins sum to total pixel count", () => {
    const img = createGradientImage(16, 16);
    const hist = computeHistogram(img);
    const totalPixels = 16 * 16;
    const redSum = hist.red.reduce((a, b) => a + b, 0);
    const greenSum = hist.green.reduce((a, b) => a + b, 0);
    const blueSum = hist.blue.reduce((a, b) => a + b, 0);
    const lumSum = hist.luminance.reduce((a, b) => a + b, 0);
    expect(redSum).toBe(totalPixels);
    expect(greenSum).toBe(totalPixels);
    expect(blueSum).toBe(totalPixels);
    expect(lumSum).toBe(totalPixels);
  });

  it("uniform red image has all counts in red[255]", () => {
    const img = createUniformImage(10, 10, 255, 0, 0);
    const hist = computeHistogram(img);
    expect(hist.red[255]).toBe(100);
    expect(hist.green[0]).toBe(100);
    expect(hist.blue[0]).toBe(100);
  });

  it("uniform gray image has single luminance bin", () => {
    const img = createUniformImage(8, 8, 128, 128, 128);
    const hist = computeHistogram(img);
    expect(hist.luminance[128]).toBe(64);
  });
});

describe("equalizeHistogram", () => {
  it("preserves image dimensions", () => {
    const img = createGradientImage(16, 16);
    const result = equalizeHistogram(img);
    expect(result.width).toBe(16);
    expect(result.height).toBe(16);
  });

  it("output values are in 0-255 range", () => {
    const img = createGradientImage(32, 32);
    const result = equalizeHistogram(img);
    for (let i = 0; i < result.data.length; i += 4) {
      expect(result.data[i]).toBeGreaterThanOrEqual(0);
      expect(result.data[i]).toBeLessThanOrEqual(255);
    }
  });

  it("equalization of low-contrast image spreads histogram", () => {
    // Create a low-contrast image (values 100-110)
    const w = 32, h = 32;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      const v = 100 + Math.floor((i / data.length) * 10);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    const img = new ImageData(data, w, h);
    const result = equalizeHistogram(img);

    // After equalization, the range should be wider
    let min = 255, max = 0;
    for (let i = 0; i < result.data.length; i += 4) {
      min = Math.min(min, result.data[i]);
      max = Math.max(max, result.data[i]);
    }
    expect(max - min).toBeGreaterThan(10);
  });

  it("preserves alpha channel", () => {
    const img = createGradientImage(8, 8);
    const result = equalizeHistogram(img);
    for (let i = 3; i < result.data.length; i += 4) {
      expect(result.data[i]).toBe(255);
    }
  });
});
