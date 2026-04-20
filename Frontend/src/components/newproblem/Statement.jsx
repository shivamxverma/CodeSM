import React, { useMemo } from "react";
import { Field, CharCount } from "./Field";

export default function Statement({ formData, updateField }) {
  const tagsArray = useMemo(
    () =>
      formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [formData.tags]
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold">Statement</h2>
      <div className="grid grid-cols-1 gap-4">
        <Field
          label="Description"
          hint={<CharCount value={formData.description} max={8000} />}
        >
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
            placeholder="Explain the problem, input/output, and what is expected."
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Input Format">
            <textarea
              value={formData.inputFormat}
              onChange={(e) => updateField("inputFormat", e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
              placeholder={"n\na1 a2 ... an"}
              required
            />
          </Field>
          <Field label="Output Format">
            <textarea
              value={formData.outputFormat}
              onChange={(e) => updateField("outputFormat", e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
              placeholder={"single integer"}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Field label="Sample Testcases">
            {formData.sampleTestcases.map((sample, idx) => (
              <div key={idx} className="mb-2 flex gap-2">
                <textarea
                  value={sample.input}
                  onChange={(e) => {
                    const next = [...formData.sampleTestcases];
                    next[idx].input = e.target.value;
                    updateField("sampleTestcases", next);
                  }}
                  rows={2}
                  className="w-1/2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                  placeholder="Sample Input"
                  required
                />
                <textarea
                  value={sample.output}
                  onChange={(e) => {
                    const next = [...formData.sampleTestcases];
                    next[idx].output = e.target.value;
                    updateField("sampleTestcases", next);
                  }}
                  rows={2}
                  className="w-1/2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                  placeholder="Sample Output"
                  required
                />
                {formData.sampleTestcases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      updateField(
                        "sampleTestcases",
                        formData.sampleTestcases.filter((_, i) => i !== idx)
                      );
                    }}
                    className="ml-2 rounded-lg bg-rose-500/20 px-2 py-1 text-xs text-rose-100 hover:bg-rose-500/30"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateField("sampleTestcases", [
                  ...formData.sampleTestcases,
                  { input: "", output: "" },
                ])
              }
              className="mt-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              + Add Sample
            </button>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Constraints"
            hint={<CharCount value={formData.constraints} max={2000} />}
          >
            <textarea
              value={formData.constraints}
              onChange={(e) => updateField("constraints", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
              placeholder={"1 ≤ n ≤ 2e5\n-1e9 ≤ ai ≤ 1e9"}
              required
            />
          </Field>

          <Field
            label="Tags (comma separated)"
            hint={`${tagsArray.length} tag${tagsArray.length !== 1 ? "s" : ""}`}
          >
            <input
              type="text"
              placeholder="math, binary search, dp"
              value={formData.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              required
            />
            {tagsArray.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tagsArray.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg bg-white/5 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-300 ring-1 ring-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </Field>
        </div>
      </div>
    </section>
  );
}
