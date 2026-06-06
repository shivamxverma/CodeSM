import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";
import { getUserDashboardStats } from "@/api/api";
import {
  Trophy, Code2, CheckCircle2, Clock, Cpu,
  ChevronRight, BarChart3, User, Zap, BookOpen,
  MessageSquare, Target, TrendingUp, Star
} from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────
const VERDICT_META = {
  ACCEPTED:             { label: "Accepted",    color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" },
  WRONG_ANSWER:         { label: "Wrong Answer",color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20",    dot: "bg-rose-500" },
  TIME_LIMIT_EXCEEDED:  { label: "TLE",         color: "text-warning-deep dark:text-warning",   bg: "bg-warning-soft border-warning/20",   dot: "bg-warning" },
  MEMORY_LIMIT_EXCEEDED:{ label: "MLE",         color: "text-purple-600 dark:text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20", dot: "bg-purple-500" },
  RUNTIME_ERROR:        { label: "Runtime Err", color: "text-orange-600 dark:text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20", dot: "bg-orange-500" },
  COMPILE_ERROR:        { label: "Compile Err", color: "text-body dark:text-mute",   bg: "bg-canvas-soft-2 border-hairline",  dot: "bg-hairline-strong" },
  PENDING:              { label: "Pending",     color: "text-link",     bg: "bg-link-bg-soft border-link/10",      dot: "bg-link" },
  RUNNING:              { label: "Running",     color: "text-link",     bg: "bg-link-bg-soft border-link/10",      dot: "bg-link" },
  FAILED:               { label: "Failed",      color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20",    dot: "bg-rose-500" },
};

const DIFF_META = {
  EASY:   { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  MEDIUM: { color: "text-warning-deep dark:text-warning",   bg: "bg-warning-soft border-warning/20" },
  HARD:   { color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20" },
};

const LANG_LABELS = { CPP: "C++", JAVA: "Java", PYTHON: "Python", JAVASCRIPT: "JS", C: "C", CSHARP: "C#" };

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Animated counter ─────────────────────────────────────────
function Counter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

// ── Donut chart ───────────────────────────────────────────────
function DonutChart({ easy, medium, hard, total }) {
  const R = 52, C = 2 * Math.PI * R;
  const eP = total ? (easy / total) * C : 0;
  const mP = total ? (medium / total) * C : 0;
  const hP = total ? (hard / total) * C : 0;
  const gap = 2;

  const Segment = ({ offset, len, color }) =>
    len > gap ? (
      <circle
        cx="64" cy="64" r={R}
        fill="none" strokeWidth="10"
        stroke={color}
        strokeDasharray={`${len - gap} ${C - (len - gap)}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    ) : null;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg viewBox="0 0 128 128" className="w-32 h-32 -rotate-90">
        <circle cx="64" cy="64" r={R} fill="none" strokeWidth="10" className="stroke-canvas-soft-2" />
        <Segment offset={0}       len={eP}           color="var(--color-cyan)" />
        <Segment offset={eP}      len={mP}           color="var(--color-warning)" />
        <Segment offset={eP + mP} len={hP}           color="var(--color-error)" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold tracking-tight text-ink font-mono">{total}</span>
        <span className="font-caption-mono text-[9px] text-mute leading-none mt-0.5">Solved</span>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, loading }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-hairline bg-canvas p-5 flex flex-col gap-3 shadow-xs hover:border-hairline-strong transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-sm bg-canvas-soft-2 border border-hairline/40 text-ink">
          <Icon size={16} className="aria-hidden:true" />
        </div>
        <span className="font-mono text-[10px] text-mute font-medium">{sub}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-ink font-mono tracking-tight">
          {loading ? <div className="h-7 w-12 rounded bg-canvas-soft-2 animate-pulse" /> : <Counter target={value} />}
        </div>
        <div className="font-caption-mono text-[10px] text-mute mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ── Submission row ────────────────────────────────────────────
function SubRow({ sub }) {
  const v = VERDICT_META[sub.status] || VERDICT_META.PENDING;
  const d = DIFF_META[sub.problem?.difficulty] || {};
  return (
    <Link
      to={`/problems/${sub.problem?.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-canvas-soft transition-colors duration-150 group border-b border-hairline last:border-0"
    >
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate group-hover:text-link transition-colors duration-150">
          {sub.problem?.title || "Unknown Problem"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border ${d.bg || ""} ${d.color || "text-mute"}`}>
            {sub.problem?.difficulty || "—"}
          </span>
          <span className="text-[10px] font-mono text-mute">{LANG_LABELS[sub.language] || sub.language}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className={`text-xs font-semibold ${v.color}`}>{v.label}</span>
        <span className="text-[10px] font-mono text-mute">{timeAgo(sub.createdAt)}</span>
      </div>
      <ChevronRight size={14} className="text-mute group-hover:text-ink transition-colors shrink-0" />
    </Link>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded bg-canvas-soft-2 ${className}`} />;
}

// ── Main ──────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserDashboardStats();
        setStats(res.data.data);
      } catch {
        setStats({ totalSubmissions: 0, totalSolved: 0, solvedByDifficulty: { easy: 0, medium: 0, hard: 0 }, recentSubmissions: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const solved = stats?.solvedByDifficulty ?? { easy: 0, medium: 0, hard: 0 };
  const totalSolved = stats?.totalSolved ?? 0;
  const acceptRate = stats?.totalSubmissions
    ? Math.round((totalSolved / stats.totalSubmissions) * 100)
    : 0;

  const initials = user?.username?.slice(0, 2)?.toUpperCase() || "US";

  return (
    <div className="min-h-screen bg-canvas-soft text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-12 w-12 rounded-sm bg-primary text-primary-foreground font-semibold text-lg items-center justify-center shadow-sm">
                {initials}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink leading-none">
                Welcome back, {user?.username || "Coder"} 👋
              </h1>
              <p className="text-xs text-body mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-link/10 bg-link-bg-soft px-3 py-1 text-xs font-semibold text-link">
              <span className="h-1.5 w-1.5 rounded-full bg-link animate-pulse" />
              {user?.role || "USER"}
            </span>
            <Link
              to="/problems"
              className="px-4 py-1.5 text-xs font-semibold rounded-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center h-8 cursor-pointer gap-1.5"
            >
              <Zap size={13} /> Solve Now
            </Link>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={CheckCircle2} label="Problems Solved"   value={totalSolved}               sub="all time"  loading={loading} />
          <StatCard icon={Code2}        label="Total Submissions" value={stats?.totalSubmissions??0} sub="attempts"   loading={loading} />
          <StatCard icon={TrendingUp}   label="Accept Rate"       value={acceptRate}                 sub="percent"   loading={loading} />
          <StatCard icon={Star}         label="Hard Solved"        value={solved.hard}                sub="problems"  loading={loading} />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left — Progress + Recent submissions */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Solved by difficulty */}
            <div className="rounded-md border border-hairline bg-canvas p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={15} className="text-mute" />
                <h2 className="text-sm font-semibold tracking-tight text-ink">Solved by Difficulty</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {loading ? (
                  <Skeleton className="w-32 h-32 rounded-full shrink-0" />
                ) : (
                  <DonutChart easy={solved.easy} medium={solved.medium} hard={solved.hard} total={totalSolved} />
                )}
                <div className="flex-1 w-full space-y-3.5">
                  {[
                    { label: "Easy",   count: solved.easy,   color: "bg-cyan", text: "text-emerald-600 dark:text-emerald-400", total: 100 },
                    { label: "Medium", count: solved.medium, color: "bg-warning",   text: "text-warning-deep dark:text-warning",   total: 100 },
                    { label: "Hard",   count: solved.hard,   color: "bg-rose-500",    text: "text-rose-600 dark:text-rose-400",    total: 100 },
                  ].map(({ label, count, color, text, total }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={`font-semibold ${text}`}>{label}</span>
                        <span className="font-mono text-mute">
                          {loading ? "—" : count} <span className="opacity-50">/ {total}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-canvas-soft-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color} transition-all duration-1000`}
                          style={{ width: loading ? "0%" : `${Math.min((count / total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="rounded-md border border-hairline bg-canvas p-6 shadow-xs flex-1">
              <div className="flex items-center justify-between mb-4 border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-mute" />
                  <h2 className="text-sm font-semibold tracking-tight text-ink">Recent Submissions</h2>
                </div>
                <Link to="/problems" className="text-xs text-link hover:text-link-deep transition-colors font-medium">
                  All Problems →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-md" />
                  ))}
                </div>
              ) : stats?.recentSubmissions?.length > 0 ? (
                <div className="flex flex-col">
                  {stats.recentSubmissions.slice(0, 10).map((sub) => (
                    <SubRow key={sub.id} sub={sub} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-md bg-canvas-soft-2 border border-hairline/60 flex items-center justify-center mb-4 text-mute">
                    <Code2 size={24} />
                  </div>
                  <p className="text-sm font-semibold text-ink">No submissions yet</p>
                  <p className="text-xs text-body mt-1 mb-4">Start solving problems to track your progress</p>
                  <Link
                    to="/problems"
                    className="btn-primary h-8 text-xs font-semibold px-4 cursor-pointer"
                  >
                    Browse Problems
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-5">

            {/* Profile card */}
            <div className="rounded-md border border-hairline bg-canvas p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <User size={15} className="text-mute" />
                <h2 className="text-sm font-semibold tracking-tight text-ink font-sans">Profile</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-body">Username</span>
                  <span className="font-medium text-ink">@{user?.username || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body">Role</span>
                  <span className="font-medium text-link">{user?.role || "USER"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body">Accept Rate</span>
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{loading ? "—" : `${acceptRate}%`}</span>
                </div>
              </div>
              <div className="mt-5 h-px bg-hairline" />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Easy",   value: solved.easy,   color: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Medium", value: solved.medium, color: "text-warning-deep dark:text-warning" },
                  { label: "Hard",   value: solved.hard,   color: "text-rose-600 dark:text-rose-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-sm bg-canvas-soft-2 border border-hairline/60 py-2.5 px-1 shadow-2xs">
                    <div className={`text-base font-bold font-mono tabular-nums ${color}`}>
                      {loading ? "—" : value}
                    </div>
                    <div className="font-caption-mono text-[9px] text-mute mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-md border border-hairline bg-canvas p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Target size={15} className="text-mute" />
                <h2 className="text-sm font-semibold tracking-tight text-ink">Quick Actions</h2>
              </div>
              <div className="space-y-2">
                {[
                  { to: "/problems", icon: Code2,        label: "Browse Problems",  sub: "Solve & improve" },
                  { to: "/interview",icon: BookOpen,      label: "Interview Prep",   sub: "AI mock interviews" },
                  { to: "/contests", icon: Trophy,        label: "Contests",         sub: "Compete & rank" },
                  { to: "/discuss",  icon: MessageSquare, label: "Discussions",      sub: "Learn with others" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-3 p-3 rounded-sm border border-transparent hover:bg-canvas-soft hover:border-hairline transition-colors duration-150 group"
                    >
                      <div className="p-1.5 rounded-sm bg-canvas-soft-2 border border-hairline/50 text-mute group-hover:text-ink transition-colors">
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink leading-tight">{item.label}</p>
                        <p className="text-[10px] text-body mt-0.5">{item.sub}</p>
                      </div>
                      <ChevronRight size={14} className="text-mute group-hover:text-ink transition-transform group-hover:translate-x-0.5 duration-200" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Verdict legend */}
            {stats?.recentSubmissions?.length > 0 && (
              <div className="rounded-md border border-hairline bg-canvas p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 border-b border-hairline pb-2">
                  <Cpu size={14} className="text-mute" />
                  <h2 className="font-caption-mono text-[10px] text-ink font-semibold">Verdict Key</h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(VERDICT_META).slice(0, 6).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 text-xs">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${v.dot}`} />
                      <span className="text-body font-medium truncate">{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
