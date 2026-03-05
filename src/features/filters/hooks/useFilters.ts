"use client";

import { useState, useCallback } from "react";
import {
  applyConvolution,
  applyMedianFilter,
  PRESET_KERNELS,
  type FilterPreset,
} from "../lib/filters";

type Status = "idle" | "processing" | "done" | "error";

export function useFilters() {
  const [status, setStatus] = useState<Status>("idle");
  const [preset, setPreset] = useState<FilterPreset>("sharpen");
  const [iterations, setIterations] = useState(1);
  const [customKernel, setCustomKernel] = useState<number[][]>([
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ]);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);

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
          const data = ctx.getImageData(0, 0, img.width, img.height);
          setImageData(data);
          resolve(data);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      }),
    []
  );

  const processImage = useCallback(
    (data: ImageData, p: FilterPreset, k: number[][], iters: number) => {
      let result: ImageData;
      if (p === "median") {
        result = applyMedianFilter(data, 3, iters);
      } else {
        const kernel = p === "custom" ? k : PRESET_KERNELS[p].kernel;
        const divisor = p === "custom" ? undefined : PRESET_KERNELS[p].divisor;
        result = applyConvolution(data, kernel, divisor, iters);
      }
      const c = document.createElement("canvas");
      c.width = result.width;
      c.height = result.height;
      c.getContext("2d")!.putImageData(result, 0, 0);
      setOutputUrl(c.toDataURL());
    },
    []
  );

  const analyze = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        const data = await loadImage(file);
        processImage(data, preset, customKernel, iterations);
        setStatus("done");
      } catch {
        setStatus("error");
      }
    },
    [loadImage, preset, customKernel, iterations, processImage]
  );

  const changePreset = useCallback(
    (p: FilterPreset) => {
      setPreset(p);
      if (imageData) processImage(imageData, p, customKernel, iterations);
    },
    [imageData, customKernel, iterations, processImage]
  );

  const changeIterations = useCallback(
    (n: number) => {
      setIterations(n);
      if (imageData) processImage(imageData, preset, customKernel, n);
    },
    [imageData, preset, customKernel, processImage]
  );

  const updateCustomKernel = useCallback(
    (row: number, col: number, value: number) => {
      setCustomKernel((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = value;
        if (imageData && preset === "custom")
          processImage(imageData, "custom", next, iterations);
        return next;
      });
    },
    [imageData, preset, iterations, processImage]
  );

  const downloadOutput = useCallback(() => {
    if (!outputUrl) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `filters-${preset}_${ts}.png`;
    a.click();
  }, [outputUrl, preset]);

  return {
    status,
    preset,
    iterations,
    customKernel,
    originalUrl,
    outputUrl,
    analyze,
    changePreset,
    changeIterations,
    updateCustomKernel,
    downloadOutput,
  };
}
