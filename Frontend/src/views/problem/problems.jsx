import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProblems } from "@/api/api";
import { usePostHog } from "@posthog/react";

export default function ProblemPage() {
  const posthog = usePostHog();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("A-Z");

  const RATING_RANGES = {
    Easy: [800, 1200],
    Medium: [1300, 1700],
    Hard: [1800, 3000],
  };

  useEffect(() => {
    const controller = new AbortController();
    async function fetchProblems() {
      try {
        posthog.capture("problem_page_load");
        setLoading(true);
        setError("");
        const res = await getAllProblems();
        const problems = res.data.message;
        // console.log(res);
        setProblems(Array.isArray(problems) ? problems : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Could not load problems. Please try again.");
          setProblems([]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
    return () => controller.abort();
  }, []);

  const getRating = (p) => {
    const raw = p?.difficulty;
    if (typeof raw === "number") return raw;
    if (raw == null) return NaN;
    const cleaned = String(raw).trim();
    const match = cleaned.match(/-?\d+(\.\d+)?/);
    const num = match ? Number(match[0]) : NaN;
    return Number.isFinite(num) ? num : NaN;
  };

  const filteredSorted = useMemo(() => {
    let list = [...problems];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const title = (p?.title || "").toLowerCase();
        const desc = (p?.description || "").toLowerCase();
        const tags = Array.isArray(p?.tags) ? p.tags.join(" ").toLowerCase() : "";
        return title.includes(q) || desc.includes(q) || tags.includes(q);
      });
    }

    if (difficulty !== "All") {
      const [min, max] = RATING_RANGES[difficulty] || [];
      list = list.filter((p) => {
        const r = getRating(p);
        return Number.isFinite(r) && r >= min && r <= max;
      });
    }

    const cmpAZ = (a, b) => (a?.title || "").localeCompare(b?.title || "");
    const cmpZA = (a, b) => (b?.title || "").localeCompare(a?.title || "");
    const cmpRatingAsc = (a, b) => {
      const ra = getRating(a), rb = getRating(b);
      if (!Number.isFinite(ra) && !Number.isFinite(rb)) return 0;
      if (!Number.isFinite(ra)) return 1;
      if (!Number.isFinite(rb)) return -1;
      return ra - rb;
    };
    const cmpRatingDesc = (a, b) => {
      const ra = getRating(a), rb = getRating(b);
      if (!Number.isFinite(ra) && !Number.isFinite(rb)) return 0;
      if (!Number.isFinite(ra)) return 1;
      if (!Number.isFinite(rb)) return -1;
      return rb - ra;
    };

    switch (sortBy) {
      case "A-Z":
        list.sort(cmpAZ);
        break;
      case "Z-A":
        list.sort(cmpZA);
        break;
      case "Easiest":
        list.sort(cmpRatingAsc);
        break;
      case "Hardest":
        list.sort(cmpRatingDesc);
        break;
      default:
        break;
    }

    return list;
  }, [problems, search, difficulty, sortBy]);

  const diffPill = (d) => {
    const base = "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs";
    return `${base} bg-slate-500/10 text-slate-300 ring-1 ring-slate-400/20`;
  };

  return (
    <div className="min-h-screen bg-background py-10 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
            <p className="mt-1 text-sm text-slate-400">Search, filter by difficulty, and sort by rating.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, tags…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-9 py-2 text-sm text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs sm:text-sm transition ${difficulty === d ? "bg-white/10 text-white ring-1 ring-white/10" : "text-slate-300 hover:bg-white/5"
                  }`}
                title={
                  d === "Easy"
                    ? "800–1200"
                    : d === "Medium"
                      ? "1300–1700"
                      : d === "Hard"
                        ? "1800–3000"
                        : "No rating filter"
                }
              >
                {d}
              </button>
            ))}
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
            >
              <option value="A-Z">Sort: A–Z</option>
              <option value="Z-A">Sort: Z–A</option>
              <option value="Easiest">Sort: Easiest (low→high rating)</option>
              <option value="Hardest">Sort: Hardest (high→low rating)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 h-5 w-2/3 rounded bg-white/10" />
                <div className="mb-6 h-3 w-1/3 rounded bg-white/10" />
                <div className="h-10 w-28 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="mx-auto mb-3 size-12 rounded-full bg-white/10" />
            <div className="text-lg font-medium">No problems found</div>
            <div className="mt-1 text-sm text-slate-400">Try changing filters or create a new one.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSorted.map((item) => {
              const rating = getRating(item);
              return (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-indigo-500/10 blur-2xl transition group-hover:bg-indigo-400/20" />
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold leading-tight text-white">
                      {item?.title || "Untitled"}
                    </h2>
                    <span className={diffPill(item?.difficulty)}>
                      {item?.difficulty || "—"}
                    </span>
                  </div>
                  <div className="mb-2 text-xs text-slate-400">
                    {Number.isFinite(rating) ? `Rating: ${rating}` : "Rating: —"}
                  </div>
                  {item?.description ? (
                    <p className="mb-6 text-sm text-slate-300">
                      {String(item.description).length > 120
                        ? `${String(item.description).slice(0, 120)}…`
                        : String(item.description)}
                    </p>
                  ) : (
                    <p className="mb-6 text-sm text-slate-400">No description provided.</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/problems/${item._id}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Solve Now
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1">
                        <path d="M9 18l6-6-6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    {Array.isArray(item?.tags) && item.tags.length > 0 ? (
                      <div className="hidden gap-1 sm:flex">
                        {item.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded-lg bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300 ring-1 ring-white/10"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500"> </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
