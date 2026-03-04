"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import EdgeDetectionPanel from "@/features/edge-detection/ui/EdgeDetectionPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { SquareDashed } from "lucide-react";

export default function EdgeDetectionPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        icon={<SquareDashed className="w-8 h-8" />}
        title={t.edgeDetect.pageTitle}
        subtitle={t.edgeDetect.pageSubtitle}
        accentColor="bg-teal-mid"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <EdgeDetectionPanel />
      </div>
    </div>
  );
}
