"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  loadModel,
  detectObjects,
  summarizeDetections,
  isModelLoaded,
  type Detection,
  type DetectionResult,
} from "../lib/detector";

type Status = "idle" | "loading-model" | "processing" | "done" | "error";

export function useAIDetection() {
  const [status, setStatus] = useState<Status>("idle");
  const [modelReady, setModelReady] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0.5);
  const [summary, setSummary] = useState<ReturnType<typeof summarizeDetections> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    // Check if model is already loaded
    setModelReady(isModelLoaded());
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const preloadModel = useCallback(async () => {
    if (isModelLoaded()) {
      setModelReady(true);
      return;
    }
    try {
      setStatus("loading-model");
      setError(null);
      await loadModel();
      if (mountedRef.current) {
        setModelReady(true);
        setStatus("idle");
      }
    } catch (err) {
      if (mountedRef.current) {
        setError("Failed to load AI model. Check your internet connection.");
        setStatus("error");
      }
    }
  }, []);

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
          resolve({ imageData, canvas });
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  const detect = useCallback(
    async (file: File) => {
      try {
        setError(null);
        setResult(null);
        setOutputUrl(null);
        setSummary(null);

        // Load model if not ready
        if (!isModelLoaded()) {
          setStatus("loading-model");
          await loadModel();
          if (!mountedRef.current) return;
          setModelReady(true);
        }

        setStatus("processing");

        const { imageData, canvas } = await loadImageData(file);

        const detectionResult = await detectObjects(imageData, confidence);
        if (!mountedRef.current) return;

        // Render processed image
        const ctx = canvas.getContext("2d")!;
        ctx.putImageData(detectionResult.processedImageData, 0, 0);

        setOutputUrl(canvas.toDataURL("image/png"));
        setResult(detectionResult);
        setSummary(summarizeDetections(detectionResult.detections));
        setStatus("done");
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Detection failed");
          setStatus("error");
        }
      }
    },
    [loadImageData, confidence]
  );

  const downloadOutput = useCallback(() => {
    if (!outputUrl) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `ai-detection_${ts}.png`;
    a.click();
  }, [outputUrl]);

  return {
    status,
    modelReady,
    result,
    outputUrl,
    error,
    confidence,
    setConfidence,
    summary,
    detect,
    preloadModel,
    downloadOutput,
  };
}
