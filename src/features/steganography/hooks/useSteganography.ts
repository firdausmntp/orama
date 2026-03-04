"use client";

import { useState, useCallback } from "react";
import {
  encodeMessage,
  decodeMessage,
  detectSteganography,
  getCapacity,
} from "../lib/lsb";

type Status = "idle" | "processing" | "done" | "error";

export function useSteganography() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [outputImageUrl, setOutputImageUrl] = useState<string | null>(null);
  const [capacity, setCapacity] = useState<number>(0);
  const [detection, setDetection] = useState<{
    probability: number;
    isLikelySteganographic: boolean;
    analysis: string;
  } | null>(null);

  const loadImageData = useCallback(
    (file: File): Promise<{ imageData: ImageData; canvas: HTMLCanvasElement }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          setCapacity(getCapacity(imageData));
          resolve({ imageData, canvas });
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  const encode = useCallback(
    async (file: File, message: string) => {
      try {
        setStatus("processing");
        setResult(null);
        setOutputImageUrl(null);

        const { imageData, canvas } = await loadImageData(file);
        const encoded = encodeMessage(imageData, message);

        const ctx = canvas.getContext("2d")!;
        ctx.putImageData(encoded, 0, 0);

        const url = canvas.toDataURL("image/png");
        setOutputImageUrl(url);
        setResult(`Message encoded successfully! (${message.length} chars)`);
        setStatus("done");
      } catch (err) {
        setResult(err instanceof Error ? err.message : "Encoding failed");
        setStatus("error");
      }
    },
    [loadImageData]
  );

  const decode = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        setResult(null);

        const { imageData } = await loadImageData(file);
        const message = decodeMessage(imageData);

        setResult(message);
        setStatus("done");
      } catch (err) {
        setResult(err instanceof Error ? err.message : "Decoding failed");
        setStatus("error");
      }
    },
    [loadImageData]
  );

  const detect = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        setDetection(null);

        const { imageData } = await loadImageData(file);
        const result = detectSteganography(imageData);

        setDetection(result);
        setStatus("done");
      } catch (err) {
        setResult(err instanceof Error ? err.message : "Detection failed");
        setStatus("error");
      }
    },
    [loadImageData]
  );

  const downloadOutput = useCallback(() => {
    if (!outputImageUrl) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const a = document.createElement("a");
    a.href = outputImageUrl;
    a.download = `steganography_${ts}.png`;
    a.click();
  }, [outputImageUrl]);

  const preloadFile = useCallback(
    async (file: File) => {
      try {
        await loadImageData(file);
      } catch {}
    },
    [loadImageData]
  );

  return {
    status,
    result,
    outputImageUrl,
    capacity,
    detection,
    encode,
    decode,
    detect,
    downloadOutput,
    preloadFile,
  };
}
