"use client";

import { Sparkles } from "lucide-react";
import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useEnhancement } from "../hooks/useEnhancement";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import type { ImageMetrics, Enhancement } from "../lib/advisor";

const ENHANCE_EXAMPLES: ExampleImage[] = [
  { src: "/examples/enhance-dark.jpg", label: "Dark Scene" },
  { src: "/examples/enhance-sunset.jpg", label: "Sunset" },
];

function MetricBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-charcoal-light uppercase">{label}</span>
        <span className="font-bold">{value.toFixed(1)}</span>
      </div>
      <div className="w-full h-4 neo-border bg-bone-muted">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function HistogramChart({ histogram }: { histogram: ImageMetrics["histogram"] }) {
  const maxVal = Math.max(
    ...histogram.luminance.filter((_, i) => i > 5 && i < 250)
  );

  return (
    <div className="neo-card p-4 bg-charcoal">
      <p className="text-xs font-mono text-bone-muted mb-2 uppercase">
        Luminance Histogram
      </p>
      <div className="flex items-end h-24 gap-px">
        {histogram.luminance.map((val, i) => (
          <div
            key={i}
            className="flex-1 bg-bone/60 min-w-0"
            style={{
              height: `${Math.max(1, (val / maxVal) * 100)}%`,
              opacity: val > 0 ? 1 : 0.1,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono text-bone-muted">0</span>
        <span className="text-[10px] font-mono text-bone-muted">128</span>
        <span className="text-[10px] font-mono text-bone-muted">255</span>
      </div>
    </div>
  );
}

const SEVERITY_STYLES = {
  info: "bg-teal-dark/20 text-teal-dark border-teal-dark",
  warning: "bg-orange-neon/20 text-orange-burnt border-orange-neon",
  critical: "bg-crimson/20 text-crimson border-crimson",
};

export function EnhancementPanel() {
  const {
    status,
    metrics,
    suggestions,
    outputUrl,
    appliedEnhancements,
    analyze,
    applyAction,
    applyAll,
    downloadOutput,
  } = useEnhancement();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Upload */}
      <FileUpload
        onFileSelect={(f) => analyze(f)}
        label={t.enhance.uploadAnalysis}
        sublabel={t.enhance.uploadAnalysisHint}
        examples={ENHANCE_EXAMPLES}
      />

      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metrics Panel */}
          <div className="space-y-4">
            <div className="neo-card p-4">
              <h3 className="font-black text-sm uppercase mb-4 text-charcoal">
                {t.enhance.imageMetrics}
              </h3>
              <MetricBar
                label={t.enhance.brightness}
                value={metrics.brightness}
                max={255}
                color="bg-orange-light"
              />
              <MetricBar
                label={t.enhance.contrast}
                value={metrics.contrast}
                max={100}
                color="bg-teal-mid"
              />
              <MetricBar
                label={t.enhance.saturation}
                value={metrics.saturation}
                max={100}
                color="bg-lavender"
              />
              <MetricBar
                label={t.enhance.sharpness}
                value={metrics.sharpness}
                max={100}
                color="bg-mint"
              />

              <div className="mt-4 p-2 neo-border bg-charcoal flex items-center gap-2">
                <div
                  className="w-8 h-8 neo-border"
                  style={{
                    backgroundColor: `rgb(${metrics.colorDominant.join(",")})`,
                  }}
                />
                <span className="text-xs font-mono text-bone">
                  {t.enhance.dominant}: rgb({metrics.colorDominant.join(", ")})
                </span>
              </div>
            </div>

            <HistogramChart histogram={metrics.histogram} />
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase text-charcoal">
                {t.enhance.suggestions}
              </h3>
              {suggestions.some((s) => s.action !== "none") && (
                <button
                  onClick={applyAll}
                  className="neo-btn neo-btn-primary text-xs px-3 py-1"
                >
                  {t.enhance.applyAll}
                </button>
              )}
            </div>

            {suggestions.map((s) => (
              <div
                key={s.id}
                className={`neo-border p-4 ${SEVERITY_STYLES[s.severity]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{s.label}</span>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 neo-border bg-white/50">
                    {s.severity}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-3">{s.description}</p>
                {s.action !== "none" && (
                  <button
                    onClick={() => applyAction(s)}
                    disabled={appliedEnhancements.includes(s.id)}
                    className={`neo-btn text-xs w-full justify-center ${
                      appliedEnhancements.includes(s.id)
                        ? "bg-mint text-teal-deep"
                        : "neo-btn-secondary"
                    }`}
                  >
                    {appliedEnhancements.includes(s.id)
                      ? t.enhance.applied
                      : `${t.enhance.applyAction}: ${s.action} (${s.value > 0 ? "+" : ""}${s.value})`}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Output */}
          <ResultDisplay
            title={t.enhance.enhancedPreview}
            status={outputUrl ? "done" : status}
            onDownload={downloadOutput}
          >
            {outputUrl ? (
              <img
                src={outputUrl}
                alt="Enhanced"
                className="max-h-80 mx-auto neo-border"
              />
            ) : (
              <div className="text-center py-16 text-charcoal-light">
                <Sparkles className="w-10 h-10 mx-auto mb-2 text-charcoal-light" />
                <p className="font-mono text-sm">
                  {t.enhance.previewPlaceholder}
                </p>
              </div>
            )}
          </ResultDisplay>
        </div>
      )}
    </div>
  );
}
