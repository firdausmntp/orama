"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { TransformsPanel } from "@/features/transforms/ui/TransformsPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { Move3D } from "lucide-react";

export default function TransformsPage() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader
        icon={<Move3D className="w-8 h-8" />}
        title={t.transforms.pageTitle}
        subtitle={t.transforms.pageSubtitle}
        accentColor="bg-peach"
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TransformsPanel />
      </div>
    </div>
  );
}
