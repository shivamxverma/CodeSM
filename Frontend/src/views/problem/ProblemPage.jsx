import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { usePostHog } from "@posthog/react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProblemDiscussions from "./ProblemDiscussions";
import { useAuth } from "@/auth/AuthContext";
import { useExecutionStore } from "@/stores/executionStore";
import {
  getProblem,
  runCode,
  getSubmissions,
  getProblemHints,
  getJobResponse,
  createSubmission,
  getSubmitJobResult,
} from "@/api/api";

const TABS = ["Description", "Editorial", "Submissions", "Solutions", "Hints", "Discussions"];

function getDifficultyFromRating(rating) {
  if (!rating)
    return {
      label: "Unknown",
      style: "bg-[#1d2736] text-gray-300 border-[#2a3750]",
    };
  if (rating >= 800 && rating <= 1200)
    return {
      label: "Easy",
      style: "bg-[#0e2a1d] text-green-300 border-[#1e5d3b]",
    };
  if (rating >= 1300 && rating <= 1700)
    return {
      label: "Medium",
      style: "bg-[#3a2a0e] text-yellow-300 border-[#6a531e]",
    };
  return {
    label: "Hard",
    style: "bg-[#2a1313] text-red-300 border-[#5d1e1e]",
  };
}

function getYouTubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith("/shorts/")) {
        const shortId = u.pathname.split("/shorts/")[1]?.split(/[/?#]/)[0];
        if (shortId) return `https://www.youtube.com/embed/${shortId}`;
      }
    }
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch { }
  return null;
}

/** Map persisted JobResult document to the same shape as queue execution payloads. */
function normalizeStoredJobResult(doc) {
  let execution = [];
  try {
    const parsed = JSON.parse(doc.output || "[]");
    execution = Array.isArray(parsed) ? parsed : [];
  } catch {
    execution = [];
  }
  const hasTLE = execution.some(
    (t) => t?.isTLE || /exited/i.test(String(t?.output || t?.error || t?.actual || ""))
  );
  const allPassed = execution.length > 0 && execution.every((t) => !!t?.isPassed);
  let status = "rejected";
  if (doc.status === "failed") status = "failed";
  else if (hasTLE) status = "tle";
  else if (allPassed) status = "accepted";
  return { status, execution };
}

