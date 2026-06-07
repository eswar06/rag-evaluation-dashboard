"use client";

const tabs = ["Overview", "Retrieval", "Performance", "Chunk Analysis", "Quality"] as const;

export type EvaluationTab = (typeof tabs)[number];

export default function EvaluationTabs({
  activeTab,
  onChange,
}: {
  activeTab: EvaluationTab;
  onChange: (tab: EvaluationTab) => void;
}) {
  return (
    <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            activeTab === tab
              ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-200"
              : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500 hover:text-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
