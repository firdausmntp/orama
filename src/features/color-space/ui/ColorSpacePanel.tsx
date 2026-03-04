"use client";

import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useColorSpace } from "../hooks/useColorSpace";
import { COLOR_MODES } from "../lib/colorSpace";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import type { ColorMode } from "../lib/colorSpace";

const COLOR_EXAMPLES: ExampleImage[] = [
  { src: "/examples/color-neon.jpg", label: "Neon" },
  { src: "/examples/color-autumn.jpg", label: "Autumn" },
];

export default function ColorSpacePanel() {
  const cs = useColorSpace();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Upload */}
      <FileUpload
        onFileSelect={(f) => cs.analyze(f)}
        label={t.colorSpace.uploadLabel}
        sublabel={t.colorSpace.uploadHint}
        examples={COLOR_EXAMPLES}
      />

      {cs.status === "processing" && (
        <ResultDisplay title={t.colorSpace.resultTitle} status="processing">
          <p className="text-center font-mono text-sm animate-pulse">
            {t.colorSpace.converting}
          </p>
        </ResultDisplay>
      )}

      {cs.status === "done" && (
        <>
          {/* Controls */}
          <div className="neo-card p-4">
            <h3 className="font-black text-sm uppercase mb-3 text-charcoal">
              {t.colorSpace.modeLabel}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {COLOR_MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => cs.changeMode(m.value as ColorMode)}
                  className={`px-2 py-1.5 text-xs font-bold uppercase neo-border transition-all ${
                    cs.mode === m.value
                      ? "bg-orange-neon text-bone shadow-[3px_3px_0px_#1A1A1A]"
                      : "bg-bone text-charcoal-light hover:bg-bone-muted"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {cs.mode === "binary" && (
              <div className="mt-4">
                <label className="text-xs font-mono text-charcoal-light uppercase block mb-1">
                  {t.colorSpace.threshold}: {cs.threshold}
                </label>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={cs.threshold}
                  onChange={(e) => cs.changeThreshold(Number(e.target.value))}
                  className="w-full accent-orange-neon"
                />
              </div>
            )}
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResultDisplay title={t.colorSpace.originalTitle} status="done">
              {cs.originalUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={cs.originalUrl}
                  alt="Original"
                  className="neo-border max-h-72 object-contain mx-auto"
                />
              )}
            </ResultDisplay>

            <ResultDisplay
              title={`${t.colorSpace.outputTitle} — ${cs.mode.toUpperCase()}`}
              status="done"
              onDownload={cs.downloadOutput}
            >
              {cs.outputUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={cs.outputUrl}
                  alt={cs.mode}
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