export default function ProblemPage() {
  const [runJobId, setRunJobId] = useState(null);
  const [submitMeta, setSubmitMeta] = useState(null);
  const [problem, setProblem] = useState(null);
  const [activeTab, setActiveTab] = useState("Description");
  const [language] = useState("cpp");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [statusBadge, setStatusBadge] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState("");
  const consoleRef = useRef(null);
  const [hints, setHints] = useState([]);
  const [hintsLoading, setHintsLoading] = useState(false);
  const [hintsError, setHintsError] = useState(null);
  const [revealedHintIndex, setRevealedHintIndex] = useState(0);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const { id: problemId } = useParams();
  const auth = useAuth();
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const setRunResult = useExecutionStore((s) => s.setRunResult);
  const setSubmitResult = useExecutionStore((s) => s.setSubmitResult);
  const handledRunRef = useRef(null);
  const handledSubmitPollRef = useRef(null);
  const handledSubmitStoredRef = useRef(null);

  const handleEditorChange = useCallback((value) => setCode(value || ""), []);
  const onEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await getProblem(problemId);
        const p = res.data.message;
        setProblem(p);
        posthog.capture("problem_viewed", {
          problem_id: problemId,
          problem_title: p?.title,
          difficulty: p?.difficulty,
        });
      } catch (error) {
        setProblem(null);
      }
    }
    fetchProblem();
  }, [problemId, posthog]);

  const runJobQuery = useQuery({
    queryKey: ["jobPoll", "run", runJobId, problemId],
    queryFn: () => getJobResponse(runJobId, problemId).then((r) => r.data),
    enabled: !!runJobId && !!problemId,
    refetchInterval: (q) => {
      const st = q.state.data?.data?.state;
      if (st === "completed" || st === "failed") return false;
      return 2000;
    },
  });

  const submitJobQuery = useQuery({
    queryKey: ["jobPoll", "submit", submitMeta?.jobId, problemId],
    queryFn: () => getJobResponse(submitMeta.jobId, problemId).then((r) => r.data),
    enabled: !!submitMeta?.jobId && !!problemId,
    refetchInterval: (q) => {
      const st = q.state.data?.data?.state;
      if (st === "completed" || st === "failed") return false;
      return 2000;
    },
  });

  const submitStoredQuery = useQuery({
    queryKey: ["submit-job-result", submitMeta?.submissionId],
    queryFn: () =>
      getSubmitJobResult(submitMeta.jobId, submitMeta.submissionId).then((r) => r.data),
    enabled:
      !!submitMeta?.jobId &&
      !!submitMeta?.submissionId &&
      submitJobQuery.data?.data?.state === "completed" &&
      !!submitJobQuery.data?.data?.fetchStoredResult,
    retry: (failureCount, err) =>
      failureCount < 10 && (err?.response?.status === 404 || err?.response?.status === 400),
    retryDelay: (i) => Math.min(1500 * (i + 1), 8000),
  });

  const {
    data: submissions = [],
    refetch: refetchSubmissions,
  } = useQuery({
    queryKey: ["problem-submissions", problemId],
    queryFn: () => getSubmissions(problemId).then((r) => r.data.message || []),
    enabled: activeTab === "Submissions" && !!problemId,
  });

  const runMutation = useMutation({
    mutationFn: () => runCode(problemId, { code, language }),
    onMutate: () => {
      setIsRunning(true);
      setStatusBadge(null);
      setConsoleOutput((prev) => (prev ? prev + "\n" : "") + "▶️ Running...\n");
      clearMarkers();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Execution failed";
      setStatusBadge({ type: "error", text: "Error" });
      setConsoleOutput((prev) => (prev ? prev + "\n" : "") + `${msg}`);
      setIsRunning(false);
      posthog.capture("run_failed", { problem_id: problemId, error: String(msg) });
    },
    onSuccess: (res) => {
      const id = res.data.message?.id;
      handledRunRef.current = null;
      if (id) setRunJobId(id);
      else setIsRunning(false);
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => createSubmission(problemId, { code, language }),
    onMutate: () => {
      setIsSubmitting(true);
      setStatusBadge(null);
      setConsoleOutput((prev) => (prev ? prev + "\n" : "") + "▶️ Submitting...\n");
      clearMarkers();
      handledSubmitPollRef.current = null;
      handledSubmitStoredRef.current = null;
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Submission failed";
      setStatusBadge({ type: "error", text: "Error" });
      setConsoleOutput((prev) => (prev ? prev + "\n" : "") + `${msg}`);
      setIsSubmitting(false);
      posthog.capture("submission_failed", { problem_id: problemId, error: String(msg) });
    },
    onSuccess: (res) => {
      const id = res.data.message?.id;
      const submissionId = res.data.message?.submissionId;
      if (id && submissionId) setSubmitMeta({ jobId: id, submissionId });
      else setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (!runJobId) return;
    const wrapped = runJobQuery.data?.data;
    const state = wrapped?.state;
    if (!state || state === "waiting" || state === "active") return;
    const token = `${runJobId}-${state}`;
    if (handledRunRef.current === token) return;

    const finish = () => {
      handledRunRef.current = token;
      setRunJobId(null);
      setIsRunning(false);
      queryClient.removeQueries({ queryKey: ["jobPoll", "run", runJobId, problemId] });
    };

    if (state === "failed") {
      posthog.capture("run_failed", {
        problem_id: problemId,
        error: "Job failed",
      });
      setStatusBadge({ type: "error", text: "Execution Failed" });
      setConsoleOutput((prev) => (prev ? prev + "\n" : "") + "Run job failed.\n");
      finish();
      return;
    }

    if (state === "completed") {
      const payload = wrapped?.result;
      if (payload) {
        setRunResult(problemId, payload);
        processExecutionResult(payload);
      } else {
        setStatusBadge({ type: "error", text: "No result received" });
        setConsoleOutput(
          (prev) => (prev ? prev + "\n" : "") + "No result was returned from the server.\n"
        );
      }
      finish();
    }
  }, [runJobId, runJobQuery.data, problemId, posthog, queryClient, setRunResult]);

  useEffect(() => {
    if (!submitMeta) return;
    const wrapped = submitJobQuery.data?.data;
    const state = wrapped?.state;
    if (!state || state === "waiting" || state === "active") return;

    if (state === "failed") {
      const token = `${submitMeta.jobId}-failed`;
      if (handledSubmitPollRef.current === token) return;
      handledSubmitPollRef.current = token;
      posthog.capture("submission_failed", {
        problem_id: problemId,
        error: "Job failed",
      });
      setStatusBadge({ type: "error", text: "Execution Failed" });
      setConsoleOutput((prev) => (prev ? prev + "\n" : "") + "Submission job failed.\n");
      setSubmitMeta(null);
      setIsSubmitting(false);
      queryClient.removeQueries({ queryKey: ["jobPoll", "submit", submitMeta.jobId, problemId] });
      return;
    }

    if (state === "completed") {
      const { result: inlineResult, fetchStoredResult } = wrapped;
      if (fetchStoredResult) return;
      if (inlineResult == null) return;
      const token = `${submitMeta.jobId}-completed-inline`;
      if (handledSubmitPollRef.current === token) return;
      handledSubmitPollRef.current = token;
      setSubmitResult(problemId, { source: "queue", result: inlineResult });
      processExecutionResult(inlineResult);
      queryClient.invalidateQueries({ queryKey: ["problem-submissions", problemId] });
      setSubmitMeta(null);
      setIsSubmitting(false);
      queryClient.removeQueries({ queryKey: ["jobPoll", "submit", submitMeta.jobId, problemId] });
    }
  }, [submitMeta, submitJobQuery.data, problemId, posthog, queryClient, setSubmitResult]);

  useEffect(() => {
    if (!submitMeta) return;
    if (!submitStoredQuery.isSuccess || !submitStoredQuery.data) return;
    const doc = submitStoredQuery.data?.data?.result;
    if (!doc) return;
    const token = `stored-${submitMeta.submissionId}`;
    if (handledSubmitStoredRef.current === token) return;
    handledSubmitStoredRef.current = token;

    const payload = normalizeStoredJobResult(doc);
    setSubmitResult(problemId, { source: "db", document: doc });
    processExecutionResult(payload);
    queryClient.invalidateQueries({ queryKey: ["problem-submissions", problemId] });
    setSubmitMeta(null);
    setIsSubmitting(false);
    queryClient.removeQueries({ queryKey: ["jobPoll", "submit", submitMeta.jobId, problemId] });
    queryClient.removeQueries({ queryKey: ["submit-job-result", submitMeta.submissionId] });
  }, [submitMeta, submitStoredQuery.isSuccess, submitStoredQuery.data, problemId, queryClient, setSubmitResult]);

  useEffect(() => {
    if (!submitMeta || !submitStoredQuery.isError) return;
    setStatusBadge({ type: "error", text: "Error" });
    setConsoleOutput(
      (prev) =>
        (prev ? prev + "\n" : "") +
        (submitStoredQuery.error?.response?.data?.message || "Could not load submission result.") +
        "\n"
    );
    setSubmitMeta(null);
    setIsSubmitting(false);
  }, [submitMeta, submitStoredQuery.isError, submitStoredQuery.error]);

  useEffect(() => {
    if (!runJobId || !runJobQuery.isError) return;
    setStatusBadge({ type: "error", text: "Execution Failed" });
    setConsoleOutput((prev) => (prev ? prev + "\n" : "") + "Failed to get job status.\n");
    setRunJobId(null);
    setIsRunning(false);
    posthog.capture("run_failed", { problem_id: problemId, error: "poll_error" });
  }, [runJobId, runJobQuery.isError, problemId, posthog]);

  useEffect(() => {
    if (!submitMeta || !submitJobQuery.isError) return;
    setStatusBadge({ type: "error", text: "Execution Failed" });
    setConsoleOutput((prev) => (prev ? prev + "\n" : "") + "Failed to get submission job status.\n");
    setSubmitMeta(null);
    setIsSubmitting(false);
    posthog.capture("submission_failed", { problem_id: problemId, error: "poll_error" });
  }, [submitMeta, submitJobQuery.isError, problemId, posthog]);

  const processExecutionResult = (payload) => {
    if (!payload) {
      setStatusBadge({ type: "error", text: "No result received" });
      setConsoleOutput(
        (prev) => (prev ? prev + "\n" : "") + "No result was returned from the server."
      );
      return;
    }

    const { status, execution = [], errors = [], stderr, stdout } = payload;

    if (status === "compile_error") {
      showCompileErrors(errors || [{ message: stderr || "Compilation failed" }]);
      return;
    }

    if (status && status !== "accepted" && status !== "rejected") {
      const msg = payload.error || payload.raw || String(status);
      setStatusBadge({ type: "error", text: "Error" });
      setConsoleOutput((prev) => (prev ? prev + "\n" : "") + msg);
      return;
    }

    const lines = [];
    if (stdout && typeof stdout === "string") lines.push(stdout.trim());
    execution.forEach((tc, i) => {
      const outStr = tc?.output ?? tc?.actual ?? tc?.error;
      if (tc?.isTLE || /exited/i.test(String(outStr || ""))) {
        lines.push(`⚠️ Test Case ${i + 1}: Time Limit Exceeded`);
      } else if (tc?.isPassed) {
        lines.push(`✅ Test Case ${i + 1}: Passed`);
      } else {
        lines.push(`❌ Test Case ${i + 1}: Failed`);
      }
      if (outStr != null && outStr !== "") {
        lines.push(`Output: ${String(outStr).trim()}`);
      }
    });

    if (!execution.length && !stdout && !stderr) {
      lines.push("No test results returned.");
    }
    if (stderr) lines.push(`stderr: ${String(stderr).trim()}`);

    setConsoleOutput((prev) => (prev ? prev + "\n" : "") + lines.join("\n"));

    const allPassed = execution.length > 0 && execution.every((t) => !!t?.isPassed);
    const hasTLE = execution.some(
      (t) => t?.isTLE || /exited/i.test(String(t?.output ?? t?.actual ?? t?.error ?? ""))
    );

    if (hasTLE) setStatusBadge({ type: "warn", text: "Time Limit Exceeded" });
    else if (allPassed) setStatusBadge({ type: "success", text: "Accepted" });
    else setStatusBadge({ type: "error", text: "Wrong Answer" });
  };

  useEffect(() => {
    setCode(`#include <bits/stdc++.h>
using namespace std;
int main(){
  return 0;
}`);
  }, [language]);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  useEffect(() => {
    if (activeTab === "Hints") {
      fetchHints();
    }
  }, [activeTab]);

  function showCompileErrors(errors) {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    const markers = errors.map((e) => ({
      startLineNumber: Number(e.line) || 1,
      startColumn: Number(e.column) || 1,
      endLineNumber: Number(e.line) || 1,
      endColumn: (Number(e.column) || 1) + 1,
      message: e.message || "Compilation failed",
      severity: e.severity === "warning" ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
    }));
    if (model) monaco.editor.setModelMarkers(model, "compile", markers);

    setStatusBadge({ type: "error", text: "Compilation Error" });
    setConsoleOutput(
      (errors && errors.length
        ? errors.map((e) => `${e.message}${e.line ? ` (Line ${e.line})` : ""}`).join("\n")
        : "Compilation failed") + "\n"
    );
  }

  function clearMarkers() {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (model) monaco.editor.setModelMarkers(model, "compile", []);
  }

  const resetCode = () => {
    setCode(`#include <bits/stdc++.h>
using namespace std;
int main(){
  return 0;
}`);
    clearMarkers();
    setStatusBadge(null);
    setConsoleOutput("");
  };

  const handleRun = () => runMutation.mutate();
  const handleSubmit = () => submitMutation.mutate();

  async function fetchHints() {
    if (hints.length > 0 || hintsLoading) return;
    setHintsLoading(true);
    setHintsError(null);
    try {
      const res = await getProblemHints(problemId);
      const fetchedHints = res.data.message.hints || [];
      setHints(fetchedHints);
      setRevealedHintIndex(0);
      posthog.capture("hints_generated", { problem_id: problemId, count: fetchedHints.length });
    } catch (error) {
      setHintsError("Failed to load hints. Please try again later.");
      console.error("Error fetching hints:", error);
    } finally {
      setHintsLoading(false);
    }
  }

  const { label: diffLabel, style: diffClass } = getDifficultyFromRating(problem?.difficulty);

  const statusClass =
    statusBadge?.type === "success"
      ? "bg-[#0e2a1d] border-[#1e5d3b] text-green-300"
      : statusBadge?.type === "warn"
        ? "bg-[#3a2a0e] border-[#6a531e] text-yellow-300"
        : statusBadge?.type === "error"
          ? "bg-[#2a1313] border-[#5d1e1e] text-red-300"
          : "bg-[#182432] border-[#233046] text-gray-300";

  const embedUrl = getYouTubeEmbed(problem?.editorialLink);

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-[#0b0f13] via-[#10151c] to-[#1a2230] text-gray-200">
      <div className="hidden xl:flex w-2/5 min-w-[480px] max-w-[720px] flex-col border-r border-[#1b2330] shadow-lg bg-[#10151c]/80">
        <div className="px-5 py-3 bg-[#0f141b] border-b border-[#1b2330] flex items-center gap-3">
          <Link to="/problems" className="text-sm hover:underline transition-colors">
            Back to Problems
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {diffLabel && (
              <span className={`text-xs px-2 py-1 rounded-full border ${diffClass}`}>{diffLabel}</span>
            )}
            {problem?.acceptance != null && (
              <span className="text-xs px-2 py-1 rounded-full bg-[#10202a] border border-[#1e3a4b]">
                Acceptance: {problem.acceptance}%
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pt-4">
          <h1 className="text-xl font-bold tracking-tight">
            {problem ? problem.title : "Loading..."}
          </h1>
          <div className="mt-1 text-xs text-gray-400">
            {problem?.rating ? `Rating: ${problem.rating}` : null}
          </div>
        </div>

        <div className="mt-3 px-2">
          <div className="flex gap-2 px-3">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-2 text-sm rounded-t font-medium transition-colors ${activeTab === t
                  ? "bg-[#121923] border-x border-t border-[#233046] text-blue-300"
                  : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="border border-[#233046] rounded-b rounded-tr bg-[#0f141b] p-5 h-[calc(100vh-170px)] overflow-y-auto">
            {activeTab === "Description" && (
              <div className="space-y-6">
                <p className="leading-7 whitespace-pre-line">{problem?.description}</p>
                {problem?.sampleTestcases?.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-blue-300">Sample Testcases</h3>
                    {problem.sampleTestcases.map((tc, i) => (
                      <div
                        key={i}
                        className="rounded border border-[#233046] bg-[#0c1219] p-4 text-sm shadow"
                      >
                        <div className="mb-2">
                          <span className="font-semibold text-blue-200">Input:</span>
                          <pre className="rounded bg-[#10151c] p-2 mt-1">{tc.input}</pre>
                        </div>
                        <div>
                          <span className="font-semibold text-blue-200">Output:</span>
                          <pre className="rounded bg-[#10151c] p-2 mt-1">{tc.output}</pre>
                        </div>
                        {tc.explanation && (
                          <div className="mt-2 text-gray-400">
                            <span className="font-semibold text-blue-200">Explanation:</span>{" "}
                            {tc.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
                {problem?.examples?.length ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-blue-300">Examples</h3>
                    {problem.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="rounded border border-[#233046] bg-[#0c1219] p-4 text-sm shadow"
                      >
                        <div className="text-gray-300 mb-2">
                          Input: <code className="font-mono">{ex.input}</code>
                        </div>
                        <div className="text-gray-300 mb-2">
                          Output: <code className="font-mono">{ex.output}</code>
                        </div>
                        {ex.explanation && (
                          <div className="text-gray-400">Explanation: {ex.explanation}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
                {problem?.constraints && (
                  <div>
                    <h3 className="font-semibold mb-2 text-blue-300">Constraints</h3>
                    <div className="rounded border border-[#233046] bg-[#0c1219] p-4 text-sm whitespace-pre-line">
                      {problem.constraints}
                    </div>
                  </div>
                )}
                {problem?.inputFormat && (
                  <div>
                    <h3 className="font-semibold mb-2 text-blue-300">Input Format</h3>
                    <pre className="rounded border border-[#233046] bg-[#0c1219] p-3 text-sm overflow-x-auto">
                      {problem.inputFormat}
                    </pre>
                  </div>
                )}
                {problem?.outputFormat && (
                  <div>
                    <h3 className="font-semibold mb-2 text-blue-300">Output Format</h3>
                    <pre className="rounded border border-[#233046] bg-[#0c1219] p-3 text-sm overflow-x-auto">
                      {problem.outputFormat}
                    </pre>
                  </div>
                )}
                {(problem?.tags || []).length ? (
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-[#13202b] border border-[#224056] text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === "Editorial" && (
              <div className="space-y-4">
                {embedUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-[#233046] bg-black shadow">
                    <iframe
                      title="Editorial Video"
                      src={embedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}
                {problem?.editorialLink && !embedUrl && (
                  <a
                    href={problem.editorialLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-300 hover:underline"
                  >
                    Open editorial link
                  </a>
                )}
                {problem?.editorial ? (
                  <div className="prose prose-invert max-w-none prose-pre:bg-[#0c1219] prose-code:text-gray-200">
                    <ReactMarkdown>{problem.editorial}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No editorial provided.</div>
                )}
              </div>
            )}

            {activeTab === "Submissions" && (
              <div className="h-full overflow-y-auto">
                <button
                  className="mb-3 px-3 py-1 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750] text-xs"
                  onClick={() => refetchSubmissions()}
                >
                  Refresh Submissions
                </button>
                {submissions.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-gray-400">
                    No submissions found.
                  </div>
                ) : (
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#121923]">
                        <th className="border border-[#233046] px-2 py-1">#</th>
                        <th className="border border-[#233046] px-2 py-1">Username</th>
                        <th className="border border-[#233046] px-2 py-1">Status</th>
                        <th className="border border-[#233046] px-2 py-1">Language</th>
                        <th className="border border-[#233046] px-2 py-1">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub, idx) => (
                        <tr key={sub._id || idx} className="bg-[#0c1219]">
                          <td className="border border-[#233046] px-2 py-1">{idx + 1}</td>
                          <td className="border border-[#233046] px-2 py-1">
                            {sub.user.username || "N/A"}
                          </td>
                          <td className="border border-[#233046] px-2 py-1">
                            {sub.status || "N/A"}
                          </td>
                          <td className="border border-[#233046] px-2 py-1">
                            {sub.language || "N/A"}
                          </td>
                          <td className="border border-[#233046] px-2 py-1">
                            {sub.createdAt
                              ? new Date(sub.createdAt).toLocaleString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === "Solutions" && (
              <div className="space-y-3">
                {problem?.solution ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-[#182432] border border-[#233046]">
                        Language: C++
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-[#10202a] border border-[#1e3a4b]">
                        Official Solution
                      </span>
                    </div>
                    <pre className="rounded-lg border border-[#233046] bg-[#0c1219] p-4 text-sm overflow-x-auto">
                      {problem.solution}
                    </pre>
                  </>
                ) : (
                  <div className="text-sm text-gray-400">No official solution available.</div>
                )}
              </div>
            )}

            {activeTab === "Hints" && (
              <div className="space-y-4">
                {hintsLoading && (
                  <div className="text-sm text-gray-400">🧠 Generating hints for you...</div>
                )}
                {hintsError && <div className="text-sm text-red-400">{hintsError}</div>}
                {!hintsLoading && hints.length === 0 && (
                  <div className="text-sm text-gray-400">
                    No hints available for this problem.
                  </div>
                )}

                {hints.slice(0, revealedHintIndex + 1).map((hint, index) => (
                  <div
                    key={index}
                    className="rounded border border-[#233046] bg-[#0c1219] p-4 shadow animate-fade-in"
                  >
                    <h3 className="font-semibold text-blue-300 mb-2">{hint.title}</h3>
                    <p className="text-gray-300 whitespace-pre-line">{hint.content}</p>
                  </div>
                ))}

                {!hintsLoading && revealedHintIndex < hints.length - 1 && (
                  <button
                    onClick={() => {
                      setRevealedHintIndex((prev) => prev + 1);
                      posthog.capture("hint_revealed", { problem_id: problemId, hint_index: revealedHintIndex + 1 });
                    }}
                    className="w-full px-3 py-2 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750] text-sm font-medium transition-colors"
                  >
                    Reveal Next Hint
                  </button>
                )}
              </div>
            )}

            {activeTab === "Discussions" && (
              <ProblemDiscussions problemId={problemId} />
            )}
          </div>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        <div className="px-5 py-3 bg-[#0f141b] border-b border-[#1b2330] flex items-center gap-3">
          <div className="xl:hidden text-sm truncate">{problem?.title || "Loading..."}</div>
          <div className="ml-auto flex items-center gap-2">
            {statusBadge && (
              <span className={`text-xs px-2 py-1 rounded border ${statusClass}`}>
                Console: {statusBadge.text}
              </span>
            )}
            {problem?.acceptance != null && (
              <span className="text-xs px-2 py-1 rounded bg-[#10202a] border border-[#1e3a4b]">
                Acceptance: {problem.acceptance}%
              </span>
            )}
            {diffLabel && (
              <span className={`text-xs px-2 py-1 rounded border ${diffClass}`}>{diffLabel}</span>
            )}
            <span className="text-xs px-2 py-1 rounded bg-[#182432] border border-[#233046]">
              Language: C++
            </span>
            <button
              onClick={resetCode}
              className="text-xs px-3 py-1.5 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750]"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#0b0f13]">
          <Editor
            height="100%"
            language="cpp"
            value={code}
            theme="vs-dark"
            onChange={handleEditorChange}
            onMount={onEditorMount}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
            }}
          />
        </div>

        <div className="bg-[#0f141b] border-t border-[#1b2330]">
          <div className="px-5 py-2 text-xs text-gray-400 flex items-center justify-between">
            <span className="font-medium text-gray-300">Console</span>
            <div className="flex items-center gap-2">
              <button
                className="text-[11px] px-2 py-1 rounded border border-[#233046] hover:bg-[#162134]"
                onClick={() => setConsoleOutput("")}
              >
                Clear
              </button>
            </div>
          </div>
          {problem?.sampleTestcases?.length > 0 ? (
            <div className="px-5 pb-2">
              <h4 className="text-xs text-blue-300 font-semibold mb-1">Sample Testcases</h4>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {problem.sampleTestcases.map((tc, i) => (
                  <div key={i} className="min-w-[200px] max-w-[300px] flex-shrink-0">
                    <div className="rounded border border-[#233046] bg-[#0c1219] p-2 text-xs">
                      <div className="mb-1">
                        <span className="text-blue-200 font-semibold">Input:</span>
                        <pre className="mt-1">{tc.input}</pre>
                      </div>
                      <div>
                        <span className="text-blue-200 font-semibold">Output:</span>
                        <pre className="mt-1">{tc.output}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div
            ref={consoleRef}
            className="h-44 overflow-y-auto px-5 pb-4 font-mono text-sm whitespace-pre-wrap bg-[#0c1219]"
          >
            {consoleOutput || "Console output will appear here..."}
          </div>
        </div>

        {auth.user ? (
          <div className="pointer-events-none absolute right-4 bottom-4 flex gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className={`pointer-events-auto rounded-lg px-4 py-2 text-sm border ${isRunning || isSubmitting
                ? "opacity-60 cursor-not-allowed bg-[#19324b] border-[#274664]"
                : "bg-[#1e3046] hover:bg-[#264060] border-[#2a4a73]"
                }`}
            >
              {isRunning ? "Running..." : "Run"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isRunning}
              className={`pointer-events-auto rounded-lg px-4 py-2 text-sm border ${isSubmitting || isRunning
                ? "opacity-60 cursor-not-allowed bg-[#19324b] border-[#274664]"
                : "bg-[#0c5bd5] hover:bg-[#0a4fb9] border-[#0c5bd5]"
                }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        ) : (
          <div className="pointer-events-none absolute right-6 bottom-4 text-sm bg-[#f3f6fa]/80 text-gray-800">
            <Link to="/login">
              <button className="bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500">
                Please log in to run or submit code.
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}