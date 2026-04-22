import React from "react";
import ProblemTabContent from "./ProblemTabContent";

const TABS = ["Description", "Editorial", "Submissions", "Solutions", "Hints", "Discussions"];

export default function ProblemDescriptionPanel({
  activeTab,
  setActiveTab,
  problem,
  problemId,
  embedUrl,
  submissions,
  refetchSubmissions,
  hints,
  hintsLoading,
  hintsError,
  revealedHintIndex,
  setRevealedHintIndex,
  fetchHints
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex gap-2 px-3 pt-3 bg-[#10151c] shrink-0 overflow-x-auto [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm rounded-t-lg font-medium transition-all duration-200 border-x border-t ${
              activeTab === t
                ? "bg-[#0f141b] border-[#233046] text-blue-300 shadow-[0_-2px_10px_rgba(0,0,0,0.3)] z-10"
                : "bg-transparent border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#1a2230]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content Wrapper */}
      <div className="flex-1 min-h-0 bg-[#0f141b] border-t border-[#233046] p-5 overflow-y-auto scroll-smooth [overscroll-behavior:contain] [scrollbar-gutter:stable]">
        <ProblemTabContent
          activeTab={activeTab}
          problem={problem}
          problemId={problemId}
          embedUrl={embedUrl}
          submissions={submissions}
          refetchSubmissions={refetchSubmissions}
          hints={hints}
          hintsLoading={hintsLoading}
          hintsError={hintsError}
          revealedHintIndex={revealedHintIndex}
          setRevealedHintIndex={setRevealedHintIndex}
          fetchHints={fetchHints}
        />
      </div>
    </div>
  );
}
