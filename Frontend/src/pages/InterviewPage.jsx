import React, { useState } from 'react';
import axios from 'axios';
import { getQuestionsForInterview , getScoreForQuestion } from '../api/api';

const InterviewAssistant = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [currentPage, setCurrentPage] = useState('selection');
    const [showScore, setShowScore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [score, setScore] = useState(null);
    const [analysis, setAnalysis] = useState('');
    const [interviewId, setInterviewId] = useState(null);

    const roles = [
        { id: 'frontend', name: 'Frontend Developer', desc: 'React, Vue, Angular', icon: '💻' },
        { id: 'backend', name: 'Backend Developer', desc: 'APIs, Databases, Server', icon: '☁️' },
        { id: 'fullstack', name: 'Full Stack Developer', desc: 'Frontend + Backend', icon: '🚀' },
        { id: 'data_scientist', name: 'Data Scientist', desc: 'ML, Analytics, Python', icon: '📊' },
        { id: 'devops', name: 'DevOps Engineer', desc: 'CI/CD, Cloud, Docker', icon: '⚙️' },
        { id: 'mobile', name: 'Mobile Developer', desc: 'iOS, Android, React Native', icon: '📱' },
        { id: 'ml_engineer', name: 'Machine Learning Engineer', desc: 'AI, Deep Learning, Models', icon: '🤖' },
        { id: 'product_manager', name: 'Strategy, Roadmaps, Analytics', icon: '📈' },
    ];

    const experienceLevels = [
        { id: 'entry', name: 'Entry Level', years: '0-1 years' },
        { id: 'junior', name: 'Junior', years: '2-3 years' },
        { id: 'mid', name: 'Mid-Level', years: '4-6 years' },
        { id: 'senior', name: 'Senior', years: '7+ years' },
        { id: 'staff', name: 'Staff/Principal', years: '10+ years' },
    ];

    const playAudio = (audioUrl) => {
        setIsSpeaking(true);
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => {
            setIsSpeaking(false);
        };
    };

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const selectedRoleData = roles.find(r => r.id === selectedRole);
            const selectedExperienceData = experienceLevels.find(e => e.id === selectedExperience);
            const response = await getQuestionsForInterview(selectedRoleData, selectedExperienceData);

            const res = response.data.data;
            const { interviewId, questions } = res;

            
            setInterviewId(interviewId);
            setQuestions(questions);
            setCurrentPage('interview');
            setIsLoading(false);
            
            if (questions.length > 0 && questions[0].audioUrl) {
                playAudio(questions[0].audioUrl);
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
            setIsLoading(false);
        }
    };

    const submitAnswer = async () => {
        setIsLoading(true);
        try {
            const response = await getScoreForQuestion(currentQuestionIndex, questions, userAnswer);
            console.log(response.data.data);
            const { score, analysis } = response.data.data;
            setScore(score);
            setAnalysis(analysis);
            setShowScore(true);
            setIsLoading(false);
        } catch (error) {
            console.error("Error submitting answer:", error);
            setIsLoading(false);
        }
    };

    const handleStartInterview = () => {
        if (selectedRole && selectedExperience) {
            setCurrentPage('ready');
        }
    };

    const handleGoToInterview = () => {
        fetchQuestions();
    };

    const handleGoBack = () => {
        setCurrentPage('selection');
    };

    const handleSubmitAnswer = () => {
        if (userAnswer.trim()) {
            submitAnswer();
        }
    };

    const handleNextQuestion = () => {
        setUserAnswer('');
        setShowScore(false);
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            if (questions[nextIndex].audioUrl) {
                playAudio(questions[nextIndex].audioUrl);
            }
        } else {
            setCurrentPage('selection');
            setQuestions([]);
            setCurrentQuestionIndex(0);
        }
    };

    if (currentPage === 'interview') {
        return (
            <div className="bg-[#1a1b26] min-h-screen text-white p-6 md:p-10 relative">
            <div className="flex justify-end mb-6">
                <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
                onClick={() => {
                    setCurrentPage('selection');
                    setQuestions([]);
                    setCurrentQuestionIndex(0);
                    setUserAnswer('');
                    setShowScore(false);
                    setScore(null);
                    setAnalysis('');
                    setInterviewId(null);
                    setIsSpeaking(false);
                }}
                >
                <span className="mr-2">⏹️</span> End Interview
                </button>
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                <div className="bg-gray-800 rounded-xl p-4 relative">
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">{isSpeaking ? 'AI is speaking' : 'AI is listening'}</span>
                    <div className="bg-black rounded-lg w-full aspect-video flex items-center justify-center">
                    {isSpeaking ? (
                        <video
                        src="/video.mp4"
                        autoPlay
                        muted
                        loop={true}
                        className="w-full h-full object-cover rounded-lg"
                        />
                    ) : (
                        <span className="text-gray-400">AI Interviewer Video</span>
                    )}
                    </div>
                    <div className="text-center mt-2">
                    <p className="text-lg">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-2">Current Question:</h3>
                    <p className="text-gray-300 text-sm">
                    {questions[currentQuestionIndex]?.text || 'Generating question...'}
                    </p>
                </div>
                </div>
                <div className="flex-1 space-y-6">
                <div className="bg-gray-800 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-2">Your Answer</h3>
                    <textarea
                    className="w-full h-32 bg-gray-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Start speaking or type your answer here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    ></textarea>
                    <div className="mt-4 flex justify-center">
                    <button
                        onClick={handleSubmitAnswer}
                        disabled={isLoading || !userAnswer.trim()}
                        className={`
                        bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-full transition-colors
                        ${isLoading || !userAnswer.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Answer'}
                    </button>
                    </div>
                </div>
                </div>
            </div>
            {showScore && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-xl p-8 w-full max-w-lg text-center border-2 border-green-500 shadow-xl">
                    <h2 className="text-3xl font-bold mb-4 text-green-400">Answer Submitted!</h2>
                    <p className="text-xl mb-6">Your score is:</p>
                    <div className="text-6xl font-extrabold text-green-500 mb-4">{score}/10</div>
                    <p className="text-sm text-gray-400 mb-6">{analysis}</p>
                    <button
                    onClick={handleNextQuestion}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
                    >
                    {currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'Finish Interview'}
                    </button>
                </div>
                </div>
            )}
            </div>
        );
    }

    if (currentPage === 'ready') {
        const roleName = roles.find(r => r.id === selectedRole)?.name || 'Not Selected';
        const experienceName = experienceLevels.find(e => e.id === selectedExperience)?.name || 'Not Selected';

        return (
            <div className="bg-[#1a1b26] min-h-screen text-white p-8 flex flex-col items-center justify-center space-y-10">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Ready to Start?</h2>
                <p className="text-lg text-gray-400">
                Selected: <span className="text-indigo-400 font-semibold">{roleName}</span> |
                Experience: <span className="text-indigo-400 font-semibold">{experienceName}</span>
                </p>
                <button onClick={handleGoBack} className="text-sm text-gray-400 underline hover:text-white transition-colors duration-300">
                Change Selection
                </button>
            </div>
            <div className="flex flex-col lg:flex-row w-full max-w-5xl gap-8">
                <div className="w-full lg:w-1/2 p-6 rounded-xl border border-gray-700 bg-gray-800/30">
                <h3 className="text-xl font-semibold mb-4 text-indigo-400">Enhanced Features</h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✅</span>
                    <p>AI speaks questions aloud with professional voice</p>
                    </li>
                    <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✅</span>
                    <p>Continuous speech-to-text with auto-restart</p>
                    </li>
                    <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✅</span>
                    <p>10 adaptive technical questions</p>
                    </li>
                    <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✅</span>
                    <p>Real-time AI evaluation and feedback</p>
                    </li>
                    <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✅</span>
                    <p>Video presence scoring</p>
                    </li>
                    <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✅</span>
                    <p>Comprehensive final report with recommendations</p>
                    </li>
                </ul>
                </div>
                <div className="w-full lg:w-1/2 p-6 rounded-xl border border-gray-700 bg-gray-800/30">
                <h3 className="text-xl font-semibold mb-4 text-indigo-400">Tips for Success</h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                    <span className="text-yellow-400 text-xl">💡</span>
                    <p>Enable camera and microphone for better scoring</p>
                    </li>
                    <li className="flex items-start gap-3">
                    <span className="text-yellow-400 text-xl">💡</span>
                    <p>Listen to AI questions and speak naturally</p>
                    </li>
                    <li className="flex items-start gap-3">
                    <span className="text-yellow-400 text-xl">💡</span>
                    <p>Speech recognition will auto-restart if it stops</p>
                    </li>
                    <li className="flex items-start gap-3">
                    <span className="text-yellow-400 text-xl">💡</span>
                    <p>Think out loud to show your problem-solving process</p>
                    </li>
                    <li className="flex items-start gap-3">
                    <span className="text-yellow-400 text-xl">💡</span>
                    <p>Maintain eye contact with the camera</p>
                    </li>
                </ul>
                </div>
            </div>
            <button
                onClick={handleGoToInterview}
                disabled={isLoading}
                className={`
                w-full max-w-lg py-4 rounded-full font-semibold text-lg transition-transform duration-300
                ${isLoading
                    ? 'bg-gray-900 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 shadow-lg'
                }
                `}
            >
                {isLoading ? 'Loading...' : 'Start AI Interview'}
            </button>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1b26] min-h-screen text-white p-8 flex flex-col items-center space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">AI Interview Assistant</h1>
                <p className="text-xl text-gray-400">
                    Practice technical interviews with AI-powered questions, voice interaction, and real-time feedback
                </p>
            </div>
            <div className="w-full max-w-6xl">
                <h2 className="text-2xl font-semibold mb-6">Choose Your Target Role</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {roles.map(role => (
                        <div
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`
                                p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                                bg-gray-800 flex flex-col items-center text-center space-y-2
                                ${selectedRole === role.id ? 'border-indigo-500 bg-indigo-900/50 scale-105 shadow-2xl' : 'border-gray-700 hover:border-indigo-500 hover:scale-[1.02]'}
                            `}
                        >
                            <span className="text-4xl">{role.icon}</span>
                            <h3 className="text-lg font-medium">{role.name}</h3>
                            <p className="text-sm text-gray-400">{role.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full max-w-6xl">
                <h2 className="text-2xl font-semibold mb-6">Select Your Experience Level</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {experienceLevels.map(level => (
                        <div
                            key={level.id}
                            onClick={() => setSelectedExperience(level.id)}
                            className={`
                                p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                                bg-gray-800 flex flex-col items-center text-center space-y-2
                                ${selectedExperience === level.id ? 'border-indigo-500 bg-indigo-900/50 scale-105 shadow-2xl' : 'border-gray-700 hover:border-indigo-500 hover:scale-[1.02]'}
                            `}
                        >
                            <h3 className="text-lg font-medium">{level.name}</h3>
                            <p className="text-sm text-gray-400">{level.years}</p>
                        </div>
                    ))}
                </div>
            </div>
            <button
                onClick={handleStartInterview}
                disabled={!selectedRole || !selectedExperience}
                className={`
                    w-full max-w-lg py-4 rounded-full font-semibold text-lg transition-transform duration-300
                    ${!selectedRole || !selectedExperience
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 shadow-lg'
                    }
                `}
            >
                {isLoading ? 'Loading...' : 'Start AI Interview'}
            </button>
            {showScore && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl p-10 w-full max-w-xl text-center border-2 border-green-500 shadow-2xl">
                        <h2 className="text-3xl font-bold mb-4 text-green-400">Your Answer is Evaluated!</h2>
                        <p className="text-xl mb-6">Score:</p>
                        <div className="text-6xl font-extrabold text-green-500 mb-4">{score}/10</div>
                        <p className="text-base text-gray-300 mb-6">{analysis}</p>
                        <button
                            onClick={handleNextQuestion}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
                        >
                            {currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'Finish Interview'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewAssistant;
