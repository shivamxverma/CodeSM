import React from 'react';
import { InterviewProgressBar } from './InterviewProgressBar';
import { InterviewerQuestionPanel } from './InterviewerQuestionPanel';
import { VoiceAnswerPanel } from './VoiceAnswerPanel';
import { TechnicalInterviewLayout } from './TechnicalInterviewLayout';
import { roundUsesCodeEditor } from './interviewConstants';

const VOICE_DESCRIPTIONS = {
    behavioral:
        'Behavioral round: answer with clear stories (STAR works well). Speak naturally — your words are captured for scoring.',
    system_design:
        'System design: explain requirements, APIs, storage, scaling, and trade-offs out loud. Your speech is captured for scoring.',
};

export function InterviewLiveSession({
    currentQuestionIndex,
    questionsLength,
    progressPct,
    isSpeaking,
    questionText,
    questionTitle,
    canSubmit,
    isRecording,
    answerSecondsRemaining,
    startError,
    onEndInterview,
    onToggleRecord,
    onSubmitAnswer,
    interviewRound,
    interviewLevel,
    codeLanguages,
    codingLanguage,
    setCodingLanguage,
    userAnswer,
    setUserAnswer,
    interviewId,
    interviewElapsedSeconds,
    candidateLabel,
    interviewMediaStream,
}) {
    const isLastQuestion = currentQuestionIndex >= questionsLength - 1;

    if (roundUsesCodeEditor(interviewRound)) {
        return (
            <TechnicalInterviewLayout
                currentQuestionIndex={currentQuestionIndex}
                questionsLength={questionsLength}
                progressPct={progressPct}
                interviewElapsedSeconds={interviewElapsedSeconds}
                candidateLabel={candidateLabel}
                interviewLevel={interviewLevel}
                questionTitle={questionTitle}
                questionText={questionText}
                isSpeaking={isSpeaking}
                onEndInterview={onEndInterview}
                mediaStream={interviewMediaStream}
                interviewId={interviewId}
                codeLanguages={codeLanguages}
                codingLanguage={codingLanguage}
                setCodingLanguage={setCodingLanguage}
                userAnswer={userAnswer}
                setUserAnswer={setUserAnswer}
                canSubmit={canSubmit}
                isLastQuestion={isLastQuestion}
                startError={startError}
                roundLabel={interviewRound}
                onSubmitAnswer={onSubmitAnswer}
            />
        );
    }

    return (
        <div className="bg-canvas-soft text-ink min-h-screen p-4 md:p-8 font-sans">
            <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-md bg-canvas border border-hairline flex items-center justify-center text-lg shrink-0 shadow-sm">
                        🎙️
                    </div>
                    <div className="min-w-0">
                        <h1 className="font-bold text-lg text-ink truncate">Live interview.</h1>
                        <p className="text-xs text-mute">
                            Question {currentQuestionIndex + 1} of {questionsLength} · Voice
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className="rounded-md border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-500/20 transition-colors duration-200 cursor-pointer"
                    onClick={onEndInterview}
                >
                    End interview
                </button>
            </header>

            <div className="max-w-6xl mx-auto mb-6">
                <InterviewProgressBar progressPct={progressPct} />
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
                <InterviewerQuestionPanel isSpeaking={isSpeaking} questionText={questionText} />
                <VoiceAnswerPanel
                        isSpeaking={isSpeaking}
                        canSubmit={canSubmit}
                        isRecording={isRecording}
                        answerSecondsRemaining={answerSecondsRemaining}
                        startError={startError}
                        isLastQuestion={isLastQuestion}
                        onToggleRecord={onToggleRecord}
                        onSubmitAnswer={onSubmitAnswer}
                        description={VOICE_DESCRIPTIONS[interviewRound]}
                    />
            </div>
        </div>
    );
}
