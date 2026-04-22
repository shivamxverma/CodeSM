import React from 'react';
import { roundUsesCodeEditor } from './interviewConstants';

const controlBase =
    'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-gray-100 shadow-sm backdrop-blur-xl transition-all duration-300 outline-none hover:bg-white/[0.06] hover:border-white/20';
const controlFocus =
    'focus:border-cyan-400/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-cyan-400/10 focus:shadow-[0_0_20px_rgba(34,211,238,0.15)]';

const labelClass = 'flex items-center gap-2.5 text-[13px] font-medium text-gray-300 mb-2.5 group-hover:text-gray-100 transition-colors duration-200';
const hintClass = 'text-[11px] text-gray-500 mt-1.5 leading-relaxed';

function Field({ id, icon, label, hint, children }) {
    return (
        <div className="group flex flex-col">
            <label className={labelClass} htmlFor={id}>
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/[0.1] group-hover:border-white/20">
                    {icon}
                </div>
                <span className="tracking-wide">{label}</span>
            </label>
            <div className="relative transform transition-all duration-300">
                {children}
            </div>
            {hint ? <div className={hintClass}>{hint}</div> : null}
        </div>
    );
}

function Select({ id, value, onChange, children }) {
    return (
        <div className="relative group">
            <select
                id={id}
                className={`${controlBase} ${controlFocus} appearance-none pr-11 cursor-pointer`}
                value={value}
                onChange={onChange}
            >
                {children}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-400 transition-all duration-300 group-hover:bg-cyan-500/10 group-hover:text-cyan-300 group-hover:border-cyan-500/20">
                <svg
                    className="h-3.5 w-3.5"
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
        </div>
    );
}

