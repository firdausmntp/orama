"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { FFTPanel } from "@/features/fft/ui/FFTPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { AudioWaveform } from "lucide-react";

export default function FFTPage() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader
        icon={<AudioWaveform className="w-8 h-8" />}
        title={t.fft.pageTitle}
        subtitle={t.fft.pageSubtitle}
        accentColor="bg-lavender"
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <FFTPanel />
      </div>
    </div>
  );
}
