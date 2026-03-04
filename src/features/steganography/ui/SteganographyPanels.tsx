"use client";

import { useState } from "react";
import { FileUpload } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useSteganography } from "../hooks/useSteganography";
import { useTranslation } from "@/shared/i18n/LanguageContext";

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
            <p className="text-4xl mb-2">🖼️</p>
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
            <p className="text-4xl mb-2">🔍</p>
            <p className="font-mono text-sm">{t.steg.analysisPlaceholder}</p>
          </div>
        )}
      </ResultDisplay>
    </div>
  );
}
