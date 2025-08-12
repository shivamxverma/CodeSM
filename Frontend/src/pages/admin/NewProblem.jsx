import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function CreateProblem() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    difficulty: 800,
    description: "",
    memoryLimit: "",
    timeLimit: "",
    inputFormat: "",
    outputFormat: "",
    sampleInput: "",
    sampleOutput: "",
    constraints: "",
    tags: "",
    testcases: [{ input: "", output: "" }],
  });

  // --- Helpers ---
  const tagsArray = useMemo(
    () =>
      formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [formData.tags]
  );

  const updateField = (name, value) => setFormData((s) => ({ ...s, [name]: value }));

  const updateTestcase = (idx, field, value) => {
    setFormData((s) => {
      const next = [...s.testcases];
      next[idx] = { ...next[idx], [field]: value };
      return { ...s, testcases: next };
    });
  };

  const addTestcase = () =>
    setFormData((s) => ({ ...s, testcases: [...s.testcases, { input: "", output: "" }] }));

  const removeTestcase = (idx) =>
    setFormData((s) => ({ ...s, testcases: s.testcases.filter((_, i) => i !== idx) }));

  const createTestcaseFromSample = () => {
    if (!formData.sampleInput && !formData.sampleOutput) return;
    setFormData((s) => ({
      ...s,
      testcases: [{ input: s.sampleInput || "", output: s.sampleOutput || "" }, ...s.testcases],
    }));
  };

  const importTestcasesJson = async (file) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        const mapped = json
          .map((x) => ({ input: String(x.input ?? ""), output: String(x.output ?? "") }))
          .filter((x) => x.input.length || x.output.length);
        if (mapped.length) setFormData((s) => ({ ...s, testcases: mapped }));
      }
    } catch (e) {
      console.error("Invalid JSON for testcases", e);
      alert("Invalid JSON file. Expected an array of { input, output }.");
    }
  };

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic client validation
    if (!formData.title.trim()) return alert("Title is required");
    if (Number(formData.difficulty) < 800 || Number(formData.difficulty) > 3000) {
      return alert("Difficulty must be between 800 and 3000");
    }

    try {
      setIsSubmitting(true);
      setError("");

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "testcases") data.append(key, JSON.stringify(value));
        else data.append(key, value);
      });

      const res = await axios.post(
        "http://localhost:8000/api/v1/problem/createproblem",
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const problemId = res?.data?.message?.newProblem?._id;
      const url = res?.data?.message?.uploadURL;

      const testcasesFile = new Blob([JSON.stringify(formData.testcases)], {
        type: "application/json",
      });
      await axios.put(url, testcasesFile, {
        headers: { "Content-Type": "application/json" },
      });

      // Navigate
      setTimeout(() => navigate("/problems"), 400);
    } catch (err) {
      console.error(err);
      setError("Failed to create problem. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI helpers ---
  const Field = ({ label, hint, children }) => (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );

  const CharCount = ({ value, max = 5000 }) => (
    <span className={`text-xs ${value.length > max ? "text-rose-300" : "text-slate-400"}`}>
      {value.length}/{max}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Create New Problem</h1>
            <p className="mt-1 text-sm text-slate-400">Fill details, add samples & testcases, then submit.</p>
          </div>
          <Link
            to="/problems"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            ← Back to Problems
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Basics */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold">Basics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Title">
                <input
                  type="text"
                  name="title"
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
                    onChange={(e) => updateField("difficulty", Number(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="number"
                    min={800}
                    max={3000}
                    step={100}
                    value={formData.difficulty}
                    onChange={(e) => updateField("difficulty", Number(e.target.value))}
                    className="w-24 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </Field>

              <Field label="Memory Limit (MB)">
                <input
                  type="number"
                  name="memoryLimit"
                  value={formData.memoryLimit}
                  onChange={(e) => updateField("memoryLimit", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  placeholder="e.g., 256"
                  required
                />
              </Field>

              <Field label="Time Limit (s)">
                <input
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={(e) => updateField("timeLimit", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  placeholder="e.g., 1"
                  required
                />
              </Field>
            </div>
          </section>

          {/* Section: Statement */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold">Statement</h2>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Description" hint={<CharCount value={formData.description} max={8000} />}>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                  placeholder={`Explain the problem, input/output, and what is expected.`}
                  required
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Input Format">
                  <textarea
                    name="inputFormat"
                    value={formData.inputFormat}
                    onChange={(e) => updateField("inputFormat", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                    placeholder={`n\na1 a2 ... an`}
                    required
                  />
                </Field>
                <Field label="Output Format">
                  <textarea
                    name="outputFormat"
                    value={formData.outputFormat}
                    onChange={(e) => updateField("outputFormat", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                    placeholder={`single integer`}
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Sample Input">
                  <textarea
                    name="sampleInput"
                    value={formData.sampleInput}
                    onChange={(e) => updateField("sampleInput", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                    placeholder={`5\n1 2 3 4 5`}
                    required
                  />
                </Field>
                <Field label="Sample Output">
                  <textarea
                    name="sampleOutput"
                    value={formData.sampleOutput}
                    onChange={(e) => updateField("sampleOutput", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                    placeholder={`6`}
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Constraints">
                  <textarea
                    name="constraints"
                    value={formData.constraints}
                    onChange={(e) => updateField("constraints", e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                    placeholder={`1 ≤ n ≤ 2e5\n-1e9 ≤ ai ≤ 1e9`}
                    required
                  />
                </Field>

                <Field label="Tags (comma separated)" hint={`${tagsArray.length} tag${tagsArray.length !== 1 ? "s" : ""}` }>
                  <input
                    type="text"
                    name="tags"
                    placeholder="math, binary search, dp"
                    value={formData.tags}
                    onChange={(e) => updateField("tags", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                    required
                  />
                  {tagsArray.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tagsArray.map((t) => (
                        <span key={t} className="rounded-lg bg-white/5 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Field>
              </div>
            </div>
          </section>

          {/* Section: Testcases */}
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
                  Import JSON
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && importTestcasesJson(e.target.files[0])}
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
              {formData.testcases.map((tc, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <span className="rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-300 ring-1 ring-white/10">Testcase #{idx + 1}</span>
                    </div>
                    {formData.testcases.length > 1 && (
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
                      <label className="mb-1 block text-xs text-slate-300">Input</label>
                      <textarea
                        name={`testcaseInput-${idx}`}
                        value={tc.input}
                        onChange={(e) => updateTestcase(idx, "input", e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                        placeholder={`n\na1 a2 ... an`}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-300">Output</label>
                      <textarea
                        name={`testcaseOutput-${idx}`}
                        value={tc.output}
                        onChange={(e) => updateTestcase(idx, "output", e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                        placeholder={`answer`}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sticky submit bar */}
          <div className="sticky bottom-4 z-10">
            <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-slate-900/80 p-3 shadow-2xl backdrop-blur">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <div className="text-xs text-slate-400">
                  Ready to publish? You can edit later from the Problems list.
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl px-5 py-2 text-sm font-semibold text-white sm:w-auto ${
                    isSubmitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                >
                  {isSubmitting ? "Submitting…" : "Submit Problem"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
