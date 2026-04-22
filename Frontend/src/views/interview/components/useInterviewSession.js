import { useState, useRef, useEffect, useCallback } from 'react';
import { usePostHog } from '@posthog/react';
import { getQuestionsForInterview, getScoreForQuestion } from '../../../api/api.js';
import {
    INTERVIEW_ROLES,
    INTERVIEW_EXPERIENCE_LEVELS,
    INTERVIEW_QUESTION_COUNTS,
    INTERVIEW_LEVELS,
    INTERVIEW_ROUNDS,
    INTERVIEW_CODE_LANGUAGES,
    RECORDING_MAX_SECONDS,
    roundUsesCodeEditor,
} from './interviewConstants.js';

export function useInterviewSession() {
    const posthog = usePostHog();
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedExperience, setSelectedExperience] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [interviewLevel, setInterviewLevel] = useState('medium');
    const [interviewRound, setInterviewRound] = useState('technical');
    const [codingLanguage, setCodingLanguage] = useState(INTERVIEW_CODE_LANGUAGES[0].id);
    const [customRequirements, setCustomRequirements] = useState('');
    const [startError, setStartError] = useState('');
    const [currentPage, setCurrentPage] = useState('selection');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [questionResults, setQuestionResults] = useState([]);
    const [interviewId, setInterviewId] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    /** Webcam + mic stream for technical / LLD rounds (after permissions step). */
    const [interviewMediaStream, setInterviewMediaStream] = useState(null);
    const [interviewElapsedSeconds, setInterviewElapsedSeconds] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioStreamRef = useRef(null);
    const audioChunksRef = useRef([]);
    /** Seconds left to answer while recording; null when not in an active answer window */
    const [answerSecondsRemaining, setAnswerSecondsRemaining] = useState(null);
    const timerRef = useRef(null);
    const recognitionRef = useRef(null);
    const questionAudioRef = useRef(null);
    const submitLockRef = useRef(false);
    const interviewIdRef = useRef(null);
    const isSpeakingRef = useRef(isSpeaking);

    useEffect(() => {
        interviewIdRef.current = interviewId;
    }, [interviewId]);

    useEffect(() => {
        isSpeakingRef.current = isSpeaking;
    }, [isSpeaking]);

    const stopQuestionAudio = useCallback(() => {
        if (questionAudioRef.current) {
            questionAudioRef.current.pause();
            questionAudioRef.current.currentTime = 0;
            questionAudioRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    const playAudio = useCallback(
        (audioUrl) => {
            stopQuestionAudio();
            setIsSpeaking(true);
            const audio = new Audio(audioUrl);
            questionAudioRef.current = audio;
            audio.play().catch(() => setIsSpeaking(false));
            audio.onended = () => {
                setIsSpeaking(false);
                questionAudioRef.current = null;
            };
        },
        [stopQuestionAudio]
    );

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const stopRecordingAndStreams = useCallback(() => {
        try {
            recognitionRef.current?.stop();
        } catch {
            /* ignore */
        }
        recognitionRef.current = null;
        try {
            mediaRecorderRef.current?.stop();
        } catch {
            /* ignore */
        }
        mediaRecorderRef.current = null;
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => track.stop());
            audioStreamRef.current = null;
        }
        audioChunksRef.current = [];
        setIsRecording(false);
        clearTimer();
        setAnswerSecondsRemaining(null);
    }, [clearTimer]);

    const stopAllInterviewSideEffects = useCallback(() => {
        stopQuestionAudio();
        stopRecordingAndStreams();
    }, [stopQuestionAudio, stopRecordingAndStreams]);

    const stopInterviewMediaStream = useCallback(() => {
        setInterviewMediaStream((prev) => {
            if (prev) {
                prev.getTracks().forEach((t) => t.stop());
            }
            return null;
        });
    }, []);

    const fetchQuestions = async (opts = {}) => {
        const { mediaStream: incomingMediaStream } = opts;
        setIsLoading(true);
        setStartError('');
        try {
            const selectedRoleData = INTERVIEW_ROLES.find((r) => r.id === selectedRole);
            const selectedExperienceData = INTERVIEW_EXPERIENCE_LEVELS.find((e) => e.id === selectedExperience);
            const response = await getQuestionsForInterview({
                role: selectedRoleData,
                experience: selectedExperienceData,
                customRequirements,
                questionCount,
                interviewLevel,
                round: interviewRound,
                ...(roundUsesCodeEditor(interviewRound)
                    ? {
                          codingLanguage,
                      }
                    : {}),
            });

            const res = response?.data?.data || response?.data?.message;
            const newInterviewId = res?.interviewId;
            const qs = Array.isArray(res?.questions) ? res.questions : [];

            if (!newInterviewId || qs.length === 0) {
                throw new Error('Interview generation returned invalid data.');
            }

            setInterviewId(newInterviewId);
            setQuestions(qs);
            setQuestionResults([]);
            setCurrentQuestionIndex(0);
            setUserAnswer('');
            if (incomingMediaStream) {
                setInterviewMediaStream(incomingMediaStream);
            }
            setInterviewElapsedSeconds(0);
            setCurrentPage('interview');
            setIsLoading(false);

            posthog.capture('interview_started', {
                role: selectedRoleData?.name,
                experience: selectedExperienceData?.name,
                interview_id: newInterviewId,
                question_count: qs.length,
                interview_level: interviewLevel,
                round: interviewRound,
                ...(roundUsesCodeEditor(interviewRound) ? { coding_language: codingLanguage } : {}),
            });

            // For code-editor rounds (Technical/DSA and LLD), we don't want the interviewer
            // voice to dictate the question. The question text is shown in the UI.
            if (!roundUsesCodeEditor(interviewRound) && qs.length > 0 && qs[0].audioUrl) {
                playAudio(qs[0].audioUrl);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            if (incomingMediaStream) {
                incomingMediaStream.getTracks().forEach((t) => t.stop());
            }
            setStartError(error?.response?.data?.message || 'Could not start interview. Please try again.');
            setIsLoading(false);
        }
    };

    const proceedFromReady = () => {
        if (roundUsesCodeEditor(interviewRound)) {
            setStartError('');
            setCurrentPage('media_permissions');
        } else {
            void fetchQuestions();
        }
    };

    const beginInterviewWithMediaStream = (stream) => {
        if (!stream) return;
        void fetchQuestions({ mediaStream: stream });
    };

    const cancelMediaPermissions = () => {
        setCurrentPage('ready');
        setStartError('');
    };

    const submitAnswer = useCallback(() => {
        const answerSnapshot = userAnswer.trim();
        if (!answerSnapshot || submitLockRef.current) return;
        submitLockRef.current = true;

        try {
            stopAllInterviewSideEffects();

            const idx = currentQuestionIndex;
            const entryId =
                typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${idx}-${Date.now()}-${Math.random()}`;

            setQuestionResults((prev) => [
                ...prev,
                {
                    id: entryId,
                    questionIndex: idx,
                    questionText: questions[idx]?.text || '',
                    answer: answerSnapshot,
                    score: null,
                    analysis: null,
                    loading: true,
                },
            ]);

            getScoreForQuestion(idx, questions, answerSnapshot, {
                round: interviewRound,
                ...(roundUsesCodeEditor(interviewRound) ? { codingLanguage } : {}),
            })
                .then((response) => {
                    const { score: s, analysis: a } = response.data.data;
                    setQuestionResults((prev) =>
                        prev.map((r) => (r.id === entryId ? { ...r, score: s, analysis: a, loading: false } : r))
                    );
                    posthog.capture('interview_question_answered', {
                        question_index: idx,
                        score: s,
                        interview_id: interviewIdRef.current,
                    });
                })
                .catch((error) => {
                    console.error('Error submitting answer:', error);
                    setQuestionResults((prev) =>
                        prev.map((r) =>
                            r.id === entryId
                                ? { ...r, score: null, analysis: 'Could not score this answer.', loading: false }
                                : r
                        )
                    );
                });

            setUserAnswer('');

            if (idx < questions.length - 1) {
                const nextIndex = idx + 1;
                setCurrentQuestionIndex(nextIndex);
                if (!roundUsesCodeEditor(interviewRound) && questions[nextIndex]?.audioUrl) {
                    playAudio(questions[nextIndex].audioUrl);
                }
            } else {
                posthog.capture('interview_finished', {
                    interview_id: interviewIdRef.current,
                    total_questions: questions.length,
                });
                setCurrentPage('results');
            }
        } finally {
            submitLockRef.current = false;
        }
    }, [
        userAnswer,
        currentQuestionIndex,
        questions,
        stopAllInterviewSideEffects,
        playAudio,
        posthog,
        interviewRound,
        codingLanguage,
    ]);

    const goToReady = useCallback(() => {
        if (selectedRole && selectedExperience) {
            setCurrentPage('ready');
        }
    }, [selectedRole, selectedExperience]);

    const selectionComplete = Boolean(selectedRole && selectedExperience);

    const goBackToSelection = useCallback(() => {
        setCurrentPage('selection');
        setStartError('');
    }, []);

    const resetInterviewSession = useCallback(() => {
        stopAllInterviewSideEffects();
        stopInterviewMediaStream();
        setInterviewElapsedSeconds(0);
        setCurrentPage('selection');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswer('');
        setQuestionResults([]);
        setInterviewId(null);
        setStartError('');
        setSelectedRole('');
        setSelectedExperience('');
        setQuestionCount(10);
        setInterviewLevel('medium');
        setInterviewRound('technical');
        setCodingLanguage(INTERVIEW_CODE_LANGUAGES[0].id);
        setCustomRequirements('');
    }, [stopAllInterviewSideEffects, stopInterviewMediaStream]);

    useEffect(() => {
        if (currentPage !== 'interview' || !roundUsesCodeEditor(interviewRound)) {
            return undefined;
        }
        const id = window.setInterval(() => {
            setInterviewElapsedSeconds((s) => s + 1);
        }, 1000);
        return () => window.clearInterval(id);
    }, [currentPage, interviewRound]);

    const handleStartRecording = useCallback(async () => {
        if (isSpeakingRef.current) {
            return;
        }
        try {
            setStartError('');
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (isSpeakingRef.current) {
                stream.getTracks().forEach((t) => t.stop());
                return;
            }
            audioStreamRef.current = stream;

            const options = MediaRecorder.isTypeSupported('audio/webm; codecs=opus')
                ? { mimeType: 'audio/webm; codecs=opus', audioBitsPerSecond: 32000 }
                : undefined;
            mediaRecorderRef.current = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                audioChunksRef.current = [];
                clearTimer();
            };

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognitionRef.current = recognition;
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event) => {
                    let transcript = '';
                    for (let i = 0; i < event.results.length; i += 1) {
                        transcript += `${event.results[i][0].transcript} `;
                    }
                    setUserAnswer(transcript.trim());
                };

                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                };

                recognition.start();
            } else {
                setStartError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
                mediaRecorderRef.current?.stop();
                stream.getTracks().forEach((t) => t.stop());
                audioStreamRef.current = null;
                return;
            }
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setAnswerSecondsRemaining(RECORDING_MAX_SECONDS);
            let remaining = RECORDING_MAX_SECONDS;
            timerRef.current = window.setInterval(() => {
                remaining -= 1;
                setAnswerSecondsRemaining(remaining);
                if (remaining <= 0) {
                    clearTimer();
                    stopRecordingAndStreams();
                }
            }, 1000);
        } catch (err) {
            console.error('Error accessing the microphone', err);
            setStartError('Could not access microphone. Please allow mic permission and try again.');
        }
    }, [clearTimer, stopRecordingAndStreams]);

    const handleStopRecording = useCallback(() => {
        stopRecordingAndStreams();
    }, [stopRecordingAndStreams]);

    useEffect(() => {
        return () => {
            clearTimer();
            try {
                recognitionRef.current?.stop();
            } catch {
                /* ignore */
            }
            if (questionAudioRef.current) {
                questionAudioRef.current.pause();
                questionAudioRef.current = null;
            }
        };
    }, [clearTimer]);

    const progressPct =
        questions.length > 0 ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) : 0;

    return {
        roles: INTERVIEW_ROLES,
        experienceLevels: INTERVIEW_EXPERIENCE_LEVELS,
        questionCountOptions: INTERVIEW_QUESTION_COUNTS,
        interviewLevels: INTERVIEW_LEVELS,
        interviewRounds: INTERVIEW_ROUNDS,
        codeLanguages: INTERVIEW_CODE_LANGUAGES,
        selectedRole,
        setSelectedRole,
        selectedExperience,
        setSelectedExperience,
        questionCount,
        setQuestionCount,
        interviewLevel,
        setInterviewLevel,
        interviewRound,
        setInterviewRound,
        codingLanguage,
        setCodingLanguage,
        customRequirements,
        setCustomRequirements,
        selectionComplete,
        startError,
        currentPage,
        isLoading,
        isSpeaking,
        questions,
        currentQuestionIndex,
        userAnswer,
        setUserAnswer,
        questionResults,
        isRecording,
        answerSecondsRemaining,
        progressPct,
        fetchQuestions,
        proceedFromReady,
        beginInterviewWithMediaStream,
        cancelMediaPermissions,
        submitAnswer,
        goToReady,
        goBackToSelection,
        resetInterviewSession,
        interviewMediaStream,
        interviewElapsedSeconds,
        handleStartRecording,
        handleStopRecording,
    };
}
