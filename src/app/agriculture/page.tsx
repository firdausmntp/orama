"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { TabSwitcher } from "@/shared/components/TabSwitcher";
import {
  CountingPanel,
  CoinPanel,
} from "@/features/agriculture/ui/AgriculturePanels";
import { useTranslation } from "@/shared/i18n/LanguageContext";

export default function AgriculturePage() {
  const { t } = useTranslation();

  const TABS = [
    { id: "count", label: t.agri.tabCount, icon: "🔢" },
    { id: "coin", label: t.agri.tabCoin, icon: "🪙" },
  ];

  return (
    <div>
      <PageHeader
        icon="🌿"
        title={t.agri.pageTitle}
        subtitle={t.agri.pageSubtitle}
        accentColor="bg-mint"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <TabSwitcher tabs={TABS} defaultTab="count">
          {(activeTab) => (
            <>
              {activeTab === "count" && <CountingPanel />}
              {activeTab === "coin" && <CoinPanel />}
            </>
          )}
        </TabSwitcher>
      </div>
    </div>
  );
}
