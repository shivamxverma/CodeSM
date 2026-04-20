import React from "react";

export default function Solution({ formData, updateField }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Author Solution</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Language</span>
          <select
            value={formData.language}
            onChange={(e) => updateField("language", e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-950/40 px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none"
          >
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>
      </div>
      <textarea
        value={formData.solution}
        onChange={(e) => updateField("solution", e.target.value)}
        rows={16}
        spellCheck={false}
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
        placeholder="// Paste your reference solution here"
      />
      <p className="mt-2 text-xs text-slate-400">
        Saved as {"{ language, solution }"}.
      </p>
    </section>
  );
}
