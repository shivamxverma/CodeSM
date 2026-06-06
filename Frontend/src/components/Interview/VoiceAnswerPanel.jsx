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
        <section className="rounded-2xl border border-hairline bg-canvas p-6 shadow-sm flex flex-col gap-6">
            <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-mute mb-1">
                    Your answer
                </h2>
                <p className="text-sm text-body">
                    {description ||
                        'Speak your answer — the transcript is captured for scoring but not shown while you record.'}
                </p>
            </div>

            <div
                className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed min-h-[10rem] px-4 py-6 transition-colors duration-200 ${
                    showCountdown
                        ? 'border-ring bg-ring/5'
                        : 'border-hairline bg-canvas-soft-2'
                }`}
            >
                {showCountdown ? (
                    <>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-mute mb-2">
                            Time to answer
                        </p>
                        <p className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight text-ink">
                            {formatMmSs(answerSecondsRemaining)}
                        </p>
                        <p className="text-xs text-mute mt-2">
                            {answerSecondsRemaining <= 10 ? 'Wrap up — time almost up' : 'Recording…'}
                        </p>
                    </>
                ) : startBlockedByInterviewer ? (
                    <>
                        <p className="text-lg font-bold text-center text-ink">Interviewer is speaking</p>
                        <p className="text-xs text-mute text-center mt-2 max-w-xs leading-relaxed">
                            Wait until the question finishes, then you can start recording your answer.
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-lg font-bold text-center text-ink">Ready when you are</p>
                        <p className="text-xs text-mute text-center mt-2 max-w-xs leading-relaxed">
                            Tap <span className="text-ink font-semibold">Start recording</span>. You will have{' '}
                            {RECORDING_MAX_SECONDS}&nbsp;seconds to answer this question.
                        </p>
                    </>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    type="button"
                    onClick={onToggleRecord}
                    disabled={startBlockedByInterviewer}
                    className={`flex-1 py-3 px-4 font-bold text-sm rounded-md transition-all duration-200 cursor-pointer text-center flex items-center justify-center ${
                        isRecording
                            ? 'bg-red-600 border border-red-600 text-white hover:bg-red-700 hover:border-red-700 active:scale-[0.98]'
                            : startBlockedByInterviewer
                              ? 'bg-canvas border border-hairline text-mute cursor-not-allowed'
                              : 'bg-primary border border-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]'
                    }`}
                >
                    {isRecording ? 'Stop recording' : 'Start recording'}
                </button>
                <button
                    type="button"
                    onClick={onSubmitAnswer}
                    disabled={!canSubmit}
                    className={`flex-1 py-3 px-4 font-bold text-sm rounded-md transition-all duration-200 cursor-pointer text-center flex items-center justify-center ${
                        !canSubmit
                            ? 'bg-canvas border border-hairline text-mute cursor-not-allowed'
                            : 'bg-emerald-600 border border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 active:scale-[0.98]'
                    }`}
                >
                    {isLastQuestion ? 'Submit & finish' : 'Submit & next'}
                </button>
            </div>
            {startError && (
                <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-600 dark:text-red-400">
                    <span>⚠️</span>
                    <span>{startError}</span>
                </div>
            )}
            <p className="text-xs text-mute leading-relaxed">
                Submit is enabled after the system captures speech. Scores appear on the summary at the end.
            </p>
        </section>
    );
}
