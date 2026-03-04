"use client";

import { useState, useCallback } from "react";
import { countObjects, detectCircles, type CountResult } from "../lib/counter";

type Status = "idle" | "processing" | "done" | "error";
type Mode = "count" | "coin";

export function useDetection() {
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<Mode>("count");
  const [result, setResult] = useState<CountResult | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [params, setParams] = useState({
    threshold: 128,
    minArea: 100,
    minRadius: 15,
    maxRadius: 80,
  });

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

  const process = useCallback(
    async (file: File, processMode: Mode) => {
      try {
        setStatus("processing");
        setMode(processMode);
        setResult(null);
        setOutputUrl(null);

        const { imageData, canvas } = await loadImageData(file);

        let countResult: CountResult;
        if (processMode === "coin") {
          countResult = detectCircles(
            imageData,
            params.minRadius,
            params.maxRadius
          );
        } else {
          countResult = countObjects(
            imageData,
            params.threshold,
            params.minArea
          );
        }

        // Render processed image
        const ctx = canvas.getContext("2d")!;
        ctx.putImageData(countResult.processedImageData, 0, 0);

        // Draw count labels
        ctx.font = "bold 16px monospace";
        ctx.strokeStyle = "#1A1A1A";
        ctx.lineWidth = 3;
        ctx.fillStyle = "#42F5B0";

        countResult.objects.forEach((obj, idx) => {
          const label = `#${idx + 1}`;
          ctx.strokeText(label, obj.x, obj.y - 5);
          ctx.fillText(label, obj.x, obj.y - 5);
        });

        setOutputUrl(canvas.toDataURL("image/png"));
        setResult(countResult);
        setStatus("done");
      } catch (err) {
        setStatus("error");
      }
    },
    [loadImageData, params]
  );

  const downloadOutput = useCallback(() => {
    if (!outputUrl) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `agriculture-${mode}_${ts}.png`;
    a.click();
  }, [outputUrl, mode]);

  return {
    status,
    mode,
    result,
    outputUrl,
    params,
    setParams,
    process,
    downloadOutput,
  };
}
