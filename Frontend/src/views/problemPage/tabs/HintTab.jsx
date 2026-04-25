export function HintTab({
  hints,
  hintsLoading,
  hintsError,
  revealedHintIndex,
  setRevealedHintIndex,
  problemId,
}) {

  return (
    <div className="space-y-4">
      {hintsLoading && <div className="text-sm text-gray-400">🧠 Generating hints for you...</div>}
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

      {!hintsLoading && revealedHintIndex < hints.length - 1 && (
        <button
          type="button"
          onClick={() => {
            setRevealedHintIndex((prev) => prev + 1);
          }}
          className="w-full px-3 py-2 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750] text-sm font-medium transition-colors"
        >
          Reveal Next Hint
        </button>
      )}
    </div>
  );
}
