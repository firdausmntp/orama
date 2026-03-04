"use client";

import { useState, useRef, useEffect } from "react";
import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useHistogram } from "../hooks/useHistogram";
import { useTranslation } from "@/shared/i18n/LanguageContext";

const HISTOGRAM_EXAMPLES: ExampleImage[] = [
  { src: "/examples/histogram-flower.jpg", label: "Flower" },
  { src: "/examples/histogram-snow.jpg", label: "Snow" },
];

type Channel = "all" | "red" | "green" | "blue" | "luminance";

function CanvasView({ canvas, alt }: { canvas: HTMLCanvasElement | null; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!canvas || !ref.current) return;
    ref.current.innerHTML = "";
    canvas.style.maxWidth = "100%";
    canvas.style.height = "auto";
    canvas.style.border = "3px solid #1A1A1A";
    ref.current.appendChild(canvas);
  }, [canvas]);
  if (!canvas) return null;
  return <div ref={ref} aria-label={alt} className="flex justify-center" />;
}

export default function HistogramPanel() {
  const h = useHistogram();
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);

  const CHANNELS: { value: Channel; label: string; color: string }[] = [
    { value: "all", label: t.histogram.channelAll, color: "bg-bone-muted" },
    { value: "red", label: t.histogram.channelRed, color: "bg-crimson" },
    { value: "green", label: t.histogram.channelGreen, color: "bg-mint" },
    { value: "blue", label: t.histogram.channelBlue, color: "bg-lavender" },
    { value: "luminance", label: t.histogram.channelLum, color: "bg-orange-light" },
  ];

  const handleFile = (f: File) => {
    setFile(f);
    h.analyze(f);
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <FileUpload
        onFileSelect={handleFile}
        label={t.histogram.uploadLabel}
        sublabel={t.histogram.uploadHint}
        examples={HISTOGRAM_EXAMPLES}
      />

      {h.status === "processing" && (
        <ResultDisplay title={t.histogram.resultTitle} status="processing">
          <p className="text-center font-mono text-sm animate-pulse">
            {t.histogram.computing}
          </p>
        </ResultDisplay>
      )}

      {h.status === "done" && (
        <>
          {/* Channel selector */}
          <div className="neo-card p-4">
            <h3 className="font-black text-sm uppercase mb-3 text-charcoal">
              {t.histogram.channelLabel}
            </h3>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.value}
                  onClick={() => {
                    h.switchChannel(ch.value);
                    if (file) h.analyze(file);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold uppercase neo-border transition-all ${
                    h.channel === ch.value
                      ? `${ch.color} text-charcoal shadow-[3px_3px_0px_#1A1A1A]`
                      : "bg-bone text-charcoal-light hover:bg-bone-muted"
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original histogram */}
            <ResultDisplay title={t.histogram.originalHist} status="done">
              <CanvasView canvas={h.histCanvas} alt="Original Histogram" />
              {h.originalUrl && (
                <div className="mt-4">
                  <p className="text-xs font-mono text-charcoal-light uppercase mb-2">
                    {t.histogram.originalImage}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.originalUrl}
                    alt="Original"
                    className="neo-border max-h-48 object-contain mx-auto"
                  />
                </div>
              )}
            </ResultDisplay>

            {/* Equalized histogram */}
            <ResultDisplay
              title={t.histogram.equalizedHist}
              status="done"
              onDownload={h.downloadEqualized}
            >
              <CanvasView canvas={h.eqHistCanvas} alt="Equalized Histogram" />
              {h.equalizedUrl && (
                <div className="mt-4">
                  <p className="text-xs font-mono text-charcoal-light uppercase mb-2">
                    {t.histogram.equalizedImage}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.equalizedUrl}
                    alt="Equalized"
                    className="neo-border max-h-48 object-contain mx-auto"
                  />
                </div>
              )}
            </ResultDisplay>
          </div>
        </>
      )}
    </div>
  );
}
