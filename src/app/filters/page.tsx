"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import FiltersPanel from "@/features/filters/ui/FiltersPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { SlidersHorizontal } from "lucide-react";

export default function FiltersPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        icon={<SlidersHorizontal className="w-8 h-8" />}
        title={t.filters.pageTitle}
        subtitle={t.filters.pageSubtitle}
        accentColor="bg-lavender"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <FiltersPanel />
      </div>
    </div>
  );
}
