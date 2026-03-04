"use client";

import { useState } from "react";
import { FileUpload } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useDetection } from "../hooks/useDetection";
import { useTranslation } from "@/shared/i18n/LanguageContext";

export function CountingPanel() {
  const [file, setFile] = useState<File | null>(null);
  const { status, result, outputUrl, params, setParams, process, downloadOutput } =
    useDetection();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="neo-card p-4">
        <h4 className="font-bold text-sm uppercase mb-3">{t.agri.parameters}</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-charcoal-light block mb-1">
              {t.agri.threshold}: {params.threshold}
            </label>
            <input
              type="range"
              min="0"
              max="255"
              value={params.threshold}
              onChange={(e) =>
                setParams({ ...params, threshold: Number(e.target.value) })
              }
              className="w-full accent-orange-neon"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-charcoal-light block mb-1">
              {t.agri.minArea}: {params.minArea}px
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              value={params.minArea}
              onChange={(e) =>
                setParams({ ...params, minArea: Number(e.target.value) })
              }
              className="w-full accent-orange-neon"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FileUpload
            onFileSelect={(f) => setFile(f)}
            label={t.agri.uploadCount}
            sublabel={t.agri.uploadCountHint}
          />
          {file && (
            <button
              onClick={() => process(file, "count")}
              disabled={status === "processing"}
              className="neo-btn neo-btn-primary w-full justify-center text-sm"
            >
              {status === "processing" ? t.agri.counting : t.agri.countBtn}
            </button>
          )}
        </div>

        <ResultDisplay
          title={t.agri.countResult}
          status={status}
          onDownload={downloadOutput}
        >
          {result && outputUrl ? (
            <div>
              <img src={outputUrl} alt="Result" className="max-h-64 mx-auto neo-border" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="neo-card-teal p-3 text-center">
                  <p className="text-3xl font-black text-orange-neon">{result.count}</p>
                  <p className="text-xs font-mono text-bone-muted">{t.agri.objectsFound}</p>
                </div>
                <div className="neo-card p-3 text-center">
                  <p className="text-sm font-mono text-charcoal">
                    {result.objects.map((o, i) => (
                      <span key={i} className="block text-xs">
                        #{i + 1}: {o.area}px² ({o.width}×{o.height})
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-charcoal-light">
              <p className="text-4xl mb-2">🔢</p>
              <p className="font-mono text-sm">{t.agri.countPlaceholder}</p>
            </div>
          )}
        </ResultDisplay>
      </div>
    </div>
  );
}

export function CoinPanel() {
  const [file, setFile] = useState<File | null>(null);
  const { status, result, outputUrl, params, setParams, process, downloadOutput } =
    useDetection();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="neo-card p-4">
        <h4 className="font-bold text-sm uppercase mb-3">{t.agri.circleParams}</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-charcoal-light block mb-1">
              {t.agri.minRadius}: {params.minRadius}px
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={params.minRadius}
              onChange={(e) =>
                setParams({ ...params, minRadius: Number(e.target.value) })
              }
              className="w-full accent-mint"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-charcoal-light block mb-1">
              {t.agri.maxRadius}: {params.maxRadius}px
            </label>
            <input
              type="range"
              min="20"
              max="200"
              value={params.maxRadius}
              onChange={(e) =>
                setParams({ ...params, maxRadius: Number(e.target.value) })
              }
              className="w-full accent-mint"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FileUpload
            onFileSelect={(f) => setFile(f)}
            label={t.agri.uploadCoin}
            sublabel={t.agri.uploadCoinHint}
          />
          {file && (
            <button
              onClick={() => process(file, "coin")}
              disabled={status === "processing"}
              className="neo-btn bg-mint text-teal-deep neo-border w-full justify-center text-sm"
            >
              {status === "processing" ? t.agri.detecting : t.agri.detectBtn}
            </button>
          )}
        </div>

        <ResultDisplay
          title={t.agri.coinDetection}
          status={status}
          onDownload={downloadOutput}
        >
          {result && outputUrl ? (
            <div>
              <img src={outputUrl} alt="Coins" className="max-h-64 mx-auto neo-border" />
              <div className="mt-4 neo-card-teal p-4 text-center">
                <p className="text-4xl font-black text-mint">{result.count}</p>
                <p className="text-sm font-mono text-bone-muted">{t.agri.coinsDetected}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-charcoal-light">
              <p className="text-4xl mb-2">🪙</p>
              <p className="font-mono text-sm">{t.agri.coinPlaceholder}</p>
            </div>
          )}
        </ResultDisplay>
      </div>
    </div>
  );
}
