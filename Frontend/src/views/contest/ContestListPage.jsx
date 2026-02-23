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
          <h1 className="text-2xl font-bold text-foreground">Contests</h1>
        </div>
        <div className="mt-6 grid gap-3">
          {contests.map((c) => (
            <Link
              key={c._id}
              to={`/contest/${c._id}`}
              className="rounded-xl border border-border bg-card p-4 hover:bg-muted transition-colors block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-foreground">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(c.startTime).toLocaleString()} · {c.durationMinutes} min
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded border ${c.visibility === "public"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300"
                    }`}
                >
                  {c.visibility}
                </span>
              </div>
              {c.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
              )}
            </Link>
          ))}
          {!contests.length && (
            <div className="text-muted-foreground text-sm">No contests yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
