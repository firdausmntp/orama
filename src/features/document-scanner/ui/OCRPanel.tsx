"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Languages, Copy, Download } from "lucide-react";
import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useOCR } from "../hooks/useOCR";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { SUPPORTED_LANGUAGES } from "../lib/ocr";

const DOC_EXAMPLES: ExampleImage[] = [
  { src: "/examples/doc-notebook.jpg", label: "Notebook" },
  { src: "/examples/doc-desk.jpg", label: "Desk" },
];

export function OCRPanel() {
  const {
    status,
    result,
    language,
    progress,
    recognize,
    setLanguage,
    reset,
  } = useOCR();
  const { t } = useTranslation();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  /* ── File handling ──────────────────────────────── */

  const handleFile = (f: File) => {
    reset();
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setImgSize(null);
    recognize(f);
  };

  /* Cleanup blob URL */
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ── Helpers ────────────────────────────────────── */

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocr-result.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImgLoad = () => {
    if (imgRef.current) {
      setImgSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  };

  /* ── Confidence color ───────────────────────────── */

  const confidenceColor = (c: number) =>
    c >= 80
      ? "text-mint"
      : c >= 50
        ? "text-orange-neon"
        : "text-crimson";

  return (
    <div className="space-y-6">
      {/* ── Upload ────────────────────────────────── */}
      <FileUpload
        onFileSelect={handleFile}
        label={t.docScan.uploadDoc}
        sublabel={t.docScan.uploadDocHint}
        examples={DOC_EXAMPLES}
      />

      {/* ── Language selector ─────────────────────── */}
      <div className="neo-card p-4">
        <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-bone mb-3">
          <Languages className="w-4 h-4" />
          {t.docScan.selectLang}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="neo-border bg-teal-deep text-bone font-mono text-sm px-3 py-2 w-full 
                     focus:outline-none focus:ring-2 focus:ring-mint cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label} ({l.code})
            </option>
          ))}
        </select>
      </div>

      {/* ── Progress ──────────────────────────────── */}
      {status === "processing" && (
        <div className="neo-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-black uppercase tracking-wider text-bone">
              {t.docScan.recognizing}
            </span>
            <span className="text-sm font-mono text-mint">{progress}%</span>
          </div>
          <div className="w-full h-3 neo-border bg-teal-deep overflow-hidden">
            <div
              className="h-full bg-mint transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Results ───────────────────────────────── */}
      {(result || previewUrl) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Word overlay on original image */}
          <ResultDisplay title={t.docScan.extractedText} status={status}>
            {previewUrl && (
              <div className="relative inline-block w-full">
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt="Uploaded document"
                  className="max-h-80 mx-auto neo-border w-full object-contain"
                  onLoad={handleImgLoad}
                />
                {/* Word bounding-box overlay */}
                {result && imgSize && imgRef.current && (
                  <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    viewBox={`0 0 ${imgSize.width} ${imgSize.height}`}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {result.words.map((w, i) => (
                      <rect
                        key={i}
                        x={w.bbox.x0}
                        y={w.bbox.y0}
                        width={w.bbox.x1 - w.bbox.x0}
                        height={w.bbox.y1 - w.bbox.y0}
                        fill="rgba(0, 255, 170, 0.15)"
                        stroke="rgba(0, 255, 170, 0.6)"
                        strokeWidth={Math.max(1, imgSize.width / 500)}
                      />
                    ))}
                  </svg>
                )}
              </div>
            )}
            {!previewUrl && (
              <div className="text-center py-12 text-charcoal-light">
                <FileText className="w-10 h-10 mx-auto mb-2 text-charcoal-light" />
                <p className="font-mono text-sm">{t.docScan.ocrPlaceholder}</p>
              </div>
            )}
          </ResultDisplay>

          {/* Text output + actions */}
          <ResultDisplay
            title={t.docScan.extractedText}
            status={status}
            onDownload={result ? handleDownload : undefined}
          >
            {result ? (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="neo-border bg-teal-deep p-2 text-center">
                    <p className="text-xs font-mono text-bone-muted">
                      {t.docScan.confidence}
                    </p>
                    <p
                      className={`text-lg font-black ${confidenceColor(result.confidence)}`}
                    >
                      {result.confidence}%
                    </p>
                  </div>
                  
                  <div className="neo-border bg-teal-deep p-2 text-center">
                    <p className="text-xs font-mono text-bone-muted">
                      {t.docScan.progress}
                    </p>
                    <p className="text-lg font-black text-mint">
                      {result.processingTime}ms
                    </p>
                  </div>
                </div>

                {/* Extracted text */}
                <div className="neo-border bg-teal-deep p-3 max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-bone leading-relaxed">
                    {result.text || t.docScan.ocrPlaceholder}
                  </pre>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="neo-btn neo-btn-secondary text-xs flex-1 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "✓" : t.docScan.copyText}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="neo-btn neo-btn-secondary text-xs flex-1 flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t.docScan.downloadTxt}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-charcoal-light">
                <FileText className="w-10 h-10 mx-auto mb-2 text-charcoal-light" />
                <p className="font-mono text-sm">{t.docScan.ocrPlaceholder}</p>
              </div>
            )}
          </ResultDisplay>
        </div>
      )}
    </div>
  );
}
