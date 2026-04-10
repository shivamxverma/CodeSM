import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { usePostHog } from "@posthog/react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthContext";
import { useExecutionStore } from "@/stores/executionStore";
import ExecutionConsole from "./components/ExecutionConsole";
import ProblemTabContent from "./components/ProblemTabContent";
import {
  TABS,
  getDifficultyFromRating,
  getYouTubeEmbed,
  normalizeStoredJobResult,
  monacoLanguageFrom,
  starterCodeByLanguage,
} from "./components/problemPageUtils";
import {
  getProblem,
  runCode,
  getSubmissions,
  getProblemHints,
  getJobResponse,
  createSubmission,
  getSubmitJobResult,
} from "@/api/api";

export default function ProblemPage() {
  const [runJobId, setRunJobId] = useState(null);
  const [submitMeta, setSubmitMeta] = useState(null);
  const [problem, setProblem] = useState(null);
  const [activeTab, setActiveTab] = useState("Description");
  const [language, setLanguage] = useState("cpp");
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
  /** One UUID per submit attempt; reused if React Query retries mutationFn for the same mutate(). */
  const submitIdempotencyKeyRef = useRef(null);

  // Resizable panel state
  const [editorHeightPct, setEditorHeightPct] = useState(60); // % of right column for editor
  const [leftWidthPct, setLeftWidthPct] = useState(40);       // % of total width for left panel
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const isDraggingVertical = useRef(false);
  const isDraggingHorizontal = useRef(false);
  const rightColRef = useRef(null);
  const rootRef = useRef(null);

  // Vertical drag (editor/console split)
  const onVerticalDragStart = useCallback((e) => {
    e.preventDefault();
    isDraggingVertical.current = true;
    const onMove = (ev) => {
      if (!isDraggingVertical.current || !rightColRef.current) return;
      const rect = rightColRef.current.getBoundingClientRect();
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const pct = ((clientY - rect.top) / rect.height) * 100;
      setEditorHeightPct(Math.min(85, Math.max(20, pct)));
    };
    const onUp = () => {
      isDraggingVertical.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }, []);

  // Horizontal drag (left/right panel split)
  const onHorizontalDragStart = useCallback((e) => {
    e.preventDefault();
    isDraggingHorizontal.current = true;
    const onMove = (ev) => {
      if (!isDraggingHorizontal.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setLeftWidthPct(Math.min(60, Math.max(25, pct)));
    };
    const onUp = () => {
      isDraggingHorizontal.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }, []);

  const handleEditorChange = useCallback((value) => setCode(value || ""), []);
  const onEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);

  const monacoLanguage = monacoLanguageFrom(language);
  const starterCode = useMemo(() => starterCodeByLanguage(), []);
  const didHydrateEditorStateRef = useRef(false);
  const didRestoreLanguageRef = useRef(false);
  const saveTimerRef = useRef(null);

  const editorStorageKey = useMemo(() => {
    const pid = String(problemId || "unknown");
    const lang = String(language || "cpp");
    return `codesm:editor:${pid}:${lang}`;
  }, [problemId, language]);

  const languageStorageKey = useMemo(() => {
    const pid = String(problemId || "unknown");
    return `codesm:editor:language:${pid}`;
  }, [problemId]);

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

  // Restore language selection for this problem (once).
  useEffect(() => {
    if (!problemId) return;
    try {
      const savedLang = localStorage.getItem(languageStorageKey);
      if (savedLang && typeof savedLang === "string") {
        setLanguage(savedLang);
      }
    } catch {
      // ignore
    }
    didRestoreLanguageRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  // Persist language selection.
  useEffect(() => {
    if (!problemId) return;
    if (!didRestoreLanguageRef.current) return;
    try {
      localStorage.setItem(languageStorageKey, String(language));
    } catch {
      // ignore
    }
  }, [problemId, language, languageStorageKey]);

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
    mutationFn: () =>
      createSubmission(problemId, { code, language }, submitIdempotencyKeyRef.current),
    retry: 0,
    onMutate: () => {
      submitIdempotencyKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
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
    onSettled: () => {
      submitIdempotencyKeyRef.current = null;
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

  // Hydrate code from localStorage (or fall back to starter) when language/problem changes.
  useEffect(() => {
    if (!problemId) return;
    const starterKey = language === "golang" ? "go" : language;
    const fallback = starterCode[starterKey] || starterCode.cpp;
    try {
      const saved = localStorage.getItem(editorStorageKey);
      if (saved != null && saved !== "") {
        setCode(saved);
      } else {
        setCode(fallback);
      }
    } catch {
      setCode(fallback);
    } finally {
      didHydrateEditorStateRef.current = true;
    }
  }, [problemId, language, editorStorageKey, starterCode]);

  // Persist code changes (debounced).
  useEffect(() => {
    if (!problemId) return;
    if (!didHydrateEditorStateRef.current) return;
    try {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(editorStorageKey, String(code || ""));
        } catch {
          // ignore
        }
      }, 300);
    } catch {
      // ignore
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [problemId, code, editorStorageKey]);

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
    const key = language === "golang" ? "go" : language;
    const next = starterCode[key] || starterCode.cpp;
    setCode(next);
    try {
      if (problemId) localStorage.setItem(editorStorageKey, next);
    } catch {
      // ignore
    }
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
  const renderActiveTabContent = () => {
    return (
      <ProblemTabContent
        activeTab={activeTab}
        problem={problem}
        problemId={problemId}
        embedUrl={embedUrl}
        submissions={submissions}
        refetchSubmissions={refetchSubmissions}
        hints={hints}
        hintsLoading={hintsLoading}
        hintsError={hintsError}
        revealedHintIndex={revealedHintIndex}
        setRevealedHintIndex={setRevealedHintIndex}
        fetchHints={fetchHints}
      />
    );
  };

  return (
    <div ref={rootRef} className="flex w-full flex-col xl:flex-row overflow-y-auto xl:overflow-hidden bg-gradient-to-br from-[#0b0f13] via-[#10151c] to-[#1a2230] text-gray-200" style={{ height: "calc(100dvh - 56px)" }}>
      {/* LEFT PANEL — problem description */}
      <div
        className={`hidden xl:flex flex-col border-r border-[#1b2330] shadow-lg bg-[#10151c]/80 shrink-0 overflow-hidden ${isEditorFullscreen ? "xl:hidden" : ""}`}
        style={{ width: `${leftWidthPct}%` }}
      >
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
            {renderActiveTabContent()}
          </div>
        </div>
      </div>

      {/* HORIZONTAL RESIZE HANDLE */}
      {!isEditorFullscreen && (
        <div
          onMouseDown={onHorizontalDragStart}
          onTouchStart={onHorizontalDragStart}
          className="hidden xl:flex items-center justify-center w-1.5 cursor-col-resize shrink-0 bg-[#1b2330] hover:bg-[#2a4a73] transition-colors group z-10"
          title="Drag to resize panels"
        >
          <div className="w-0.5 h-8 rounded-full bg-[#2a3750] group-hover:bg-[#4a7ab5] transition-colors" />
        </div>
      )}

      {/* RIGHT PANEL — editor + console */}
      <div ref={rightColRef} className={`relative flex-1 flex flex-col min-h-0 overflow-hidden ${isEditorFullscreen ? "xl:w-full" : ""}`}>
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Language</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs px-2 py-1 rounded bg-[#182432] border border-[#233046] text-gray-200 focus:outline-none"
              >
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="go">Go</option>
              </select>
            </div>
            <button
              onClick={() => setIsEditorFullscreen((v) => !v)}
              className="text-xs px-3 py-1.5 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750]"
              title={isEditorFullscreen ? "Exit fullscreen" : "Fullscreen editor"}
            >
              {isEditorFullscreen ? "⊠ Exit Full" : "⛶ Fullscreen"}
            </button>
            <button
              onClick={resetCode}
              className="text-xs px-3 py-1.5 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750]"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="xl:hidden border-b border-[#1b2330] bg-[#0f141b]">
          <div className="flex gap-2 overflow-x-auto px-3 pt-2 [scrollbar-width:none]">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`shrink-0 px-3 py-2 text-xs rounded-t font-medium transition-colors ${activeTab === t
                  ? "bg-[#121923] border-x border-t border-[#233046] text-blue-300"
                  : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="border-t border-[#233046] bg-[#0f141b] p-4">
            {renderActiveTabContent()}
          </div>
        </div>

        <div
          className="xl:shrink-0 bg-[#0b0f13] h-[46vh] min-h-[280px] xl:h-auto"
          style={{ flex: `0 0 ${editorHeightPct}%` }}
        >
          <Editor
            height="100%"
            language={monacoLanguage}
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

        {/* VERTICAL RESIZE HANDLE */}
        <div
          onMouseDown={onVerticalDragStart}
          onTouchStart={onVerticalDragStart}
          className="hidden xl:flex items-center justify-center h-1.5 cursor-row-resize shrink-0 bg-[#1b2330] hover:bg-[#2a4a73] transition-colors group z-10"
          title="Drag to resize editor / console"
        >
          <div className="h-0.5 w-8 rounded-full bg-[#2a3750] group-hover:bg-[#4a7ab5] transition-colors" />
        </div>

        <ExecutionConsole
          consoleRef={consoleRef}
          executionPanel={executionPanel}
          testcaseTab={testcaseTab}
          setTestcaseTab={setTestcaseTab}
          onClear={() => {
            setExecutionPanel(null);
            setTestcaseTab(0);
          }}
        />

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