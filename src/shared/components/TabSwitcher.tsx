"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabSwitcherProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
}

export function TabSwitcher({ tabs, defaultTab, children }: TabSwitcherProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex flex-wrap border-b-3 border-charcoal" role="tablist" aria-label="Module tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-3 font-bold uppercase text-sm tracking-wider
              border-3 border-b-0 border-charcoal transition-all
              flex items-center gap-1.5
              ${
                activeTab === tab.id
                  ? "bg-orange-neon text-bone -mb-[3px] border-b-3 border-b-orange-neon z-10"
                  : "bg-bone-muted text-charcoal-light hover:bg-bone hover:text-charcoal"
              }
            `}
          >
            {tab.icon && <span className="flex items-center justify-center w-4 h-4" aria-hidden="true">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        className="p-6 neo-border border-t-0"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {children(activeTab)}
      </div>
    </div>
  );
}
