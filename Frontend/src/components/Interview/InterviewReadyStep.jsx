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
    isLoading,
    startError,
    onGoBack,
    onStartInterview,
}) {
    return (
        <div className="bg-background text-foreground min-h-screen p-8 flex flex-col items-center justify-center space-y-10">
            <div className="text-center space-y-4 max-w-lg">
                <h2 className="text-2xl font-semibold">Ready to start?</h2>
                <ul className="text-sm text-left text-muted-foreground space-y-1.5 list-none">
                    <li>
                        <span className="text-foreground font-medium">Role:</span> {roleName}
                    </li>
                    <li>
                        <span className="text-foreground font-medium">Experience:</span> {experienceName}
                    </li>
                    <li>
                        <span className="text-foreground font-medium">Round:</span> {roundName}
                    </li>
                    <li>
                        <span className="text-foreground font-medium">Level:</span> {levelName}
                    </li>
                    <li>
                        <span className="text-foreground font-medium">Questions:</span> {questionCount}
                    </li>
                    {isCodeRound && codingLanguageName && (
                        <li>
                            <span className="text-foreground font-medium">Editor language:</span>{' '}
                            {codingLanguageName}
                        </li>
                    )}
                </ul>
                {customRequirements.trim() && (
                    <p className="text-sm text-muted-foreground">
                        <span className="text-foreground font-medium">Focus:</span> {customRequirements}
                    </p>
                )}
                <button
                    type="button"
                    onClick={onGoBack}
                    className="text-sm text-gray-400 underline hover:text-white transition-colors duration-300"
                >
                    Change Selection
                </button>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-md">
                {isCodeRound
                    ? 'Next, you will allow camera and microphone for a picture-in-picture preview, then solve problems in a full-screen technical workspace. Scores appear after you finish all questions.'
                    : 'Allow microphone when prompted. Use Chrome or Edge for speech recognition. Scores appear after you finish all questions.'}
            </p>
            <button
                type="button"
                onClick={onStartInterview}
                disabled={isLoading}
                className={`w-full max-w-md py-2.5 rounded-md text-sm font-semibold transition-colors ${
                    isLoading
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
                {isLoading ? 'Starting…' : 'Start interview'}
            </button>
            {startError && <p className="text-red-400 text-sm text-center max-w-lg">{startError}</p>}
        </div>
    );
}
