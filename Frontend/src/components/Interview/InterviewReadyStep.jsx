import React from 'react';

export function InterviewReadyStep({
    roleName,
    experienceName,
    roundName,
    levelName,
    questionCount,
    customRequirements,
    codingLanguageName,
    isCodeRound,
    resumeText,
    isLoading,
    startError,
    onGoBack,
    onStartInterview,
}) {
    const hasResume = Boolean(resumeText && resumeText.trim());
    return (
        <div className="bg-canvas-soft text-ink min-h-screen p-6 flex flex-col items-center justify-center font-sans">
            <div className="w-full max-w-lg space-y-6 bg-canvas border border-hairline p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/20 to-transparent opacity-50" />

                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-ink">Ready to start.</h2>
                    <p className="text-xs text-mute">
                        Double-check your interview parameters before proceeding.
                    </p>
                </div>

                {/* Grid List of Parameters */}
                <div className="grid grid-cols-2 gap-4 bg-canvas-soft-2 border border-hairline p-4 rounded-md">
                    <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-mute">Role</span>
                        <span className="text-sm font-semibold text-ink">{roleName}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-mute">Experience</span>
                        <span className="text-sm font-semibold text-ink">{experienceName}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-mute">Round</span>
                        <span className="text-sm font-semibold text-ink">{roundName}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-mute">Level</span>
                        <span className="text-sm font-semibold text-ink">{levelName}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-mute">Questions</span>
                        <span className="text-sm font-semibold text-ink">{questionCount}</span>
                    </div>
                    {isCodeRound && codingLanguageName && (
                        <div>
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-mute">Editor Language</span>
                            <span className="text-sm font-semibold text-ink">{codingLanguageName}</span>
                        </div>
                    )}
                </div>

                {customRequirements.trim() && (
                    <div className="bg-canvas-soft-2 border border-hairline p-4 rounded-md">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-mute mb-1">Focus Areas</span>
                        <p className="text-sm text-body leading-relaxed">{customRequirements}</p>
                    </div>
                )}

                {hasResume && (
                    <div className="flex items-center justify-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>✅</span>
                        <span>Resume loaded — questions will be tailored to your profile</span>
                    </div>
                )}

                <div className="text-center">
                    <button
                        type="button"
                        onClick={onGoBack}
                        className="text-xs text-mute underline decoration-dashed underline-offset-2 hover:text-ink transition-colors duration-200"
                    >
                        Change selection
                    </button>
                </div>

                <div className="text-[11px] text-mute text-center leading-relaxed max-w-sm mx-auto">
                    {isCodeRound
                        ? 'Next, you will allow camera and microphone for a picture-in-picture preview, then solve problems in a split technical workspace. Scores appear after you finish all questions.'
                        : 'Allow microphone when prompted. Use Chrome or Edge for speech recognition. Scores appear after you finish all questions.'}
                </div>

                <button
                    type="button"
                    onClick={onStartInterview}
                    disabled={isLoading}
                    className={`w-full btn-primary py-3 text-sm font-bold transition-all ${
                        isLoading ? 'opacity-40 cursor-not-allowed bg-canvas border-hairline text-mute' : ''
                    }`}
                >
                    {isLoading ? 'Starting…' : 'Start interview'}
                </button>

                {startError && (
                    <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-600 dark:text-red-400">
                        <span>⚠️</span>
                        <span>{startError}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
