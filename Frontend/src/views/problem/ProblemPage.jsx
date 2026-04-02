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
  /** Fresh execution UI: loading | compile errors | per-testcase tabs | plain error */
  const [executionPanel, setExecutionPanel] = useState(null);
  const [testcaseTab, setTestcaseTab] = useState(0);
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

  const showCompileErrors = useCallback((errors) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (editor && monaco) {
      const model = editor.getModel();
      const markers = (errors || []).map((e) => ({
        startLineNumber: Number(e.line) || 1,
        startColumn: Number(e.column) || 1,
        endLineNumber: Number(e.line) || 1,
        endColumn: (Number(e.column) || 1) + 1,
        message: e.message || "Compilation failed",
        severity: e.severity === "warning" ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
      }));
      if (model) monaco.editor.setModelMarkers(model, "compile", markers);
    }
    setStatusBadge({ type: "error", text: "Compilation Error" });
    setExecutionPanel({
      type: "compile",
      errors:
        errors && errors.length
          ? errors
          : [{ message: "Compilation failed" }],
    });
  }, []);

  const processExecutionResult = useCallback(
    (payload) => {
      if (!payload) {
        setStatusBadge({ type: "error", text: "No result received" });
        setExecutionPanel({ type: "error", message: "No result was returned from the server." });
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
        setExecutionPanel({ type: "error", message: msg });
        return;
      }

      setTestcaseTab(0);
      const outS = typeof stdout === "string" ? stdout : "";
      const errS = typeof stderr === "string" ? stderr : "";
      if (
        execution.length === 0 &&
        !outS.trim() &&
        !errS.trim()
      ) {
        setStatusBadge({ type: "error", text: "No result" });
        setExecutionPanel({ type: "error", message: "No test results returned." });
        return;
      }

      setExecutionPanel({
        type: "tests",
        items: execution,
        stdout: outS,
        stderr: errS,
      });

      const allPassed = execution.length > 0 && execution.every((t) => !!t?.isPassed);
      const hasTLE = execution.some(
        (t) => t?.isTLE || /exited|timeout/i.test(String(t?.output ?? t?.actual ?? t?.error ?? ""))
      );

      if (hasTLE) setStatusBadge({ type: "warn", text: "Time Limit Exceeded" });
      else if (allPassed) setStatusBadge({ type: "success", text: "Accepted" });
      else if (execution.length === 0) setStatusBadge(null);
      else setStatusBadge({ type: "error", text: "Wrong Answer" });
    },
    [showCompileErrors]
  );

  const runMutation = useMutation({
    mutationFn: () => runCode(problemId, { code, language }),
    onMutate: () => {
      setIsRunning(true);
      setStatusBadge(null);
      setTestcaseTab(0);
      setExecutionPanel({ type: "loading", message: "Running on sample testcases…" });
      clearMarkers();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Execution failed";
      setStatusBadge({ type: "error", text: "Error" });
      setExecutionPanel({ type: "error", message: msg });
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
      setTestcaseTab(0);
      setExecutionPanel({ type: "loading", message: "Submitting — judging hidden testcases…" });
      clearMarkers();
      handledSubmitPollRef.current = null;
      handledSubmitStoredRef.current = null;
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Submission failed";
      setStatusBadge({ type: "error", text: "Error" });
      setExecutionPanel({ type: "error", message: msg });
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
      setExecutionPanel({ type: "error", message: "Run job failed." });
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
        setExecutionPanel({ type: "error", message: "No result was returned from the server." });
      }
      finish();
    }
  }, [runJobId, runJobQuery.data, problemId, posthog, queryClient, setRunResult, processExecutionResult]);

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
      setExecutionPanel({ type: "error", message: "Submission job failed." });
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
  }, [submitMeta, submitJobQuery.data, problemId, posthog, queryClient, setSubmitResult, processExecutionResult]);

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
  }, [submitMeta, submitStoredQuery.isSuccess, submitStoredQuery.data, problemId, queryClient, setSubmitResult, processExecutionResult]);

  useEffect(() => {
    if (!submitMeta || !submitStoredQuery.isError) return;
    setStatusBadge({ type: "error", text: "Error" });
    setExecutionPanel({
      type: "error",
      message:
        submitStoredQuery.error?.response?.data?.message || "Could not load submission result.",
    });
    setSubmitMeta(null);
    setIsSubmitting(false);
  }, [submitMeta, submitStoredQuery.isError, submitStoredQuery.error]);

  useEffect(() => {
    if (!runJobId || !runJobQuery.isError) return;
    setStatusBadge({ type: "error", text: "Execution Failed" });
    setExecutionPanel({ type: "error", message: "Failed to get job status." });
    setRunJobId(null);
    setIsRunning(false);
    posthog.capture("run_failed", { problem_id: problemId, error: "poll_error" });
  }, [runJobId, runJobQuery.isError, problemId, posthog]);

  useEffect(() => {
    if (!submitMeta || !submitJobQuery.isError) return;
    setStatusBadge({ type: "error", text: "Execution Failed" });
    setExecutionPanel({ type: "error", message: "Failed to get submission job status." });
    setSubmitMeta(null);
    setIsSubmitting(false);
    posthog.capture("submission_failed", { problem_id: problemId, error: "poll_error" });
  }, [submitMeta, submitJobQuery.isError, problemId, posthog]);

  useEffect(() => {
    setCode(`#include <bits/stdc++.h>
using namespace std;
int main(){
  return 0;
}`);
  }, [language]);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = 0;
    }
  }, [executionPanel, testcaseTab]);

  useEffect(() => {
    if (activeTab === "Hints") {
      fetchHints();
    }
  }, [activeTab]);

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
    setExecutionPanel(null);
    setTestcaseTab(0);
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
    <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-[#0b0f13] via-[#10151c] to-[#1a2230] text-gray-200">
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

        <div className="mt-3 px-2 flex-1 min-h-0 flex flex-col">
          <div className="flex gap-2 px-3 shrink-0">
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

          <div className="border border-[#233046] rounded-b rounded-tr bg-[#0f141b] p-5 flex-1 min-h-0 overflow-y-auto scroll-smooth [overscroll-behavior:contain] [scrollbar-gutter:stable]">
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

      <div className="relative flex-1 flex flex-col min-h-0">
        <div className="px-5 py-3 bg-[#0f141b] border-b border-[#1b2330] flex items-center gap-3">
          <div className="xl:hidden text-sm truncate">{problem?.title || "Loading..."}</div>
          <div className="ml-auto flex items-center gap-2">
            {statusBadge && (
              <span className={`text-xs px-2 py-1 rounded border ${statusClass}`}>
                {statusBadge.text}
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

        <div className="flex-1 bg-[#0b0f13] min-h-0">
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
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                alwaysConsumeMouseWheel: false,
              },
            }}
          />
        </div>

        <div className="bg-[#0f141b] border-t border-[#1b2330] shrink-0">
          <div className="px-5 py-2.5 text-xs flex items-center justify-between border-b border-[#1b2330]/90">
            <span className="font-semibold text-gray-200 tracking-wide">Console</span>
            <button
              type="button"
              className="text-[11px] px-2.5 py-1 rounded-md border border-[#2a3750] text-gray-400 hover:bg-[#162134] hover:text-gray-200 transition-colors"
              onClick={() => {
                setExecutionPanel(null);
                setTestcaseTab(0);
              }}
            >
              Clear
            </button>
          </div>

          <div
            ref={consoleRef}
            className="min-h-[200px] max-h-[min(40vh,360px)] overflow-y-auto px-5 py-4 bg-[#080b10] scroll-smooth [overscroll-behavior:contain] [scrollbar-gutter:stable]"
          >
            {!executionPanel && (
              <p className="text-sm text-gray-500 font-mono leading-relaxed">
                Run (sample tests) or Submit to see a fresh result here.
              </p>
            )}

            {executionPanel?.type === "loading" && (
              <p className="text-sm text-sky-400/95 animate-pulse font-medium">{executionPanel.message}</p>
            )}

            {executionPanel?.type === "error" && (
              <p className="text-sm text-red-400 font-mono whitespace-pre-wrap leading-relaxed">
                {executionPanel.message}
              </p>
            )}

            {executionPanel?.type === "compile" && (
              <ul className="space-y-2">
                {executionPanel.errors.map((e, i) => (
                  <li
                    key={i}
                    className="text-sm text-red-200 font-mono bg-[#1a0c10] border border-red-900/35 rounded-lg px-3 py-2.5 leading-relaxed"
                  >
                    {e.message}
                    {e.line != null ? <span className="text-red-400/80"> (line {e.line})</span> : null}
                  </li>
                ))}
              </ul>
            )}

            {executionPanel?.type === "tests" && (
              <div className="space-y-3">
                {executionPanel.items.length > 0 ? (
                  <>
                    <div className="flex gap-0.5 border-b border-[#233046] overflow-x-auto -mx-1 px-1 pb-px">
                      {executionPanel.items.map((tc, i) => {
                        const errStr = String(tc?.error ?? "");
                        const tle = tc?.isTLE || /exited|timeout/i.test(errStr);
                        const passed = !!tc?.isPassed && !tle;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setTestcaseTab(i)}
                            className={`shrink-0 px-3 py-2 text-xs font-semibold rounded-t-md border border-b-0 transition-colors ${testcaseTab === i
                              ? "bg-[#0f141b] border-[#2f4a63] text-gray-100 -mb-px relative z-[1]"
                              : "bg-transparent border-transparent text-gray-500 hover:text-gray-300"
                              } ${tle
                                ? testcaseTab === i
                                  ? "text-amber-300"
                                  : "text-amber-500/85"
                                : passed
                                  ? testcaseTab === i
                                    ? "text-emerald-300"
                                    : "text-emerald-500/85"
                                  : testcaseTab === i
                                    ? "text-red-300"
                                    : "text-red-400/85"
                              }`}
                          >
                            Case {i + 1}
                            <span className="ml-1 opacity-90">{tle ? "· TLE" : passed ? "· AC" : "· WA"}</span>
                          </button>
                        );
                      })}
                    </div>

                    {executionPanel.items.map((tc, i) => {
                      if (i !== testcaseTab) return null;
                      const errStr = String(tc?.error ?? "");
                      const tle = tc?.isTLE || /exited|timeout/i.test(errStr);
                      const passed = !!tc?.isPassed && !tle;
                      const expected = tc.expected ?? tc.output ?? "—";
                      const actualRaw = tc.actual ?? tc.output ?? "";
                      const actualDisplay = tle
                        ? errStr || "—"
                        : actualRaw !== "" && actualRaw != null
                          ? String(actualRaw)
                          : errStr || "—";

                      return (
                        <div key={i} className="space-y-3 text-sm">
                          <div
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${tle
                              ? "bg-amber-950/45 border-amber-800/70 text-amber-300"
                              : passed
                                ? "bg-emerald-950/40 border-emerald-800/70 text-emerald-300"
                                : "bg-red-950/35 border-red-900/55 text-red-300"
                              }`}
                          >
                            {tle ? "Time limit exceeded" : passed ? "Passed" : "Failed"}
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                              Input
                            </div>
                            <pre className="text-gray-200 bg-[#0c1219] border border-[#233046] rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                              {tc.input != null && tc.input !== "" ? String(tc.input) : "—"}
                            </pre>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                              Expected output
                            </div>
                            <pre className="text-gray-200 bg-[#0c1219] border border-[#233046] rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                              {expected !== "—" ? String(expected) : "—"}
                            </pre>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                              Your output (actual)
                            </div>
                            <pre
                              className={`rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed border ${passed && !tle
                                ? "bg-emerald-950/25 border-emerald-900/40 text-emerald-100"
                                : "bg-red-950/20 border-red-900/45 text-red-100"
                                }`}
                            >
                              {actualDisplay}
                            </pre>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : null}

                {(executionPanel.stdout?.trim() || executionPanel.stderr?.trim()) && (
                  <div className={`space-y-2 ${executionPanel.items.length > 0 ? "pt-2 border-t border-[#233046]/80" : ""}`}>
                    {executionPanel.stdout?.trim() ? (
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                          stdout
                        </div>
                        <pre className="text-gray-300 bg-[#0c1219] border border-[#233046] rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                          {executionPanel.stdout.trim()}
                        </pre>
                      </div>
                    ) : null}
                    {executionPanel.stderr?.trim() ? (
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                          stderr
                        </div>
                        <pre className="text-amber-100/90 bg-[#1a1508] border border-amber-900/35 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                          {executionPanel.stderr.trim()}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {auth.user ? (
          <div className="fixed right-4 bottom-4 z-40 flex gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className={`rounded-lg px-4 py-2 text-sm border shadow-lg ${isRunning || isSubmitting
                ? "opacity-60 cursor-not-allowed bg-[#19324b] border-[#274664]"
                : "bg-[#1e3046] hover:bg-[#264060] border-[#2a4a73]"
                }`}
            >
              {isRunning ? "Running..." : "Run"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isRunning}
              className={`rounded-lg px-4 py-2 text-sm border shadow-lg ${isSubmitting || isRunning
                ? "opacity-60 cursor-not-allowed bg-[#19324b] border-[#274664]"
                : "bg-[#0c5bd5] hover:bg-[#0a4fb9] border-[#0c5bd5]"
                }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        ) : (
          <div className="fixed right-6 bottom-4 z-40 text-sm">
            <Link to="/login">
              <button className="bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 border border-indigo-500">
                Please log in to run or submit code.
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
