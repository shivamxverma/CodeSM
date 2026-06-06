import React from 'react';

export function InterviewResultsSummary({ questionResults, onStartAnother }) {
    const anyLoading = questionResults.some((r) => r.loading);
    const scoredResults = questionResults.filter((r) => !r.loading && r.score != null);
    const averageScore =
        !anyLoading && scoredResults.length > 0
            ? (scoredResults.reduce((acc, r) => acc + Number(r.score), 0) / scoredResults.length).toFixed(1)
            : null;

    return (
        <div className="bg-canvas-soft text-ink min-h-screen p-6 md:p-10 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-ink">Interview complete.</h1>
                    <p className="text-sm text-mute">
                        {anyLoading
                            ? 'Scores are still loading for some answers…'
                            : 'Here is how you did on each question.'}
                    </p>
                </div>
                {averageScore != null && !anyLoading && (
                    <div className="rounded-xl border border-hairline bg-canvas p-6 text-center shadow-sm max-w-xs mx-auto relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/20 to-transparent opacity-50" />
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-mute">
                            Overall average
                        </p>
                        <p className="text-5xl font-extrabold text-ink tracking-tight mt-1">{averageScore}</p>
                        <p className="text-xs text-mute mt-1">out of 10</p>
                    </div>
                )}
                <ol className="space-y-4">
                    {questionResults.map((r) => (
                        <li key={r.id} className="rounded-xl border border-hairline bg-canvas p-5 sm:p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-mute">
                                    Question {r.questionIndex + 1}
                                </span>
                                {r.loading ? (
                                    <span className="text-xs text-mute animate-pulse">Scoring…</span>
                                ) : r.score != null ? (
                                    <span className="text-xs font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full tabular-nums">
                                        Score: {r.score}/10
                                    </span>
                                ) : (
                                    <span className="text-xs font-semibold border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                        No score
                                    </span>
                                )}
                            </div>
                            <p className="text-[13px] text-mute mb-3 font-medium">{r.questionText}</p>
                            <div className="text-xs border-l-2 border-ring/40 pl-3.5 py-2 mb-3 bg-canvas-soft-2 text-body rounded-r-md whitespace-pre-wrap leading-relaxed font-mono">
                                {r.answer}
                            </div>
                            {!r.loading && r.analysis && (
                                <p className="text-sm text-body leading-relaxed">{r.analysis}</p>
                            )}
                        </li>
                    ))}
                </ol>
                <div className="flex justify-center pt-4">
                    <button
                        type="button"
                        onClick={onStartAnother}
                        className="btn-primary px-8 py-3 h-11 text-sm font-bold shadow-md cursor-pointer"
                    >
                        Start another interview
                    </button>
                </div>
            </div>
        </div>
    );
}
