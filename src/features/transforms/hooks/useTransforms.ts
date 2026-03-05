"use client";

import { useState, useCallback } from "react";
import {
  applyTransform,
  type TransformType,
  type InterpolationMethod,
  type FlipDirection,
  type CropRect,
} from "../lib/transforms";

type Status = "idle" | "processing" | "done" | "error";

export function useTransforms() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ImageData | null>(null);
  const [transformType, setTransformType] = useState<TransformType>("resize");
  const [interpolation, setInterpolation] =
    useState<InterpolationMethod>("bilinear");
  const [angle, setAngle] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [flipDirection, setFlipDirection] =
    useState<FlipDirection>("horizontal");
  const [cropRect, setCropRect] = useState<CropRect>({
    x: 0,
    y: 0,
    w: 200,
    h: 200,
  });
  const [shearX, setShearX] = useState(0);
  const [shearY, setShearY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
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

  const processTransform = useCallback(
    (data: ImageData) => {
      const output = applyTransform(data, {
        type: transformType,
        interpolation,
        angle,
        scaleX,
        scaleY,
        flipDirection,
        cropRect,
        shearX,
        shearY,
        translateX,
        translateY,
      });
      setResult(output);
      const c = document.createElement("canvas");
      c.width = output.width;
      c.height = output.height;
      c.getContext("2d")!.putImageData(output, 0, 0);
      setOutputUrl(c.toDataURL());
    },
    [
      transformType,
      interpolation,
      angle,
      scaleX,
      scaleY,
      flipDirection,
      cropRect,
      shearX,
      shearY,
      translateX,
      translateY,
    ]
  );

  const transform = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        const data = await loadImage(file);
        processTransform(data);
        setStatus("done");
      } catch {
        setStatus("error");
      }
    },
    [loadImage, processTransform]
  );

  const reapply = useCallback(() => {
    if (imageData) {
      setStatus("processing");
      processTransform(imageData);
      setStatus("done");
    }
  }, [imageData, processTransform]);

  const downloadOutput = useCallback(() => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `transformed-${transformType}.png`;
    a.click();
  }, [outputUrl, transformType]);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setOriginalUrl(null);
    setOutputUrl(null);
    setImageData(null);
    setAngle(0);
    setScaleX(1);
    setScaleY(1);
    setFlipDirection("horizontal");
    setCropRect({ x: 0, y: 0, w: 200, h: 200 });
    setShearX(0);
    setShearY(0);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  return {
    status,
    result,
    transformType,
    setTransformType,
    interpolation,
    setInterpolation,
    angle,
    setAngle,
    scaleX,
    setScaleX,
    scaleY,
    setScaleY,
    flipDirection,
    setFlipDirection,
    cropRect,
    setCropRect,
    shearX,
    setShearX,
    shearY,
    setShearY,
    translateX,
    setTranslateX,
    translateY,
    setTranslateY,
    originalUrl,
    outputUrl,
    transform,
    reapply,
    downloadOutput,
    reset,
  };
}
