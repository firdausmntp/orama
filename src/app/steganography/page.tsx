"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { TabSwitcher } from "@/shared/components/TabSwitcher";
import {
  EncodePanel,
  DecodePanel,
  DetectPanel,
} from "@/features/steganography/ui/SteganographyPanels";
import { useTranslation } from "@/shared/i18n/LanguageContext";

export default function SteganographyPage() {
  const { t } = useTranslation();

  const TABS = [
    { id: "encode", label: t.steg.tabEncode, icon: "🔐" },
    { id: "decode", label: t.steg.tabDecode, icon: "🔓" },
    { id: "detect", label: t.steg.tabDetect, icon: "🔍" },
  ];

  return (
    <div>
      <PageHeader
        icon="🔐"
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
            </>
          )}
        </TabSwitcher>
      </div>
    </div>
  );
}
