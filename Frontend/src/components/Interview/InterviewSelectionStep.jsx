import React from 'react';
import { roundUsesCodeEditor } from './interviewConstants';
import { ResumeUploadField } from './ResumeUploadField';

const controlBase =
    'w-full rounded-md border border-hairline bg-canvas px-4 py-2.5 text-sm text-ink transition-all duration-200 outline-none hover:bg-canvas-soft-2 hover:border-hairline-strong focus:border-ring focus:ring-2 focus:ring-ring/20';

const labelClass = 'flex items-center gap-2.5 text-[13px] font-medium text-body mb-2 transition-colors duration-200';
const hintClass = 'text-[11px] text-mute mt-1.5 leading-relaxed';

function Field({ id, icon, label, hint, children }) {
    return (
        <div className="group flex flex-col">
            <label className={labelClass} htmlFor={id}>
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-canvas-soft-2 border border-hairline text-[10px] shadow-sm transition-transform duration-300 group-hover:scale-105">
                    {icon}
                </div>
                <span className="tracking-wide">{label}</span>
            </label>
            <div className="relative">
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
                className={`${controlBase} appearance-none pr-11 cursor-pointer`}
                value={value}
                onChange={onChange}
            >
                {children}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md bg-canvas-soft-2 border border-hairline text-mute transition-colors duration-200 group-hover:text-ink">
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
                <div className="flex h-8 w-1 rounded-full bg-primary" />
                <div>
                    <h2 className="text-[15px] font-semibold text-ink tracking-tight">{title}</h2>
                    <p className="text-[12px] text-mute mt-0.5">{subtitle}</p>
                </div>
            </div>
            {step && (
                <div className="flex items-center justify-center rounded-full border border-hairline bg-canvas-soft-2 px-3 py-1 text-[10px] font-semibold tracking-widest text-mute uppercase shadow-sm">
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
    resumeText,
    onResumeParsed,
    onResumeClear,
    isResumeParsing,
    setIsResumeParsing,
    isLoading,
    selectionComplete,
    onContinue,
}) {
    return (
        <div className="min-h-screen text-ink px-4 sm:px-6 py-12 flex items-center justify-center relative overflow-hidden bg-canvas-soft font-sans selection:bg-cyan/30">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] h-[60vh] w-[60vw] rounded-full bg-cyan/5 dark:bg-cyan/10 blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[70vh] w-[60vw] rounded-full bg-violet/5 dark:bg-violet/10 blur-[130px] mix-blend-screen" />
                
                <div 
                    className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay"
                    style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27 opacity=%270.9%27/%3E%3C/svg%3E")'
                    }}
                />
            </div>

            <div className="relative w-full max-w-2xl mx-auto z-10">
                <div className="relative rounded-2xl bg-canvas border border-hairline shadow-md overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/30 to-transparent opacity-50" />

                    <div className="p-8 sm:p-10">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-[10px] font-semibold text-cyan-deep dark:text-cyan uppercase tracking-widest mb-4">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
                                    </span>
                                    Session setup
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-ink">
                                    AI Interview.
                                </h1>
                                <p className="mt-3 text-[14px] leading-relaxed text-body max-w-md">
                                    Configure your targeted technical or behavioral interview. Our AI will conduct a realistic session and provide crisp, actionable feedback.
                                </p>
                            </div>
                            <div className="hidden sm:flex shrink-0 items-center justify-center h-16 w-16 rounded-xl border border-hairline bg-canvas-soft-2 shadow-sm">
                                <span className="text-3xl">🧠</span>
                            </div>
                        </div>

                        <div className="w-full h-px bg-hairline mb-8" />

                        <div className="space-y-8">
                            <section className="relative">
                                <SectionHeader 
                                    title="Candidate Profile" 
                                    subtitle="Define the role and experience level" 
                                    step="Step 1"
                                />
                                <div className="space-y-5 bg-canvas-soft border border-hairline rounded-xl p-5 sm:p-6">
                                    <Field id="interview-role" icon="🎯" label="Target Role">
                                        <Select
                                            id="interview-role"
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                        >
                                            <option value="" className="bg-canvas text-ink">Select a role…</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id} className="bg-canvas text-ink">
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
                                                <option value="" className="bg-canvas text-ink">Select level…</option>
                                                {experienceLevels.map((level) => (
                                                    <option key={level.id} value={level.id} className="bg-canvas text-ink">
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
                                                    <option key={r.id} value={r.id} className="bg-canvas text-ink">
                                                        {r.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Field>
                                    </div>
                                </div>
                            </section>

                            <section className="relative">
                                <SectionHeader 
                                    title="Interview Parameters" 
                                    subtitle="Customize difficulty and structure" 
                                    step="Step 2"
                                />
                                <div className="space-y-5 bg-canvas-soft border border-hairline rounded-xl p-5 sm:p-6">
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
                                                        <option key={lang.id} value={lang.id} className="bg-canvas text-ink">
                                                            {lang.name}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Field>
                                        ) : (
                                            <div className="sm:col-span-1 flex flex-col justify-end mb-4">
                                                <div className="flex h-10 items-center gap-2 rounded-md border border-hairline bg-canvas-soft-2 px-3 text-[13px] text-body shadow-sm">
                                                    <span className="text-base">📝</span>
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
                                                    <option key={lvl.id} value={lvl.id} className="bg-canvas text-ink">
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
                                                <option key={n} value={String(n)} className="bg-canvas text-ink">
                                                    {n} Questions
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                </div>
                            </section>

                            <section className="relative">
                                <SectionHeader
                                    title="Resume"
                                    subtitle="Upload your resume for personalized questions (optional)"
                                    step="Step 3"
                                />
                                <div className="bg-canvas-soft border border-hairline rounded-xl p-5 sm:p-6">
                                    <ResumeUploadField
                                        resumeText={resumeText}
                                        onParsed={onResumeParsed}
                                        onClear={onResumeClear}
                                        isParsing={isResumeParsing}
                                        setIsParsing={setIsResumeParsing}
                                    />
                                </div>
                            </section>

                            <section className="relative">
                                <SectionHeader 
                                    title="Custom Focus" 
                                    subtitle="Add specific topics to emphasize (optional)" 
                                    step="Step 4"
                                />
                                <div className="bg-canvas-soft border border-hairline rounded-xl p-5 sm:p-6">
                                    <Field
                                        id="custom-req"
                                        icon="✨"
                                        label="Focus Areas"
                                        hint="e.g. System design tradeoffs, React hooks, conflict resolution. Leave blank — the AI will draw from your resume."
                                    >
                                        <textarea
                                            id="custom-req"
                                            className={`${controlBase} min-h-[110px] resize-y placeholder:text-mute leading-relaxed`}
                                            placeholder="What should the interviewer specifically evaluate? e.g. System design tradeoffs…"
                                            value={customRequirements}
                                            onChange={(e) => setCustomRequirements(e.target.value)}
                                        />
                                    </Field>
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="relative p-8 sm:p-10 bg-canvas-soft-2 border-t border-hairline">
                        <button
                            type="button"
                            onClick={onContinue}
                            disabled={!selectionComplete}
                            className={`group relative w-full overflow-hidden rounded-md py-3 text-[15px] font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                                !selectionComplete
                                    ? 'bg-canvas text-mute border border-hairline cursor-not-allowed'
                                    : 'bg-primary text-primary-foreground border border-transparent shadow-sm hover:opacity-90 active:scale-[0.98]'
                            }`}
                        >
                            <span className="relative flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Initializing Session…
                                    </>
                                ) : (
                                    <>
                                        Start interview
                                        <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                        </svg>
                                    </>
                                )}
                            </span>
                        </button>
                        <p className="mt-4 text-center text-[12px] text-mute font-medium">
                            Ready when you are. The interviewer awaits your setup.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
