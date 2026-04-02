import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const LEVEL_BADGE = {
    easy: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    hard: 'bg-red-500/20 text-red-600 dark:text-red-400',
    mixed: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
};

export function TechnicalProblemPanel({
    questionTitle,
    questionText,
    interviewLevel,
    isSpeaking,
    speechSupported,
    speechStatus,
    onSpeak,
    onSpeechTogglePause,
    onSpeechStop,
}) {
    const plainForSpeech = [questionTitle, questionText].filter(Boolean).join('. ');

    useEffect(() => {
        return () => {
            onSpeechStop();
        };
    }, [questionText, onSpeechStop]);

    const levelClass = LEVEL_BADGE[interviewLevel] || LEVEL_BADGE.medium;

    return (
        <section
            className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm min-h-0 max-h-[calc(100vh-8rem)] lg:max-h-[calc(100vh-6rem)]"
            style={{ borderRadius: 12 }}
        >
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                            isSpeaking
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        }`}
                    >
                        {isSpeaking ? 'Interviewer speaking' : 'Your turn'}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${levelClass}`}>
                        {interviewLevel}
                    </span>
                </div>
                {speechSupported ? (
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => onSpeak(plainForSpeech)}
                            className="rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-primary/25"
                        >
                            {speechStatus === 'playing' ? 'Replay' : 'Read aloud'}
                        </button>
                        {(speechStatus === 'playing' || speechStatus === 'paused') && (
                            <>
                                <button
                                    type="button"
                                    onClick={onSpeechTogglePause}
                                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted/50"
                                >
                                    {speechStatus === 'paused' ? 'Resume' : 'Pause'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onSpeechStop}
                                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted/50"
                                >
                                    Stop
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <span className="text-[11px] text-muted-foreground">Speech not supported</span>
                )}
            </div>

            <div className="aspect-video max-h-[200px] shrink-0 bg-black/90 flex items-center justify-center border-b border-border">
                {isSpeaking ? (
                    <video src="/video.mp4" autoPlay muted loop className="h-full w-full object-cover" />
                ) : (
                    <p className="text-muted-foreground text-sm px-4 text-center">
                        Listen to the question audio, or use <span className="text-foreground">Read aloud</span>.
                    </p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {questionTitle && (
                    <h2 className="text-lg font-semibold text-foreground mb-3 leading-snug">{questionTitle}</h2>
                )}
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 [&_pre]:bg-muted [&_pre]:rounded-lg [&_code]:text-sm">
                    <ReactMarkdown>{questionText || '_Loading…_'}</ReactMarkdown>
                </div>
            </div>
        </section>
    );
}
