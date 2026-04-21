import React from "react";
import { Link } from "react-router-dom";

export default function ProblemHeader({
  problem,
  statusBadge,
  statusClass,
  diffLabel,
  diffClass,
  language,
  setLanguage,
  isRunning,
  isSubmitting,
  isEditorFullscreen,
  setIsEditorFullscreen,
  resetCode
}) {
  return (
    <div className="px-5 py-3 bg-[#0f141b] border-b border-[#1b2330] flex items-center gap-3">
      {/* Mobile Title - visible only on small screens */}
      <div className="xl:hidden text-sm truncate">{problem?.title || "Loading..."}</div>
      
      {/* Desktop Navigation - visible only on large screens */}
      <div className="hidden xl:flex items-center gap-3">
        <Link to="/problems" className="text-sm hover:underline transition-colors text-gray-400">
          Back to Problems
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {statusBadge && (
          <span className={`text-xs px-2 py-1 rounded border ${statusClass}`}>
            {statusBadge.text}
          </span>
        )}
        
        {problem?.acceptance != null && (
          <span className="text-xs px-2 py-1 rounded bg-[#10202a] border border-[#1e3a4b] text-gray-300">
            Acceptance: {problem.acceptance}%
          </span>
        )}
        
        {diffLabel && (
          <span className={`text-xs px-2 py-1 rounded border ${diffClass}`}>{diffLabel}</span>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isRunning || isSubmitting}
            className={`text-xs px-2 py-1 rounded bg-[#182432] border border-[#233046] text-gray-200 focus:outline-none ${
              isRunning || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="go">Go</option>
          </select>
        </div>

        <button
          onClick={() => setIsEditorFullscreen((v) => !v)}
          className="text-xs px-3 py-1.5 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750] transition-colors"
          title={isEditorFullscreen ? "Exit fullscreen" : "Fullscreen editor"}
        >
          {isEditorFullscreen ? "⊠ Exit" : "⛶ Fullscreen"}
        </button>

        <button
          onClick={resetCode}
          disabled={isRunning || isSubmitting}
          className={`text-xs px-3 py-1.5 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750] transition-colors ${
            isRunning || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
