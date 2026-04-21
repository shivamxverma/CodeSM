export function DescriptionTab({ problem }) {
    return (
        <div className="space-y-6">
            <p className="leading-7 whitespace-pre-line">{problem?.description}</p>
            {(problem?.timeLimit || problem?.memoryLimit) && (
                <div className="flex gap-4 text-sm">
                    {problem.timeLimit && (
                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="font-semibold text-blue-200">Time Limit:</span>
                            <span>{problem.timeLimit} ms</span>
                        </div>
                    )}
                    {problem.memoryLimit && (
                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="font-semibold text-blue-200">Memory Limit:</span>
                            <span>{problem.memoryLimit} MB</span>
                        </div>
                    )}
                </div>
            )}
            {problem?.sampleTestcases?.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="font-semibold text-blue-300">Sample Testcases</h3>
                    {problem.sampleTestcases.map((tc, i) => (
                        <div
                            key={i}
                            className="rounded border border-[#233046] bg-[#0c1219] p-4 text-sm shadow"
                        >
                            <div className="mb-2">
                                <span className="font-semibold text-blue-200">Input:</span>
                                <pre className="rounded bg-[#10151c] p-2 mt-1">{tc.input}</pre>
                            </div>
                            <div>
                                <span className="font-semibold text-blue-200">Output:</span>
                                <pre className="rounded bg-[#10151c] p-2 mt-1">{tc.output}</pre>
                            </div>
                            {tc.explanation && (
                                <div className="mt-2 text-gray-400">
                                    <span className="font-semibold text-blue-200">Explanation:</span>{" "}
                                    {tc.explanation}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : null}
            {problem?.examples?.length ? (
                <div className="space-y-4">
                    <h3 className="font-semibold text-blue-300">Examples</h3>
                    {problem.examples.map((ex, i) => (
                        <div
                            key={i}
                            className="rounded border border-[#233046] bg-[#0c1219] p-4 text-sm shadow"
                        >
                            <div className="text-gray-300 mb-2">
                                Input: <code className="font-mono">{ex.input}</code>
                            </div>
                            <div className="text-gray-300 mb-2">
                                Output: <code className="font-mono">{ex.output}</code>
                            </div>
                            {ex.explanation && (
                                <div className="text-gray-400">Explanation: {ex.explanation}</div>
                            )}
                        </div>
                    ))}
                </div>
            ) : null}
            {problem?.constraints && (
                <div>
                    <h3 className="font-semibold mb-2 text-blue-300">Constraints</h3>
                    <div className="rounded border border-[#233046] bg-[#0c1219] p-4 text-sm whitespace-pre-line">
                        {problem.constraints}
                    </div>
                </div>
            )}
            {problem?.inputFormat && (
                <div>
                    <h3 className="font-semibold mb-2 text-blue-300">Input Format</h3>
                    <pre className="rounded border border-[#233046] bg-[#0c1219] p-3 text-sm overflow-x-auto">
                        {problem.inputFormat}
                    </pre>
                </div>
            )}
            {problem?.outputFormat && (
                <div>
                    <h3 className="font-semibold mb-2 text-blue-300">Output Format</h3>
                    <pre className="rounded border border-[#233046] bg-[#0c1219] p-3 text-sm overflow-x-auto">
                        {problem.outputFormat}
                    </pre>
                </div>
            )}
            {(problem?.tags || []).length ? (
                <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag, i) => (
                        <span
                            key={i}
                            className="text-xs px-2 py-1 rounded-full bg-[#13202b] border border-[#224056] text-blue-200"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    )
}