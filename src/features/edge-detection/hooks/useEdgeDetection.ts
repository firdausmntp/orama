"use client";

import { useState, useCallback } from "react";
import { detectEdges, type EdgeMethod } from "../lib/edgeDetect";

type Status = "idle" | "processing" | "done" | "error";

export function useEdgeDetection() {
  const [status, setStatus] = useState<Status>("idle");
  const [method, setMethod] = useState<EdgeMethod>("sobel");
  const [invert, setInvert] = useState(false);
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
    (data: ImageData, m: EdgeMethod, inv: boolean) => {
      const result = detectEdges(data, m, inv);
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
        processImage(data, method, invert);
        setStatus("done");
      } catch {
        setStatus("error");
      }
    },
    [loadImage, method, invert, processImage]
  );

  const changeMethod = useCallback(
    (m: EdgeMethod) => {
      setMethod(m);
      if (imageData) processImage(imageData, m, invert);
    },
    [imageData, invert, processImage]
  );

  const toggleInvert = useCallback(() => {
    const newInv = !invert;
    setInvert(newInv);
    if (imageData) processImage(imageData, method, newInv);
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
