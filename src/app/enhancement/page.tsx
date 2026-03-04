"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { EnhancementPanel } from "@/features/enhancement/ui/EnhancementPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { Sparkles } from "lucide-react";

export default function EnhancementPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        icon={<Sparkles className="w-8 h-8" />}
        title={t.enhance.pageTitle}
        subtitle={t.enhance.pageSubtitle}
        accentColor="bg-lavender"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <EnhancementPanel />
      </div>
    </div>
  );
}
