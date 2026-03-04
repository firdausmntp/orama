"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import MorphologyPanel from "@/features/morphology/ui/MorphologyPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";

export default function MorphologyPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        icon="⚙️"
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
