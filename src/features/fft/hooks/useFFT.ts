"use client";

import { useState, useCallback, useRef } from "react";
import {
  fft2D,
  applyFrequencyFilter,
  type FrequencyFilter,
} from "../lib/fft";

type Status = "idle" | "processing" | "done" | "error";

export function useFFT() {
  const [status, setStatus] = useState<Status>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [spectrum, setSpectrum] = useState<ImageData | null>(null);
  const [filteredImage, setFilteredImage] = useState<ImageData | null>(null);
  const [filterMask, setFilterMask] = useState<ImageData | null>(null);
  const [filterType, setFilterType] = useState<FrequencyFilter>("lowpass");
  const [cutoff, setCutoff] = useState(30);
  const [bandwidth, setBandwidth] = useState(20);

  // store raw FFT data so we can re-apply filters without recomputing
  const fftRef = useRef<{
    re: Float64Array[];
    im: Float64Array[];
    width: number;
    height: number;
  } | null>(null);

  const loadImage = useCallback(
    (file: File): Promise<ImageData> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          setOriginalUrl(c.toDataURL());
          resolve(ctx.getImageData(0, 0, img.width, img.height));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      }),
    [],
  );

  const analyze = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        setFilteredImage(null);
        setFilterMask(null);
        const data = await loadImage(file);

        // run FFT (sync but heavy — wrapped in microtask for UI update)
        await new Promise<void>((r) => setTimeout(r, 0));
        const result = fft2D(data);

        fftRef.current = {
          re: result.re,
          im: result.im,
          width: result.width,
          height: result.height,
        };
        setSpectrum(result.magnitudeSpectrum);
        setStatus("done");
      } catch {
        setStatus("error");
      }
    },
    [loadImage],
  );

  const applyFilter = useCallback(() => {
    const fftData = fftRef.current;
    if (!fftData) return;

    const { re, im, width, height } = fftData;
    const result = applyFrequencyFilter(re, im, width, height, filterType, cutoff, bandwidth);
    setFilteredImage(result.filtered);
    setFilterMask(result.filterMask);
  }, [filterType, cutoff, bandwidth]);

  const reset = useCallback(() => {
    setStatus("idle");
    setOriginalUrl(null);
    setSpectrum(null);
    setFilteredImage(null);
    setFilterMask(null);
    fftRef.current = null;
    setCutoff(30);
    setBandwidth(20);
    setFilterType("lowpass");
  }, []);

  return {
    status,
    originalUrl,
    spectrum,
    filteredImage,
    filterMask,
    filterType,
    setFilterType,
    cutoff,
    setCutoff,
    bandwidth,
    setBandwidth,
    analyze,
    applyFilter,
    reset,
  };
}
