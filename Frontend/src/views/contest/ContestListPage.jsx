import React, { useEffect, useState } from "react";
import { listContests } from "../../api/api.js";
import { Link } from "react-router-dom";
import { usePostHog } from "@posthog/react";

export default function ContestListPage() {
  const [contests, setContests] = useState([]);
  const posthog = usePostHog();

  useEffect(() => {
    (async () => {
      const { data } = await listContests();
      setContests(data.data || []);
      posthog.capture("contest_list_viewed", { count: data.data?.length });
    })();
  }, [posthog]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Contests</h1>
        </div>
        <div className="mt-6 grid gap-3">
          {contests.map((c) => (
            <Link key={c._id} to={`/contest/${c._id}`} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{c.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{new Date(c.startTime).toLocaleString()} · {c.durationMinutes} min</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${c.visibility === "public" ? "bg-emerald-900/30 border-emerald-800 text-emerald-300" : "bg-amber-900/30 border-amber-800 text-amber-300"
                  }`}>{c.visibility}</span>
              </div>
              {c.description && <p className="mt-2 text-sm text-slate-300 line-clamp-2">{c.description}</p>}
            </Link>
          ))}
          {!contests.length && <div className="text-slate-400 text-sm">No contests yet.</div>}
        </div>
      </div>
    </div>
  );
}
