"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { ScannerPanel } from "@/features/document-scanner/ui/ScannerPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { Scan } from "lucide-react";

export default function DocumentScannerPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        icon={<Scan className="w-8 h-8" />}
        title={t.docScan.pageTitle}
        subtitle={t.docScan.pageSubtitle}
        accentColor="bg-teal-mid"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <ScannerPanel />
      </div>
    </div>
  );
}
