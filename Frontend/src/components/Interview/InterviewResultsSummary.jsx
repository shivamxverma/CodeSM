import React from 'react';

export function InterviewResultsSummary({ questionResults, onStartAnother }) {
    const anyLoading = questionResults.some((r) => r.loading);
    const scoredResults = questionResults.filter((r) => !r.loading && r.score != null);
    const averageScore =
        !anyLoading && scoredResults.length > 0
            ? (scoredResults.reduce((acc, r) => acc + Number(r.score), 0) / scoredResults.length).toFixed(1)
            : null;

    return (
        <div className="bg-background text-foreground min-h-screen p-6 md:p-10">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Interview complete</h1>
                    <p className="text-muted-foreground">
                        {anyLoading
                            ? 'Scores are still loading for some answers…'
                            : 'Here is how you did on each question.'}
                    </p>
                </div>
                {averageScore != null && !anyLoading && (
                    <div className="rounded-2xl border border-border bg-card/80 p-6 text-center shadow-sm">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Overall average
                        </p>
                        <p className="text-5xl font-bold text-primary mt-1">{averageScore}</p>
                        <p className="text-sm text-muted-foreground mt-1">out of 10</p>
                    </div>
                )}
                <ol className="space-y-4">
                    {questionResults.map((r) => (
                        <li key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Question {r.questionIndex + 1}
                                </span>
                                {r.loading ? (
                                    <span className="text-sm text-muted-foreground animate-pulse">Scoring…</span>
                                ) : r.score != null ? (
                                    <span className="text-lg font-bold tabular-nums text-emerald-500">{r.score}/10</span>
                                ) : (
                                    <span className="text-sm text-amber-500">No score</span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{r.questionText}</p>
                            <p className="text-sm border-l-2 border-primary/40 pl-3 py-1 mb-3 bg-muted/30 rounded-r whitespace-pre-wrap leading-relaxed">
                                {r.answer}
                            </p>
                            {!r.loading && r.analysis && (
                                <p className="text-sm text-foreground/90 leading-relaxed">{r.analysis}</p>
                            )}
                        </li>
                    ))}
                </ol>
                <div className="flex justify-center pt-4">
                    <button
                        type="button"
                        onClick={onStartAnother}
                        className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg hover:opacity-95 transition-opacity"
                    >
                        Start another interview
                    </button>
                </div>
            </div>
        </div>
    );
}
