"use client";

import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useFFT } from "../hooks/useFFT";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import type { FrequencyFilter } from "../lib/fft";
import { SlidersHorizontal, Play } from "lucide-react";

const FFT_EXAMPLES: ExampleImage[] = [
  { src: "/examples/edge-bridge.jpg", label: "Bridge" },
  { src: "/examples/filter-tiles.jpg", label: "Tiles" },
];

function imageDataToUrl(data: ImageData): string {
  const c = document.createElement("canvas");
  c.width = data.width;
  c.height = data.height;
  c.getContext("2d")!.putImageData(data, 0, 0);
  return c.toDataURL();
}

export function FFTPanel() {
  const fft = useFFT();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Upload */}
      <FileUpload
        onFileSelect={(f) => fft.analyze(f)}
        label={t.fft.uploadLabel}
        sublabel={t.fft.uploadHint}
        examples={FFT_EXAMPLES}
      />

      {/* Processing */}
      {fft.status === "processing" && (
        <ResultDisplay title={t.fft.spectrum} status="processing">
          <p className="text-center font-mono text-sm animate-pulse">
            {t.fft.analyzing}
          </p>
        </ResultDisplay>
      )}

      {/* Controls & Results */}
      {fft.status === "done" && (
        <>
          {/* Control Panel */}
          <div className="neo-card p-4">
            <h3 className="font-black text-sm uppercase mb-3 text-charcoal flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              {t.fft.filterType}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Filter type selector */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-charcoal-light font-mono">
                  {t.fft.filterType}
                </label>
                <select
                  value={fft.filterType}
                  onChange={(e) => fft.setFilterType(e.target.value as FrequencyFilter)}
                  className="w-full neo-border bg-bone text-charcoal font-mono text-sm px-3 py-2"
                >
                  <option value="lowpass">{t.fft.lowpass}</option>
                  <option value="highpass">{t.fft.highpass}</option>
                  <option value="bandpass">{t.fft.bandpass}</option>
                </select>
              </div>

              {/* Cutoff slider */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-charcoal-light font-mono">
                  {t.fft.cutoff}: {fft.cutoff}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={fft.cutoff}
                  onChange={(e) => fft.setCutoff(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              {/* Bandwidth slider (bandpass only) */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase mb-1 font-mono ${
                    fft.filterType === "bandpass"
                      ? "text-charcoal-light"
                      : "text-charcoal-light/40"
                  }`}
                >
                  {t.fft.bandwidth}: {fft.bandwidth}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={fft.bandwidth}
                  onChange={(e) => fft.setBandwidth(Number(e.target.value))}
                  disabled={fft.filterType !== "bandpass"}
                  className="w-full accent-teal-600 disabled:opacity-30"
                />
              </div>
            </div>

            {/* Apply button */}
            <button
              onClick={fft.applyFilter}
              className="neo-btn bg-teal-mid text-bone font-bold uppercase text-sm px-6 py-2 flex items-center gap-2 neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <Play className="w-4 h-4" />
              {t.fft.applyFilter}
            </button>
          </div>

          {/* 4-panel result grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Original */}
            <ResultDisplay title={t.fft.placeholder} status="done">
              {fft.originalUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={fft.originalUrl}
                  alt="Original"
                  className="neo-border max-h-72 object-contain mx-auto"
                />
              )}
            </ResultDisplay>

            {/* 2. FFT Magnitude Spectrum */}
            <ResultDisplay title={t.fft.spectrum} status="done">
              {fft.spectrum && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageDataToUrl(fft.spectrum)}
                  alt="FFT Spectrum"
                  className="neo-border max-h-72 object-contain mx-auto"
                />
              )}
            </ResultDisplay>

            {/* 3. Filter Mask */}
            <ResultDisplay
              title={t.fft.filterMask}
              status={fft.filterMask ? "done" : "idle"}
            >
              {fft.filterMask ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageDataToUrl(fft.filterMask)}
                  alt="Filter Mask"
                  className="neo-border max-h-72 object-contain mx-auto"
                />
              ) : (
                <p className="text-center text-charcoal-light font-mono text-sm py-8">
                  {t.fft.placeholder}
                </p>
              )}
            </ResultDisplay>

            {/* 4. Filtered Result */}
            <ResultDisplay
              title={t.fft.filteredResult}
              status={fft.filteredImage ? "done" : "idle"}
            >
              {fft.filteredImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageDataToUrl(fft.filteredImage)}
                  alt="Filtered"
                  className="neo-border max-h-72 object-contain mx-auto"
                />
              ) : (
                <p className="text-center text-charcoal-light font-mono text-sm py-8">
                  {t.fft.placeholder}
                </p>
              )}
            </ResultDisplay>
          </div>
        </>
      )}
    </div>
  );
}
