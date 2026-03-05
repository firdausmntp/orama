"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { OCRPanel } from "@/features/document-scanner/ui/OCRPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { FileText } from "lucide-react";

export default function DocumentScannerPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        icon={<FileText className="w-8 h-8" />}
        title={t.docScan.pageTitle}
        subtitle={t.docScan.pageSubtitle}
        accentColor="bg-teal-mid"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <OCRPanel />
      </div>
    </div>
  );
}
