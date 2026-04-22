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
            className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm min-h-0 max-h-[calc(100vh-8rem)] lg:max-h-[calc(100vh-6rem)]"
            style={{ borderRadius: 12 }}
        >
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                            isSpeaking
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        }`}
                    >
                        {isSpeaking ? 'Interviewer speaking' : 'Your turn'}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${levelClass}`}>
                        {interviewLevel}
                    </span>
                </div>
            </div>

            <div className="aspect-video max-h-[200px] shrink-0 bg-black/90 flex items-center justify-center border-b border-border">
                {isSpeaking ? (
                    <video src="/video.mp4" autoPlay muted loop className="h-full w-full object-cover" />
                ) : (
                    <p className="text-muted-foreground text-sm px-4 text-center">
                        Read the formatted question description below, then start coding.
                    </p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {questionTitle && (
                    <h2 className="text-lg font-semibold text-foreground mb-3 leading-snug">{questionTitle}</h2>
                )}
                <div className="space-y-5">
                    {description ? (
                        <div>
                            <h3 className="font-semibold mb-2 text-blue-300">Description</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 [&_pre]:bg-muted [&_pre]:rounded-lg [&_code]:text-sm">
                                <ReactMarkdown>{description}</ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                            <ReactMarkdown>{questionText || '_Loading…_'}</ReactMarkdown>
                        </div>
                    )}

                    {inputFormat && (
                        <div>
                            <h3 className="font-semibold mb-2 text-blue-300">Input Format</h3>
                            <pre className="rounded border border-border bg-muted/20 p-3 text-sm overflow-x-auto whitespace-pre-wrap">
                                {inputFormat}
                            </pre>
                        </div>
                    )}

                    {outputFormat && (
                        <div>
                            <h3 className="font-semibold mb-2 text-blue-300">Output Format</h3>
                            <pre className="rounded border border-border bg-muted/20 p-3 text-sm overflow-x-auto whitespace-pre-wrap">
                                {outputFormat}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
