"use client";

import { useState, useCallback } from "react";
import { morphologicalOp, type MorphOp, type StructShape } from "../lib/morphology";

type Status = "idle" | "processing" | "done" | "error";

export function useMorphology() {
  const [status, setStatus] = useState<Status>("idle");
  const [op, setOp] = useState<MorphOp>("erode");
  const [kernelSize, setKernelSize] = useState(3);
  const [shape, setShape] = useState<StructShape>("square");
  const [threshold, setThreshold] = useState(128);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [binaryUrl, setBinaryUrl] = useState<string | null>(null);
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
    (data: ImageData, o: MorphOp, ks: number, sh: StructShape, t: number) => {
      const { output, binaryInput } = morphologicalOp(data, o, ks, sh, true, t);

      const c1 = document.createElement("canvas");
      c1.width = binaryInput.width;
      c1.height = binaryInput.height;
      c1.getContext("2d")!.putImageData(binaryInput, 0, 0);
      setBinaryUrl(c1.toDataURL());

      const c2 = document.createElement("canvas");
      c2.width = output.width;
      c2.height = output.height;
      c2.getContext("2d")!.putImageData(output, 0, 0);
      setOutputUrl(c2.toDataURL());
    },
    []
  );

  const analyze = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        const data = await loadImage(file);
        processImage(data, op, kernelSize, shape, threshold);
        setStatus("done");
      } catch {
        setStatus("error");
      }
    },
    [loadImage, op, kernelSize, shape, threshold, processImage]
  );

  const changeOp = useCallback(
    (o: MorphOp) => {
      setOp(o);
      if (imageData) processImage(imageData, o, kernelSize, shape, threshold);
    },
    [imageData, kernelSize, shape, threshold, processImage]
  );

  const changeKernelSize = useCallback(
    (ks: number) => {
      setKernelSize(ks);
      if (imageData) processImage(imageData, op, ks, shape, threshold);
    },
    [imageData, op, shape, threshold, processImage]
  );

  const changeShape = useCallback(
    (sh: StructShape) => {
      setShape(sh);
      if (imageData) processImage(imageData, op, kernelSize, sh, threshold);
    },
    [imageData, op, kernelSize, threshold, processImage]
  );

  const changeThreshold = useCallback(
    (t: number) => {
      setThreshold(t);
      if (imageData) processImage(imageData, op, kernelSize, shape, t);
    },
    [imageData, op, kernelSize, shape, processImage]
  );

  const downloadOutput = useCallback(() => {
    if (!outputUrl) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `morphology-${op}_${ts}.png`;
    a.click();
  }, [outputUrl, op]);

  return {
    status,
    op,
    kernelSize,
    shape,
    threshold,
    originalUrl,
    binaryUrl,
    outputUrl,
    analyze,
    changeOp,
    changeKernelSize,
    changeShape,
    changeThreshold,
    downloadOutput,
  };
}
