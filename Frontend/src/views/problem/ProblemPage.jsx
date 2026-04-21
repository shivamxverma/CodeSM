import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePostHog } from "@posthog/react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/AuthContext";
import { useExecutionStore } from "@/stores/executionStore";

// Modular Components
import ProblemHeader from "@/components/runproblem/ProblemHeader";
import ProblemDescriptionPanel from "@/components/runproblem/ProblemDescriptionPanel";
import EditorPanel from "@/components/runproblem/EditorPanel";
import ExecutionConsole from "@/components/runproblem/ExecutionConsole";
import Resizer from "@/components/runproblem/Resizer";
import ActionButtons from "@/components/runproblem/ActionButtons";

import {
  getDifficultyFromRating,
  getYouTubeEmbed,
  monacoLanguageFrom,
  starterCodeByLanguage,
} from "@/components/runproblem/utils";

import {
  getProblem,
  runCode,
  getSubmissions,
  getProblemHints,
  createSubmission,
  getSubmitJobResult,
  getRunJobResult,
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
  const handledRunStoredRef = useRef(null);
  const handledSubmitStoredRef = useRef(null);
  const submitIdempotencyKeyRef = useRef(null);

  // Resizable panel state
  const [editorHeightPct, setEditorHeightPct] = useState(60); 
  const [leftWidthPct, setLeftWidthPct] = useState(40);       
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const isDraggingVertical = useRef(false);
  const isDraggingHorizontal = useRef(false);
  const rightColRef = useRef(null);
  const rootRef = useRef(null);

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

  const editorStorageKey = useMemo(() => `codesm:editor:${problemId || "unknown"}:${language}`, [problemId, language]);
  const languageStorageKey = useMemo(() => `codesm:editor:language:${problemId || "unknown"}`, [problemId]);

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

  useEffect(() => {
    if (!problemId) return;
    try {
      const savedLang = localStorage.getItem(languageStorageKey);
      if (savedLang) setLanguage(savedLang);
    } catch {}
    didRestoreLanguageRef.current = true;
  }, [problemId, languageStorageKey]);

  useEffect(() => {
    if (!problemId || !didRestoreLanguageRef.current) return;
    try {
      localStorage.setItem(languageStorageKey, String(language));
    } catch {}
  }, [problemId, language, languageStorageKey]);

  const runStoredQuery = useQuery({
    queryKey: ["run-job-result", runJobId],
    queryFn: () => getRunJobResult(runJobId).then((r) => r.data),
    enabled: !!runJobId,
    refetchInterval: (q) => {
      const status = q.state.data?.data?.result?.status;
      const term = ["correct answer", "tle", "wrong answer", "mle", "compile_error", "accepted", "rejected", "builderror", "testcase_fetch_error", "no_sample_testcases"];
      return term.includes(status) ? false : 1000;
    },
  });

  const submitStoredQuery = useQuery({
    queryKey: ["submit-job-result", submitMeta?.submissionId],
    queryFn: () => getSubmitJobResult(submitMeta.jobId, submitMeta.submissionId).then((r) => r.data),
    enabled: !!submitMeta?.submissionId,
    refetchInterval: (q) => {
      const status = q.state.data?.data?.result?.status;
      const term = ["correct answer", "tle", "wrong answer", "mle", "compile_error", "accepted", "rejected", "builderror", "testcase_fetch_error"];
      return term.includes(status) ? false : 1000;
    },
  });

  const { data: submissions = [], refetch: refetchSubmissions } = useQuery({
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
    setExecutionPanel({ type: "compile", errors: errors?.length ? errors : [{ message: "Compilation failed" }] });
  }, []);

  const processExecutionResult = useCallback((payload) => {
    if (!payload) {
      setStatusBadge({ type: "error", text: "No result" });
      setExecutionPanel({ type: "error", message: "No result was returned from the server." });
      return;
    }
    const { status, execution = [], errors = [], stderr, stdout } = payload;
    if (status === "compile_error") {
      showCompileErrors(errors || [{ message: stderr || "Compilation failed" }]);
      return;
    }
    const valid = ["accepted", "rejected", "correct answer", "wrong answer", "tle", "mle"];
    if (status && !valid.includes(status)) {
      setExecutionPanel({ type: "error", message: payload.error || payload.raw || String(status) });
      setStatusBadge({ type: "error", text: "Error" });
      return;
    }
    setTestcaseTab(0);
    setExecutionPanel({ type: "tests", items: execution, stdout: String(stdout || ""), stderr: String(stderr || "") });
    const allPassed = execution.length > 0 && execution.every((t) => !!t?.isPassed);
    const hasTLE = execution.some((t) => t?.isTLE || /exited|timeout/i.test(String(t?.output ?? t?.actual ?? t?.error ?? "")));
    if (hasTLE) setStatusBadge({ type: "warn", text: "Time Limit Exceeded" });
    else if (allPassed) setStatusBadge({ type: "success", text: "Accepted" });
    else if (execution.length === 0) setStatusBadge(null);
    else setStatusBadge({ type: "error", text: "Wrong Answer" });
  }, [showCompileErrors]);

  const runMutation = useMutation({
    mutationFn: () => runCode(problemId, { code, language }),
    onMutate: () => {
      setIsRunning(true);
      setStatusBadge(null);
      setExecutionPanel({ type: "loading", message: "Running on sample testcases…" });
      clearMarkers();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Execution failed";
      setExecutionPanel({ type: "error", message: msg });
      setStatusBadge({ type: "error", text: "Error" });
      setIsRunning(false);
    },
    onSuccess: (res) => {
      const id = res.data.message?.id;
      if (id) setRunJobId(id);
      else setIsRunning(false);
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => createSubmission(problemId, { code, language }, submitIdempotencyKeyRef.current),
    onMutate: () => {
      submitIdempotencyKeyRef.current = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      setIsSubmitting(true);
      setStatusBadge(null);
      setExecutionPanel({ type: "loading", message: "Submitting — judging hidden testcases…" });
      clearMarkers();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Submission failed";
      setExecutionPanel({ type: "error", message: msg });
      setStatusBadge({ type: "error", text: "Error" });
      setIsSubmitting(false);
    },
    onSuccess: (res) => {
      const { id, submissionId } = res.data.message || {};
      if (id && submissionId) setSubmitMeta({ jobId: id, submissionId });
      else setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (!runJobId || !runStoredQuery.isSuccess || !runStoredQuery.data) return;
    const doc = runStoredQuery.data?.data?.result;
    if (!doc) return;
    const term = ["correct answer", "tle", "wrong answer", "mle", "compile_error", "accepted", "rejected", "builderror", "testcase_fetch_error", "no_sample_testcases"];
    if (term.includes(doc.status)) {
      if (handledRunStoredRef.current === `run-${runJobId}`) return;
      handledRunStoredRef.current = `run-${runJobId}`;
      let exc = Array.isArray(doc.result) ? doc.result : [];
      if (!exc.length && doc.output) try { exc = JSON.parse(doc.output); } catch {}
      const res = { status: doc.status, execution: exc, errors: doc.errors || [], raw: doc.raw || "", error: doc.error || "" };
      setRunResult(problemId, res);
      processExecutionResult(res);
      setRunJobId(null);
      setIsRunning(false);
    } else setExecutionPanel({ type: "loading", message: `Running — ${doc.status}...` });
  }, [runJobId, runStoredQuery.data, problemId, setRunResult, processExecutionResult]);

  useEffect(() => {
    if (!submitMeta || !submitStoredQuery.isSuccess || !submitStoredQuery.data) return;
    const doc = submitStoredQuery.data?.data?.result;
    if (!doc) return;
    const term = ["correct answer", "tle", "wrong answer", "mle", "compile_error", "accepted", "rejected", "builderror", "testcase_fetch_error"];
    if (term.includes(doc.status)) {
      if (handledSubmitStoredRef.current === `sub-${submitMeta.submissionId}`) return;
      handledSubmitStoredRef.current = `sub-${submitMeta.submissionId}`;
      let exc = Array.isArray(doc.result) ? doc.result : [];
      if (!exc.length && doc.output) try { exc = JSON.parse(doc.output); } catch {}
      const res = { status: doc.status, execution: exc, errors: doc.errors || [], raw: doc.raw || "", error: doc.error || "" };
      setSubmitResult(problemId, { source: "db", document: doc });
      processExecutionResult(res);
      queryClient.invalidateQueries({ queryKey: ["problem-submissions", problemId] });
      setSubmitMeta(null);
      setIsSubmitting(false);
    } else setExecutionPanel({ type: "loading", message: `Submitting — ${doc.status}...` });
  }, [submitMeta, submitStoredQuery.data, problemId, setSubmitResult, processExecutionResult, queryClient]);

  useEffect(() => {
    if (!problemId) return;
    const starterKey = language === "golang" ? "go" : language;
    const fallback = starterCode[starterKey] || starterCode.cpp;
    try {
      const saved = localStorage.getItem(editorStorageKey);
      setCode(saved || fallback);
    } catch { setCode(fallback); }
    finally { didHydrateEditorStateRef.current = true; }
  }, [problemId, language, editorStorageKey, starterCode]);

  useEffect(() => {
    if (!problemId || !didHydrateEditorStateRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(editorStorageKey, String(code || "")); } catch {}
    }, 300);
    return () => clearTimeout(saveTimerRef.current);
  }, [problemId, code, editorStorageKey]);

  function clearMarkers() {
    const model = editorRef.current?.getModel();
    if (model && monacoRef.current) monacoRef.current.editor.setModelMarkers(model, "compile", []);
  }

  const resetCode = () => {
    const key = language === "golang" ? "go" : language;
    const next = starterCode[key] || starterCode.cpp;
    setCode(next);
    localStorage.setItem(editorStorageKey, next);
    clearMarkers();
    setStatusBadge(null);
    setExecutionPanel(null);
    setTestcaseTab(0);
  };

  async function fetchHints() {
    if (hints.length || hintsLoading) return;
    setHintsLoading(true);
    try {
      const res = await getProblemHints(problemId);
      setHints(res.data.message.hints || []);
      setRevealedHintIndex(0);
    } catch { setHintsError("Failed to load hints."); }
    finally { setHintsLoading(false); }
  }

  useEffect(() => { if (activeTab === "Hints") fetchHints(); }, [activeTab]);

  const { label: diffLabel, style: diffClass } = getDifficultyFromRating(problem?.difficulty);
  const statusClass = useMemo(() => {
    if (statusBadge?.type === "success") return "bg-[#0e2a1d] border-[#1e5d3b] text-green-300";
    if (statusBadge?.type === "warn") return "bg-[#3a2a0e] border-[#6a531e] text-yellow-300";
    if (statusBadge?.type === "error") return "bg-[#2a1313] border-[#5d1e1e] text-red-300";
    return "bg-[#182432] border-[#233046] text-gray-300";
  }, [statusBadge]);

  const embedUrl = getYouTubeEmbed(problem?.editorialLink);

  return (
    <div ref={rootRef} className="flex w-full flex-col xl:flex-row overflow-y-auto xl:overflow-hidden bg-[#0b0f13] text-gray-200 font-sans" style={{ height: "calc(100dvh - 56px)" }}>
      {/* LEFT PANEL */}
      {!isEditorFullscreen && (
        <div className="hidden xl:flex flex-col border-r border-[#1b2330] shadow-2xl bg-[#0d1117] shrink-0 overflow-hidden" style={{ width: `${leftWidthPct}%` }}>
          <ProblemDescriptionPanel
            activeTab={activeTab} setActiveTab={setActiveTab} problem={problem} problemId={problemId} embedUrl={embedUrl}
            submissions={submissions} refetchSubmissions={refetchSubmissions} hints={hints} hintsLoading={hintsLoading}
            hintsError={hintsError} revealedHintIndex={revealedHintIndex} setRevealedHintIndex={setRevealedHintIndex} fetchHints={fetchHints}
          />
        </div>
      )}

      <Resizer direction="horizontal" onMouseDown={onHorizontalDragStart} onTouchStart={onHorizontalDragStart} />

      {/* RIGHT PANEL */}
      <div ref={rightColRef} className="relative flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0d1117]">
        <ProblemHeader
          problem={problem} statusBadge={statusBadge} statusClass={statusClass} diffLabel={diffLabel} diffClass={diffClass}
          language={language} setLanguage={setLanguage} isRunning={isRunning} isSubmitting={isSubmitting}
          isEditorFullscreen={isEditorFullscreen} setIsEditorFullscreen={setIsEditorFullscreen} resetCode={resetCode}
        />

        {/* Mobile Tabs */}
        {!isEditorFullscreen && (
          <div className="xl:hidden bg-[#0f141b] border-b border-[#1b2330] max-h-[40vh] overflow-hidden flex flex-col">
            <ProblemDescriptionPanel
              activeTab={activeTab} setActiveTab={setActiveTab} problem={problem} problemId={problemId} embedUrl={embedUrl}
              submissions={submissions} refetchSubmissions={refetchSubmissions} hints={hints} hintsLoading={hintsLoading}
              hintsError={hintsError} revealedHintIndex={revealedHintIndex} setRevealedHintIndex={setRevealedHintIndex} fetchHints={fetchHints}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0" style={{ flex: `0 0 ${editorHeightPct}%` }}>
          <EditorPanel language={language} monacoLanguage={monacoLanguage} code={code} handleEditorChange={handleEditorChange} onEditorMount={onEditorMount} />
        </div>

        <Resizer direction="vertical" onMouseDown={onVerticalDragStart} onTouchStart={onVerticalDragStart} />

        <ExecutionConsole consoleRef={consoleRef} executionPanel={executionPanel} testcaseTab={testcaseTab} setTestcaseTab={setTestcaseTab} onClear={() => setExecutionPanel(null)} />

        <ActionButtons onRun={() => runMutation.mutate()} onSubmit={() => submitMutation.mutate()} isRunning={isRunning} isSubmitting={isSubmitting} user={auth.user} />
      </div>
    </div>
  );
}