import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getContest } from "../api/api.js"; 

export default function ContestPage() {
  const [contest, setContest] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getContest(id);
        setContest(data.data);
      } catch (error) {
        console.error("Failed to fetch contest:", error);
      }
    })();
  }, [id]);

  if (!contest) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="text-lg">Loading Contest...</div>
      </div>
    );
  }

  const getVisibilityClasses = (visibility) => {
    return visibility === "public"
      ? "bg-emerald-900/50 border-emerald-700 text-emerald-300"
      : "bg-amber-900/50 border-amber-700 text-amber-300";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link to="/contests" className="text-sm text-indigo-400 hover:text-indigo-300">
            &larr; Back to Contests
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h1 className="text-4xl font-bold leading-tight">{contest.title}</h1>
              <p className="mt-4 text-slate-300 whitespace-pre-wrap">
                {contest.description || "No description provided for this contest."}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Problems</h2>
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((p, index) => (
                  <div key={p} className="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 p-4 hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="font-semibold">{`Problem ${p}: The Two Towers`}</div>
                      <div className="text-xs text-slate-400 mt-1">Difficulty: {index % 2 === 0 ? 'Easy' : 'Medium'}</div>
                    </div>
                    <span className="text-sm font-mono bg-slate-800 px-3 py-1 rounded">100</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-slate-900 rounded-xl border border-slate-800 p-5">
              <button className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold hover:bg-indigo-500 transition-all">
                Enter Contest
              </button>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status</span>
                  <span className="font-medium px-2 py-1 rounded-md text-xs bg-slate-800">Upcoming</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Visibility</span>
                  <span className={`font-medium px-2 py-1 rounded-md text-xs border ${getVisibilityClasses(contest.visibility)}`}>
                    {contest.visibility}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Starts On</span>
                  <span className="font-medium text-slate-200">{new Date(contest.startTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-medium text-slate-200">{contest.durationMinutes} minutes</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-800">
                <nav className="flex flex-col space-y-2">
                    <a href="#" className="font-medium text-slate-300 hover:text-white bg-slate-800/50 px-3 py-2 rounded-md">Leaderboard</a>
                    <a href="#" className="font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 px-3 py-2 rounded-md">Submissions</a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}