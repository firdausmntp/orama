"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { TabSwitcher } from "@/shared/components/TabSwitcher";
import {
  EncodePanel,
  DecodePanel,
  DetectPanel,
  WatermarkPanel,
} from "@/features/steganography/ui/SteganographyPanels";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { Lock, Unlock, Search, Droplets } from "lucide-react";

export default function SteganographyPage() {
  const { t } = useTranslation();

  const TABS = [
    { id: "encode", label: t.steg.tabEncode, icon: <Lock className="w-4 h-4" /> },
    { id: "decode", label: t.steg.tabDecode, icon: <Unlock className="w-4 h-4" /> },
    { id: "detect", label: t.steg.tabDetect, icon: <Search className="w-4 h-4" /> },
    { id: "watermark", label: t.steg.tabWatermark, icon: <Droplets className="w-4 h-4" /> },
  ];

  return (
    <div>
      <PageHeader
        icon={<Lock className="w-8 h-8" />}
        title={t.steg.pageTitle}
        subtitle={t.steg.pageSubtitle}
        accentColor="bg-orange-neon"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <TabSwitcher tabs={TABS} defaultTab="encode">
          {(activeTab) => (
            <>
              {activeTab === "encode" && <EncodePanel />}
              {activeTab === "decode" && <DecodePanel />}
              {activeTab === "detect" && <DetectPanel />}
              {activeTab === "watermark" && <WatermarkPanel />}
            </>
          )}
        </TabSwitcher>
      </div>
    </div>
  );
}
