"use client";

import { useTranslation } from "@/shared/i18n/LanguageContext";

interface ResultDisplayProps {
  title: string;
  children: React.ReactNode;
  status?: "idle" | "processing" | "done" | "error";
  onDownload?: () => void;
}

export function ResultDisplay({
  title,
  children,
  status = "idle",
  onDownload,
}: ResultDisplayProps) {
  const { t } = useTranslation();

  const STATUS_CONFIG = {
    idle: { label: t.resultDisplay.waiting, color: "bg-bone-muted text-charcoal-light" },
    processing: { label: t.resultDisplay.processing, color: "bg-orange-neon text-bone animate-pulse" },
    done: { label: t.resultDisplay.complete, color: "bg-mint text-teal-deep" },
    error: { label: t.resultDisplay.error, color: "bg-crimson text-bone" },
  };

  const statusConf = STATUS_CONFIG[status];

  return (
    <section className="neo-card" aria-label={title}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-3 border-charcoal bg-teal-dark">
        <h3 className="font-black text-bone uppercase tracking-wider text-sm">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-bold neo-border ${statusConf.color}`}
            role="status"
            aria-live="polite"
          >
            {statusConf.label}
          </span>
          {status === "done" && onDownload && (
            <button
              onClick={onDownload}
              className="neo-btn neo-btn-primary text-xs px-2 py-1"
              aria-label={`${t.resultDisplay.save} ${title}`}
            >
              {t.resultDisplay.save}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </section>
  );
}
