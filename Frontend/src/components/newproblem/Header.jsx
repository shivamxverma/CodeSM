import React from "react";
import { Link } from "react-router-dom";

export default function Header({
  importProblemJson,
  exportProblemJson,
  isSubmitting,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Create New Problem</h1>
        <p className="mt-1 text-sm text-slate-400">
          Fill details, or import a JSON to auto-fill everything.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <label className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
          Import Problem JSON
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && importProblemJson(e.target.files[0])
            }
          />
        </label>
        <button
          type="button"
          onClick={exportProblemJson}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
        >
          Export JSON
        </button>
        <Link
          to="/problems"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
        >
          ← Back
        </Link>
      </div>
    </div>
  );
}
