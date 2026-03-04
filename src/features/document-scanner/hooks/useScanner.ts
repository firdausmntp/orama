"use client";

import { useState, useCallback } from "react";
import {
  detectDocumentEdges,
  perspectiveTransform,
  adaptiveThreshold,
  type Point,
} from "../lib/scanner";

type Status = "idle" | "processing" | "done" | "error";

export function useScanner() {
  const [status, setStatus] = useState<Status>("idle");
  const [corners, setCorners] = useState<Point[]>([]);
  const [edgeUrl, setEdgeUrl] = useState<string | null>(null);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [enhanceMode, setEnhanceMode] = useState(false);

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

  const scan = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");

        const { imageData, canvas } = await loadImageData(file);
        setOriginalImageData(imageData);

        // Detect edges and corners
        const { corners: detected, edgeImageData } = detectDocumentEdges(imageData);
        setCorners(detected);

        // Show edge detection result
        const edgeCanvas = document.createElement("canvas");
        edgeCanvas.width = imageData.width;
        edgeCanvas.height = imageData.height;
        edgeCanvas.getContext("2d")!.putImageData(edgeImageData, 0, 0);
        setEdgeUrl(edgeCanvas.toDataURL("image/png"));

        // Apply perspective transform
        const scanned = perspectiveTransform(imageData, detected);
        const scanCanvas = document.createElement("canvas");
        scanCanvas.width = scanned.width;
        scanCanvas.height = scanned.height;
        scanCanvas.getContext("2d")!.putImageData(scanned, 0, 0);
        setScannedUrl(scanCanvas.toDataURL("image/png"));

        setStatus("done");
      } catch (err) {
        setStatus("error");
      }
    },
    [loadImageData]
  );

  const applyEnhancement = useCallback(() => {
    if (!originalImageData || corners.length !== 4) return;

    setStatus("processing");

    const scanned = perspectiveTransform(originalImageData, corners);
    const enhanced = adaptiveThreshold(scanned);

    const canvas = document.createElement("canvas");
    canvas.width = enhanced.width;
    canvas.height = enhanced.height;
    canvas.getContext("2d")!.putImageData(enhanced, 0, 0);
    setScannedUrl(canvas.toDataURL("image/png"));
    setEnhanceMode(true);
    setStatus("done");
  }, [originalImageData, corners]);

  const updateCorner = useCallback((index: number, point: Point) => {
    setCorners((prev) => {
      const next = [...prev];
      next[index] = point;
      return next;
    });
  }, []);

  const reprocess = useCallback(() => {
    if (!originalImageData || corners.length !== 4) return;

    setStatus("processing");
    const scanned = perspectiveTransform(originalImageData, corners);

    const canvas = document.createElement("canvas");
    canvas.width = scanned.width;
    canvas.height = scanned.height;
    canvas.getContext("2d")!.putImageData(
      enhanceMode ? adaptiveThreshold(scanned) : scanned,
      0,
      0
    );
    setScannedUrl(canvas.toDataURL("image/png"));
    setStatus("done");
  }, [originalImageData, corners, enhanceMode]);

  const downloadOutput = useCallback(() => {
    if (!scannedUrl) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const a = document.createElement("a");
    a.href = scannedUrl;
    a.download = `document-scanner_${ts}.png`;
    a.click();
  }, [scannedUrl]);

  return {
    status,
    corners,
    edgeUrl,
    scannedUrl,
    enhanceMode,
    scan,
    applyEnhancement,
    updateCorner,
    reprocess,
    downloadOutput,
  };
}
