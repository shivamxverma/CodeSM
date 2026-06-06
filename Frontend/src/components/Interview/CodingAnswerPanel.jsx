import React, { useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';

const selectClass =
    'rounded-md border border-hairline bg-canvas px-3 py-1.5 text-sm text-ink outline-none transition-colors hover:bg-canvas-soft-2 focus:border-ring focus:ring-2 focus:ring-ring/20 cursor-pointer';

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
        <section className="rounded-2xl border border-hairline bg-canvas p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-mute mb-1">
                        Your solution
                    </h2>
                    <p className="text-sm text-body">
                        {roundLabel === 'technical'
                            ? 'Write working code or a clear solution for this DSA-style problem.'
                            : 'Model classes, interfaces, and structure in code — focus on clarity and APIs.'}
                    </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-mute" htmlFor="interview-code-lang">
                        Language
                    </label>
                    <select
                        id="interview-code-lang"
                        className={selectClass}
                        value={codingLanguage}
                        onChange={(e) => setCodingLanguage(e.target.value)}
                    >
                        {codeLanguages.map((lang) => (
                            <option key={lang.id} value={lang.id} className="bg-canvas text-ink">
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-md border border-hairline overflow-hidden min-h-[280px] h-[min(50vh,420px)] shadow-sm">
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
                    loading={<div className="flex h-full items-center justify-center text-sm text-mute bg-[#1e1e1e]">Loading editor…</div>}
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
                className={`w-full py-3 px-4 font-bold text-sm rounded-md transition-all duration-200 cursor-pointer text-center flex items-center justify-center ${
                    !canSubmit
                        ? 'bg-canvas text-mute border border-hairline cursor-not-allowed'
                        : 'bg-emerald-600 border border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 active:scale-[0.98]'
                }`}
            >
                {isLastQuestion ? 'Submit & finish' : 'Submit & next'}
            </button>
            {startError && (
                <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-600 dark:text-red-400">
                    <span>⚠️</span>
                    <span>{startError}</span>
                </div>
            )}
            <p className="text-xs text-mute leading-relaxed">
                Submit when your code or pseudocode reflects your answer. Feedback uses your selected language and round
                type.
            </p>
        </section>
    );
}
