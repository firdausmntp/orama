"use client";

import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useEdgeDetection } from "../hooks/useEdgeDetection";
import { EDGE_METHODS } from "../lib/edgeDetect";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import type { EdgeMethod } from "../lib/edgeDetect";

const EDGE_EXAMPLES: ExampleImage[] = [
  { src: "/examples/edge-bridge.jpg", label: "Bridge" },
  { src: "/examples/edge-church.jpg", label: "Church" },
];

export default function EdgeDetectionPanel() {
  const ed = useEdgeDetection();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Upload */}
      <FileUpload
        onFileSelect={(f) => ed.analyze(f)}
        label={t.edgeDetect.uploadLabel}
        sublabel={t.edgeDetect.uploadHint}
        examples={EDGE_EXAMPLES}
      />

      {ed.status === "processing" && (
        <ResultDisplay title={t.edgeDetect.resultTitle} status="processing">
          <p className="text-center font-mono text-sm animate-pulse">
            {t.edgeDetect.detecting}
          </p>
        </ResultDisplay>
      )}

      {ed.status === "done" && (
        <>
          {/* Controls */}
          <div className="neo-card p-4">
            <h3 className="font-black text-sm uppercase mb-3 text-charcoal">
              {t.edgeDetect.methodLabel}
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {EDGE_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => ed.changeMethod(m.value as EdgeMethod)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase neo-border transition-all ${
                    ed.method === m.value
                      ? "bg-teal-mid text-bone shadow-[3px_3px_0px_#1A1A1A]"
                      : "bg-bone text-charcoal-light hover:bg-bone-muted"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Invert toggle */}
            <button
              onClick={ed.toggleInvert}
              className={`px-3 py-1.5 text-xs font-bold uppercase neo-border transition-all ${
                ed.invert
                  ? "bg-charcoal text-bone shadow-[3px_3px_0px_#FF5F15]"
                  : "bg-bone text-charcoal-light hover:bg-bone-muted"
              }`}
            >
              {t.edgeDetect.invertLabel} {ed.invert ? "ON" : "OFF"}
            </button>

            {/* Method description */}
            <p className="mt-3 text-xs font-mono text-charcoal-light">
              {EDGE_METHODS.find((m) => m.value === ed.method)?.desc}
            </p>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResultDisplay title={t.edgeDetect.originalTitle} status="done">
              {ed.originalUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={ed.originalUrl}
                  alt="Original"
                  className="neo-border max-h-72 object-contain mx-auto"
                />
              )}
            </ResultDisplay>

            <ResultDisplay
              title={`${t.edgeDetect.outputTitle} — ${ed.method.toUpperCase()}`}
              status="done"
              onDownload={ed.downloadOutput}
            >
              {ed.outputUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={ed.outputUrl}
                  alt={`Edge ${ed.method}`}
                  className="neo-border max-h-72 object-contain mx-auto"
                />
              )}
            </ResultDisplay>
          </div>
        </>
      )}
    </div>
  );
}
