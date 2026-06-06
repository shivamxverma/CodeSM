import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProblems } from "@/api/api";
import { Search } from "lucide-react";

export default function ProblemPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("A-Z");
  const [nextCursor, setNextCursor] = useState(null);
  const [paginationLoading, setPaginationLoading] = useState(false);

  const RATING_RANGES = {
    Easy: [800, 1200],
    Medium: [1300, 1700],
    Hard: [1800, 3000],
  };

  async function fetchProblems(cursor = "") {
    try {
      if (!cursor) {
        setLoading(true);
      } else {
        setPaginationLoading(true);
      }
      setError("");
      const res = await getAllProblems(10, cursor);
      const { problems: newProblems, nextCursor: newCursor } = res.data.data;
      
      if (!cursor) {
        setProblems(newProblems);
      } else {
        setProblems((prev) => [...prev, ...newProblems]);
      }
      setNextCursor(newCursor);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Could not load problems. Please try again.");
      }
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
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
    let colors = "bg-canvas-soft-2 text-body border-hairline";
    if (d.includes("easy") || d.includes("800") || d.includes("1200")) {
      colors = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15";
    } else if (d.includes("medium") || d.includes("1300") || d.includes("1700")) {
      colors = "bg-warning-soft text-warning-deep border-warning/15";
    } else if (d.includes("hard") || d.includes("1800")) {
      colors = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/15";
    }
    return `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border ${colors}`;
  };

  return (
    <div className="min-h-screen bg-canvas-soft py-10 text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Problems</h1>
            <p className="mt-1 text-sm text-body">Search, filter by difficulty, and sort by rating.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute">
              <Search size={14} aria-hidden="true" />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, tags…"
              className="form-input pl-9"
            />
          </div>

          <div className="flex items-center gap-1 rounded-sm border border-hairline bg-canvas-soft p-1 shadow-2xs">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 rounded-sm py-1 text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer ${difficulty === d
                  ? "bg-canvas text-ink border border-hairline shadow-2xs font-semibold"
                  : "text-body hover:text-ink hover:bg-canvas-soft-2/50"
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
              className="form-input"
            >
              <option value="A-Z">Sort: A–Z</option>
              <option value="Z-A">Sort: Z–A</option>
              <option value="Easiest">Sort: Easiest (low→high rating)</option>
              <option value="Hardest">Sort: Hardest (high→low rating)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-rose-500/20 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-md border border-hairline bg-canvas p-5.5">
                <div className="mb-3 h-5 w-2/3 rounded bg-canvas-soft-2" />
                <div className="mb-6 h-3.5 w-1/3 rounded bg-canvas-soft-2" />
                <div className="h-9 w-24 rounded bg-canvas-soft-2" />
              </div>
            ))}
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="rounded-md border border-hairline bg-canvas p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 size-10 rounded-full bg-canvas-soft-2 border border-hairline/60 flex items-center justify-center text-mute" />
            <div className="text-base font-semibold text-ink">No problems found</div>
            <div className="mt-1.5 text-sm text-body">Try changing filters or create a new problem.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSorted.map((item) => {
              const rating = getRating(item);
              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-md border border-hairline bg-canvas p-5.5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm duration-200"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold leading-tight text-ink group-hover:text-link transition-colors duration-150">
                      {item?.title || "Untitled"}
                    </h2>
                    <span className={diffPill(item?.difficulty)}>
                      {item?.difficulty || "—"}
                    </span>
                  </div>
                  <div className="mb-4 font-mono text-[10px] text-mute">
                    {Number.isFinite(rating) ? `Rating: ${rating}` : "Rating: —"}
                  </div>
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/problems/${item.id}`}
                      className="inline-flex items-center gap-1 rounded-sm border border-hairline bg-canvas hover:bg-canvas-soft-2 px-3 py-1.5 text-xs font-semibold text-ink transition-colors h-8 cursor-pointer"
                    >
                      Solve Now
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-0.5">
                        <path d="M9 18l6-6-6-6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    {Array.isArray(item?.tags) && item.tags.length > 0 ? (
                      <div className="hidden flex-wrap gap-1 sm:flex max-w-[60%] justify-end">
                        {item.tags.filter(Boolean).slice(0, 2).map((t) => {
                          const cleaned = formatTag(t);
                          return (
                            <span
                              key={t}
                              className="rounded-sm bg-canvas-soft-2 border border-hairline/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-mute"
                            >
                              {cleaned}
                            </span>
                          );
                        })}
                        {item.tags.length > 2 && (
                          <span className="text-[9px] font-medium text-mute self-center">+{item.tags.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-mute" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {nextCursor && !loading && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => fetchProblems(nextCursor)}
              disabled={paginationLoading}
              className="btn-secondary h-10 px-8 text-sm font-semibold tracking-wide"
            >
              {paginationLoading ? (
                <>
                  <div className="size-3.5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                  Loading…
                </>
              ) : (
                "Load More Problems"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
