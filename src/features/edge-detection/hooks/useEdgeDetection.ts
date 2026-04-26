"use client";

import { useState, useCallback } from "react";
import { detectEdges, type EdgeMethod } from "../lib/edgeDetect";
import { useProcessing } from "@/shared/hooks/useProcessing";

type Status = "idle" | "processing" | "done" | "error";

export function useEdgeDetection() {
  const [status, setStatus] = useState<Status>("idle");
  const [method, setMethod] = useState<EdgeMethod>("sobel");
  const [invert, setInvert] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const { runOffMain } = useProcessing();

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
    async (data: ImageData, m: EdgeMethod, inv: boolean) => {
      const result = await runOffMain(() => detectEdges(data, m, inv));
      const c = document.createElement("canvas");
      c.width = result.width;
      c.height = result.height;
      c.getContext("2d")!.putImageData(result, 0, 0);
      setOutputUrl(c.toDataURL());
    },
    [runOffMain]
  );

  const analyze = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        const data = await loadImage(file);
        await processImage(data, method, invert);
        setStatus("done");
      } catch {
        setStatus("error");
      }
    },
    [loadImage, method, invert, processImage]
  );

  const changeMethod = useCallback(
    async (m: EdgeMethod) => {
      setMethod(m);
      if (imageData) await processImage(imageData, m, invert);
    },
    [imageData, invert, processImage]
  );

  const toggleInvert = useCallback(async () => {
    const newInv = !invert;
    setInvert(newInv);
    if (imageData) await processImage(imageData, method, newInv);
  }, [imageData, method, invert, processImage]);

  const downloadOutput = useCallback(() => {
    if (!outputUrl) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `edge-detection-${method}_${ts}.png`;
    a.click();
  }, [outputUrl, method]);

  return {
    status,
    method,
    invert,
    originalUrl,
    outputUrl,
    analyze,
    changeMethod,
    toggleInvert,
    downloadOutput,
  };
}
