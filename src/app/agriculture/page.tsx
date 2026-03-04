"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { TabSwitcher } from "@/shared/components/TabSwitcher";
import {
  CountingPanel,
  CoinPanel,
} from "@/features/agriculture/ui/AgriculturePanels";
import { AIDetectionPanel } from "@/features/agriculture/ui/AIDetectionPanel";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { Sprout, Hash, CircleDot, Brain } from "lucide-react";

export default function AgriculturePage() {
  const { t } = useTranslation();

  const TABS = [
    { id: "ai", label: t.agri.tabAI, icon: <Brain className="w-4 h-4" /> },
    { id: "count", label: t.agri.tabCount, icon: <Hash className="w-4 h-4" /> },
    { id: "coin", label: t.agri.tabCoin, icon: <CircleDot className="w-4 h-4" /> },
  ];

  return (
    <div>
      <PageHeader
        icon={<Sprout className="w-8 h-8" />}
        title={t.agri.pageTitle}
        subtitle={t.agri.pageSubtitle}
        accentColor="bg-mint"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <TabSwitcher tabs={TABS} defaultTab="ai">
          {(activeTab) => (
            <>
              {activeTab === "ai" && <AIDetectionPanel />}
              {activeTab === "count" && <CountingPanel />}
              {activeTab === "coin" && <CoinPanel />}
            </>
          )}
        </TabSwitcher>
      </div>
    </div>
  );
}
