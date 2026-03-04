"use client";

import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useMorphology } from "../hooks/useMorphology";
import { MORPH_OPS, STRUCT_SHAPES } from "../lib/morphology";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import type { MorphOp, StructShape } from "../lib/morphology";

const MORPH_EXAMPLES: ExampleImage[] = [
  { src: "/examples/morph-coast.jpg", label: "Coast" },
  { src: "/examples/morph-road.jpg", label: "Road" },
];

export default function MorphologyPanel() {
  const mp = useMorphology();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Upload */}
      <FileUpload
        onFileSelect={(f) => mp.analyze(f)}
        label={t.morphology.uploadLabel}
        sublabel={t.morphology.uploadHint}
        examples={MORPH_EXAMPLES}
      />

      {mp.status === "processing" && (
        <ResultDisplay title={t.morphology.resultTitle} status="processing">
          <p className="text-center font-mono text-sm animate-pulse">
            {t.morphology.processing}
          </p>
        </ResultDisplay>
      )}

      {mp.status === "done" && (
        <>
          {/* Controls */}
          <div className="neo-card p-4 space-y-4">
            {/* Operation selector */}
            <div>
              <h3 className="font-black text-sm uppercase mb-2 text-charcoal">
                {t.morphology.opLabel}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MORPH_OPS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => mp.changeOp(o.value as MorphOp)}
                    className={`px-2 py-1.5 text-xs font-bold uppercase neo-border transition-all ${
                      mp.op === o.value
                        ? "bg-crimson text-bone shadow-[3px_3px_0px_#1A1A1A]"
                        : "bg-bone text-charcoal-light hover:bg-bone-muted"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs font-mono text-charcoal-light">
                {MORPH_OPS.find((o) => o.value === mp.op)?.desc}
              </p>
            </div>

            {/* Structuring element shape */}
            <div>
              <h3 className="font-black text-sm uppercase mb-2 text-charcoal">
                {t.morphology.shapeLabel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {STRUCT_SHAPES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => mp.changeShape(s.value as StructShape)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase neo-border transition-all ${
                      mp.shape === s.value
                        ? "bg-teal-mid text-bone shadow-[3px_3px_0px_#1A1A1A]"
                        : "bg-bone text-charcoal-light hover:bg-bone-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Kernel size */}
            <div>
              <label className="text-xs font-mono text-charcoal-light uppercase block mb-1">
                {t.morphology.kernelSize}: {mp.kernelSize}×{mp.kernelSize}
              </label>
              <input
                type="range"
                min={3}
                max={15}
                step={2}
                value={mp.kernelSize}
                onChange={(e) => mp.changeKernelSize(Number(e.target.value))}
                className="w-full accent-crimson"
              />
            </div>

            {/* Threshold */}
            <div>
              <label className="text-xs font-mono text-charcoal-light uppercase block mb-1">
                {t.morphology.threshold}: {mp.threshold}
              </label>
              <input
                type="range"
                min={0}
                max={255}
                value={mp.threshold}
                onChange={(e) => mp.changeThreshold(Number(e.target.value))}
                className="w-full accent-crimson"
              />
            </div>
          </div>

          {/* Results — 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultDisplay title={t.morphology.originalTitle} status="done">
              {mp.originalUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={mp.originalUrl}
                  alt="Original"
                  className="neo-border max-h-56 object-contain mx-auto"
                />
              )}
            </ResultDisplay>

            <ResultDisplay title={t.morphology.binaryTitle} status="done">
              {mp.binaryUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={mp.binaryUrl}
                  alt="Binary"
                  className="neo-border max-h-56 object-contain mx-auto"
                />
              )}
            </ResultDisplay>

            <ResultDisplay
              title={`${t.morphology.outputTitle} — ${mp.op.toUpperCase()}`}
              status="done"
              onDownload={mp.downloadOutput}
            >
              {mp.outputUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={mp.outputUrl}
                  alt={`Morphology ${mp.op}`}
                  className="neo-border max-h-56 object-contain mx-auto"
                />
              )}
            </ResultDisplay>
          </div>
        </>
      )}
    </div>
  );
}
