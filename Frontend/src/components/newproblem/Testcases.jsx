import React from "react";

export default function Testcases({
  testcases,
  addTestcase,
  removeTestcase,
  updateTestcase,
  createTestcaseFromSample,
  importTestcasesJson,
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Testcases</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={createTestcaseFromSample}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            + From Sample
          </button>
          <label className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
            Import Testcases JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && importTestcasesJson(e.target.files[0])
              }
            />
          </label>
          <button
            type="button"
            onClick={addTestcase}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            + Add Testcase
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {testcases.map((tc, idx) => (
          <div
            key={idx}
            className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-300 ring-1 ring-white/10">
                Testcase #{idx + 1}
              </span>
              {testcases.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTestcase(idx)}
                  className="rounded-lg bg-rose-500/20 px-2 py-1 text-xs text-rose-100 hover:bg-rose-500/30"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Input
                </label>
                <textarea
                  value={tc.input}
                  onChange={(e) => updateTestcase(idx, "input", e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                  placeholder={"n\na1 a2 ... an"}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Output
                </label>
                <textarea
                  value={tc.output}
                  onChange={(e) =>
                    updateTestcase(idx, "output", e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                  placeholder={"answer"}
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
