import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { createProblem } from "../../api/api";

export default function CreateProblem() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    difficulty: 800,
    description: "",
    memoryLimit: "",
    timeLimit: "",
    inputFormat: "",
    outputFormat: "",
    sampleTestcases: [{ input: "", output: "" }],
    constraints: "",
    tags: "",
    testcases: [{ input: "", output: "" }],
    language: "cpp",
    solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
  return 0;
}`,
    editorial: "",
    editorialLink: "",
  });

  const tagsArray = useMemo(
    () =>
      formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [formData.tags]
  );

  const updateField = (name, value) =>
    setFormData((s) => ({ ...s, [name]: value }));

  const updateTestcase = (idx, field, value) => {
    setFormData((s) => {
      const next = [...s.testcases];
      next[idx] = { ...next[idx], [field]: value };
      return { ...s, testcases: next };
    });
  };

  const addTestcase = () =>
    setFormData((s) => ({
      ...s,
      testcases: [...s.testcases, { input: "", output: "" }],
    }));

  const removeTestcase = (idx) =>
    setFormData((s) => ({
      ...s,
      testcases: s.testcases.filter((_, i) => i !== idx),
    }));

  const createTestcaseFromSample = () => {
    if (
      !formData.sampleTestcases.length ||
      !formData.sampleTestcases[0].input.trim() ||
      !formData.sampleTestcases[0].output.trim()
    )
      return;
    setFormData((s) => ({
      ...s,
      testcases: [
        ...s.sampleTestcases
          .filter(
            (sample) => sample.input.trim() && sample.output.trim()
          )
          .filter(
            (sample) =>
              !s.testcases.some(
                (tc) => tc.input === sample.input && tc.output === sample.output
              )
          ),
        ...s.testcases,
      ],
    }));
  };

  const importTestcasesJson = async (file) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        const mapped = json
          .map((x) => ({
            input: String(x.input ?? ""),
            output: String(x.output ?? ""),
          }))
          .filter((x) => x.input.length || x.output.length);
        if (mapped.length)
          setFormData((s) => ({ ...s, testcases: mapped }));
      }
    } catch {
      alert("Invalid JSON file. Expected an array of { input, output }.");
    }
  };

  const importProblemJson = async (file) => {
    try {
      const text = await file.text();
      const obj = JSON.parse(text) || {};
      const samples =
        Array.isArray(obj.sampleTestcases) && obj.sampleTestcases.length
          ? { sampleTestcases: obj.sampleTestcases }
          : Array.isArray(obj.examples) && obj.examples.length
          ? {
              sampleTestcases: [
                {
                  input: obj.examples[0].input || "",
                  output: obj.examples[0].output || "",
                },
              ],
            }
          : { sampleTestcases: [{ input: "", output: "" }] };
      const tc = Array.isArray(obj.testcases)
        ? obj.testcases
        : Array.isArray(obj.tests)
        ? obj.tests
        : samples.sampleInput || samples.sampleOutput
        ? [{ input: samples.sampleInput, output: samples.sampleOutput }]
        : [{ input: "", output: "" }];
      const sol =
        obj.solutions && (obj.solutions.code || obj.solutions.language)
          ? {
              language: obj.solutions.language || "cpp",
              solution: obj.solutions.code || "",
            }
          : { language: obj.language || "cpp", solution: obj.solution || "" };
      const tagsVal = Array.isArray(obj.tags)
        ? obj.tags.join(", ")
        : obj.tags || "";
      setFormData((s) => ({
        ...s,
        title: obj.title || "",
        difficulty: Number(obj.difficulty ?? s.difficulty),
        description: obj.description || "",
        memoryLimit: obj.memoryLimit || "",
        timeLimit: obj.timeLimit || "",
        inputFormat: obj.inputFormat || "",
        outputFormat: obj.outputFormat || "",
        constraints: obj.constraints || "",
        sampleTestcases:
          obj.sampleTestcases || [
            { input: samples.sampleInput, output: samples.sampleOutput },
          ],
        editorial: obj.editorial || "",
        editorialLink: obj.editorialLink || "",
        tags: tagsVal,
        testcases: (tc || [])
          .map((x) => ({
            input: String(x.input ?? ""),
            output: String(x.output ?? ""),
          }))
          .length
          ? (tc || []).map((x) => ({
              input: String(x.input ?? ""),
              output: String(x.output ?? ""),
            }))
          : [{ input: "", output: "" }],
        language: sol.language,
        solution: sol.solution,
      }));
      setError("");
    } catch (e) {
      setError("Invalid problem.json. Please check structure.");
    }
  };

  const exportProblemJson = () => {
    const payload = {
      title: formData.title,
      difficulty: formData.difficulty,
      description: formData.description,
      memoryLimit: formData.memoryLimit,
      timeLimit: formData.timeLimit,
      inputFormat: formData.inputFormat,
      outputFormat: formData.outputFormat,
      sampleTestcases: formData.sampleTestcases,
      constraints: formData.constraints,
      tags: tagsArray,
      testcases: formData.testcases,
      solutions: { language: formData.language, code: formData.solution },
      editorial: formData.editorial,
      editorialLink: formData.editorialLink,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "problem.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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
    <span
      className={`text-xs ${
        value.length > max ? "text-rose-300" : "text-slate-400"
      }`}
    >
      {value.length}/{max}
    </span>
  );

  const isValidUrl = (s) => {
    if (!s) return true;
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    if (!formData.title.trim()) return "Title is required";
    const d = Number(formData.difficulty);
    if (d < 800 || d > 3000) return "Difficulty must be between 800 and 3000";
    if (!formData.memoryLimit) return "Memory limit is required";
    if (!formData.timeLimit) return "Time limit is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.inputFormat.trim()) return "Input format is required";
    if (!formData.outputFormat.trim()) return "Output format is required";
    if (!formData.sampleTestcases.length)
      return "Sample testcases are required";
    if (!formData.constraints.trim()) return "Constraints are required";
    if (!formData.language) return "Language is required";
    if (!formData.solution.trim()) return "Solution cannot be empty";
    if (!formData.testcases.length) return "At least one testcase is required";
    if (formData.editorialLink && !isValidUrl(formData.editorialLink))
      return "Enter a valid Editorial link URL";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key === "testcases" ||
          key === "tags" ||
          key === "sampleTestcases" // Fix: Add this line
        ) {
          data.append(key, JSON.stringify(value));
        } else if (key === "solution") {
          data.append("code", value);
        } else {
          data.append(key, value);
        }
      });
      data.append(
        "solutions",
        JSON.stringify({ language: formData.language, code: formData.solution })
      );

      const res = await createProblem(data);

      const url = res?.data?.message?.uploadURL;
      if (url) {
        const testcasesFile = new Blob([JSON.stringify(formData.testcases)], {
          type: "application/json",
        });
        await axios.put(url, testcasesFile, {
          headers: { "Content-Type": "application/json" },
        });
      }

      navigate("/problems");
    } catch (err) {
      console.error(err);
      setError("Failed to create problem. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
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

        {error && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                    onChange={(e) =>
                      updateField("outputFormat", e.target.value)
                    }
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
                              formData.sampleTestcases.filter(
                                (_, i) => i !== idx
                              )
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
                  hint={`${tagsArray.length} tag${
                    tagsArray.length !== 1 ? "s" : ""
                  }`}
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

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold">Editorial (optional)</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Editorial (Markdown supported)"
                hint={
                  <CharCount value={formData.editorial} max={20000} />
                }
              >
                <textarea
                  value={formData.editorial}
                  onChange={(e) => updateField("editorial", e.target.value)}
                  rows={10}
                  spellCheck={false}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
                  placeholder={
                    "# Approach\nExplain your intuition, algorithm, and complexity.\n\n## Steps\n1. ..."
                  }
                />
              </Field>
              <Field label="Editorial Link (URL)">
                <input
                  type="url"
                  value={formData.editorialLink}
                  onChange={(e) =>
                    updateField("editorialLink", e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  placeholder="https://your-blog-or-notion-page.com/post"
                />
                {formData.editorialLink && !isValidUrl(formData.editorialLink) && (
                  <p className="mt-1 text-xs text-rose-300">Invalid URL</p>
                )}
              </Field>
            </div>
          </section>

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
                      e.target.files?.[0] &&
                      importTestcasesJson(e.target.files[0])
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
              {formData.testcases.map((tc, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-300 ring-1 ring-white/10">
                      Testcase #{idx + 1}
                    </span>
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
                      <label className="mb-1 block text-xs text-slate-300">
                        Input
                      </label>
                      <textarea
                        value={tc.input}
                        onChange={(e) =>
                          updateTestcase(idx, "input", e.target.value)
                        }
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

          <div className="sticky bottom-4 z-10">
            <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-slate-900/80 p-3 shadow-2xl backdrop-blur">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <div className="text-xs text-slate-400">
                  Ready to publish? You can edit later from the Problems list.
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl px-5 py-2 text-sm font-semibold text-white sm:w-auto ${
                    isSubmitting
                      ? "cursor-not-allowed bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-500"
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