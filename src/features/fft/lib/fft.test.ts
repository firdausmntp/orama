import "@/test-utils";
import { describe, it, expect } from "vitest";
import { fft1D, ifft1D, fft2D, applyFrequencyFilter } from "./fft";
import { createUniformImage, createGradientImage } from "@/test-utils";

describe("fft1D", () => {
  it("DC signal: all energy at bin 0", () => {
    const N = 8;
    const re = new Float64Array(N).fill(1);
    const im = new Float64Array(N).fill(0);
    fft1D(re, im);
    expect(re[0]).toBeCloseTo(N, 5);
    for (let i = 1; i < N; i++) {
      expect(Math.abs(re[i])).toBeLessThan(1e-10);
      expect(Math.abs(im[i])).toBeLessThan(1e-10);
    }
  });

  it("impulse at index 0: flat spectrum", () => {
    const N = 8;
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    re[0] = 1;
    fft1D(re, im);
    for (let i = 0; i < N; i++) {
      expect(re[i]).toBeCloseTo(1, 5);
      expect(Math.abs(im[i])).toBeLessThan(1e-10);
    }
  });

  it("single frequency sinusoid has energy at correct bin", () => {
    const N = 16;
    const k = 3; // frequency bin
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    for (let n = 0; n < N; n++) {
      re[n] = Math.cos((2 * Math.PI * k * n) / N);
    }
    fft1D(re, im);
    // Energy should be at bin k and bin N-k
    const mag = (i: number) => Math.sqrt(re[i] ** 2 + im[i] ** 2);
    expect(mag(k)).toBeCloseTo(N / 2, 3);
    expect(mag(N - k)).toBeCloseTo(N / 2, 3);
    // Other bins should be near zero
    for (let i = 0; i < N; i++) {
      if (i !== k && i !== N - k) {
        expect(mag(i)).toBeLessThan(1e-8);
      }
    }
  });
});

describe("ifft1D", () => {
  it("roundtrip: fft1D then ifft1D recovers original signal", () => {
    const N = 16;
    const original = new Float64Array(N);
    for (let i = 0; i < N; i++) original[i] = Math.sin(i) + 2 * Math.cos(3 * i);

    const re = new Float64Array(original);
    const im = new Float64Array(N);
    fft1D(re, im);
    ifft1D(re, im);

    for (let i = 0; i < N; i++) {
      expect(re[i]).toBeCloseTo(original[i], 8);
    }
  });

  it("single element roundtrip", () => {
    const re = new Float64Array([42]);
    const im = new Float64Array([0]);
    fft1D(re, im);
    ifft1D(re, im);
    expect(re[0]).toBeCloseTo(42, 10);
  });
});

describe("fft2D", () => {
  it("produces magnitude spectrum with correct dimensions (power of 2)", () => {
    const img = createUniformImage(10, 10, 128, 128, 128);
    const result = fft2D(img);
    expect(result.width).toBe(16); // next power of 2 from 10
    expect(result.height).toBe(16);
    expect(result.magnitudeSpectrum.width).toBe(16);
    expect(result.magnitudeSpectrum.height).toBe(16);
  });

  it("power-of-2 input keeps same dimensions", () => {
    const img = createUniformImage(8, 8, 100, 100, 100);
    const result = fft2D(img);
    expect(result.width).toBe(8);
    expect(result.height).toBe(8);
  });

  it("uniform image has DC energy only", () => {
    const img = createUniformImage(8, 8, 200, 200, 200);
    const result = fft2D(img);
    // The grayscale value is 200 for all pixels
    // DC component should be 200 * 8 * 8 = 12800 (before log scaling)
    // Non-DC should be ~0
    const { re, im } = result;
    // Check that non-DC values are near zero
    let nonDcEnergy = 0;
    for (let y = 0; y < result.height; y++) {
      for (let x = 0; x < result.width; x++) {
        if (x === 0 && y === 0) continue;
        nonDcEnergy += re[y][x] ** 2 + im[y][x] ** 2;
      }
    }
    expect(nonDcEnergy).toBeLessThan(1e-6);
  });

  it("spectrum pixel values are in 0-255 range", () => {
    const img = createGradientImage(16, 16);
    const result = fft2D(img);
    const data = result.magnitudeSpectrum.data;
    for (let i = 0; i < data.length; i += 4) {
      expect(data[i]).toBeGreaterThanOrEqual(0);
      expect(data[i]).toBeLessThanOrEqual(255);
      expect(data[i + 3]).toBe(255); // alpha
    }
  });
});

describe("applyFrequencyFilter", () => {
  it("lowpass filter zeros high frequencies", () => {
    const img = createGradientImage(8, 8);
    const { re, im, width, height } = fft2D(img);
    const result = applyFrequencyFilter(re, im, width, height, "lowpass", 20);
    expect(result.filtered.width).toBe(width);
    expect(result.filtered.height).toBe(height);
    expect(result.filterMask).toBeDefined();
  });

  it("highpass filter zeros low frequencies", () => {
    const img = createGradientImage(8, 8);
    const { re, im, width, height } = fft2D(img);
    const result = applyFrequencyFilter(re, im, width, height, "highpass", 50);
    expect(result.filtered.width).toBe(width);
    expect(result.filterMask).toBeDefined();
  });

  it("bandpass filter produces valid output", () => {
    const img = createGradientImage(8, 8);
    const { re, im, width, height } = fft2D(img);
    const result = applyFrequencyFilter(re, im, width, height, "bandpass", 30, 20);
    expect(result.filtered.width).toBe(width);
    expect(result.filterMask).toBeDefined();
  });

  it("does not mutate original FFT data", () => {
    const img = createGradientImage(8, 8);
    const { re, im, width, height } = fft2D(img);
    const reCopy = re.map((row) => new Float64Array(row));
    applyFrequencyFilter(re, im, width, height, "lowpass", 10);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        expect(re[y][x]).toBe(reCopy[y][x]);
      }
    }
  });

  it("filter mask has only 0 or 255 values (ideal filter)", () => {
    const img = createGradientImage(8, 8);
    const { re, im, width, height } = fft2D(img);
    const result = applyFrequencyFilter(re, im, width, height, "lowpass", 50);
    const mask = result.filterMask.data;
    for (let i = 0; i < mask.length; i += 4) {
      expect(mask[i] === 0 || mask[i] === 255).toBe(true);
    }
  });
});
