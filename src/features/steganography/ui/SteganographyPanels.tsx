"use client";

import { useState } from "react";
import { Image, Search, Droplets } from "lucide-react";
import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useSteganography } from "../hooks/useSteganography";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import {
  applyVisibleWatermark,
  embedInvisibleWatermark,
  extractInvisibleWatermark,
  WATERMARK_POSITIONS,
  type WatermarkPosition,
} from "../lib/watermark";

const STEG_EXAMPLES: ExampleImage[] = [
  { src: "/examples/steg-landscape.jpg", label: "Landscape" },
  { src: "/examples/steg-portrait.jpg", label: "Portrait" },
];

export function EncodePanel() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const { status, result, outputImageUrl, capacity, encode, downloadOutput, preloadFile } =
    useSteganography();
  const { t } = useTranslation();

  const handleFileSelect = (f: File) => {
    setFile(f);
    preloadFile(f);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="space-y-4">
        <FileUpload
          onFileSelect={handleFileSelect}
          label={t.steg.uploadCarrier}
          sublabel={t.steg.uploadCarrierHint}
          examples={STEG_EXAMPLES}
        />

        {file && (
          <div className="neo-card p-4">
            <p className="text-xs font-mono text-charcoal-light mb-2">
              {t.steg.capacity}: <span className="text-mint font-bold">{capacity}</span>{" "}
              {t.steg.characters}
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.steg.placeholder}
              className="neo-input w-full h-32 resize-none font-mono text-sm"
              maxLength={capacity}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs font-mono text-charcoal-light">
                {message.length}/{capacity}
              </span>
              <button
                onClick={() => file && encode(file, message)}
                disabled={!message || status === "processing"}
                className="neo-btn neo-btn-primary text-sm disabled:opacity-50"
              >
                {status === "processing" ? t.steg.encoding : t.steg.encodeBtn}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Output */}
      <ResultDisplay
        title={t.steg.encodedOutput}
        status={status}
        onDownload={downloadOutput}
      >
        {outputImageUrl ? (
          <div>
            <img
              src={outputImageUrl}
              alt="Encoded"
              className="max-h-64 mx-auto neo-border"
            />
            <p className="text-sm text-mint font-mono mt-3 text-center">
              {result}
            </p>
          </div>
        ) : (
          <div className="text-center py-12 text-charcoal-light">
            <Image className="w-10 h-10 mx-auto mb-2 text-charcoal-light" />
            <p className="font-mono text-sm">{t.steg.encodedPlaceholder}</p>
          </div>
        )}
      </ResultDisplay>
    </div>
  );
}

export function DecodePanel() {
  const { status, result, decode } = useSteganography();
  const [file, setFile] = useState<File | null>(null);
  const { t } = useTranslation();

  const handleFile = (f: File) => {
    setFile(f);
    decode(f);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <FileUpload
        onFileSelect={handleFile}
        label={t.steg.uploadStego}
        sublabel={t.steg.uploadStegoHint}
        examples={STEG_EXAMPLES}
      />

      <ResultDisplay title={t.steg.decodedMessage} status={status}>
        {result ? (
          <div className="neo-card-teal p-6">
            <p className="text-xs font-mono text-bone-muted mb-2">
              {t.steg.extractedMsg}
            </p>
            <p className="font-mono text-bone text-lg break-all">{result}</p>
          </div>
        ) : (
          <div className="text-center py-12 text-charcoal-light">
            <p className="text-4xl mb-2">🔓</p>
            <p className="font-mono text-sm">{t.steg.decodedPlaceholder}</p>
          </div>
        )}
      </ResultDisplay>
    </div>
  );
}

