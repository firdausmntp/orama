import "@/test-utils";
import { describe, it, expect } from "vitest";
import {
  morphologicalOp,
  MORPH_OPS,
  STRUCT_SHAPES,
  type MorphOp,
  type StructShape,
} from "./morphology";
import { createUniformImage, createCheckerboard } from "@/test-utils";

describe("morphologicalOp", () => {
  const ops: MorphOp[] = ["erode", "dilate", "open", "close", "gradient", "tophat", "blackhat", "regionGrowing"];

  it.each(ops)("%s produces valid ImageData with correct dimensions", (op) => {
    const img = createCheckerboard(16, 16);
    const { output } = morphologicalOp(img, op, 3, "square");
    expect(output.width).toBe(16);
    expect(output.height).toBe(16);
    expect(output.data.length).toBe(16 * 16 * 4);
  });

  it.each(ops)("%s output alpha is always 255", (op) => {
    const img = createCheckerboard(16, 16);
    const { output } = morphologicalOp(img, op, 3, "square");
    for (let i = 3; i < output.data.length; i += 4) {
      expect(output.data[i]).toBe(255);
    }
  });

  it("erosion of fully white image stays white", () => {
    const img = createUniformImage(16, 16, 255, 255, 255);
    const { output } = morphologicalOp(img, "erode", 3, "square");
    for (let i = 0; i < output.data.length; i += 4) {
      expect(output.data[i]).toBe(255);
    }
  });

  it("dilation of fully black image stays black", () => {
    const img = createUniformImage(16, 16, 0, 0, 0);
    const { output } = morphologicalOp(img, "dilate", 3, "square");
    for (let i = 0; i < output.data.length; i += 4) {
      expect(output.data[i]).toBe(0);
    }
  });

  it("returns binaryInput preview", () => {
    const img = createCheckerboard(16, 16);
    const { binaryInput } = morphologicalOp(img, "erode", 3, "square");
    expect(binaryInput.width).toBe(16);
    expect(binaryInput.height).toBe(16);
  });

  describe("structuring elements", () => {
    const shapes: StructShape[] = ["square", "cross", "circle"];
    it.each(shapes)("works with %s structuring element", (shape) => {
      const img = createCheckerboard(16, 16);
      const { output } = morphologicalOp(img, "dilate", 3, shape);
      expect(output.width).toBe(16);
    });
  });

  it("gradient produces non-zero output on image with edges", () => {
    const img = createCheckerboard(16, 16);
    const { output } = morphologicalOp(img, "gradient", 3, "square");
    let hasNonZero = false;
    for (let i = 0; i < output.data.length; i += 4) {
      if (output.data[i] > 0) { hasNonZero = true; break; }
    }
    expect(hasNonZero).toBe(true);
  });
});

describe("MORPH_OPS", () => {
  it("has 8 entries", () => {
    expect(MORPH_OPS).toHaveLength(8);
  });
});

describe("STRUCT_SHAPES", () => {
  it("has 3 entries", () => {
    expect(STRUCT_SHAPES).toHaveLength(3);
  });
});
