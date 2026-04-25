import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
  getSubmissionsForProblem,
  getProblemHints,
  createSubmission,
  getSubmissionStatus,
  getSubmissionResult,
} from "@/api/api";

export default function ProblemPage() {
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
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

  const queryClient = useQueryClient();
    
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

      } catch (error) {
        setProblem(null);
      }
    }
    fetchProblem();
  }, [problemId]);

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

  const pollQuery = useQuery({
    queryKey: ["submissionPoll", activeSubmissionId],
    queryFn: () => getSubmissionStatus(activeSubmissionId).then((r) => r.data.data),
    enabled: !!activeSubmissionId,
    refetchInterval: (q) => {
      const st = q.state.data?.status;
      if (st === "COMPLETED" || st === "FAILED" || st === "ERROR") return false;
      return 2000;
    },
    retry: (failureCount, err) =>
      failureCount < 10 && (err?.response?.status === 404 || err?.response?.status === 400),
    retryDelay: (i) => Math.min(1500 * (i + 1), 8000),
  });

  const { data: submissions = [], refetch: refetchSubmissions } = useQuery({
    queryKey: ["problem-submissions", problemId],
    queryFn: () => getSubmissionsForProblem(problemId).then((r) => r.data.message || []),
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
    const { verdict, stdout, stderr, totalTestcases, passedTestcases, timeTaken, memoryTaken } = payload;
    if (verdict === "COMPILE_ERROR") {
      showCompileErrors([{ message: stderr || "Compilation failed" }]);
      return;
    }

    setTestcaseTab(0);
    setExecutionPanel({ type: "submit_results", details: payload });
    
    const v = (verdict || "").toLowerCase();
    if (v === "accepted" || v === "correct answer") setStatusBadge({ type: "success", text: "Accepted" });
    else if (v.includes("time limit") || v.includes("tle")) setStatusBadge({ type: "warn", text: "Time Limit Exceeded" });
    else if (v.includes("memory limit") || v.includes("mle")) setStatusBadge({ type: "error", text: "Memory Limit Exceeded" });
    else if (v.includes("wrong answer") || v === "wa") setStatusBadge({ type: "error", text: "Wrong Answer" });
    else if (v === "runtime_error" || v === "re") setStatusBadge({ type: "error", text: "Runtime Error" });
    else setStatusBadge({ type: "error", text: verdict || "Failed" });
  }, [showCompileErrors]);

  const runMutation = useMutation({
    mutationFn: () => runCode(problemId, { code, language }),
    onMutate: () => {
      setIsRunning(true);
      setStatusBadge(null);
      setExecutionPanel({ type: "loading", message: "Running..." });
      clearMarkers();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Execution failed";
      setExecutionPanel({ type: "error", message: msg });
      setStatusBadge({ type: "error", text: "Error" });
      setIsRunning(false);
      if (id) setActiveSubmissionId(id);
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
      setExecutionPanel({ type: "loading", message: "Submitting..." });
      clearMarkers();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Submission failed";
      setExecutionPanel({ type: "error", message: msg });
      setStatusBadge({ type: "error", text: "Error" });
      setIsSubmitting(false);

    },
    onSuccess: (res) => {
      const id = res.data.data?.submissionId;
      if (id) setActiveSubmissionId(id);
      else setIsSubmitting(false);
    },
    onSettled: () => {
      submitIdempotencyKeyRef.current = null;
    },
  });

  useEffect(() => {
    if (!activeSubmissionId || !pollQuery.data) return;
    const { status } = pollQuery.data;

    if (status === "FAILED" || status === "ERROR") {
      setStatusBadge({ type: "error", text: "Execution Failed" });
      setExecutionPanel({ type: "error", message: "Job failed." });
      setActiveSubmissionId(null);
      setIsRunning(false);
      setIsSubmitting(false);
      return;
    }

    if (status === "COMPLETED") {
      getSubmissionResult(activeSubmissionId)
        .then(r => {
           const payload = r.data.data;
           processExecutionResult(payload);
           queryClient.invalidateQueries({ queryKey: ["problem-submissions", problemId] });
        })
        .catch(err => {
           setStatusBadge({ type: "error", text: "Result Fetch Failed" });
           setExecutionPanel({ type: "error", message: "Failed to get final result." });
        })
        .finally(() => {
           setActiveSubmissionId(null);
           setIsRunning(false);
           setIsSubmitting(false);
        });
    }
  }, [activeSubmissionId, pollQuery.data, problemId, queryClient, processExecutionResult]);

  useEffect(() => {
    if (!activeSubmissionId || !pollQuery.isError) return;
    setStatusBadge({ type: "error", text: "Execution Failed" });
    setExecutionPanel({ type: "error", message: "Failed to get submission job status." });
    setActiveSubmissionId(null);
    setIsRunning(false);
    setIsSubmitting(false);

  }, [activeSubmissionId, pollQuery.isError, problemId]);

  // Persist code changes (debounced).
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