import React, { useCallback, useEffect, useRef, useState } from 'react';
import { InterviewProgressBar } from './InterviewProgressBar';
import { TechnicalProblemPanel } from './TechnicalProblemPanel';
import { CodingAnswerPanel } from './CodingAnswerPanel';
import { FloatingInterviewVideo } from './FloatingInterviewVideo';

function formatElapsed(total) {
    const s = Math.max(0, total);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function TechnicalInterviewLayout({
    currentQuestionIndex,
    questionsLength,
    progressPct,
    interviewElapsedSeconds,
    candidateLabel,
    interviewLevel,
    questionTitle,
    questionText,
    isSpeaking,
    onEndInterview,
    mediaStream,
    interviewId,
    codeLanguages,
    codingLanguage,
    setCodingLanguage,
    userAnswer,
    setUserAnswer,
    canSubmit,
    isLastQuestion,
    startError,
    roundLabel,
    onSubmitAnswer,
}) {
    const editorRef = useRef(null);
    const [runNotice, setRunNotice] = useState(false);
    const [sessionRecording, setSessionRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const recordChunksRef = useRef([]);

    const triggerRun = useCallback(() => {
        setRunNotice(true);
        window.setTimeout(() => setRunNotice(false), 4500);
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            const mod = e.ctrlKey || e.metaKey;
            if (mod && e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                if (canSubmit) onSubmitAnswer();
                return;
            }
            if (mod && e.key === 'Enter') {
                e.preventDefault();
                triggerRun();
                return;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [canSubmit, onSubmitAnswer, triggerRun]);

    const pickRecorderMime = () => {
        if (typeof MediaRecorder === 'undefined') return '';
        if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9,opus')) return 'video/webm; codecs=vp9,opus';
        if (MediaRecorder.isTypeSupported('video/webm')) return 'video/webm';
        return '';
    };

    const toggleSessionRecording = useCallback(() => {
        if (!mediaStream) return;
        if (sessionRecording) {
            try {
                mediaRecorderRef.current?.stop();
            } catch {
                /* ignore */
            }
            mediaRecorderRef.current = null;
            recordChunksRef.current = [];
            setSessionRecording(false);
            return;
        }
        const mime = pickRecorderMime();
        if (!mime) return;
        try {
            recordChunksRef.current = [];
            const rec = new MediaRecorder(mediaStream, { mimeType: mime });
            rec.ondataavailable = (ev) => {
                if (ev.data?.size) recordChunksRef.current.push(ev.data);
            };
            rec.start(1000);
            mediaRecorderRef.current = rec;
            setSessionRecording(true);
        } catch {
            /* ignore */
        }
    }, [mediaStream, sessionRecording]);

    useEffect(() => {
        return () => {
            try {
                mediaRecorderRef.current?.stop();
            } catch {
                /* ignore */
            }
            mediaRecorderRef.current = null;
        };
    }, []);

    const canRecordSession = Boolean(mediaStream && pickRecorderMime());

    return (
        <div className="min-h-screen bg-canvas-soft text-ink flex flex-col pb-44 font-sans">
            <header
                className="sticky top-0 z-40 border-b border-hairline bg-canvas/95 backdrop-blur-md"
                style={{ borderRadius: 0 }}
            >
                <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 min-w-0">
                        <div className="flex items-center gap-2.5 rounded-md border border-hairline bg-canvas px-3 py-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-mute">
                                Time
                            </span>
                            <span className="text-lg font-bold text-ink tabular-nums">{formatElapsed(interviewElapsedSeconds)}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-mute">Candidate</p>
                            <p className="text-sm font-semibold text-ink truncate max-w-[200px] sm:max-w-xs">{candidateLabel}</p>
                            <p className="text-[11px] text-mute mt-0.5">
                                Question {currentQuestionIndex + 1} of {questionsLength}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                Live
                            </span>
                            {sessionRecording && (
                                <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                                    REC
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {canRecordSession && (
                            <button
                                type="button"
                                onClick={toggleSessionRecording}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                                    sessionRecording
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'border border-hairline bg-canvas text-ink hover:bg-canvas-soft-2'
                                }`}
                            >
                                {sessionRecording ? 'Stop recording' : 'Record session'}
                            </button>
                        )}
                        <button
                            type="button"
                            className="rounded-md border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-1.5 text-sm font-medium hover:bg-red-500/20 transition-colors duration-200 cursor-pointer"
                            onClick={onEndInterview}
                        >
                            End interview
                        </button>
                    </div>
                </div>
                <div className="max-w-[1600px] mx-auto px-4 pb-2.5 w-full">
                    <InterviewProgressBar progressPct={progressPct} />
                    <p className="text-[11px] text-mute mt-1.5">
                        Shortcuts: <kbd className="px-1.5 py-0.5 rounded border border-hairline bg-canvas-soft-2 font-mono text-[10px]">Ctrl/⌘</kbd>+<kbd className="px-1.5 py-0.5 rounded border border-hairline bg-canvas-soft-2 font-mono text-[10px]">Enter</kbd> run
                        hint · <kbd className="px-1.5 py-0.5 rounded border border-hairline bg-canvas-soft-2 font-mono text-[10px]">Ctrl/⌘</kbd>+<kbd className="px-1.5 py-0.5 rounded border border-hairline bg-canvas-soft-2 font-mono text-[10px]">⇧</kbd>+
                        <kbd className="px-1.5 py-0.5 rounded border border-hairline bg-canvas-soft-2 font-mono text-[10px]">Enter</kbd> submit
                    </p>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 grid lg:grid-cols-2 gap-6 min-h-0 items-stretch bg-canvas-soft">
                <TechnicalProblemPanel
                    questionTitle={questionTitle}
                    questionText={questionText}
                    interviewLevel={interviewLevel}
                    isSpeaking={isSpeaking}
                />
                <div className="flex flex-col min-h-[480px]">
                    {runNotice && (
                        <div className="mb-3 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                            Practice mode: there is no automated judge. Refine your solution in the editor, then use{' '}
                            <strong>Submit</strong> (or <kbd className="px-1 rounded bg-canvas-soft-2 border border-hairline">Ctrl+Shift+Enter</kbd>
                            ).
                        </div>
                    )}
                    <CodingAnswerPanel
                        codeLanguages={codeLanguages}
                        codingLanguage={codingLanguage}
                        setCodingLanguage={setCodingLanguage}
                        userAnswer={userAnswer}
                        setUserAnswer={setUserAnswer}
                        canSubmit={canSubmit}
                        isLastQuestion={isLastQuestion}
                        startError={startError}
                        roundLabel={roundLabel}
                        onSubmitAnswer={onSubmitAnswer}
                        interviewId={interviewId}
                        currentQuestionIndex={currentQuestionIndex}
                        editorRef={editorRef}
                    />
                </div>
            </main>

            <FloatingInterviewVideo stream={mediaStream} />
        </div>
    );
}
