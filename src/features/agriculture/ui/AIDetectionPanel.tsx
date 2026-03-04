"use client";

import { useState } from "react";
import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useAIDetection } from "../hooks/useAIDetection";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { Brain, Download, Loader2, AlertTriangle } from "lucide-react";

const AGRI_EXAMPLES: ExampleImage[] = [
  { src: "/examples/agri-fruits.jpg", label: "Nature" },
  { src: "/examples/agri-objects.jpg", label: "Objects" },
];

export function AIDetectionPanel() {
  const [file, setFile] = useState<File | null>(null);
  const {
    status,
    modelReady,
    result,
    outputUrl,
    error,
    confidence,
    setConfidence,
    summary,
    detect,
    preloadModel,
    downloadOutput,
  } = useAIDetection();
  const { t } = useTranslation();

  const statusMap: Record<string, "idle" | "processing" | "done" | "error"> = {
    idle: "idle",
    "loading-model": "processing",
    processing: "processing",
    done: "done",
    error: "error",
  };

  return (
    <div className="space-y-6">
      {/* Model Status + Controls */}
      <div className="neo-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-sm uppercase flex items-center gap-2">
            <Brain className="w-4 h-4" />
            {t.agri.aiModelConfig}
          </h4>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs font-bold neo-border ${
                modelReady
                  ? "bg-mint text-teal-deep"
                  : "bg-bone-muted text-charcoal-light"
              }`}
            >
              {modelReady ? t.agri.modelLoaded : t.agri.modelNotLoaded}
            </span>
            {!modelReady && status !== "loading-model" && (
              <button
                onClick={preloadModel}
                className="neo-btn neo-btn-secondary text-xs px-3 py-1"
              >
                {t.agri.preloadModel}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-charcoal-light block mb-1">
            {t.agri.confidenceThreshold}: {(confidence * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="w-full accent-orange-neon"
          />
          <div className="flex justify-between text-[10px] font-mono text-charcoal-light mt-1">
            <span>10%</span>
            <span>50%</span>
            <span>90%</span>
          </div>
        </div>

        <p className="mt-3 text-xs font-mono text-charcoal-light">
          {t.agri.aiModelDesc}
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="neo-card p-4 bg-crimson/10 border-crimson flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-crimson flex-shrink-0" />
          <p className="text-sm text-crimson font-mono">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FileUpload
            onFileSelect={(f) => setFile(f)}
            label={t.agri.uploadAI}
            sublabel={t.agri.uploadAIHint}
            examples={AGRI_EXAMPLES}
          />
          {file && (
            <button
              onClick={() => detect(file)}
              disabled={status === "processing" || status === "loading-model"}
              className="neo-btn neo-btn-primary w-full justify-center text-sm disabled:opacity-60"
            >
              {status === "loading-model" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.agri.loadingModel}
                </>
              ) : status === "processing" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.agri.detecting}
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  {t.agri.detectAIBtn}
                </>
              )}
            </button>
          )}
        </div>

        <ResultDisplay
          title={t.agri.aiDetectionResult}
          status={statusMap[status] || "idle"}
          onDownload={downloadOutput}
        >
          {result && outputUrl ? (
            <div>
              <img
                src={outputUrl}
                alt="AI Detection"
                className="max-h-64 mx-auto neo-border"
              />

              {/* Summary Stats */}
              {summary && (
                <div className="mt-4 space-y-3">
                  {/* Counts row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="neo-card-teal p-3 text-center">
                      <p className="text-2xl font-black text-orange-neon">
                        {summary.totalCount}
                      </p>
                      <p className="text-[10px] font-mono text-bone-muted">
                        {t.agri.objectsFound}
                      </p>
                    </div>
                    <div className="neo-card-teal p-3 text-center">
                      <p className="text-2xl font-black text-mint">
                        {summary.uniqueClasses.length}
                      </p>
                      <p className="text-[10px] font-mono text-bone-muted">
                        {t.agri.classesFound}
                      </p>
                    </div>
                    <div className="neo-card-teal p-3 text-center">
                      <p className="text-2xl font-black text-lavender">
                        {result.inferenceTime.toFixed(0)}ms
                      </p>
                      <p className="text-[10px] font-mono text-bone-muted">
                        {t.agri.inferenceTime}
                      </p>
                    </div>
                  </div>

                  {/* Per-class breakdown */}
                  <div className="neo-card p-3">
                    <p className="text-xs font-black uppercase text-charcoal-light mb-2">
                      {t.agri.detectedClasses}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(summary.classCounts)
                        .sort(([, a], [, b]) => b - a)
                        .map(([cls, count]) => (
                          <span
                            key={cls}
                            className="px-2 py-1 bg-teal-dark text-mint text-xs font-mono neo-border"
                          >
                            {cls}: {count}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Individual detections */}
                  <details className="neo-card">
                    <summary className="p-3 cursor-pointer text-xs font-black uppercase text-charcoal-light">
                      {t.agri.allDetections} ({result.detections.length})
                    </summary>
                    <div className="p-3 pt-0 max-h-40 overflow-y-auto space-y-1">
                      {result.detections.map((det, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs font-mono py-1 border-b border-charcoal/10"
                        >
                          <span className="font-bold">{det.class}</span>
                          <span className="text-charcoal-light">
                            {(det.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-charcoal-light">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-mono text-sm">{t.agri.aiPlaceholder}</p>
              <p className="font-mono text-[10px] mt-1 text-charcoal-light/60">
                COCO-SSD · 80 classes · MobileNet v2
              </p>
            </div>
          )}
        </ResultDisplay>
      </div>
    </div>
  );
}
