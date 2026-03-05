/**
 * OCR Engine — Tesseract.js v5 wrapper
 *
 * Provides text recognition from images with word-level bounding boxes,
 * confidence scores, and multi-language support.
 */

import Tesseract from "tesseract.js";

/* ── Types ────────────────────────────────────────── */

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface OCRResult {
  text: string;
  confidence: number;
  words: OCRWord[];
  processingTime: number;
}

export interface SupportedLanguage {
  code: string;
  label: string;
}

/* ── Supported Languages ──────────────────────────── */

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "eng", label: "English" },
  { code: "ind", label: "Indonesian" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "spa", label: "Spanish" },
  { code: "ara", label: "Arabic" },
];

/* ── Worker cache ─────────────────────────────────── */

let cachedWorker: Tesseract.Worker | null = null;
let cachedLang: string | null = null;

async function getWorker(
  lang: string,
  onProgress?: (progress: number) => void,
): Promise<Tesseract.Worker> {
  // Reuse existing worker if language hasn't changed
  if (cachedWorker && cachedLang === lang) {
    return cachedWorker;
  }

  // Terminate old worker if language changed
  if (cachedWorker) {
    await cachedWorker.terminate();
    cachedWorker = null;
    cachedLang = null;
  }

  const worker = await Tesseract.createWorker(lang, undefined, {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round((m.progress ?? 0) * 100));
      }
    },
  });

  cachedWorker = worker;
  cachedLang = lang;
  return worker;
}

/* ── Public API ───────────────────────────────────── */

/**
 * Run OCR on an image source (File object or URL string).
 *
 * @param imageSource — a File or an image URL
 * @param lang        — Tesseract language code (default "eng")
 * @param onProgress  — optional progress callback (0–100)
 */
export async function recognizeText(
  imageSource: File | string,
  lang: string = "eng",
  onProgress?: (progress: number) => void,
): Promise<OCRResult> {
  const start = performance.now();
  const worker = await getWorker(lang, onProgress);

  const source =
    imageSource instanceof File
      ? URL.createObjectURL(imageSource)
      : imageSource;

  try {
    const {
      data: { text, confidence, blocks },
    } = await worker.recognize(source);

    const elapsed = Math.round(performance.now() - start);

    // Flatten nested blocks → paragraphs → lines → words
    const ocrWords: OCRWord[] = [];
    if (blocks) {
      for (const block of blocks) {
        for (const paragraph of block.paragraphs) {
          for (const line of paragraph.lines) {
            for (const w of line.words) {
              ocrWords.push({
                text: w.text,
                confidence: w.confidence,
                bbox: {
                  x0: w.bbox.x0,
                  y0: w.bbox.y0,
                  x1: w.bbox.x1,
                  y1: w.bbox.y1,
                },
              });
            }
          }
        }
      }
    }

    return {
      text: text.trim(),
      confidence: Math.round(confidence),
      words: ocrWords,
      processingTime: elapsed,
    };
  } finally {
    // Revoke blob URL if we created one
    if (imageSource instanceof File) {
      URL.revokeObjectURL(source);
    }
  }
}

/**
 * Terminate the cached worker and free resources.
 */
export async function terminateWorker(): Promise<void> {
  if (cachedWorker) {
    await cachedWorker.terminate();
    cachedWorker = null;
    cachedLang = null;
  }
}
