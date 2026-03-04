"use client";

import { useState, useCallback, useRef } from "react";
import {
  errorLevelAnalysis,
  blurMap,
  noiseAnalysis,
  extractMetadata,
  type ELAResult,
  type BlurMapResult,
  type NoiseResult,
  type MetadataEntry,
} from "../lib/forensics";

export type ForensicsStatus = "idle" | "processing" | "done" | "error";

export interface ForensicsState {
  status: ForensicsStatus;
  preview: string | null;            // original image data-url
  ela: ELAResult | null;
  blur: BlurMapResult | null;
  noise: NoiseResult | null;
  meta: MetadataEntry[];
  error: string | null;
}

const INIT: ForensicsState = {
  status: "idle",
  preview: null,
  ela: null,
  blur: null,
  noise: null,
  meta: [],
  error: null,
};

export function useForensics() {
  const [state, setState] = useState<ForensicsState>(INIT);
  const fileRef = useRef<File | null>(null);

  // ── ELA params ──
  const [elaQuality, setElaQuality] = useState(0.75);
  const [elaScale, setElaScale] = useState(15);

  // ── Blur params ──
  const [blurBlockSize, setBlurBlockSize] = useState(16);

  /** Load an image file and kick off all analyses. */
  const analyse = useCallback(
    async (file: File) => {
      fileRef.current = file;
      setState((s) => ({ ...s, status: "processing", error: null }));

      try {
        const url = URL.createObjectURL(file);
        const img = await loadImage(url);
        URL.revokeObjectURL(url);

        // Preview
        const prevCanvas = document.createElement("canvas");
        prevCanvas.width = img.naturalWidth;
        prevCanvas.height = img.naturalHeight;
        prevCanvas.getContext("2d")!.drawImage(img, 0, 0);

        // Run all analyses in parallel-ish
        const [elaRes, blurRes, noiseRes, metaRes] = await Promise.all([
          errorLevelAnalysis(img, elaQuality, elaScale),
          Promise.resolve(blurMap(img, blurBlockSize)),
          Promise.resolve(noiseAnalysis(img)),
          extractMetadata(file),
        ]);

        setState({
          status: "done",
          preview: prevCanvas.toDataURL(),
          ela: elaRes,
          blur: blurRes,
          noise: noiseRes,
          meta: metaRes,
          error: null,
        });
      } catch (err) {
        setState((s) => ({
          ...s,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    },
    [elaQuality, elaScale, blurBlockSize],
  );

  /** Re-run only ELA with updated params. */
  const rerunELA = useCallback(async () => {
    if (!fileRef.current) return;
    setState((s) => ({ ...s, status: "processing" }));
    const url = URL.createObjectURL(fileRef.current);
    const img = await loadImage(url);
    URL.revokeObjectURL(url);
    const elaRes = await errorLevelAnalysis(img, elaQuality, elaScale);
    setState((s) => ({ ...s, status: "done", ela: elaRes }));
  }, [elaQuality, elaScale]);

  /** Re-run only blur map with updated block size. */
  const rerunBlur = useCallback(async () => {
    if (!fileRef.current) return;
    setState((s) => ({ ...s, status: "processing" }));
    const url = URL.createObjectURL(fileRef.current);
    const img = await loadImage(url);
    URL.revokeObjectURL(url);
    const blurRes = blurMap(img, blurBlockSize);
    setState((s) => ({ ...s, status: "done", blur: blurRes }));
  }, [blurBlockSize]);

  const reset = useCallback(() => {
    fileRef.current = null;
    setState(INIT);
  }, []);

  return {
    ...state,
    analyse,
    rerunELA,
    rerunBlur,
    reset,
    elaQuality,
    setElaQuality,
    elaScale,
    setElaScale,
    blurBlockSize,
    setBlurBlockSize,
  };
}

// ── Helper ──
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
