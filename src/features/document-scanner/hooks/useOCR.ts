"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  recognizeText,
  terminateWorker,
  type OCRResult,
} from "../lib/ocr";

type Status = "idle" | "processing" | "done" | "error";

export function useOCR() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<OCRResult | null>(null);
  const [language, setLanguage] = useState("eng");
  const [progress, setProgress] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      terminateWorker();
    };
  }, []);

  const recognize = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        setResult(null);
        setProgress(0);

        const ocrResult = await recognizeText(file, language, (p) => {
          if (mountedRef.current) setProgress(p);
        });

        if (!mountedRef.current) return;

        setResult(ocrResult);
        setStatus("done");
        setProgress(100);
      } catch (err) {
        console.error("OCR failed:", err);
        if (mountedRef.current) {
          setStatus("error");
          setProgress(0);
        }
      }
    },
    [language],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setProgress(0);
  }, []);

  return {
    status,
    result,
    language,
    progress,
    recognize,
    setLanguage,
    reset,
  };
}
