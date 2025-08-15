import React, { useEffect, useMemo, useState } from "react";
import { getContest, registerContest, getLeaderboard } from "../api/api.js";
import useContestClock from "../hooks/useContestClock";
import { Link, useParams } from "react-router-dom";

function msFmt(ms){
  if(ms == null) return "--:--:--";
  const s = Math.floor(ms/1000);
  const h = Math.floor(s/3600).toString().padStart(2,"0");
  const m = Math.floor((s%3600)/60).toString().padStart(2,"0");
  const ss = (s%60).toString().padStart(2,"0");
  return `${h}:${m}:${ss}`;
}

export default function ContestLobbyAndRun(){
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [err, setErr] = useState("");
  const [joining, setJoining] = useState(false);
  const [board, setBoard] = useState([]);

  const { phase, toStartMs, toEndMs } = useContestClock(id);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getContest(id);
        setContest(data.data);
      } catch(e) { setErr("Failed to load contest"); }
    })();
  }, [id]);

  useEffect(() => {
    let t;
    async function pull(){
      try{
        const { data } = await getLeaderboard(id);
        setBoard(data.message || []);
      }catch{}
    }
    if (phase === "running" || phase === "ended"){
      pull();
      t = setInterval(pull, 5000);
    }
    return () => clearInterval(t);
  }, [id, phase]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await registerContest(id);
      const { data } = await getContest(id);
      setContest(data.message);
    } catch(e) {
      setErr(e?.response?.data?.message || "Failed to register");
    } finally {
      setJoining(false);
    }
  };

  const isRegistered = useMemo(() => {
    return contest?.isRegistered === true;
  }, [contest]);

  const headerBadge =
    phase === "before" ? "bg-amber-900/40 border-amber-800 text-amber-200" :
    phase === "running" ? "bg-emerald-900/40 border-emerald-800 text-emerald-200" :
    phase === "ended" ? "bg-slate-800 border-slate-600 text-slate-200" : "bg-slate-800/60 border-slate-700";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{contest?.title || "Contest"}</h1>
            <div className="mt-1 text-xs text-slate-400">
              {contest && new Date(contest.startTime).toLocaleString()} • {contest?.durationMinutes} min
            </div>
          </div>
          <div className={`text-xs px-2 py-1 rounded border ${headerBadge}`}>
            {phase === "before" && <>Starts in {msFmt(toStartMs)}</>}
            {phase === "running" && <>Ends in {msFmt(toEndMs)}</>}
            {phase === "ended" && <>Ended</>}
          </div>
        </div>

        {err && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm">{err}</div>}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-sm text-slate-300 whitespace-pre-line">{contest?.description || "—"}</p>
              {phase === "before" && (
                <div className="mt-3">
                  {isRegistered ? (
                    <span className="text-xs px-2 py-1 rounded bg-emerald-900/30 border border-emerald-800 text-emerald-200">Registered</span>
                  ) : (
                    <button onClick={handleJoin} disabled={joining}
                      className="rounded bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm">
                      {joining ? "Joining..." : "Register"}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Problems</h2>
                {phase !== "running" && <span className="text-xs text-slate-400">Locked until start</span>}
              </div>
              <div className="mt-3 grid gap-2">
                {(contest?.problems || []).map((p, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-white/10 px-2 py-1 text-xs">{p.index || String.fromCharCode(65+i)}</span>
                      <div className="text-sm">{p.problem?.title || "Problem"}</div>
                    </div>
                    {phase === "running" ? (
                      <Link to={`/problems/${p.problem?._id}`} className="text-xs rounded bg-indigo-600 px-2 py-1">Open</Link>
                    ) : (
                      <button disabled className="text-xs rounded bg-slate-800 px-2 py-1 opacity-60 cursor-not-allowed">Open</button>
                    )}
                  </div>
                ))}
                {!contest?.problems?.length && <div className="text-sm text-slate-400">No problems yet.</div>}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Leaderboard</h2>
              <span className="text-xs text-slate-400">{phase === "running" ? "Live" : "Final"}</span>
            </div>
            <div className="mt-3">
              <div className="grid grid-cols-4 text-xs text-slate-400 px-2">
                <div>#</div><div className="col-span-2">User</div><div className="text-right">Score</div>
              </div>
              <div className="mt-1 divide-y divide-white/10">
                {board.map((row, i)=>(
                  <div key={row.user._id || i} className="grid grid-cols-4 px-2 py-2 text-sm">
                    <div>{i+1}</div>
                    <div className="col-span-2 truncate">{row.user.username || row.user.email}</div>
                    <div className="text-right">{row.score}</div>
                  </div>
                ))}
                {!board.length && <div className="text-xs text-slate-400 px-2 py-4">No submissions yet.</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Rules: No plagiarism. Submissions after end are ignored. First AC counts; wrong attempts add penalties.
        </div>
      </div>
    </div>
  );
}
