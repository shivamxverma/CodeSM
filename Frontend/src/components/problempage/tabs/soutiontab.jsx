export function SolutionTab({ problem }) {
    return (
        <div className="space-y-3">
            {problem?.solution ? (
                <>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-[#182432] border border-[#233046]">
                            Language: C++
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-[#10202a] border border-[#1e3a4b]">
                            Official Solution
                        </span>
                    </div>
                    <pre className="rounded-lg border border-[#233046] bg-[#0c1219] p-4 text-sm overflow-x-auto">
                        {problem.solution}
                    </pre>
                </>
            ) : (
                <div className="text-sm text-gray-400">No official solution available.</div>
            )}
        </div>
    )
}