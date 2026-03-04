"use client";

import { useState, useCallback } from "react";
import { convertColorSpace, type ColorMode } from "../lib/colorSpace";

type Status = "idle" | "processing" | "done" | "error";

export function useColorSpace() {
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<ColorMode>("grayscale");
  const [threshold, setThreshold] = useState(128);
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
    (data: ImageData, m: ColorMode, t: number) => {
      const result = convertColorSpace(data, { mode: m, threshold: t });
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
        processImage(data, mode, threshold);
        setStatus("done");
      } catch {
        setStatus("error");
      }
    },
    [loadImage, mode, threshold, processImage]
  );

  const changeMode = useCallback(
    (m: ColorMode) => {
      setMode(m);
      if (imageData) {
        processImage(imageData, m, threshold);
      }
    },
    [imageData, threshold, processImage]
  );

  const changeThreshold = useCallback(
    (t: number) => {
      setThreshold(t);
      if (imageData) {
        processImage(imageData, mode, t);
      }
    },
    [imageData, mode, processImage]
  );

  const downloadOutput = useCallback(() => {
    if (!outputUrl) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `color-space-${mode}_${ts}.png`;
    a.click();
  }, [outputUrl, mode]);

  return {
    status,
    mode,
    threshold,
    originalUrl,
    outputUrl,
    analyze,
    changeMode,
    changeThreshold,
    downloadOutput,
  };
}
