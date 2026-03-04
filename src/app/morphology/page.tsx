"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import MorphologyPanel from "@/features/morphology/ui/MorphologyPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { Shapes } from "lucide-react";

export default function MorphologyPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        icon={<Shapes className="w-8 h-8" />}
        title={t.morphology.pageTitle}
        subtitle={t.morphology.pageSubtitle}
        accentColor="bg-crimson"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <MorphologyPanel />
      </div>
    </div>
  );
}
