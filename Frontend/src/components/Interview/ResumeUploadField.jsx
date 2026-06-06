import React, { useRef, useState, useCallback } from 'react';
import { parseResume } from '@/utils/resumeParser.js';

/**
 * ResumeUploadField
 * Drop-zone + file-picker that extracts text from a PDF/TXT resume client-side
 * and calls onParsed({ text, truncated, charCount }) or onError(message).
 */
export function ResumeUploadField({ resumeText, onParsed, onClear, isParsing, setIsParsing }) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [parseError, setParseError] = useState('');
    const [fileName, setFileName] = useState('');
    const [truncated, setTruncated] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const processFile = useCallback(
        async (file) => {
            if (!file) return;
            setParseError('');
            setIsParsing(true);
            try {
                const result = await parseResume(file);
                setFileName(file.name);
                setTruncated(result.truncated);
                setCharCount(result.charCount);
                onParsed(result);
            } catch (err) {
                setParseError(err.message || 'Failed to parse resume.');
            } finally {
                setIsParsing(false);
            }
        },
        [onParsed, setIsParsing]
    );

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleClear = () => {
        setFileName('');
        setTruncated(false);
        setCharCount(0);
        setParseError('');
        onClear();
    };

    const hasResume = Boolean(resumeText && resumeText.trim());

    return (
        <div className="space-y-2.5">
            {/* Label row */}
            <div className="flex items-center gap-2.5 text-[13px] font-medium text-body mb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-canvas-soft-2 border border-hairline text-[10px] shadow-sm">
                    📄
                </div>
                <span className="tracking-wide">Resume</span>
                <span className="ml-1 text-[11px] font-normal text-mute rounded-full border border-hairline bg-canvas-soft px-2 py-0.5">
                    optional
                </span>
            </div>

            {hasResume ? (
                /* ── Parsed state ─────────────────────────────────────── */
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5 flex items-start gap-3 shadow-sm">
                    <div className="mt-0.5 shrink-0 h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm">
                        ✅
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 truncate" title={fileName}>
                            {fileName || 'Resume loaded'}
                        </div>
                        <div className="text-[11px] text-body mt-0.5">
                            {charCount.toLocaleString()}&nbsp;characters extracted
                            {truncated && (
                                <span className="ml-1.5 text-amber-600 dark:text-amber-400">· Preview capped for token efficiency</span>
                            )}
                        </div>
                        <div className="text-[11px] text-mute mt-1">
                            Questions will be tailored to your resume
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        title="Remove resume"
                        className="shrink-0 mt-0.5 rounded-md p-1.5 text-mute hover:text-red-500 hover:bg-red-500/10 transition-colors duration-200"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
            ) : (
                /* ── Drop zone ────────────────────────────────────────── */
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload resume — drag and drop or click to browse"
                    className={`relative w-full rounded-md border-2 border-dashed transition-all duration-200 cursor-pointer group
                        ${dragOver
                            ? 'border-ring bg-canvas-soft-2 shadow-[0_0_0_3px_rgba(80,227,194,0.08)]'
                            : 'border-hairline bg-canvas hover:border-ring hover:bg-canvas-soft-2'
                        }
                        ${isParsing ? 'pointer-events-none opacity-60' : ''}
                    `}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') ? inputRef.current?.click() : undefined}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    <div className="py-7 px-5 flex flex-col items-center gap-3 text-center">
                        {isParsing ? (
                            <>
                                <div className="h-9 w-9 rounded-full border-2 border-ring/25 border-t-ring animate-spin" />
                                <p className="text-[13px] text-ring font-medium">Parsing resume…</p>
                                <p className="text-[11px] text-mute">Extracting text client-side</p>
                            </>
                        ) : (
                            <>
                                <div className="h-12 w-12 rounded-xl border border-hairline bg-canvas-soft-2 flex items-center justify-center text-2xl group-hover:border-ring/25 group-hover:bg-ring/10 group-hover:scale-105 transition-all duration-200 shadow-sm">
                                    📤
                                </div>
                                <div>
                                    <p className="text-[13px] text-body font-medium group-hover:text-ink transition-colors duration-200">
                                        Drop your resume or{' '}
                                        <span className="text-link underline decoration-dashed underline-offset-2">
                                            browse
                                        </span>
                                    </p>
                                    <p className="text-[11px] text-mute mt-1">PDF or TXT · max 10&nbsp;MB</p>
                                </div>
                                <div className="text-[10px] text-mute border border-hairline bg-canvas-soft-2 rounded-full px-3 py-1 font-medium tracking-wide">
                                    🔒 Parsed locally — nothing uploaded to a server
                                </div>
                            </>
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        id="resume-upload-input"
                        type="file"
                        accept=".pdf,.txt"
                        className="sr-only"
                        onChange={handleFileChange}
                        aria-label="Upload resume file"
                    />
                </div>
            )}

            {parseError && (
                <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-[12px] text-red-600 dark:text-red-400">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span>{parseError}</span>
                </div>
            )}

            {!hasResume && !parseError && (
                <p className="text-[11px] text-mute">
                    Upload your resume to get interview questions tailored to your actual experience and skills.
                </p>
            )}
        </div>
    );
}
