"use client";

import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useTransforms } from "../hooks/useTransforms";
import { TRANSFORM_TYPES, INTERPOLATION_METHODS } from "../lib/transforms";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import type { TransformType, InterpolationMethod, FlipDirection } from "../lib/transforms";
import {
  RotateCw,
  FlipHorizontal2,
  Maximize2,
  Crop,
  MoveHorizontal,
  ArrowRightLeft,
} from "lucide-react";

const TRANSFORM_EXAMPLES: ExampleImage[] = [
  { src: "/examples/edge-bridge.jpg", label: "Bridge" },
  { src: "/examples/filter-tiles.jpg", label: "Tiles" },
];

const TRANSFORM_ICONS: Record<TransformType, React.ReactNode> = {
  resize: <Maximize2 className="w-4 h-4" />,
  rotate: <RotateCw className="w-4 h-4" />,
  flip: <FlipHorizontal2 className="w-4 h-4" />,
  crop: <Crop className="w-4 h-4" />,
  shear: <ArrowRightLeft className="w-4 h-4" />,
  translate: <MoveHorizontal className="w-4 h-4" />,
};

export function TransformsPanel() {
  const tx = useTransforms();
  const { t } = useTranslation();

  const needsInterpolation =
    tx.transformType === "resize" ||
    tx.transformType === "rotate" ||
    tx.transformType === "shear";

  return (
    <div className="space-y-6">
      {/* Upload */}
      <FileUpload
        onFileSelect={(f) => tx.transform(f)}
        label={t.transforms.uploadLabel}
        sublabel={t.transforms.uploadHint}
        examples={TRANSFORM_EXAMPLES}
      />

      {tx.status === "processing" && (
        <ResultDisplay title={t.transforms.transformType} status="processing">
          <p className="text-center font-mono text-sm animate-pulse">
            {t.transforms.processing}
          </p>
        </ResultDisplay>
      )}

      {tx.status === "done" && (
        <>
          {/* Transform type selector */}
          <div className="neo-card p-4">
            <h3 className="font-black text-sm uppercase mb-3 text-charcoal">
              {t.transforms.transformType}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
              {TRANSFORM_TYPES.map((tt) => (
                <button
                  key={tt.value}
                  onClick={() => tx.setTransformType(tt.value as TransformType)}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-bold uppercase neo-border transition-all ${
                    tx.transformType === tt.value
                      ? "bg-teal-deep text-bone shadow-[3px_3px_0px_#1A1A1A]"
                      : "bg-bone text-charcoal-light hover:bg-bone-muted"
                  }`}
                >
                  {TRANSFORM_ICONS[tt.value as TransformType]}
                  {tt.label}
                </button>
              ))}
            </div>

            {/* Dynamic parameters */}
            <div className="bg-charcoal p-4 neo-border space-y-4">
              {/* ── Resize ────────────────── */}
              {tx.transformType === "resize" && (
                <>
                  <div>
                    <label className="text-xs font-mono text-bone-muted uppercase block mb-1">
                      {t.transforms.scaleX}: {tx.scaleX.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={3}
                      step={0.1}
                      value={tx.scaleX}
                      onChange={(e) => tx.setScaleX(Number(e.target.value))}
                      className="w-full accent-mint"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-bone-muted uppercase block mb-1">
                      {t.transforms.scaleY}: {tx.scaleY.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={3}
                      step={0.1}
                      value={tx.scaleY}
                      onChange={(e) => tx.setScaleY(Number(e.target.value))}
                      className="w-full accent-mint"
                    />
                  </div>
                </>
              )}

              {/* ── Rotate ────────────────── */}
              {tx.transformType === "rotate" && (
                <div>
                  <label className="text-xs font-mono text-bone-muted uppercase block mb-1">
                    {t.transforms.angle}: {tx.angle}°
                  </label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={tx.angle}
                    onChange={(e) => tx.setAngle(Number(e.target.value))}
                    className="w-full accent-mint"
                  />
                </div>
              )}

              {/* ── Flip ──────────────────── */}
              {tx.transformType === "flip" && (
                <div>
                  <p className="text-xs font-mono text-bone-muted uppercase mb-2">
                    {t.transforms.flipDir}
                  </p>
                  <div className="flex gap-3">
                    {(
                      [
                        { value: "horizontal", label: t.transforms.horizontal },
                        { value: "vertical", label: t.transforms.vertical },
                        { value: "both", label: t.transforms.both },
                      ] as const
                    ).map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="flipDir"
                          checked={tx.flipDirection === opt.value}
                          onChange={() =>
                            tx.setFlipDirection(opt.value as FlipDirection)
                          }
                          className="accent-mint"
                        />
                        <span className="text-xs font-mono text-bone">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Crop ──────────────────── */}
              {tx.transformType === "crop" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      { key: "x", label: t.transforms.cropX },
                      { key: "y", label: t.transforms.cropY },
                      { key: "w", label: t.transforms.cropW },
                      { key: "h", label: t.transforms.cropH },
                    ] as const
                  ).map((f) => (
                    <div key={f.key}>
                      <label className="text-xs font-mono text-bone-muted uppercase block mb-1">
                        {f.label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={tx.cropRect[f.key]}
                        onChange={(e) =>
                          tx.setCropRect({
                            ...tx.cropRect,
                            [f.key]: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full text-xs font-mono p-1.5 neo-border bg-bone text-charcoal"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Shear ─────────────────── */}
              {tx.transformType === "shear" && (
                <>
                  <div>
                    <label className="text-xs font-mono text-bone-muted uppercase block mb-1">
                      {t.transforms.shear} X: {tx.shearX.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={tx.shearX}
                      onChange={(e) => tx.setShearX(Number(e.target.value))}
                      className="w-full accent-mint"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-bone-muted uppercase block mb-1">
                      {t.transforms.shear} Y: {tx.shearY.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={tx.shearY}
                      onChange={(e) => tx.setShearY(Number(e.target.value))}
                      className="w-full accent-mint"
                    />
                  </div>
                </>
              )}

              {/* ── Translate ─────────────── */}
              {tx.transformType === "translate" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-bone-muted uppercase block mb-1">
                      {t.transforms.translate} X
                    </label>
                    <input
                      type="number"
                      value={tx.translateX}
                      onChange={(e) =>
                        tx.setTranslateX(Number(e.target.value) || 0)
                      }
                      className="w-full text-xs font-mono p-1.5 neo-border bg-bone text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-bone-muted uppercase block mb-1">
                      {t.transforms.translate} Y
                    </label>
                    <input
                      type="number"
                      value={tx.translateY}
                      onChange={(e) =>
                        tx.setTranslateY(Number(e.target.value) || 0)
                      }
                      className="w-full text-xs font-mono p-1.5 neo-border bg-bone text-charcoal"
                    />
                  </div>
                </div>
              )}

              {/* ── Interpolation (shared) ── */}
              {needsInterpolation && (
                <div>
                  <p className="text-xs font-mono text-bone-muted uppercase mb-2">
                    {t.transforms.interpolation}
                  </p>
                  <div className="flex gap-3">
                    {INTERPOLATION_METHODS.map((im) => (
                      <label
                        key={im.value}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="interpolation"
                          checked={tx.interpolation === im.value}
                          onChange={() =>
                            tx.setInterpolation(
                              im.value as InterpolationMethod
                            )
                          }
                          className="accent-mint"
                        />
                        <span className="text-xs font-mono text-bone">
                          {im.value === "nearest"
                            ? t.transforms.nearest
                            : t.transforms.bilinear}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Apply button */}
            <button
              onClick={tx.reapply}
              className="neo-btn mt-4 w-full bg-teal-deep text-bone font-black uppercase tracking-wider py-2"
            >
              {t.transforms.apply}
            </button>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResultDisplay title={t.transforms.placeholder} status="done">
              {tx.originalUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={tx.originalUrl}
                  alt="Original"
                  className="neo-border max-h-72 object-contain mx-auto"
                />
              )}
            </ResultDisplay>

            <ResultDisplay
              title={`${tx.transformType.toUpperCase()}`}
              status="done"
              onDownload={tx.downloadOutput}
            >
              {tx.outputUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={tx.outputUrl}
                  alt={`Transformed ${tx.transformType}`}
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

export default TransformsPanel;
