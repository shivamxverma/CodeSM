import React, { useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';

const selectClass =
    'rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500';

export function CodingAnswerPanel({
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
    interviewId,
    currentQuestionIndex,
    editorRef,
}) {
    const monacoLang = useMemo(
        () => codeLanguages.find((l) => l.id === codingLanguage)?.monacoLanguage || 'python',
        [codeLanguages, codingLanguage]
    );

    const storageKey =
        interviewId != null && currentQuestionIndex != null
            ? `interviewCode:${interviewId}:${currentQuestionIndex}`
            : null;

    useEffect(() => {
        if (!storageKey) return undefined;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved != null && saved !== '') {
                setUserAnswer(saved);
            }
        } catch {
            /* ignore */
        }
        return undefined;
    }, [storageKey, setUserAnswer]);

    useEffect(() => {
        if (!storageKey) return undefined;
        const t = window.setTimeout(() => {
            try {
                localStorage.setItem(storageKey, userAnswer);
            } catch {
                /* ignore */
            }
        }, 500);
        return () => window.clearTimeout(t);
    }, [userAnswer, storageKey]);

    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Your solution
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {roundLabel === 'technical'
                            ? 'Write working code or a clear solution for this DSA-style problem.'
                            : 'Model classes, interfaces, and structure in code — focus on clarity and APIs.'}
                    </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="interview-code-lang">
                        Language
                    </label>
                    <select
                        id="interview-code-lang"
                        className={selectClass}
                        value={codingLanguage}
                        onChange={(e) => setCodingLanguage(e.target.value)}
                    >
                        {codeLanguages.map((lang) => (
                            <option key={lang.id} value={lang.id}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden min-h-[280px] h-[min(50vh,420px)]">
                <Editor
                    height="100%"
                    language={monacoLang}
                    theme="vs-dark"
                    value={userAnswer}
                    onChange={(v) => setUserAnswer(v ?? '')}
                    onMount={(editor) => {
                        if (editorRef) {
                            editorRef.current = editor;
                        }
                    }}
                    loading={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading editor…</div>}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        tabSize: 4,
                        automaticLayout: true,
                    }}
                />
            </div>

            <button
                type="button"
                onClick={onSubmitAnswer}
                disabled={!canSubmit}
                className={`w-full rounded-xl py-3 px-4 font-semibold text-white transition-colors ${
                    !canSubmit
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
            >
                {isLastQuestion ? 'Submit & finish' : 'Submit & next'}
            </button>
            {startError && <p className="text-sm text-destructive">{startError}</p>}
            <p className="text-xs text-muted-foreground">
                Submit when your code or pseudocode reflects your answer. Feedback uses your selected language and round
                type.
            </p>
        </section>
    );
}