export function DetectPanel() {
  const { status, detection, detect } = useSteganography();
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <FileUpload
        onFileSelect={(f) => detect(f)}
        label={t.steg.uploadAnalyze}
        sublabel={t.steg.uploadAnalyzeHint}
        examples={STEG_EXAMPLES}
      />

      <ResultDisplay title={t.steg.detectionResult} status={status}>
        {detection ? (
          <div className="space-y-4">
            {/* Probability Meter */}
            <div className="neo-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm uppercase">
                  {t.steg.stegoProb}
                </span>
                <span
                  className={`neo-btn text-xs px-2 py-1 ${
                    detection.isLikelySteganographic
                      ? "bg-crimson text-bone"
                      : "bg-mint text-teal-deep"
                  }`}
                >
                  {(detection.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-6 neo-border bg-bone-muted">
                <div
                  className={`h-full transition-all duration-500 ${
                    detection.probability > 0.7
                      ? "bg-crimson"
                      : detection.probability > 0.3
                        ? "bg-orange-neon"
                        : "bg-mint"
                  }`}
                  style={{ width: `${detection.probability * 100}%` }}
                />
              </div>
            </div>

            {/* Analysis */}
            <div className="neo-card-teal p-4">
              <p className="text-xs font-mono text-bone-muted mb-2">
                {t.steg.analysis}
              </p>
              <p className="text-bone text-sm leading-relaxed">
                {detection.analysis}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-charcoal-light">
            <Search className="w-10 h-10 mx-auto mb-2 text-charcoal-light" />
            <p className="font-mono text-sm">{t.steg.analysisPlaceholder}</p>
          </div>
        )}
      </ResultDisplay>
    </div>
  );
}

export function WatermarkPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [mode, setMode] = useState<"visible" | "invisible">("visible");
  const [text, setText] = useState("");
  const [opacity, setOpacity] = useState(0.3);
  const [position, setPosition] = useState<WatermarkPosition>("tiled");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [extractedWm, setExtractedWm] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const { t } = useTranslation();

  const loadImage = (f: File) => {
    setFile(f);
    setOutputUrl(null);
    setExtractedWm(null);
    const img = new window.Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      setImageData(ctx.getImageData(0, 0, img.width, img.height));
    };
    img.src = URL.createObjectURL(f);
  };

  const applyWatermark = () => {
    if (!imageData || !text) return;
    setStatus("processing");
    try {
      let result: ImageData;
      if (mode === "visible") {
        result = applyVisibleWatermark(imageData, text, { opacity, position });
      } else {
        result = embedInvisibleWatermark(imageData, text);
      }
      const c = document.createElement("canvas");
      c.width = result.width;
      c.height = result.height;
      c.getContext("2d")!.putImageData(result, 0, 0);
      setOutputUrl(c.toDataURL());
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  const extractWatermark = () => {
    if (!imageData) return;
    setStatus("processing");
    const result = extractInvisibleWatermark(imageData);
    setExtractedWm(result);
    setStatus("done");
  };

  const downloadOutput = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `watermarked_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["visible", "invisible"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setOutputUrl(null); setExtractedWm(null); }}
            className={`neo-btn text-sm px-4 py-2 uppercase font-black tracking-wider ${
              mode === m ? "bg-orange-neon text-bone" : "neo-btn-secondary"
            }`}
          >
            {m === "visible" ? t.steg.wmVisible : t.steg.wmInvisible}
          </button>
        ))}
        {mode === "invisible" && imageData && (
          <button
            onClick={extractWatermark}
            className="neo-btn text-sm px-4 py-2 uppercase font-black tracking-wider bg-mint text-teal-deep ml-auto"
          >
            {t.steg.wmExtract}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <FileUpload
            onFileSelect={loadImage}
            label={t.steg.wmUpload}
            sublabel={t.steg.wmUploadHint}
            examples={STEG_EXAMPLES}
          />

          {file && (
            <div className="neo-card p-4 space-y-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={mode === "visible" ? t.steg.wmTextPlaceholder : t.steg.wmSigPlaceholder}
                className="neo-input w-full h-20 resize-none font-mono text-sm"
              />

              {mode === "visible" && (
                <>
                  <div>
                    <label className="text-xs font-mono text-charcoal-light uppercase block mb-1">
                      {t.steg.wmOpacity}: {(opacity * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full accent-orange-neon"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-charcoal-light uppercase block mb-1">
                      {t.steg.wmPosition}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {WATERMARK_POSITIONS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setPosition(p.value)}
                          className={`neo-btn text-xs px-3 py-1 ${
                            position === p.value ? "bg-orange-neon text-bone" : "neo-btn-secondary"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={applyWatermark}
                disabled={!text || status === "processing"}
                className="neo-btn neo-btn-primary text-sm w-full disabled:opacity-50"
              >
                {status === "processing" ? t.steg.wmApplying : t.steg.wmApply}
              </button>
            </div>
          )}
        </div>

        {/* Output */}
        <ResultDisplay
          title={t.steg.wmResult}
          status={status}
          onDownload={outputUrl ? downloadOutput : undefined}
        >
          {outputUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={outputUrl} alt="Watermarked" className="max-h-64 mx-auto neo-border" />
          ) : extractedWm ? (
            <div className="neo-card-teal p-6">
              <p className="text-xs font-mono text-bone-muted mb-2">{t.steg.wmExtracted}</p>
              <p className="font-mono text-bone text-lg break-all">{extractedWm}</p>
            </div>
          ) : (
            <div className="text-center py-12 text-charcoal-light">
              <Droplets className="w-10 h-10 mx-auto mb-2 text-charcoal-light" />
              <p className="font-mono text-sm">{t.steg.wmPlaceholder}</p>
            </div>
          )}
        </ResultDisplay>
      </div>
    </div>
  );
}
