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
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-lg text-muted-foreground">Loading Contest...</div>
      </div>
    );
  }

  const getVisibilityClasses = (visibility) => {
    return visibility === "public"
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
      : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300";
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link to="/contests" className="text-sm text-primary hover:opacity-80 transition-opacity">
            &larr; Back to Contests
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
              <h1 className="text-4xl font-bold leading-tight text-foreground">{contest.title}</h1>
              <p className="mt-4 text-muted-foreground whitespace-pre-wrap">
                {contest.description || "No description provided for this contest."}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Problems</h2>
              <div className="space-y-3">
                {["A", "B", "C", "D"].map((p, index) => (
                  <div
                    key={p}
                    className="flex items-center justify-between rounded-lg bg-card border border-border p-4 hover:bg-muted transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{`Problem ${p}: The Two Towers`}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Difficulty: {index % 2 === 0 ? "Easy" : "Medium"}
                      </div>
                    </div>
                    <span className="text-sm font-mono bg-muted text-foreground px-3 py-1 rounded border border-border">
                      100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-card text-card-foreground rounded-xl border border-border p-5 shadow-sm">
              <button className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 text-base font-semibold hover:opacity-90 transition-all">
                Enter Contest
              </button>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium px-2 py-1 rounded-md text-xs bg-muted text-foreground border border-border">
                    Upcoming
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Visibility</span>
                  <span
                    className={`font-medium px-2 py-1 rounded-md text-xs border ${getVisibilityClasses(
                      contest.visibility
                    )}`}
                  >
                    {contest.visibility}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Starts On</span>
                  <span className="font-medium text-foreground">
                    {new Date(contest.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{contest.durationMinutes} minutes</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <nav className="flex flex-col space-y-2">
                  <a
                    href="#"
                    className="font-medium text-foreground hover:text-primary bg-muted px-3 py-2 rounded-md transition-colors"
                  >
                    Leaderboard
                  </a>
                  <a
                    href="#"
                    className="font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-md transition-colors"
                  >
                    Submissions
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}