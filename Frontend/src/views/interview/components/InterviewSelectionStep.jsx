import React from 'react';
import { roundUsesCodeEditor } from './interviewConstants.js';

const selectClass =
    'w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500';

const labelClass = 'block text-sm font-medium text-muted-foreground mb-1';

export function InterviewSelectionStep({
    roles,
    experienceLevels,
    questionCountOptions,
    interviewLevels,
    interviewRounds,
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
    codeLanguages,
    codingLanguage,
    setCodingLanguage,
    customRequirements,
    setCustomRequirements,
    isLoading,
    selectionComplete,
    onContinue,
}) {
    return (
        <div className="bg-background text-foreground min-h-screen p-6 flex flex-col items-center">
            <div className="w-full max-w-md space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">AI Interview</h1>
                    <p className="text-sm text-muted-foreground mt-1">Configure your practice session.</p>
                </div>

                <div>
                    <label className={labelClass} htmlFor="interview-role">
                        Role
                    </label>
                    <select
                        id="interview-role"
                        className={selectClass}
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        <option value="">Select role</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass} htmlFor="interview-experience">
                        Experience
                    </label>
                    <select
                        id="interview-experience"
                        className={selectClass}
                        value={selectedExperience}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                    >
                        <option value="">Select experience</option>
                        {experienceLevels.map((level) => (
                            <option key={level.id} value={level.id}>
                                {level.name} ({level.years})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass} htmlFor="interview-round">
                        Round
                    </label>
                    <select
                        id="interview-round"
                        className={selectClass}
                        value={interviewRound}
                        onChange={(e) => setInterviewRound(e.target.value)}
                    >
                        {interviewRounds.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                </div>

                {roundUsesCodeEditor(interviewRound) && (
                    <div>
                        <label className={labelClass} htmlFor="interview-code-language">
                            Programming language
                        </label>
                        <select
                            id="interview-code-language"
                            className={selectClass}
                            value={codingLanguage}
                            onChange={(e) => setCodingLanguage(e.target.value)}
                        >
                            {codeLanguages.map((lang) => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Used for the in-browser editor in Technical (DSA) and LLD rounds.
                        </p>
                    </div>
                )}

                <div>
                    <label className={labelClass} htmlFor="interview-level">
                        Interview level
                    </label>
                    <select
                        id="interview-level"
                        className={selectClass}
                        value={interviewLevel}
                        onChange={(e) => setInterviewLevel(e.target.value)}
                    >
                        {interviewLevels.map((lvl) => (
                            <option key={lvl.id} value={lvl.id}>
                                {lvl.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass} htmlFor="question-count">
                        Number of questions
                    </label>
                    <select
                        id="question-count"
                        className={selectClass}
                        value={String(questionCount)}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                    >
                        {questionCountOptions.map((n) => (
                            <option key={n} value={String(n)}>
                                {n}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass} htmlFor="custom-req">
                        Focus areas (optional)
                    </label>
                    <textarea
                        id="custom-req"
                        className={`${selectClass} min-h-24 resize-y`}
                        placeholder="e.g. React performance, rate limiters, leadership stories"
                        value={customRequirements}
                        onChange={(e) => setCustomRequirements(e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    onClick={onContinue}
                    disabled={!selectionComplete}
                    className={`w-full rounded-md py-2.5 text-sm font-semibold transition-colors ${
                        !selectionComplete
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                    {isLoading ? 'Loading…' : 'Continue'}
                </button>
            </div>
        </div>
    );
}
