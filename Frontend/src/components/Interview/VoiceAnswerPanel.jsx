import React from 'react';
import { RECORDING_MAX_SECONDS } from './interviewConstants';

function formatMmSs(totalSeconds) {
    const s = Math.max(0, totalSeconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function VoiceAnswerPanel({
    isSpeaking,
    canSubmit,
    isRecording,
    answerSecondsRemaining,
    startError,
    isLastQuestion,
    onToggleRecord,
    onSubmitAnswer,
    description,
}) {
    const showCountdown = isRecording && answerSecondsRemaining != null;
    const startBlockedByInterviewer = !isRecording && isSpeaking;

    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-6">
            <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Your answer
                </h2>
                <p className="text-sm text-muted-foreground">
                    {description ||
                        'Speak your answer — the transcript is captured for scoring but not shown while you record.'}
                </p>
            </div>

            <div
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed min-h-[10rem] px-4 py-6 transition-colors ${
                    showCountdown
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border bg-muted/20'
                }`}
            >
                {showCountdown ? (
                    <>
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                            Time to answer
                        </p>
                        <p className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight text-foreground">
                            {formatMmSs(answerSecondsRemaining)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            {answerSecondsRemaining <= 10 ? 'Wrap up — time almost up' : 'Recording…'}
                        </p>
                    </>
                ) : startBlockedByInterviewer ? (
                    <>
                        <p className="text-lg font-medium text-center text-foreground">Interviewer is speaking</p>
                        <p className="text-sm text-muted-foreground text-center mt-2 max-w-xs">
                            Wait until the question finishes, then you can start recording your answer.
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-lg font-medium text-center text-foreground">Ready when you are</p>
                        <p className="text-sm text-muted-foreground text-center mt-2 max-w-xs">
                            Tap <span className="text-foreground font-medium">Start recording</span>. You will have{' '}
                            {RECORDING_MAX_SECONDS} seconds to answer this question.
                        </p>
                    </>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    type="button"
                    onClick={onToggleRecord}
                    disabled={startBlockedByInterviewer}
                    className={`flex-1 rounded-xl py-3 px-4 font-semibold text-white transition-colors ${
                        isRecording
                            ? 'bg-red-600 hover:bg-red-700'
                            : startBlockedByInterviewer
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isRecording ? 'Stop recording' : 'Start recording'}
                </button>
                <button
                    type="button"
                    onClick={onSubmitAnswer}
                    disabled={!canSubmit}
                    className={`flex-1 rounded-xl py-3 px-4 font-semibold text-white transition-colors ${
                        !canSubmit
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                >
                    {isLastQuestion ? 'Submit & finish' : 'Submit & next'}
                </button>
            </div>
            {startError && <p className="text-sm text-destructive">{startError}</p>}
            <p className="text-xs text-muted-foreground">
                Submit is enabled after the system captures speech. Scores appear on the summary at the end.
            </p>
        </section>
    );
}
