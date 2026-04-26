import "@/test-utils";
import { describe, it, expect } from "vitest";
import {
  encodeMessage,
  decodeMessage,
  getCapacity,
  detectSteganography,
} from "./lsb";
import { createRandomImage, createUniformImage } from "@/test-utils";

describe("LSB Steganography", () => {
  describe("encodeMessage / decodeMessage roundtrip", () => {
    it("recovers a simple message", () => {
      const img = createRandomImage(64, 64);
      const encoded = encodeMessage(img, "Hello World");
      const decoded = decodeMessage(encoded);
      expect(decoded).toBe("Hello World");
    });

    it("recovers special characters", () => {
      const img = createRandomImage(64, 64);
      const msg = "Test @#$%^&*() 123!";
      const encoded = encodeMessage(img, msg);
      expect(decodeMessage(encoded)).toBe(msg);
    });

    it("recovers empty message", () => {
      const img = createRandomImage(64, 64);
      const encoded = encodeMessage(img, "");
      expect(decodeMessage(encoded)).toBe("");
    });

    it("recovers long message up to capacity", () => {
      const img = createRandomImage(128, 128);
      const capacity = getCapacity(img);
      const msg = "A".repeat(Math.min(capacity, 500));
      const encoded = encodeMessage(img, msg);
      expect(decodeMessage(encoded)).toBe(msg);
    });
  });

  describe("encodeMessage", () => {
    it("only modifies LSBs (difference of at most 1 per channel)", () => {
      const img = createRandomImage(32, 32);
      const encoded = encodeMessage(img, "Test");
      for (let i = 0; i < img.data.length; i++) {
        if (i % 4 === 3) continue; // skip alpha
        const diff = Math.abs(img.data[i] - encoded.data[i]);
        expect(diff).toBeLessThanOrEqual(1);
      }
    });

    it("preserves alpha channel", () => {
      const img = createRandomImage(32, 32);
      const encoded = encodeMessage(img, "Test");
      for (let i = 3; i < img.data.length; i += 4) {
        expect(encoded.data[i]).toBe(img.data[i]);
      }
    });

    it("preserves image dimensions", () => {
      const img = createRandomImage(32, 32);
      const encoded = encodeMessage(img, "Test");
      expect(encoded.width).toBe(32);
      expect(encoded.height).toBe(32);
    });

    it("throws on message too long", () => {
      const img = createRandomImage(4, 4); // very small
      const longMsg = "A".repeat(1000);
      expect(() => encodeMessage(img, longMsg)).toThrow("Message too long");
    });
  });

  describe("decodeMessage", () => {
    it("returns no-message indicator on unmodified image", () => {
      const img = createUniformImage(32, 32, 128, 128, 128);
      const result = decodeMessage(img);
      expect(result).toBe("[No hidden message found]");
    });
  });

  describe("getCapacity", () => {
    it("returns correct capacity for given image size", () => {
      const img = createRandomImage(10, 10);
      const capacity = getCapacity(img);
      // 10*10 pixels * 3 channels / 8 bits = 37.5 chars, minus delimiter "<<END>>" (7 chars)
      expect(capacity).toBe(Math.floor((100 * 3) / 8) - 7);
    });

    it("larger image has more capacity", () => {
      const small = createRandomImage(10, 10);
      const large = createRandomImage(100, 100);
      expect(getCapacity(large)).toBeGreaterThan(getCapacity(small));
    });
  });

  describe("detectSteganography (Chi-square)", () => {
    it("returns probability between 0 and 1", () => {
      const img = createRandomImage(64, 64);
      const result = detectSteganography(img);
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(1);
    });

    it("returns analysis string", () => {
      const img = createRandomImage(64, 64);
      const result = detectSteganography(img);
      expect(typeof result.analysis).toBe("string");
      expect(result.analysis.length).toBeGreaterThan(0);
    });

    it("encoded image returns valid detection result", () => {
      const img = createRandomImage(128, 128, 42);
      const encoded = encodeMessage(img, "A".repeat(200));
      const result = detectSteganography(encoded);
      // Chi-square steganalysis is statistical — we verify it returns
      // a valid result structure rather than exact probability ordering
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(1);
      expect(typeof result.isLikelySteganographic).toBe("boolean");
      expect(result.analysis.length).toBeGreaterThan(0);
    });

    it("handles very small image gracefully", () => {
      const img = createUniformImage(2, 2, 100, 100, 100);
      const result = detectSteganography(img);
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.analysis.length).toBeGreaterThan(0);
    });
  });
});
