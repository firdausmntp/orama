"use client";

import { useTranslation } from "@/shared/i18n/LanguageContext";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-charcoal border-t-[3px] border-charcoal">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-neon neo-border flex items-center justify-center font-black text-bone text-sm">
              O
            </div>
            <span className="font-bold text-bone text-sm">
              ORAMA<span className="text-orange-neon">.</span>vision
            </span>
          </div>
          <p className="text-bone-muted text-xs font-mono text-center">
            {t.footer.credit}<br />
            {t.footer.copyright}
          </p>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-teal-dark text-mint text-xs font-mono neo-border">
              Next.js
            </span>
            <span className="px-2 py-1 bg-teal-dark text-lavender text-xs font-mono neo-border">
              Canvas API
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
