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

  const formatTag = (t) => {
    if (typeof t !== "string") return t;
    return t.replace(/['"]+/g, "").trim();
  };

  const diffPill = (difficulty) => {
    const d = String(difficulty || "").toLowerCase();
    let colors = "bg-muted text-muted-foreground ring-border";
    if (d.includes("easy") || d.includes("800") || d.includes("1200")) {
      colors = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20";
    } else if (d.includes("medium") || d.includes("1300") || d.includes("1700")) {
      colors = "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20";
    } else if (d.includes("hard") || d.includes("1800")) {
      colors = "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20";
    }
    return `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${colors}`;
  };

  return (
    <div className="min-h-screen bg-background py-10 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Problems</h1>
            <p className="mt-1 text-sm text-muted-foreground">Search, filter by difficulty, and sort by rating.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔎</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, tags…"
              className="w-full rounded-xl border border-border bg-card px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs sm:text-sm transition ${difficulty === d
                  ? "bg-primary text-primary-foreground ring-1 ring-primary/30"
                  : "text-muted-foreground hover:bg-muted"
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
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="A-Z">Sort: A–Z</option>
              <option value="Z-A">Sort: Z–A</option>
              <option value="Easiest">Sort: Easiest (low→high rating)</option>
              <option value="Hardest">Sort: Hardest (high→low rating)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 h-5 w-2/3 rounded bg-muted" />
                <div className="mb-6 h-3 w-1/3 rounded bg-muted" />
                <div className="h-10 w-28 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <div className="mx-auto mb-3 size-12 rounded-full bg-muted" />
            <div className="text-lg font-medium text-foreground">No problems found</div>
            <div className="mt-1 text-sm text-muted-foreground">Try changing filters or create a new one.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSorted.map((item) => {
              const rating = getRating(item);
              return (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" />
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold leading-tight text-foreground">
                      {item?.title || "Untitled"}
                    </h2>
                    <span className={diffPill(item?.difficulty)}>
                      {item?.difficulty || "—"}
                    </span>
                  </div>
                  <div className="mb-2 text-xs text-muted-foreground">
                    {Number.isFinite(rating) ? `Rating: ${rating}` : "Rating: —"}
                  </div>
                  {item?.description ? (
                    <p className="mb-6 text-sm text-muted-foreground">
                      {String(item.description).length > 120
                        ? `${String(item.description).slice(0, 120)}…`
                        : String(item.description)}
                    </p>
                  ) : (
                    <p className="mb-6 text-sm text-muted-foreground">No description provided.</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/problems/${item._id}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
                    >
                      Solve Now
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1">
                        <path d="M9 18l6-6-6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    {Array.isArray(item?.tags) && item.tags.length > 0 ? (
                      <div className="hidden flex-wrap gap-1.5 sm:flex">
                        {item.tags.filter(Boolean).slice(0, 3).map((t) => {
                          const cleaned = formatTag(t);
                          return (
                            <span
                              key={t}
                              className="rounded-lg bg-secondary/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground ring-1 ring-border/50"
                            >
                              {cleaned}
                            </span>
                          );
                        })}
                        {item.tags.length > 3 && (
                          <span className="text-[10px] font-medium text-muted-foreground">+{item.tags.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground" />
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
