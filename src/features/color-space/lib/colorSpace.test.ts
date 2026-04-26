import "@/test-utils";
import { describe, it, expect } from "vitest";
import { convertColorSpace, COLOR_MODES, type ColorMode } from "./colorSpace";
import { createUniformImage, createRandomImage } from "@/test-utils";

describe("convertColorSpace", () => {
  const allModes: ColorMode[] = COLOR_MODES.map((m) => m.value);

  it.each(allModes)("%s produces valid ImageData with correct dimensions", (mode) => {
    const img = createRandomImage(8, 8);
    const result = convertColorSpace(img, { mode });
    expect(result.width).toBe(8);
    expect(result.height).toBe(8);
    expect(result.data.length).toBe(8 * 8 * 4);
  });

  it.each(allModes)("%s preserves alpha channel", (mode) => {
    const img = createRandomImage(8, 8);
    const result = convertColorSpace(img, { mode });
    for (let i = 3; i < result.data.length; i += 4) {
      expect(result.data[i]).toBe(img.data[i]);
    }
  });

  describe("grayscale", () => {
    it("uses correct luminance formula", () => {
      const img = createUniformImage(1, 1, 100, 150, 200);
      const result = convertColorSpace(img, { mode: "grayscale" });
      const expected = Math.round(0.299 * 100 + 0.587 * 150 + 0.114 * 200);
      expect(result.data[0]).toBe(expected);
      expect(result.data[1]).toBe(expected);
      expect(result.data[2]).toBe(expected);
    });

    it("pure white stays white", () => {
      const img = createUniformImage(1, 1, 255, 255, 255);
      const result = convertColorSpace(img, { mode: "grayscale" });
      expect(result.data[0]).toBe(255);
    });

    it("pure black stays black", () => {
      const img = createUniformImage(1, 1, 0, 0, 0);
      const result = convertColorSpace(img, { mode: "grayscale" });
      expect(result.data[0]).toBe(0);
    });
  });

  describe("inverted", () => {
    it("produces 255 minus original for each channel", () => {
      const img = createUniformImage(1, 1, 100, 150, 200);
      const result = convertColorSpace(img, { mode: "inverted" });
      expect(result.data[0]).toBe(155);
      expect(result.data[1]).toBe(105);
      expect(result.data[2]).toBe(55);
    });

    it("double inversion returns original", () => {
      const img = createRandomImage(8, 8);
      const inv1 = convertColorSpace(img, { mode: "inverted" });
      const inv2 = convertColorSpace(inv1, { mode: "inverted" });
      for (let i = 0; i < img.data.length; i += 4) {
        expect(inv2.data[i]).toBe(img.data[i]);
        expect(inv2.data[i + 1]).toBe(img.data[i + 1]);
        expect(inv2.data[i + 2]).toBe(img.data[i + 2]);
      }
    });
  });

  describe("binary", () => {
    it("produces only 0 or 255 values", () => {
      const img = createRandomImage(16, 16);
      const result = convertColorSpace(img, { mode: "binary", threshold: 128 });
      for (let i = 0; i < result.data.length; i += 4) {
        expect(result.data[i] === 0 || result.data[i] === 255).toBe(true);
        expect(result.data[i]).toBe(result.data[i + 1]); // R=G=B
        expect(result.data[i]).toBe(result.data[i + 2]);
      }
    });

    it("respects custom threshold", () => {
      const img = createUniformImage(1, 1, 100, 100, 100);
      const low = convertColorSpace(img, { mode: "binary", threshold: 50 });
      const high = convertColorSpace(img, { mode: "binary", threshold: 150 });
      expect(low.data[0]).toBe(255); // 100 >= 50
      expect(high.data[0]).toBe(0);  // 100 < 150
    });
  });

  describe("channel isolation", () => {
    it("redChannel keeps only red", () => {
      const img = createUniformImage(1, 1, 100, 150, 200);
      const result = convertColorSpace(img, { mode: "redChannel" });
      expect(result.data[0]).toBe(100);
      expect(result.data[1]).toBe(0);
      expect(result.data[2]).toBe(0);
    });

    it("greenChannel keeps only green", () => {
      const img = createUniformImage(1, 1, 100, 150, 200);
      const result = convertColorSpace(img, { mode: "greenChannel" });
      expect(result.data[0]).toBe(0);
      expect(result.data[1]).toBe(150);
      expect(result.data[2]).toBe(0);
    });

    it("blueChannel keeps only blue", () => {
      const img = createUniformImage(1, 1, 100, 150, 200);
      const result = convertColorSpace(img, { mode: "blueChannel" });
      expect(result.data[0]).toBe(0);
      expect(result.data[1]).toBe(0);
      expect(result.data[2]).toBe(200);
    });
  });

  describe("sepia", () => {
    it("produces warm-toned output", () => {
      const img = createUniformImage(1, 1, 100, 100, 100);
      const result = convertColorSpace(img, { mode: "sepia" });
      // Sepia: R > G > B
      expect(result.data[0]).toBeGreaterThanOrEqual(result.data[1]);
      expect(result.data[1]).toBeGreaterThanOrEqual(result.data[2]);
    });
  });
});

describe("COLOR_MODES", () => {
  it("has 15 entries", () => {
    expect(COLOR_MODES).toHaveLength(15);
  });

  it("each entry has value and label", () => {
    for (const m of COLOR_MODES) {
      expect(m.value).toBeDefined();
      expect(m.label).toBeDefined();
    }
  });
});
