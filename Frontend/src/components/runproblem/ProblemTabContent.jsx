import React from "react";
import ReactMarkdown from "react-markdown";
import ProblemDiscussions from "@/views/discussion/ProblemDiscussions";

export default function ProblemTabContent({
  activeTab,
  problem,
  problemId,
  embedUrl,
  submissions,
  refetchSubmissions,
  hints,
  hintsLoading,
  hintsError,
  revealedHintIndex,
  setRevealedHintIndex,
  fetchHints,
}) {
  if (activeTab === "Description") {
    return (
      <div className="space-y-6">
        <p className="leading-7 whitespace-pre-wrap break-words">{problem?.description}</p>
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
                  <pre className="rounded bg-[#10151c] p-2 mt-1 whitespace-pre-wrap break-words">
                    {tc.input}
                  </pre>
                </div>
                <div>
                  <span className="font-semibold text-blue-200">Output:</span>
                  <pre className="rounded bg-[#10151c] p-2 mt-1 whitespace-pre-wrap break-words">
                    {tc.output}
                  </pre>
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
            <div className="rounded border border-[#233046] bg-[#0c1219] p-4 text-sm whitespace-pre-wrap break-words">
              {problem.constraints}
            </div>
          </div>
        )}
        {problem?.inputFormat && (
          <div>
            <h3 className="font-semibold mb-2 text-blue-300">Input Format</h3>
            <pre className="rounded border border-[#233046] bg-[#0c1219] p-3 text-sm whitespace-pre-wrap break-words">
              {problem.inputFormat}
            </pre>
          </div>
        )}
        {problem?.outputFormat && (
          <div>
            <h3 className="font-semibold mb-2 text-blue-300">Output Format</h3>
            <pre className="rounded border border-[#233046] bg-[#0c1219] p-3 text-sm whitespace-pre-wrap break-words">
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
    );
  }

  if (activeTab === "Editorial") {
    return (
      <div className="space-y-4">
        {embedUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-[#233046] bg-black shadow">
            <iframe
              title="Editorial Video"
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}
        {problem?.editorialLink && !embedUrl && (
          <a
            href={problem.editorialLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-300 hover:underline"
          >
            Open editorial link
          </a>
        )}
        {problem?.editorial ? (
          <div className="prose prose-invert max-w-none prose-pre:bg-[#0c1219] prose-code:text-gray-200">
            <ReactMarkdown>{problem.editorial}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-sm text-gray-400">No editorial provided.</div>
        )}
      </div>
    );
  }

  if (activeTab === "Submissions") {
    return (
      <div className="h-full overflow-y-auto">
        <button
          className="mb-3 px-3 py-1 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750] text-xs"
          onClick={() => refetchSubmissions?.()}
        >
          Refresh Submissions
        </button>
        {submissions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            No submissions found.
          </div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#121923]">
                <th className="border border-[#233046] px-2 py-1">#</th>
                <th className="border border-[#233046] px-2 py-1">Username</th>
                <th className="border border-[#233046] px-2 py-1">Status</th>
                <th className="border border-[#233046] px-2 py-1">Language</th>
                <th className="border border-[#233046] px-2 py-1">Time</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => (
                <tr key={sub._id || idx} className="bg-[#0c1219]">
                  <td className="border border-[#233046] px-2 py-1">{idx + 1}</td>
                  <td className="border border-[#233046] px-2 py-1">
                    {sub.user.username || "N/A"}
                  </td>
                  <td className="border border-[#233046] px-2 py-1">{sub.status || "N/A"}</td>
                  <td className="border border-[#233046] px-2 py-1">{sub.language || "N/A"}</td>
                  <td className="border border-[#233046] px-2 py-1">
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  if (activeTab === "Solutions") {
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
    );
  }

  if (activeTab === "Hints") {
    const onRevealNext = () => {
      setRevealedHintIndex?.((prev) => prev + 1);
    };
    const canRevealMore = !hintsLoading && revealedHintIndex < hints.length - 1;
    return (
      <div className="space-y-4">
        {hintsLoading && <div className="text-sm text-gray-400">Generating hints for you...</div>}
        {hintsError && <div className="text-sm text-red-400">{hintsError}</div>}
        {!hintsLoading && hints.length === 0 && (
          <div className="text-sm text-gray-400">No hints available for this problem.</div>
        )}

        {hints.slice(0, revealedHintIndex + 1).map((hint, index) => (
          <div
            key={index}
            className="rounded border border-[#233046] bg-[#0c1219] p-4 shadow animate-fade-in"
          >
            <h3 className="font-semibold text-blue-300 mb-2">{hint.title}</h3>
            <p className="text-gray-300 whitespace-pre-line">{hint.content}</p>
          </div>
        ))}

        {canRevealMore && (
          <button
            onClick={onRevealNext}
            className="w-full px-3 py-2 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750] text-sm font-medium transition-colors"
          >
            Reveal Next Hint
          </button>
        )}

        {!hintsLoading && hints.length === 0 ? (
          <button
            onClick={() => fetchHints?.()}
            className="w-full px-3 py-2 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750] text-sm font-medium transition-colors"
          >
            Generate Hints
          </button>
        ) : null}
      </div>
    );
  }

  if (activeTab === "Discussions") {
    return <ProblemDiscussions problemId={problemId || problem?.id || problem?._id} />;
  }

  return null;
}

