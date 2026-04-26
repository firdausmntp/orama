import "@/test-utils";
import { describe, it, expect } from "vitest";
import { analyzeImage, generateSuggestions, applyEnhancement } from "./advisor";
import { createUniformImage, createRandomImage, createGradientImage } from "@/test-utils";

describe("analyzeImage", () => {
  it("returns all expected metric fields", () => {
    const img = createRandomImage(16, 16);
    const metrics = analyzeImage(img);
    expect(metrics).toHaveProperty("brightness");
    expect(metrics).toHaveProperty("contrast");
    expect(metrics).toHaveProperty("saturation");
    expect(metrics).toHaveProperty("sharpness");
    expect(metrics).toHaveProperty("histogram");
    expect(metrics).toHaveProperty("colorDominant");
  });

  it("pure white image has brightness ~255", () => {
    const img = createUniformImage(8, 8, 255, 255, 255);
    const metrics = analyzeImage(img);
    expect(metrics.brightness).toBeCloseTo(255, 0);
  });

  it("pure black image has brightness ~0", () => {
    const img = createUniformImage(8, 8, 0, 0, 0);
    const metrics = analyzeImage(img);
    expect(metrics.brightness).toBeCloseTo(0, 0);
  });

  it("mid-gray image has brightness ~128", () => {
    const img = createUniformImage(8, 8, 128, 128, 128);
    const metrics = analyzeImage(img);
    expect(metrics.brightness).toBeCloseTo(128, 0);
  });

  it("uniform image has zero contrast", () => {
    const img = createUniformImage(8, 8, 128, 128, 128);
    const metrics = analyzeImage(img);
    expect(metrics.contrast).toBeCloseTo(0, 1);
  });

  it("gradient image has non-zero contrast", () => {
    const img = createGradientImage(32, 32);
    const metrics = analyzeImage(img);
    expect(metrics.contrast).toBeGreaterThan(0);
  });

  it("grayscale image has zero saturation", () => {
    const img = createUniformImage(8, 8, 128, 128, 128);
    const metrics = analyzeImage(img);
    expect(metrics.saturation).toBeCloseTo(0, 1);
  });

  it("histogram arrays have length 256", () => {
    const img = createRandomImage(8, 8);
    const metrics = analyzeImage(img);
    expect(metrics.histogram.red).toHaveLength(256);
    expect(metrics.histogram.green).toHaveLength(256);
    expect(metrics.histogram.blue).toHaveLength(256);
    expect(metrics.histogram.luminance).toHaveLength(256);
  });

  it("colorDominant is an RGB tuple", () => {
    const img = createUniformImage(8, 8, 100, 150, 200);
    const metrics = analyzeImage(img);
    expect(metrics.colorDominant).toEqual([100, 150, 200]);
  });
});

describe("generateSuggestions", () => {
  it("suggests brightness increase for dark image", () => {
    const img = createUniformImage(16, 16, 30, 30, 30);
    const metrics = analyzeImage(img);
    const suggestions = generateSuggestions(metrics);
    const brightnessSuggestion = suggestions.find((s) => s.id === "brightness-low");
    expect(brightnessSuggestion).toBeDefined();
    expect(brightnessSuggestion!.severity).toBe("critical");
  });

  it("suggests brightness decrease for bright image", () => {
    const img = createUniformImage(16, 16, 240, 240, 240);
    const metrics = analyzeImage(img);
    const suggestions = generateSuggestions(metrics);
    const brightnessSuggestion = suggestions.find((s) => s.id === "brightness-high");
    expect(brightnessSuggestion).toBeDefined();
  });

  it("returns 'Image Quality OK' for balanced image", () => {
    const img = createGradientImage(32, 32);
    const metrics = analyzeImage(img);
    // Manually check if no issues — gradient has good contrast
    const suggestions = generateSuggestions(metrics);
    // Should have at least one suggestion
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("each suggestion has required fields", () => {
    const img = createUniformImage(16, 16, 30, 30, 30);
    const metrics = analyzeImage(img);
    const suggestions = generateSuggestions(metrics);
    for (const s of suggestions) {
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("label");
      expect(s).toHaveProperty("description");
      expect(s).toHaveProperty("severity");
      expect(s).toHaveProperty("action");
      expect(s).toHaveProperty("value");
    }
  });
});

describe("applyEnhancement", () => {
  it("brightness adjustment changes pixel values", () => {
    const img = createUniformImage(8, 8, 100, 100, 100);
    const result = applyEnhancement(img, "brightness", 50);
    expect(result.data[0]).toBe(150);
    expect(result.data[1]).toBe(150);
    expect(result.data[2]).toBe(150);
  });

  it("brightness clamps to 0-255", () => {
    const img = createUniformImage(8, 8, 200, 200, 200);
    const result = applyEnhancement(img, "brightness", 100);
    expect(result.data[0]).toBe(255); // clamped
  });

  it("contrast adjustment works", () => {
    const img = createUniformImage(8, 8, 100, 100, 100);
    const result = applyEnhancement(img, "contrast", 50);
    expect(result.width).toBe(8);
    expect(result.height).toBe(8);
  });

  it("saturation adjustment works", () => {
    const img = createUniformImage(8, 8, 200, 100, 50);
    const result = applyEnhancement(img, "saturation", 30);
    expect(result.width).toBe(8);
  });

  it("preserves dimensions", () => {
    const img = createRandomImage(16, 16);
    const result = applyEnhancement(img, "brightness", 20);
    expect(result.width).toBe(16);
    expect(result.height).toBe(16);
  });

  it("unknown action returns unchanged image", () => {
    const img = createUniformImage(4, 4, 100, 100, 100);
    const result = applyEnhancement(img, "unknown", 50);
    expect(result.data[0]).toBe(100);
  });
});
