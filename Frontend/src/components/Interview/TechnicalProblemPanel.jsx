import React from 'react';
import ReactMarkdown from 'react-markdown';

const LEVEL_BADGE = {
    easy: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    hard: 'bg-red-500/20 text-red-600 dark:text-red-400',
    mixed: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
};

function splitQuestionTextIntoSections(questionText) {
    const text = (questionText || '').trim();
    if (!text) return { description: '', inputFormat: '', outputFormat: '' };

    // Prefer explicit "Input Format" / "Output Format" markers.
    const inputRegex = /(^|\n)\s*(?:#{1,6}\s*)?input\s*format\s*:?\s*/i;
    const outputRegex = /(^|\n)\s*(?:#{1,6}\s*)?output\s*format\s*:?\s*/i;

    // Fallback for problems that use "Input:" / "Output:" instead.
    const inputAltRegex = /(^|\n)\s*(?:#{1,6}\s*)?input\s*:?\s*/i;
    const outputAltRegex = /(^|\n)\s*(?:#{1,6}\s*)?output\s*:?\s*/i;

    const inputMatch = inputRegex.exec(text) ?? inputAltRegex.exec(text);
    const outputMatch = outputRegex.exec(text) ?? outputAltRegex.exec(text);

    const inputStart = inputMatch?.index ?? -1;
    const inputContentStart = inputMatch ? inputMatch.index + inputMatch[0].length : -1;

    const outputStart = outputMatch?.index ?? -1;
    const outputContentStart = outputMatch ? outputMatch.index + outputMatch[0].length : -1;

    // Expected order: Description -> Input Format -> Output Format.
    if (inputStart >= 0 && outputStart >= 0 && inputStart < outputStart) {
        return {
            description: text.slice(0, inputStart).trim(),
            inputFormat: text.slice(inputContentStart, outputStart).trim(),
            outputFormat: text.slice(outputContentStart).trim(),
        };
    }

    if (inputStart >= 0) {
        return {
            description: text.slice(0, inputStart).trim(),
            inputFormat: text.slice(inputContentStart).trim(),
            outputFormat: '',
        };
    }

    if (outputStart >= 0) {
        return {
            description: text.slice(0, outputStart).trim(),
            inputFormat: '',
            outputFormat: text.slice(outputContentStart).trim(),
        };
    }

    return { description: text, inputFormat: '', outputFormat: '' };
}

export function TechnicalProblemPanel({
    questionTitle,
    questionText,
    interviewLevel,
    isSpeaking,
}) {
    const levelClass = LEVEL_BADGE[interviewLevel] || LEVEL_BADGE.medium;
    const { description, inputFormat, outputFormat } = splitQuestionTextIntoSections(questionText);

    return (
        <section
            className="flex flex-col rounded-2xl border border-hairline bg-canvas overflow-hidden shadow-sm min-h-0 max-h-[calc(100vh-8rem)] lg:max-h-[calc(100vh-6rem)]"
            style={{ borderRadius: 12 }}
        >
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-canvas/95 backdrop-blur-sm px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 border ${
                            isSpeaking
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        }`}
                    >
                        {isSpeaking ? 'Interviewer speaking' : 'Your turn'}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${levelClass.replace('/20', '/10 border border-current/25')}`}>
                        {interviewLevel}
                    </span>
                </div>
            </div>

            <div className="aspect-video max-h-[200px] shrink-0 bg-black/95 flex items-center justify-center border-b border-hairline">
                {isSpeaking ? (
                    <video src="/video.mp4" autoPlay muted loop className="h-full w-full object-cover" />
                ) : (
                    <p className="text-mute text-xs px-4 text-center">
                        Read the formatted question description below, then start coding.
                    </p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-0 space-y-6">
                {questionTitle && (
                    <h2 className="text-lg font-bold text-ink leading-snug">{questionTitle}</h2>
                )}
                <div className="space-y-6">
                    {description ? (
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-mute mb-2">Description</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-body [&_pre]:bg-canvas-soft-2 [&_pre]:border [&_pre]:border-hairline [&_pre]:rounded-md [&_code]:text-sm [&_code]:font-mono">
                                <ReactMarkdown>{description}</ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-body [&_pre]:bg-canvas-soft-2 [&_pre]:border [&_pre]:border-hairline [&_pre]:rounded-md [&_code]:text-sm [&_code]:font-mono">
                            <ReactMarkdown>{questionText || '_Loading…_'}</ReactMarkdown>
                        </div>
                    )}

                    {inputFormat && (
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-mute mb-2">Input Format</h3>
                            <pre className="rounded-md border border-hairline bg-canvas-soft-2 p-3 text-sm overflow-x-auto whitespace-pre-wrap font-mono text-ink">
                                {inputFormat}
                            </pre>
                        </div>
                    )}

                    {outputFormat && (
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-mute mb-2">Output Format</h3>
                            <pre className="rounded-md border border-hairline bg-canvas-soft-2 p-3 text-sm overflow-x-auto whitespace-pre-wrap font-mono text-ink">
                                {outputFormat}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