function SectionHeader({ title, subtitle, step }) {
    return (
        <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-1.5 rounded-full bg-gradient-to-b from-cyan-400 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
                <div>
                    <div className="text-[15px] font-semibold text-white tracking-wide">{title}</div>
                    <div className="text-[12px] text-gray-400 mt-0.5">{subtitle}</div>
                </div>
            </div>
            {step && (
                <div className="flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-medium tracking-widest text-gray-400 uppercase shadow-inner">
                    {step}
                </div>
            )}
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
        <div className="min-h-screen text-white px-4 sm:px-6 py-12 flex items-center justify-center relative overflow-hidden bg-[#03060c] font-sans selection:bg-cyan-500/30">
            {/* Rich Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] h-[60vh] w-[60vw] rounded-full bg-cyan-600/10 blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[70vh] w-[60vw] rounded-full bg-purple-600/10 blur-[130px] mix-blend-screen animate-pulse duration-[7000ms] delay-1000" />
                <div className="absolute top-[40%] left-[60%] h-[40vh] w-[40vw] rounded-full bg-blue-600/10 blur-[100px] mix-blend-screen animate-pulse duration-[5000ms]" />
                
                {/* SVG Noise Overlay */}
                <div 
                    className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                    style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27 opacity=%270.9%27/%3E%3C/svg%3E")'
                    }}
                />
            </div>

            <div className="relative w-full max-w-2xl mx-auto z-10">
                {/* Premium Card Container */}
                <div className="relative rounded-[32px] bg-[#0a0f18]/80 backdrop-blur-3xl border border-white/[0.08] shadow-[0_0_80px_-20px_rgba(0,0,0,1)] overflow-hidden transition-all duration-500 hover:border-white/[0.12]">
                    
                    {/* Inner glowing accent line at the top */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-50" />

                    <div className="p-8 sm:p-10">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
                            <div>
                                <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-semibold text-cyan-300 uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.15)] mb-4">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                    </span>
                                    Premium Session Setup
                                </div>
                                <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500">
                                    AI Interview
                                </h1>
                                <p className="mt-3 text-[14px] leading-relaxed text-gray-400 max-w-md">
                                    Configure your targeted technical or behavioral interview. Our AI will conduct a realistic session and provide crisp, actionable feedback.
                                </p>
                            </div>
                            <div className="hidden sm:flex shrink-0 items-center justify-center h-16 w-16 rounded-2xl border border-white/10 bg-white/[0.03] shadow-inner">
                                <span className="text-3xl">🧠</span>
                            </div>
                        </div>

                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-10" />

                        <div className="space-y-10">
                            {/* Basics Section */}
                            <section className="relative">
                                <SectionHeader 
                                    title="Candidate Profile" 
                                    subtitle="Define the role and experience level" 
                                    step="Step 1"
                                />
                                <div className="space-y-5 bg-white/[0.015] border border-white/[0.03] rounded-[24px] p-5 sm:p-7 transition-colors duration-300 hover:bg-white/[0.025]">
                                    <Field id="interview-role" icon="🎯" label="Target Role">
                                        <Select
                                            id="interview-role"
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                        >
                                            <option value="" className="bg-[#0f172a] text-gray-400">Select a role...</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id} className="bg-[#0f172a]">
                                                    {role.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field id="interview-experience" icon="⚡" label="Experience Level">
                                            <Select
                                                id="interview-experience"
                                                value={selectedExperience}
                                                onChange={(e) => setSelectedExperience(e.target.value)}
                                            >
                                                <option value="" className="bg-[#0f172a] text-gray-400">Select level...</option>
                                                {experienceLevels.map((level) => (
                                                    <option key={level.id} value={level.id} className="bg-[#0f172a]">
                                                        {level.name} ({level.years})
                                                    </option>
                                                ))}
                                            </Select>
                                        </Field>

                                        <Field id="interview-round" icon="🔄" label="Interview Round">
                                            <Select
                                                id="interview-round"
                                                value={interviewRound}
                                                onChange={(e) => setInterviewRound(e.target.value)}
                                            >
                                                {interviewRounds.map((r) => (
                                                    <option key={r.id} value={r.id} className="bg-[#0f172a]">
                                                        {r.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Field>
                                    </div>
                                </div>
                            </section>

                            {/* Interview Setup Section */}
                            <section className="relative">
                                <SectionHeader 
                                    title="Interview Parameters" 
                                    subtitle="Customize difficulty and structure" 
                                />
                                <div className="space-y-5 bg-white/[0.015] border border-white/[0.03] rounded-[24px] p-5 sm:p-7 transition-colors duration-300 hover:bg-white/[0.025]">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {roundUsesCodeEditor(interviewRound) ? (
                                            <Field
                                                id="interview-code-language"
                                                icon="💻"
                                                label="Programming Language"
                                                hint="Used for the in-browser IDE during technical rounds."
                                            >
                                                <Select
                                                    id="interview-code-language"
                                                    value={codingLanguage}
                                                    onChange={(e) => setCodingLanguage(e.target.value)}
                                                >
                                                    {codeLanguages.map((lang) => (
                                                        <option key={lang.id} value={lang.id} className="bg-[#0f172a]">
                                                            {lang.name}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Field>
                                        ) : (
                                            <div className="sm:col-span-1 flex flex-col justify-end mb-[22px]">
                                                <div className="flex h-[46px] items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 text-[13px] text-gray-400 shadow-inner">
                                                    <span className="opacity-60 text-base">📝</span>
                                                    <span>No IDE required for this round</span>
                                                </div>
                                            </div>
                                        )}

                                        <Field id="interview-level" icon="📊" label="Difficulty">
                                            <Select
                                                id="interview-level"
                                                value={interviewLevel}
                                                onChange={(e) => setInterviewLevel(e.target.value)}
                                            >
                                                {interviewLevels.map((lvl) => (
                                                    <option key={lvl.id} value={lvl.id} className="bg-[#0f172a]">
                                                        {lvl.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Field>
                                    </div>

                                    <Field id="question-count" icon="🔢" label="Number of Questions">
                                        <Select
                                            id="question-count"
                                            value={String(questionCount)}
                                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                                        >
                                            {questionCountOptions.map((n) => (
                                                <option key={n} value={String(n)} className="bg-[#0f172a]">
                                                    {n} Questions
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                </div>
                            </section>

                            {/* Focus Areas Section */}
                            <section className="relative">
                                <SectionHeader 
                                    title="Custom Focus" 
                                    subtitle="Add specific topics to emphasize (optional)" 
                                />
                                <div className="bg-white/[0.015] border border-white/[0.03] rounded-[24px] p-5 sm:p-7 transition-colors duration-300 hover:bg-white/[0.025]">
                                    <Field
                                        id="custom-req"
                                        icon="✨"
                                        label="Focus Areas"
                                        hint="e.g. System design tradeoffs, React hooks, conflict resolution."
                                    >
                                        <textarea
                                            id="custom-req"
                                            className={`${controlBase} ${controlFocus} min-h-[110px] resize-y placeholder:text-gray-600 leading-relaxed`}
                                            placeholder="What should the interviewer specifically evaluate?"
                                            value={customRequirements}
                                            onChange={(e) => setCustomRequirements(e.target.value)}
                                        />
                                    </Field>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer / CTA Section */}
                    <div className="relative p-8 sm:p-10 bg-white/[0.015] border-t border-white/[0.05]">
                        <button
                            type="button"
                            onClick={onContinue}
                            disabled={!selectionComplete}
                            className={`group relative w-full overflow-hidden rounded-xl py-4 text-[15px] font-bold tracking-wide transition-all duration-300 ${
                                !selectionComplete
                                    ? 'bg-white/[0.05] text-gray-500 cursor-not-allowed border border-white/5'
                                    : 'text-white border border-transparent shadow-[0_0_40px_-10px_rgba(34,211,238,0.4)] hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.6)] hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                        >
                            {selectionComplete && (
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 transition-opacity duration-300" />
                            )}
                            
                            <span className="relative flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Initializing Session...
                                    </>
                                ) : (
                                    <>
                                        Start Interview
                                        <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                        </svg>
                                    </>
                                )}
                            </span>
                        </button>
                        <p className="mt-5 text-center text-[12px] text-gray-500 font-medium">
                            Ready when you are. The interviewer awaits your setup.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
