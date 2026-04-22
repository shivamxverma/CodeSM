import React from "react";

export default function ActionButtons({ 
  onRun, 
  onSubmit, 
  isRunning, 
  isSubmitting, 
  user 
}) {
  if (!user) return null;

  return (
    <div className="pointer-events-none absolute right-4 bottom-4 flex gap-3 z-20">
      <button
        type="button"
        onClick={onRun}
        disabled={isRunning || isSubmitting}
        className={`pointer-events-auto flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold border transition-all duration-200 shadow-lg ${
          isRunning || isSubmitting
            ? "opacity-60 cursor-not-allowed bg-[#19324b] border-[#274664] text-gray-400"
            : "bg-[#1e3046] hover:bg-[#264060] border-[#2a4a73] text-blue-100 hover:scale-105 active:scale-95"
        }`}
      >
        {isRunning ? (
          <>
            <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Running...
          </>
        ) : (
          "Run"
        )}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || isRunning}
        className={`pointer-events-auto flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold border transition-all duration-200 shadow-lg ${
          isSubmitting || isRunning
            ? "opacity-60 cursor-not-allowed bg-[#0c2a5d] border-[#1a3a78] text-gray-400"
            : "bg-[#0c5bd5] hover:bg-[#0a4fb9] border-[#0c5bd5] text-white hover:scale-105 active:scale-95"
        }`}
      >
        {isSubmitting ? (
          <>
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit"
        )}
      </button>
    </div>
  );
}
