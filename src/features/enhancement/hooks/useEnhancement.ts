"use client";

import { useState, useCallback } from "react";
import {
  analyzeImage,
  generateSuggestions,
  applyEnhancement,
  type ImageMetrics,
  type Enhancement,
} from "../lib/advisor";

type Status = "idle" | "processing" | "done" | "error";

export function useEnhancement() {
  const [status, setStatus] = useState<Status>("idle");
  const [metrics, setMetrics] = useState<ImageMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<Enhancement[]>([]);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [appliedEnhancements, setAppliedEnhancements] = useState<string[]>([]);

  const loadImageData = useCallback(
    (file: File): Promise<ImageData> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          resolve(ctx.getImageData(0, 0, img.width, img.height));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  const analyze = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        setAppliedEnhancements([]);
        setOutputUrl(null);

        const imageData = await loadImageData(file);
        setOriginalImageData(imageData);

        const m = analyzeImage(imageData);
        setMetrics(m);

        const s = generateSuggestions(m);
        setSuggestions(s);

        setStatus("done");
      } catch (err) {
        setStatus("error");
      }
    },
    [loadImageData]
  );

  const applyAction = useCallback(
    (enhancement: Enhancement) => {
      if (!originalImageData || enhancement.action === "none") return;

      setStatus("processing");

      // Get current image data (with previously applied enhancements)
      let currentData = originalImageData;

      // Re-apply all previous enhancements + new one
      const newApplied = [...appliedEnhancements, enhancement.id];
      const allSuggestions = suggestions.filter((s) =>
        newApplied.includes(s.id)
      );

      for (const s of allSuggestions) {
        currentData = applyEnhancement(currentData, s.action, s.value);
      }

      // Render result
      const canvas = document.createElement("canvas");
      canvas.width = currentData.width;
      canvas.height = currentData.height;
      canvas.getContext("2d")!.putImageData(currentData, 0, 0);

      setOutputUrl(canvas.toDataURL("image/png"));
      setAppliedEnhancements(newApplied);

      // Re-analyze enhanced image
      const newMetrics = analyzeImage(currentData);
      setMetrics(newMetrics);

      setStatus("done");
    },
    [originalImageData, appliedEnhancements, suggestions]
  );

  const applyAll = useCallback(() => {
    if (!originalImageData) return;

    setStatus("processing");

    let currentData = originalImageData;
    const ids: string[] = [];

    for (const s of suggestions) {
      if (s.action !== "none") {
        currentData = applyEnhancement(currentData, s.action, s.value);
        ids.push(s.id);
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = currentData.width;
    canvas.height = currentData.height;
    canvas.getContext("2d")!.putImageData(currentData, 0, 0);

    setOutputUrl(canvas.toDataURL("image/png"));
    setAppliedEnhancements(ids);

    const newMetrics = analyzeImage(currentData);
    setMetrics(newMetrics);

    setStatus("done");
  }, [originalImageData, suggestions]);

  const downloadOutput = useCallback(() => {
    if (!outputUrl) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `enhancement_${ts}.png`;
    a.click();
  }, [outputUrl]);

  return {
    status,
    metrics,
    suggestions,
    outputUrl,
    appliedEnhancements,
    analyze,
    applyAction,
    applyAll,
    downloadOutput,
  };
}
