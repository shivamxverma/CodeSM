import React from 'react';

export function InterviewerQuestionPanel({ isSpeaking, questionText }) {
    return (
        <section className="rounded-2xl border border-hairline bg-canvas overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-hairline bg-canvas-soft flex items-center justify-between gap-2">
                <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                        isSpeaking
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}
                >
                    {isSpeaking ? 'Interviewer speaking' : 'Your turn to answer'}
                </span>
            </div>
            <div className="bg-black/95 aspect-video flex items-center justify-center border-b border-hairline">
                {isSpeaking ? (
                    <video src="/video.mp4" autoPlay muted loop className="w-full h-full object-cover" />
                ) : (
                    <span className="text-mute text-xs px-4 text-center">
                        Interviewer idle — use the mic when you are ready
                    </span>
                )}
            </div>
            <div className="p-4 sm:p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-mute mb-2">
                    Question
                </h2>
                <p className="text-sm md:text-base leading-relaxed text-ink">{questionText || 'Loading…'}</p>
            </div>
        </section>
    );
}
