import "@/test-utils";
import { describe, it, expect } from "vitest";
import { detectEdges, EDGE_METHODS, type EdgeMethod } from "./edgeDetect";
import {
  createUniformImage,
  createVerticalEdgeImage,
  createCheckerboard,
} from "@/test-utils";

describe("detectEdges", () => {
  const methods: EdgeMethod[] = ["sobel", "prewitt", "laplacian", "roberts", "harris", "canny"];

  it.each(methods)("%s produces ImageData with correct dimensions", (method) => {
    const img = createCheckerboard(32, 32);
    const result = detectEdges(img, method);
    expect(result.width).toBe(32);
    expect(result.height).toBe(32);
    expect(result.data.length).toBe(32 * 32 * 4);
  });

  it.each(methods)("%s output alpha channel is always 255", (method) => {
    const img = createCheckerboard(16, 16);
    const result = detectEdges(img, method);
    for (let i = 3; i < result.data.length; i += 4) {
      expect(result.data[i]).toBe(255);
    }
  });

  describe("gradient methods on uniform image", () => {
    const gradientMethods: EdgeMethod[] = ["sobel", "prewitt", "laplacian", "roberts"];

    it.each(gradientMethods)(
      "%s produces near-zero output on uniform image",
      (method) => {
        const img = createUniformImage(16, 16, 128, 128, 128);
        const result = detectEdges(img, method);
        let maxVal = 0;
        for (let i = 0; i < result.data.length; i += 4) {
          maxVal = Math.max(maxVal, result.data[i]);
        }
        expect(maxVal).toBeLessThan(5);
      }
    );
  });

  describe("vertical edge detection", () => {
    it("Sobel detects vertical edge with strong response", () => {
      const img = createVerticalEdgeImage(32, 32);
      const result = detectEdges(img, "sobel");
      // Pixels near the edge (x=16) should have high values
      const edgeX = 16;
      let edgeMax = 0;
      let nonEdgeMax = 0;
      for (let y = 2; y < 30; y++) {
        for (let x = 0; x < 32; x++) {
          const v = result.data[(y * 32 + x) * 4];
          if (Math.abs(x - edgeX) <= 1) {
            edgeMax = Math.max(edgeMax, v);
          } else if (Math.abs(x - edgeX) > 3) {
            nonEdgeMax = Math.max(nonEdgeMax, v);
          }
        }
      }
      expect(edgeMax).toBeGreaterThan(100);
      expect(nonEdgeMax).toBeLessThan(edgeMax);
    });
  });

  describe("invert flag", () => {
    it("inverted output is 255 minus non-inverted", () => {
      const img = createVerticalEdgeImage(16, 16);
      const normal = detectEdges(img, "sobel", false);
      const inverted = detectEdges(img, "sobel", true);
      for (let i = 0; i < normal.data.length; i += 4) {
        // Allow +-1 for rounding
        expect(Math.abs(inverted.data[i] - (255 - normal.data[i]))).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("Harris corner detection", () => {
    it("marks corners in red on checkerboard", () => {
      const img = createCheckerboard(32, 32, 8);
      const result = detectEdges(img, "harris");
      // Check that some pixels are red (R=255, G=0, B=0)
      let redPixels = 0;
      for (let i = 0; i < result.data.length; i += 4) {
        if (result.data[i] === 255 && result.data[i + 1] === 0 && result.data[i + 2] === 0) {
          redPixels++;
        }
      }
      expect(redPixels).toBeGreaterThan(0);
    });
  });

  describe("Canny edge detection", () => {
    it("produces binary-like output (mostly 0 or 255)", () => {
      const img = createVerticalEdgeImage(32, 32);
      const result = detectEdges(img, "canny");
      let binaryCount = 0;
      const total = result.width * result.height;
      for (let i = 0; i < result.data.length; i += 4) {
        if (result.data[i] === 0 || result.data[i] === 255) binaryCount++;
      }
      // Canny should produce mostly binary output
      expect(binaryCount / total).toBeGreaterThan(0.9);
    });
  });
});

describe("EDGE_METHODS", () => {
  it("has 6 entries", () => {
    expect(EDGE_METHODS).toHaveLength(6);
  });

  it("each entry has value, label, and desc", () => {
    for (const m of EDGE_METHODS) {
      expect(m.value).toBeDefined();
      expect(m.label).toBeDefined();
      expect(m.desc).toBeDefined();
    }
  });
});
