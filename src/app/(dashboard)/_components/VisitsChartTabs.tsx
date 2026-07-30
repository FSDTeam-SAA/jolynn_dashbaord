"use client";

import { useState } from "react";
import SponsorVisitsChart from "./SponsorVisitsChart";
import WebsiteVisitsChart from "./WebsiteVisitsChart";

type VisitTab = "website" | "sponsor";

const tabs: Array<{ label: string; value: VisitTab }> = [
  { label: "Website Visits", value: "website" },
  { label: "Sponsor Visits", value: "sponsor" },
];

export default function VisitsChartTabs() {
  const [activeTab, setActiveTab] = useState<VisitTab>("website");

  return (
    <section className="mt-10">
      <div
        className="mb-4 inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1"
        role="tablist"
        aria-label="Visit chart type"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#1e266e] text-white shadow-sm"
                  : "text-gray-500 hover:bg-white hover:text-[#1e266e]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {activeTab === "website" ? (
          <WebsiteVisitsChart />
        ) : (
          <SponsorVisitsChart />
        )}
      </div>
    </section>
  );
}
