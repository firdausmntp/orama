"use client";

import { useState } from "react";
import { Ruler, FileText } from "lucide-react";
import { FileUpload, type ExampleImage } from "@/shared/components/FileUpload";
import { ResultDisplay } from "@/shared/components/ResultDisplay";
import { useScanner } from "../hooks/useScanner";
import { useTranslation } from "@/shared/i18n/LanguageContext";

const DOC_EXAMPLES: ExampleImage[] = [
  { src: "/examples/doc-notebook.jpg", label: "Notebook" },
  { src: "/examples/doc-desk.jpg", label: "Desk" },
];

export function ScannerPanel() {
  const [file, setFile] = useState<File | null>(null);
  const {
    status,
    corners,
    edgeUrl,
    scannedUrl,
    enhanceMode,
    scan,
    applyEnhancement,
    downloadOutput,
  } = useScanner();
  const { t } = useTranslation();

  const handleFile = (f: File) => {
    setFile(f);
    scan(f);
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <FileUpload
        onFileSelect={handleFile}
        label={t.docScan.uploadDoc}
        sublabel={t.docScan.uploadDocHint}
        examples={DOC_EXAMPLES}
      />

      {/* Results */}
      {(edgeUrl || scannedUrl) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edge Detection */}
          <ResultDisplay title={t.docScan.edgeDetection} status={status}>
            {edgeUrl ? (
              <div>
                <img
                  src={edgeUrl}
                  alt="Edges"
                  className="max-h-64 mx-auto neo-border"
                />
                <div className="mt-3 neo-card p-3">
                  <p className="text-xs font-mono text-charcoal-light">
                    {t.docScan.detectedCorners}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {corners.map((c, i) => (
                      <div
                        key={i}
                        className="text-xs font-mono bg-teal-dark text-mint px-2 py-1 neo-border"
                      >
                        P{i + 1}: ({Math.round(c.x)}, {Math.round(c.y)})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-charcoal-light">
                <Ruler className="w-10 h-10 mx-auto mb-2 text-charcoal-light" />
                <p className="font-mono text-sm">{t.docScan.edgePlaceholder}</p>
              </div>
            )}
          </ResultDisplay>

          {/* Scanned Output */}
          <ResultDisplay
            title={t.docScan.scannedDoc}
            status={status}
            onDownload={downloadOutput}
          >
            {scannedUrl ? (
              <div>
                <img
                  src={scannedUrl}
                  alt="Scanned"
                  className="max-h-64 mx-auto neo-border"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={applyEnhancement}
                    className={`neo-btn text-xs flex-1 justify-center ${
                      enhanceMode
                        ? "bg-mint text-teal-deep"
                        : "neo-btn-secondary"
                    }`}
                  >
                    {enhanceMode ? t.docScan.enhanced : t.docScan.enhanceBtn}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-charcoal-light">
                <FileText className="w-10 h-10 mx-auto mb-2 text-charcoal-light" />
                <p className="font-mono text-sm">{t.docScan.scanPlaceholder}</p>
              </div>
            )}
          </ResultDisplay>
        </div>
      )}
    </div>
  );
}
