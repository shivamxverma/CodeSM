import React, { useMemo } from "react";
import { Field } from "./Field";

export default function Basics({ formData, updateField }) {
  const diffLabel = useMemo(() => {
    const d = Number(formData.difficulty);
    if (d >= 800 && d <= 1200)
      return {
        label: "Easy",
        className: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
      };
    if (d >= 1300 && d <= 1700)
      return {
        label: "Medium",
        className: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
      };
    return {
      label: "Hard",
      className: "bg-rose-500/15 text-rose-300 ring-rose-400/20",
    };
  }, [formData.difficulty]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Basics</h2>
        <span
          className={`rounded-lg px-2 py-1 text-xs ring-1 ${diffLabel.className}`}
        >
          {diffLabel.label} · {formData.difficulty}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            placeholder="e.g., Two Sum"
            required
          />
        </Field>

        <Field label="Difficulty" hint="800–3000 (CF scale)">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={800}
              max={3000}
              step={100}
              value={formData.difficulty}
              onChange={(e) =>
                updateField("difficulty", Number(e.target.value))
              }
              className="w-full"
            />
            <input
              type="number"
              min={800}
              max={3000}
              step={100}
              value={formData.difficulty}
              onChange={(e) =>
                updateField("difficulty", Number(e.target.value))
              }
              className="w-24 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </Field>

        <Field label="Memory Limit (MB)">
          <input
            type="number"
            value={formData.memoryLimit}
            onChange={(e) => updateField("memoryLimit", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            placeholder="256"
            required
          />
        </Field>

        <Field label="Time Limit (s)">
          <input
            type="number"
            value={formData.timeLimit}
            onChange={(e) => updateField("timeLimit", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            placeholder="1"
            required
          />
        </Field>
      </div>
    </section>
  );
}
