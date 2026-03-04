"use client";

import { useState, useCallback } from "react";
import {
  computeHistogram,
  equalizeHistogram,
  drawHistogramCanvas,
  type HistogramData,
} from "../lib/histogram";

type Status = "idle" | "processing" | "done" | "error";
type Channel = "red" | "green" | "blue" | "luminance" | "all";

export function useHistogram() {
  const [status, setStatus] = useState<Status>("idle");
  const [histogram, setHistogram] = useState<HistogramData | null>(null);
  const [histCanvas, setHistCanvas] = useState<HTMLCanvasElement | null>(null);
  const [eqCanvas, setEqCanvas] = useState<HTMLCanvasElement | null>(null);
  const [eqHistCanvas, setEqHistCanvas] = useState<HTMLCanvasElement | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [equalizedUrl, setEqualizedUrl] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel>("all");

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
    []
  );

  const analyze = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        const imgData = await loadImage(file);
        const hist = computeHistogram(imgData);
        setHistogram(hist);
        setHistCanvas(drawHistogramCanvas(hist, channel));

        // equalize
        const eq = equalizeHistogram(imgData);
        const eqHist = computeHistogram(eq);
        setEqHistCanvas(drawHistogramCanvas(eqHist, channel));

        // render equalized image
        const c2 = document.createElement("canvas");
        c2.width = eq.width;
        c2.height = eq.height;
        c2.getContext("2d")!.putImageData(eq, 0, 0);
        setEqualizedUrl(c2.toDataURL());
        setEqCanvas(c2);

        setStatus("done");
      } catch {
        setStatus("error");
      }
    },
    [loadImage, channel]
  );

  const switchChannel = useCallback(
    (ch: Channel) => {
      setChannel(ch);
      if (histogram) {
        setHistCanvas(drawHistogramCanvas(histogram, ch));
      }
    },
    [histogram]
  );

  const downloadEqualized = useCallback(() => {
    if (!equalizedUrl) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const a = document.createElement("a");
    a.href = equalizedUrl;
    a.download = `histogram_${ts}.png`;
    a.click();
  }, [equalizedUrl]);

  return {
    status,
    histogram,
    histCanvas,
    eqHistCanvas,
    originalUrl,
    equalizedUrl,
    channel,
    analyze,
    switchChannel,
    downloadEqualized,
  };
}
