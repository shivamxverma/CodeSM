import React from 'react';
import { roundUsesCodeEditor } from './interviewConstants.js';

const controlBase =
    'w-full rounded-2xl border border-white/10 bg-[#0b1220]/55 px-4 py-3 text-sm text-gray-100 shadow-[0_10px_35px_-25px_rgba(0,0,0,0.85)] shadow-black/30 backdrop-blur-md transition-all outline-none';
const controlFocus =
    'focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20 hover:border-white/20 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]';

const labelClass = 'flex items-center gap-2 text-sm font-semibold text-gray-100 mb-2';
const hintClass = 'text-xs text-gray-400 mt-1';

function Field({ id, icon, label, hint, children }) {
    return (
        <div className="group">
            <label className={labelClass} htmlFor={id}>
                <span className="text-base leading-none opacity-90 group-hover:opacity-100 transition-opacity">
                    {icon}
                </span>
                <span>{label}</span>
            </label>
            {children}
            {hint ? <div className={hintClass}>{hint}</div> : null}
        </div>
    );
}

function Select({ id, value, onChange, children }) {
    return (
        <div className="relative group">
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-cyan-400/10 via-transparent to-purple-500/10" />
            <select
                id={id}
                className={`${controlBase} ${controlFocus} appearance-none pr-11 relative`}
                value={value}
                onChange={onChange}
            >
                {children}
            </select>
            <svg
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-gray-200 transition-colors"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                />
            </svg>
        </div>
    );
}

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
        <div className="min-h-screen text-foreground px-5 py-10 flex items-center justify-center relative overflow-hidden bg-[#070b12]">
            {/* Soft animated mesh background */}
            <div className="absolute inset-0">
                <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-cyan-500/18 blur-3xl animate-pulse" />
                <div className="absolute -bottom-56 -right-48 h-[640px] w-[640px] rounded-full bg-purple-500/18 blur-3xl animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.10),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.10),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.08),transparent_45%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/40" />
                {/* subtle noise */}
                <div
                    className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27 opacity=%270.9%27/%3E%3C/svg%3E")',
                    }}
                />
            </div>

            <div className="relative w-full max-w-[520px]">
                {/* animated gradient border */}
                <div className="absolute -inset-[1px] rounded-[26px] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(34,211,238,0.65),rgba(168,85,247,0.55),rgba(59,130,246,0.55),rgba(34,211,238,0.65))] opacity-50 blur-[10px]" />
                <div className="rounded-[26px] border border-white/10 bg-white/[0.055] backdrop-blur-xl shadow-[0_20px_70px_-38px_rgba(0,0,0,0.92)] overflow-hidden relative">
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.06] via-transparent to-black/25" />
                    <div className="px-7 pt-7 pb-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gray-200">
                                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_0_3px_rgba(34,211,238,0.12)]" />
                                    Premium practice mode
                                </div>
                                <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-100">
                                    AI Interview
                                </h1>
                                <p className="mt-1.5 text-sm text-gray-400">
                                    Configure a focused session in seconds. Crisp feedback, realistic rounds.
                                </p>
                            </div>
                            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-gray-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">🧠</span>
                                    <span className="hidden sm:inline text-xs text-gray-300">Setup</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="mt-6 space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold text-gray-100">Basics</div>
                                    <div className="text-xs text-gray-500">Who you are interviewing as</div>
                                </div>
                                <div className="text-[11px] text-gray-500 rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                                    Step 1 of 1
                                </div>
                            </div>
                            <Field id="interview-role" icon="🎯" label="Role">
                                <Select
                                    id="interview-role"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="">Select role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </Select>
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field id="interview-experience" icon="⚡" label="Experience">
                                    <Select
                                        id="interview-experience"
                                        value={selectedExperience}
                                        onChange={(e) => setSelectedExperience(e.target.value)}
                                    >
                                        <option value="">Select experience</option>
                                        {experienceLevels.map((level) => (
                                            <option key={level.id} value={level.id}>
                                                {level.name} ({level.years})
                                            </option>
                                        ))}
                                    </Select>
                                </Field>

                                <Field id="interview-round" icon="🔄" label="Round">
                                    <Select
                                        id="interview-round"
                                        value={interviewRound}
                                        onChange={(e) => setInterviewRound(e.target.value)}
                                    >
                                        {interviewRounds.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                            </div>

                            <div className="mt-2 h-px w-full bg-white/10" />

                            <div>
                                <div className="text-sm font-semibold text-gray-100">Interview setup</div>
                                <div className="text-xs text-gray-500">Difficulty, language and structure</div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {roundUsesCodeEditor(interviewRound) ? (
                                    <Field
                                        id="interview-code-language"
                                        icon="💻"
                                        label="Language"
                                        hint="Used for the in-browser editor in Technical (DSA) and LLD rounds."
                                    >
                                        <Select
                                            id="interview-code-language"
                                            value={codingLanguage}
                                            onChange={(e) => setCodingLanguage(e.target.value)}
                                        >
                                            {codeLanguages.map((lang) => (
                                                <option key={lang.id} value={lang.id}>
                                                    {lang.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                ) : (
                                    <div className="sm:col-span-1">
                                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-gray-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                                            <div className="flex items-center gap-2 text-gray-200 font-medium">
                                                💻 Language
                                            </div>
                                            <div className="mt-1.5">
                                                This round doesn’t use the code editor.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Field id="interview-level" icon="📊" label="Level">
                                    <Select
                                        id="interview-level"
                                        value={interviewLevel}
                                        onChange={(e) => setInterviewLevel(e.target.value)}
                                    >
                                        {interviewLevels.map((lvl) => (
                                            <option key={lvl.id} value={lvl.id}>
                                                {lvl.name}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                            </div>

                            <Field id="question-count" icon="🔢" label="Questions">
                                <Select
                                    id="question-count"
                                    value={String(questionCount)}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                >
                                    {questionCountOptions.map((n) => (
                                        <option key={n} value={String(n)}>
                                            {n}
                                        </option>
                                    ))}
                                </Select>
                            </Field>

                            <div className="mt-2 h-px w-full bg-white/10" />

                            <Field
                                id="custom-req"
                                icon="✨"
                                label="Focus areas (optional)"
                                hint="Add topics you want the interviewer to emphasize."
                            >
                                <textarea
                                    id="custom-req"
                                    className={`${controlBase} ${controlFocus} min-h-28 resize-y`}
                                    placeholder="e.g. React performance, rate limiters, leadership stories"
                                    value={customRequirements}
                                    onChange={(e) => setCustomRequirements(e.target.value)}
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="px-7 pb-7">
                        <button
                            type="button"
                            onClick={onContinue}
                            disabled={!selectionComplete}
                            className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                                !selectionComplete
                                    ? 'bg-white/10 text-gray-400 cursor-not-allowed border border-white/10'
                                    : 'text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 shadow-[0_16px_45px_-28px_rgba(34,211,238,0.85)] hover:shadow-[0_22px_60px_-34px_rgba(168,85,247,0.95)] focus:ring-2 focus:ring-cyan-300/30 hover:-translate-y-[1px] active:translate-y-0'
                            }`}
                        >
                            {isLoading ? 'Loading…' : 'Continue'}
                        </button>
                        <div className="mt-3 text-[11px] text-gray-500 text-center">
                            By continuing, you’ll start a practice session using AI-generated questions.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
