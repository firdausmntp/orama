"use client";

import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useForensics } from "../hooks/useForensics";
import { useTranslation } from "@/shared/i18n/LanguageContext";

const FORENSICS_EXAMPLES: ExampleImage[] = [
  { src: "/examples/forensics-edited-ela.jpg", label: "Edited (ELA)" },
  { src: "/examples/forensics-edited-blur.jpg", label: "Edited (Blur)" },
  { src: "/examples/forensics-edited-splice.jpg", label: "Edited (Splice)" },
  { src: "/examples/forensics-edited-copymove.jpg", label: "Edited (Copy-Move)" },
  { src: "/examples/forensics-city.jpg", label: "Original City" },
  { src: "/examples/forensics-nature.jpg", label: "Original Nature" },
];

/* ================================================================
   FORENSICS PANEL  —  master component with inline sub-panels
   ================================================================ */
export default function ForensicsPanel() {
  const f = useForensics();
  const { t } = useTranslation();

  const handleFile = (file: File) => f.analyse(file);

  return (
    <div className="space-y-8">
      {/* ── Upload ─────────────────────────────────────── */}
      {f.status === "idle" && (
        <div className="max-w-xl mx-auto">
          <FileUpload
            label={t.forensics.uploadForensic}
            sublabel={t.forensics.uploadForensicHint}
            onFileSelect={handleFile}
            examples={FORENSICS_EXAMPLES}
          />
        </div>
      )}

      {/* ── Processing ─────────────────────────────────── */}
      {f.status === "processing" && (
        <ResultDisplay title="Analysis" status="processing">
          <p className="text-center font-mono text-sm animate-pulse">
            {t.forensics.running}
          </p>
        </ResultDisplay>
      )}

      {/* ── Error ──────────────────────────────────────── */}
      {f.status === "error" && (
        <ResultDisplay title="Error" status="error">
          <p>{f.error}</p>
          <button onClick={f.reset} className="neo-btn neo-btn-secondary mt-4">
            {t.forensics.tryAgain}
          </button>
        </ResultDisplay>
      )}

      {/* ── Results ────────────────────────────────────── */}
      {f.status === "done" && (
        <>
          {/* Original preview */}
          {f.preview && (
            <section className="neo-card p-4 text-center">
              <h3 className="font-bold text-lg mb-2">{t.forensics.originalImage}</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.preview}
                alt="Original"
                className="mx-auto neo-border max-h-64 object-contain"
              />
              <button
                onClick={f.reset}
                className="neo-btn neo-btn-ghost mt-3 text-sm"
              >
                {t.forensics.uploadDifferent}
              </button>
            </section>
          )}

          {/* ── 1. ELA ─────────────────────────────────── */}
          <ELASection
            canvas={f.ela?.canvas ?? null}
            maxDiff={f.ela?.maxDiff ?? 0}
            avgDiff={f.ela?.avgDiff ?? 0}
            suspiciousPercent={f.ela?.suspiciousPercent ?? 0}
            quality={f.elaQuality}
            scale={f.elaScale}
            onQualityChange={f.setElaQuality}
            onScaleChange={f.setElaScale}
            onRerun={f.rerunELA}
          />

          {/* ── 2. Blur Map ────────────────────────────── */}
          <BlurSection
            canvas={f.blur?.canvas ?? null}
            globalVariance={f.blur?.globalVariance ?? 0}
            isBlurry={f.blur?.isBlurry ?? false}
            blurryPercent={f.blur?.blurryPercent ?? 0}
            blockSize={f.blurBlockSize}
            onBlockSizeChange={f.setBlurBlockSize}
            onRerun={f.rerunBlur}
          />

          {/* ── 3. Noise Analysis ──────────────────────── */}
          <NoiseSection
            canvas={f.noise?.canvas ?? null}
            noiseLevel={f.noise?.noiseLevel ?? 0}
            uniformity={f.noise?.uniformity ?? 0}
            verdict={f.noise?.verdict ?? ""}
          />

          {/* ── 4. Metadata / EXIF ─────────────────────── */}
          <MetaSection entries={f.meta} />
        </>
      )}
    </div>
  );
}

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

