"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import ForensicsPanel from "@/features/forensics/ui/ForensicsPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { SearchCode } from "lucide-react";

export default function ForensicsPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-bone px-4 py-10 md:px-8">
      <PageHeader
        icon={<SearchCode className="w-8 h-8" />}
        title={t.forensics.pageTitle}
        subtitle={t.forensics.pageSubtitle}
        accentColor="bg-crimson"
      />
      <div className="mt-8 max-w-5xl mx-auto">
        <ForensicsPanel />
      </div>
    </main>
  );
}
