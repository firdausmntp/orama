"use client";

import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useFilters } from "../hooks/useFilters";
import { FILTER_PRESETS, PRESET_KERNELS } from "../lib/filters";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import type { FilterPreset } from "../lib/filters";

const FILTER_EXAMPLES: ExampleImage[] = [
  { src: "/examples/filter-tiles.jpg", label: "Tiles" },
  { src: "/examples/filter-moss.jpg", label: "Moss" },
];

export default function FiltersPanel() {
  const fl = useFilters();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Upload */}
      <FileUpload
        onFileSelect={(f) => fl.analyze(f)}
        label={t.filters.uploadLabel}
        sublabel={t.filters.uploadHint}
        examples={FILTER_EXAMPLES}
      />

      {fl.status === "processing" && (
        <ResultDisplay title={t.filters.resultTitle} status="processing">
          <p className="text-center font-mono text-sm animate-pulse">
            {t.filters.applying}
          </p>
        </ResultDisplay>
      )}

      {fl.status === "done" && (
        <>
          {/* Preset selector */}
          <div className="neo-card p-4">
            <h3 className="font-black text-sm uppercase mb-3 text-charcoal">
              {t.filters.presetLabel}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {FILTER_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => fl.changePreset(p.value as FilterPreset)}
                  className={`px-2 py-1.5 text-xs font-bold uppercase neo-border transition-all ${
                    fl.preset === p.value
                      ? "bg-lavender text-charcoal shadow-[3px_3px_0px_#1A1A1A]"
                      : "bg-bone text-charcoal-light hover:bg-bone-muted"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Iterations slider */}
            <div className="mb-4">
              <label className="text-xs font-mono text-charcoal-light uppercase block mb-1">
                {t.filters.iterations}: {fl.iterations}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={fl.iterations}
                onChange={(e) => fl.changeIterations(Number(e.target.value))}
                className="w-full accent-lavender"
              />
            </div>

            {/* Kernel preview */}
            <div className="bg-charcoal p-3 neo-border">
              <p className="text-xs font-mono text-bone-muted uppercase mb-2">
                {t.filters.kernelPreview}
              </p>
              {fl.preset === "median" ? (
                <div className="text-center text-xs font-mono text-bone p-3">
                  <p className="text-mint font-bold mb-1">MEDIAN 3×3</p>
                  <p className="text-bone-muted">Sort neighborhood → pick middle value</p>
                </div>
              ) : (
              <div className="grid grid-cols-3 gap-1 max-w-[160px] mx-auto">
                {(fl.preset === "custom"
                  ? fl.customKernel
                  : PRESET_KERNELS[fl.preset as Exclude<FilterPreset, "custom" | "median">]?.kernel ?? fl.customKernel
                ).map((row, r) =>
                  row.map((val, c) => (
                    <div key={`${r}-${c}`} className="relative">
                      {fl.preset === "custom" ? (
                        <input
                          type="number"
                          value={val}
                          onChange={(e) =>
                            fl.updateCustomKernel(r, c, Number(e.target.value) || 0)
                          }
                          className="w-full text-center text-xs font-mono p-1 neo-border bg-bone text-charcoal"
                        />
                      ) : (
                        <div className="text-center text-xs font-mono p-1 neo-border bg-teal-deep text-bone">
                          {val}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResultDisplay title={t.filters.originalTitle} status="done">
              {fl.originalUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={fl.originalUrl}
                  alt="Original"
                  className="neo-border max-h-72 object-contain mx-auto"
                />
              )}
            </ResultDisplay>

            <ResultDisplay
              title={`${t.filters.outputTitle} — ${fl.preset.toUpperCase()}`}
              status="done"
              onDownload={fl.downloadOutput}
            >
              {fl.outputUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={fl.outputUrl}
                  alt={`Filtered ${fl.preset}`}
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
