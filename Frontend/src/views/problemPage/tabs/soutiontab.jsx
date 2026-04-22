import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEditorialSolution } from "@/api/api";
import { Loader2, Copy, Check } from "lucide-react";
import Editor from "@monaco-editor/react";

export function SolutionTab({ problem }) {
    const problemId = problem?.id;
    const [copied, setCopied] = useState(false);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["editorial-solution", problemId],
        queryFn: () => getEditorialSolution(problemId).then((r) => r.data.data),
        enabled: !!problemId,
    });

    const solution = React.useMemo(() => {
        if (!data || typeof data !== 'string') return data;
        try {
            // Check if it's a JSON-wrapped string (literal " at start/end)
            if (data.trim().startsWith('"') && data.trim().endsWith('"')) {
                return JSON.parse(data.trim());
            }
            // Check if it contains literal \n but no actual newlines
            if (data.includes('\\n') && !data.includes('\n')) {
                // Wrap in quotes to make it a valid JSON string for parsing
                return JSON.parse(`"${data.replace(/"/g, '\\"')}"`);
            }
        } catch (e) {
            console.error("Error parsing solution string:", e);
        }
        return data;
    }, [data]);

    const handleCopy = useCallback(() => {
        if (!solution) return;
        navigator.clipboard.writeText(solution).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm">Fetching official solution...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-6 text-sm text-red-400">
                {error?.response?.data?.message || "Failed to load solution."}
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-12">
            {solution ? (
                <>
                    <div className="flex items-center justify-between gap-2 px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-[#182432] border border-[#233046] text-gray-300">
                                Language: C++
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-[#10202a] border border-[#1e3a4b] text-blue-300">
                                Official Solution
                            </span>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-[#1a2432] hover:bg-[#233046] border border-[#2a3750] transition-all hover:text-blue-300"
                            title="Copy code"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5 text-green-400" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="rounded-xl border border-[#233046] bg-[#0c1219] overflow-hidden shadow-2xl h-[500px]">
                        <Editor
                            height="100%"
                            language="cpp"
                            value={solution}
                            theme="vs-dark"
                            options={{
                                readOnly: true,
                                fontSize: 13,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                lineNumbers: "on",
                                folding: true,
                                scrollbar: {
                                    vertical: "visible",
                                    horizontal: "visible",
                                    verticalScrollbarSize: 8,
                                    horizontalScrollbarSize: 8,
                                },
                                renderLineHighlight: "none",
                                padding: { top: 16, bottom: 16 },
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            }}
                        />
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 border border-dashed border-[#233046] rounded-xl">
                    <p className="text-sm italic">No official solution available yet.</p>
                </div>
            )}
        </div>
    )
}