// ── Canvas renderer helper ──────────────────────────────
function CanvasView({
  canvas,
  alt,
}: {
  canvas: HTMLCanvasElement | null;
  alt: string;
}) {
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

// ── Stat pill ───────────────────────────────────────────
function Pill({
  label,
  value,
  accent = "bg-bone",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-mono px-3 py-1 neo-border text-charcoal ${accent}`}
    >
      <span className="font-bold">{label}:</span> {value}
    </span>
  );
}

// ════════════════════════════════════════════════════════
// 1. ELA Section
// ════════════════════════════════════════════════════════
function ELASection({
  canvas,
  maxDiff,
  avgDiff,
  suspiciousPercent,
  quality,
  scale,
  onQualityChange,
  onScaleChange,
  onRerun,
}: {
  canvas: HTMLCanvasElement | null;
  maxDiff: number;
  avgDiff: number;
  suspiciousPercent: number;
  quality: number;
  scale: number;
  onQualityChange: (v: number) => void;
  onScaleChange: (v: number) => void;
  onRerun: () => void;
}) {
  const { t } = useTranslation();
  const severity =
    suspiciousPercent > 15
      ? "text-crimson"
      : suspiciousPercent > 5
        ? "text-orange-light"
        : "text-mint";

  return (
    <section className="neo-card-teal p-5 space-y-4">
      <h3 className="font-bold text-xl flex items-center gap-2">
        <span className="text-2xl">🔥</span> {t.forensics.elaTitle}
      </h3>

      <p className="text-sm opacity-80">{t.forensics.elaDesc}</p>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <label className="flex flex-col gap-1 text-sm font-mono">
          {t.forensics.elaQuality} ({(quality * 100).toFixed(0)}%)
          <input
            type="range"
            min={0.1}
            max={0.99}
            step={0.01}
            value={quality}
            onChange={(e) => onQualityChange(+e.target.value)}
            className="accent-orange-neon"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-mono">
          {t.forensics.elaAmplification} (×{scale})
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={scale}
            onChange={(e) => onScaleChange(+e.target.value)}
            className="accent-orange-neon"
          />
        </label>
        <button
          onClick={onRerun}
          className="neo-btn neo-btn-primary text-sm h-10"
        >
          {t.forensics.rerunEla}
        </button>
      </div>

      {/* Map */}
      <CanvasView canvas={canvas} alt="ELA heatmap" />

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <Pill label={t.forensics.maxDelta} value={maxDiff} accent="bg-bone" />
        <Pill label={t.forensics.avgDelta} value={avgDiff} accent="bg-bone" />
        <Pill
          label={t.forensics.suspicious}
          value={`${suspiciousPercent}%`}
          accent="bg-bone"
        />
      </div>

      <p className={`font-bold text-sm ${severity}`}>
        {suspiciousPercent > 15
          ? t.forensics.elaHigh
          : suspiciousPercent > 5
            ? t.forensics.elaMod
            : t.forensics.elaLow}
      </p>
    </section>
  );
}

// ════════════════════════════════════════════════════════
// 2. Blur Map Section
// ════════════════════════════════════════════════════════
function BlurSection({
  canvas,
  globalVariance,
  isBlurry,
  blurryPercent,
  blockSize,
  onBlockSizeChange,
  onRerun,
}: {
  canvas: HTMLCanvasElement | null;
  globalVariance: number;
  isBlurry: boolean;
  blurryPercent: number;
  blockSize: number;
  onBlockSizeChange: (v: number) => void;
  onRerun: () => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="neo-card p-5 space-y-4">
      <h3 className="font-bold text-xl flex items-center gap-2">
        <Search className="w-6 h-6" /> {t.forensics.blurTitle}
      </h3>

      <p className="text-sm opacity-80">
        {t.forensics.blurDesc
          .replace(/<red>|<\/red>/g, "")
          .replace(/<blue>|<\/blue>/g, "")}
      </p>

      <div className="flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-1 text-sm font-mono">
          {t.forensics.blockSize} ({blockSize}px)
          <input
            type="range"
            min={4}
            max={64}
            step={4}
            value={blockSize}
            onChange={(e) => onBlockSizeChange(+e.target.value)}
            className="accent-orange-neon"
          />
        </label>
        <button
          onClick={onRerun}
          className="neo-btn neo-btn-secondary text-sm h-10"
        >
          {t.forensics.rerunBlur}
        </button>
      </div>

      <CanvasView canvas={canvas} alt="Blur sharpness map" />

      <div className="flex flex-wrap gap-3">
        <Pill label={t.forensics.variance} value={globalVariance} />
        <Pill label={t.forensics.blurry} value={`${blurryPercent}%`} />
        <Pill
          label={t.forensics.verdict}
          value={isBlurry ? t.forensics.verdictBlurry : t.forensics.verdictSharp}
          accent={isBlurry ? "bg-crimson/20" : "bg-mint/30"}
        />
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════
// 3. Noise Analysis Section
// ════════════════════════════════════════════════════════
function NoiseSection({
  canvas,
  noiseLevel,
  uniformity,
  verdict,
}: {
  canvas: HTMLCanvasElement | null;
  noiseLevel: number;
  uniformity: number;
  verdict: string;
}) {
  const { t } = useTranslation();
  const uColor =
    uniformity > 0.85
      ? "text-teal-mid"
      : uniformity > 0.6
        ? "text-orange-neon"
        : "text-crimson";

  return (
    <section className="neo-card p-5 space-y-4">
      <h3 className="font-bold text-xl flex items-center gap-2">
        <span className="text-2xl">📡</span> {t.forensics.noiseTitle}
      </h3>

      <p className="text-sm opacity-80">{t.forensics.noiseDesc}</p>

      <CanvasView canvas={canvas} alt="Noise residual map" />

      <div className="flex flex-wrap gap-3">
        <Pill label={t.forensics.noiseLevel} value={noiseLevel} />
        <Pill label={t.forensics.uniformity} value={uniformity} />
      </div>

      <p className={`font-bold text-sm ${uColor}`}>{verdict}</p>
    </section>
  );
}

// ════════════════════════════════════════════════════════
// 4. Metadata / EXIF Section
// ════════════════════════════════════════════════════════
function MetaSection({ entries }: { entries: { key: string; value: string }[] }) {
  const { t } = useTranslation();
  if (entries.length === 0) return null;

  return (
    <section className="neo-card p-5 space-y-4">
      <h3 className="font-bold text-xl flex items-center gap-2">
        <span className="text-2xl">🏷️</span> {t.forensics.metaTitle}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono border-collapse">
          <thead>
            <tr className="bg-charcoal text-bone">
              <th className="text-left px-3 py-2 neo-border">{t.forensics.field}</th>
              <th className="text-left px-3 py-2 neo-border">{t.forensics.value}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr
                key={e.key + i}
                className={i % 2 === 0 ? "bg-bone" : "bg-bone-muted"}
              >
                <td className="px-3 py-1.5 neo-border font-bold">{e.key}</td>
                <td className="px-3 py-1.5 neo-border">{e.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
