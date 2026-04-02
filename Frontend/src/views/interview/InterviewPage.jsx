import React from 'react';
import { useInterviewSession } from './components/useInterviewSession.js';
import { roundUsesCodeEditor } from './components/interviewConstants.js';
import { InterviewSelectionStep } from './components/InterviewSelectionStep.jsx';
import { InterviewReadyStep } from './components/InterviewReadyStep.jsx';
import { InterviewLiveSession } from './components/InterviewLiveSession.jsx';
import { InterviewResultsSummary } from './components/InterviewResultsSummary.jsx';
import { InterviewMediaPermissionsStep } from './components/InterviewMediaPermissionsStep.jsx';

const InterviewAssistant = () => {
    const session = useInterviewSession();

    if (session.currentPage === 'results') {
        return (
            <InterviewResultsSummary
                questionResults={session.questionResults}
                onStartAnother={session.resetInterviewSession}
            />
        );
    }

    if (session.currentPage === 'interview') {
        const roleName = session.roles.find((r) => r.id === session.selectedRole)?.name || 'Candidate';
        const experienceName =
            session.experienceLevels.find((e) => e.id === session.selectedExperience)?.name || '';
        const candidateLabel = experienceName ? `${roleName} · ${experienceName}` : roleName;
        const q = session.questions[session.currentQuestionIndex];

        return (
            <InterviewLiveSession
                currentQuestionIndex={session.currentQuestionIndex}
                questionsLength={session.questions.length}
                progressPct={session.progressPct}
                isSpeaking={session.isSpeaking}
                questionText={q?.text}
                questionTitle={q?.title || `Question ${session.currentQuestionIndex + 1}`}
                canSubmit={Boolean(session.userAnswer.trim())}
                isRecording={session.isRecording}
                answerSecondsRemaining={session.answerSecondsRemaining}
                startError={session.startError}
                onEndInterview={session.resetInterviewSession}
                onToggleRecord={() =>
                    session.isRecording ? session.handleStopRecording() : session.handleStartRecording()
                }
                onSubmitAnswer={session.submitAnswer}
                interviewRound={session.interviewRound}
                interviewLevel={session.interviewLevel}
                codeLanguages={session.codeLanguages}
                codingLanguage={session.codingLanguage}
                setCodingLanguage={session.setCodingLanguage}
                userAnswer={session.userAnswer}
                setUserAnswer={session.setUserAnswer}
                interviewId={session.interviewId}
                interviewElapsedSeconds={session.interviewElapsedSeconds}
                candidateLabel={candidateLabel}
                interviewMediaStream={session.interviewMediaStream}
            />
        );
    }

    if (session.currentPage === 'media_permissions') {
        return (
            <InterviewMediaPermissionsStep
                onGranted={session.beginInterviewWithMediaStream}
                onCancel={session.cancelMediaPermissions}
                isLoading={session.isLoading}
                apiError={session.startError}
            />
        );
    }

    if (session.currentPage === 'ready') {
        const roleName = session.roles.find((r) => r.id === session.selectedRole)?.name || '—';
        const experienceName =
            session.experienceLevels.find((e) => e.id === session.selectedExperience)?.name || '—';
        const roundName = session.interviewRounds.find((r) => r.id === session.interviewRound)?.name || '—';
        const levelName = session.interviewLevels.find((l) => l.id === session.interviewLevel)?.name || '—';
        const codingLanguageName =
            session.codeLanguages.find((l) => l.id === session.codingLanguage)?.name || session.codingLanguage;

        return (
            <InterviewReadyStep
                roleName={roleName}
                experienceName={experienceName}
                roundName={roundName}
                levelName={levelName}
                questionCount={session.questionCount}
                customRequirements={session.customRequirements}
                codingLanguageName={codingLanguageName}
                isCodeRound={roundUsesCodeEditor(session.interviewRound)}
                isLoading={session.isLoading}
                startError={session.startError}
                onGoBack={session.goBackToSelection}
                onStartInterview={session.proceedFromReady}
            />
        );
    }

    return (
        <InterviewSelectionStep
            roles={session.roles}
            experienceLevels={session.experienceLevels}
            questionCountOptions={session.questionCountOptions}
            interviewLevels={session.interviewLevels}
            interviewRounds={session.interviewRounds}
            selectedRole={session.selectedRole}
            setSelectedRole={session.setSelectedRole}
            selectedExperience={session.selectedExperience}
            setSelectedExperience={session.setSelectedExperience}
            questionCount={session.questionCount}
            setQuestionCount={session.setQuestionCount}
            interviewLevel={session.interviewLevel}
            setInterviewLevel={session.setInterviewLevel}
            interviewRound={session.interviewRound}
            setInterviewRound={session.setInterviewRound}
            codeLanguages={session.codeLanguages}
            codingLanguage={session.codingLanguage}
            setCodingLanguage={session.setCodingLanguage}
            customRequirements={session.customRequirements}
            setCustomRequirements={session.setCustomRequirements}
            isLoading={session.isLoading}
            selectionComplete={session.selectionComplete}
            onContinue={session.goToReady}
        />
    );
};

export default InterviewAssistant;
