import React from "react";

export default function ExecutionConsole({
  consoleRef,
  executionPanel,
  testcaseTab,
  setTestcaseTab,
  onClear,
}) {
  return (
    <div className="bg-[#0f141b] border-t border-[#1b2330] flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="px-5 py-2.5 text-xs flex items-center justify-between border-b border-[#1b2330]/90">
        <span className="font-semibold text-gray-200 tracking-wide">Console</span>
        <button
          type="button"
          className="text-[11px] px-2.5 py-1 rounded-md border border-[#2a3750] text-gray-400 hover:bg-[#162134] hover:text-gray-200 transition-colors"
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      <div
        ref={consoleRef}
        className="flex-1 overflow-y-auto px-5 py-4 bg-[#080b10] scroll-smooth [overscroll-behavior:contain] [scrollbar-gutter:stable]"
      >
        {!executionPanel && (
          <p className="text-sm text-gray-500 font-mono leading-relaxed">
            Run (sample tests) or Submit to see a fresh result here.
          </p>
        )}

        {executionPanel?.type === "loading" && (
          <p className="text-sm text-sky-400/95 animate-pulse font-medium">
            {executionPanel.message}
          </p>
        )}

        {executionPanel?.type === "error" && (
          <p className="text-sm text-red-400 font-mono whitespace-pre-wrap leading-relaxed">
            {executionPanel.message}
          </p>
        )}

        {executionPanel?.type === "compile" && (
          <ul className="space-y-2">
            {executionPanel.errors.map((e, i) => (
              <li
                key={i}
                className="text-sm text-red-200 font-mono bg-[#1a0c10] border border-red-900/35 rounded-lg px-3 py-2.5 leading-relaxed"
              >
                {e.message}
                {e.line != null ? (
                  <span className="text-red-400/80"> (line {e.line})</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {executionPanel?.type === "submit_results" && (() => {
          const { details } = executionPanel;
          const v = (details.verdict || details.status || "").toLowerCase();
          const isAccepted = v === "accepted" || v === "correct answer";
          const isError = !isAccepted && !v.includes("pending") && !v.includes("running");
          const colorClass = isAccepted 
            ? "text-emerald-400 bg-emerald-950/20 border-emerald-800/40" 
            : isError 
              ? "text-red-400 bg-red-950/20 border-red-800/40" 
              : "text-amber-400 bg-amber-950/20 border-amber-800/40";
          
          const titleColor = isAccepted ? "text-emerald-400" : isError ? "text-red-400" : "text-amber-400";

          return (
            <div className="space-y-5 py-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className={`p-4 rounded-xl border ${colorClass} flex flex-col gap-4 shadow-xl shadow-black/20 backdrop-blur-sm`}>
                <div className="flex items-center gap-2">
                  <h3 className={`text-[19px] font-bold ${titleColor} capitalize tracking-tight`}>
                    {details.verdict || details.status || "Unknown"}
                  </h3>
                  {isAccepted && <span className="text-xl ml-1">🚀</span>}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1 flex-1 bg-black/40 p-3 rounded-lg border border-white/5 transition-colors hover:bg-black/50">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Testcases</span>
                    <span className="text-gray-200 font-mono text-sm font-semibold">
                      <span className={details.passedTestcases === details.totalTestcases && details.totalTestcases > 0 ? "text-emerald-400" : "text-gray-200"}>
                        {details.passedTestcases ?? 0}
                      </span>
                      <span className="text-gray-600 mx-1.5 font-bold">/</span>
                      {details.totalTestcases ?? 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 flex-1 bg-black/40 p-3 rounded-lg border border-white/5 transition-colors hover:bg-black/50">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Time</span>
                    <span className="text-gray-200 font-mono text-sm font-semibold">{details.timeTaken != null ? `${details.timeTaken} ms` : '—'}</span>
                  </div>

                  <div className="flex flex-col gap-1 flex-1 bg-black/40 p-3 rounded-lg border border-white/5 transition-colors hover:bg-black/50">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Memory</span>
                    <span className="text-gray-200 font-mono text-sm font-semibold">{details.memoryTaken != null ? `${(details.memoryTaken / 1024).toFixed(1)} KB` : '—'}</span>
                  </div>

                  <div className="flex flex-col gap-1 flex-1 bg-black/40 p-3 rounded-lg border border-white/5 transition-colors hover:bg-black/50">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Language</span>
                    <span className="text-gray-200 font-mono text-sm font-semibold">{details.language || '—'}</span>
                  </div>
                </div>
              </div>

              {(details.stdout?.trim() || details.stderr?.trim()) && (
                <div className="space-y-4 px-1">
                  {details.stdout?.trim() && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 ml-0.5">
                        <span className="bg-gray-800/50 px-2 py-1 rounded border border-gray-700/50">Standard Output</span>
                      </div>
                      <pre className="text-gray-300 bg-[#0c1219] border border-[#233046] rounded-xl p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto shadow-inner leading-relaxed">
                        {details.stdout.trim()}
                      </pre>
                    </div>
                  )}
                  {details.stderr?.trim() && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-2 ml-0.5">
                        <span className="bg-red-950/40 text-red-400 px-2 py-1 rounded border border-red-900/50">Standard Error</span>
                      </div>
                      <pre className="text-red-200/90 bg-[#1a0e0e] border border-red-900/40 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto shadow-inner leading-relaxed">
                        {details.stderr.trim()}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {executionPanel?.type === "tests" && (
          <div className="space-y-3">
            {executionPanel.items.length > 0 ? (
              <>
                <div className="flex gap-0.5 border-b border-[#233046] overflow-x-auto -mx-1 px-1 pb-px">
                  {executionPanel.items.map((tc, i) => {
                    const errStr = String(tc?.error ?? "");
                    const tle = tc?.isTLE || /exited|timeout/i.test(errStr);
                    const passed = !!tc?.isPassed && !tle;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTestcaseTab(i)}
                        className={`shrink-0 px-3 py-2 text-xs font-semibold rounded-t-md border border-b-0 transition-colors ${
                          testcaseTab === i
                            ? "bg-[#0f141b] border-[#2f4a63] text-gray-100 -mb-px relative z-[1]"
                            : "bg-transparent border-transparent text-gray-500 hover:text-gray-300"
                        } ${
                          tle
                            ? testcaseTab === i
                              ? "text-amber-300"
                              : "text-amber-500/85"
                            : passed
                              ? testcaseTab === i
                                ? "text-emerald-300"
                                : "text-emerald-500/85"
                              : testcaseTab === i
                                ? "text-red-300"
                                : "text-red-400/85"
                        }`}
                      >
                        Case {i + 1}
                        <span className="ml-1 opacity-90">
                          {tle ? "· TLE" : passed ? "· AC" : "· WA"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {executionPanel.items.map((tc, i) => {
                  if (i !== testcaseTab) return null;
                  const errStr = String(tc?.error ?? "");
                  const tle = tc?.isTLE || /exited|timeout/i.test(errStr);
                  const passed = !!tc?.isPassed && !tle;
                  const expected = tc.expected ?? tc.output ?? "—";
                  const actualRaw = tc.actual ?? tc.output ?? "";
                  const actualDisplay = tle
                    ? errStr || "—"
                    : actualRaw !== "" && actualRaw != null
                      ? String(actualRaw)
                      : errStr || "—";

                  return (
                    <div key={i} className="space-y-3 text-sm">
                      <div
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                          tle
                            ? "bg-amber-950/45 border-amber-800/70 text-amber-300"
                            : passed
                              ? "bg-emerald-950/40 border-emerald-800/70 text-emerald-300"
                              : "bg-red-950/35 border-red-900/55 text-red-300"
                        }`}
                      >
                        {tle ? "Time limit exceeded" : passed ? "Passed" : "Failed"}
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                          Input
                        </div>
                        <pre className="text-gray-200 bg-[#0c1219] border border-[#233046] rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                          {tc.input != null && tc.input !== "" ? String(tc.input) : "—"}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                          Expected output
                        </div>
                        <pre className="text-gray-200 bg-[#0c1219] border border-[#233046] rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                          {expected !== "—" ? String(expected) : "—"}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                          Your output (actual)
                        </div>
                        <pre
                          className={`rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed border ${
                            passed && !tle
                              ? "bg-emerald-950/25 border-emerald-900/40 text-emerald-100"
                              : "bg-red-950/20 border-red-900/45 text-red-100"
                          }`}
                        >
                          {actualDisplay}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : null}

            {(executionPanel.stdout?.trim() || executionPanel.stderr?.trim()) && (
              <div
                className={`space-y-2 ${
                  executionPanel.items.length > 0 ? "pt-2 border-t border-[#233046]/80" : ""
                }`}
              >
                {executionPanel.stdout?.trim() ? (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      stdout
                    </div>
                    <pre className="text-gray-300 bg-[#0c1219] border border-[#233046] rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                      {executionPanel.stdout.trim()}
                    </pre>
                  </div>
                ) : null}
                {executionPanel.stderr?.trim() ? (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      stderr
                    </div>
                    <pre className="text-amber-100/90 bg-[#1a1508] border border-amber-900/35 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                      {executionPanel.stderr.trim()}
                    </pre>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

