"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import HistogramPanel from "@/features/histogram/ui/HistogramPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { BarChart2 } from "lucide-react";

export default function HistogramPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        icon={<BarChart2 className="w-8 h-8" />}
        title={t.histogram.pageTitle}
        subtitle={t.histogram.pageSubtitle}
        accentColor="bg-orange-neon"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <HistogramPanel />
      </div>
    </div>
  );
}
