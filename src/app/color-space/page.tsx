"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import ColorSpacePanel from "@/features/color-space/ui/ColorSpacePanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";

export default function ColorSpacePage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        icon="🎨"
        title={t.colorSpace.pageTitle}
        subtitle={t.colorSpace.pageSubtitle}
        accentColor="bg-mint"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <ColorSpacePanel />
      </div>
    </div>
  );
}
