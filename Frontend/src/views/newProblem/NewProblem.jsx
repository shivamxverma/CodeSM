import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { createProblem, finializeProblem } from "@/api/api";
import { usePostHog } from "@posthog/react";

import Header from "@/components/newproblem/Header";
import Basics from "@/components/newproblem/Basics";
import Statement from "@/components/newproblem/Statement";
import Solution from "@/components/newproblem/Solution";
import Editorial from "@/components/newproblem/Editorial";
import Testcases from "@/components/newproblem/Testcases";

export default function CreateProblem() {
  const navigate = useNavigate();
  const posthog = usePostHog();
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

  useEffect(() => {
    posthog.capture("problem_creation_started");
  }, [posthog]);

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
    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
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

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const mapDifficulty = (val) => {
    const d = Number(val);
    if (d <= 1200) return "EASY";
    if (d <= 1900) return "MEDIUM";
    if (d <= 2400) return "HARD";
    return "EXPERT";
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

      const payload = {
        title: formData.title,
        description: formData.description,
        slug: generateSlug(formData.title),
        difficulty: mapDifficulty(formData.difficulty),
        inputFormat: formData.inputFormat,
        outputFormat: formData.outputFormat,
        constraints: formData.constraints,
        timeLimit: Number(formData.timeLimit),
        memoryLimit: Number(formData.memoryLimit),
        editorialContent: formData.editorial,
        editorialLink: formData.editorialLink || "",
        solution: formData.solution,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        testcases: formData.testcases.length,
        sampleTestcases: formData.sampleTestcases.length,
      };

      const res = await createProblem(payload);
      const { problemId, uploadUrls } = res.data.data;

      if (uploadUrls && uploadUrls.length > 0) {
        // Upload normal testcases first, then sample testcases
        const allTestcases = [...formData.testcases, ...formData.sampleTestcases];

        await Promise.all(
          uploadUrls.map((url, i) => {
            const tc = allTestcases[i];
            return axios.put(url, tc, {
              headers: { "Content-Type": "application/json" },
            });
          })
        );
      }

      await finializeProblem(problemId);

      posthog.capture("problem_created_success", {
        title: formData.title,
        problemId: problemId,
      });

      navigate("/problems");
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to create problem. Please try again.";
      posthog.capture("problem_created_failure", {
        title: formData.title,
        error: errorMsg,
      });
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <Header
          importProblemJson={importProblemJson}
          exportProblemJson={exportProblemJson}
          isSubmitting={isSubmitting}
        />

        {error && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Basics formData={formData} updateField={updateField} />
          <Statement formData={formData} updateField={updateField} />
          <Solution formData={formData} updateField={updateField} />
          <Editorial formData={formData} updateField={updateField} />
          <Testcases
            testcases={formData.testcases}
            addTestcase={addTestcase}
            removeTestcase={removeTestcase}
            updateTestcase={updateTestcase}
            createTestcaseFromSample={createTestcaseFromSample}
            importTestcasesJson={importTestcasesJson}
          />

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