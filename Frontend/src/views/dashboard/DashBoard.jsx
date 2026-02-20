import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { getAllProblems } from "@/api/api";

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
}

// ─── Floating colour orbs (subtle, works in light + dark) ────────────────────
function FloatingOrbs() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
            <div className="absolute -right-32 top-20 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-sky-500/8 blur-[120px]" />
        </div>
    );
}

// ─── Stat tile with animated counter ─────────────────────────────────────────
function StatTile({ value, label, color }) {
    const count = useCountUp(value);
    return (
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm">
            <span className={`text-3xl font-extrabold ${color}`}>{count.toLocaleString()}</span>
            <span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        </div>
    );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ to, icon, title, desc, badgeText, badgeColor, glowColor }) {
    return (
        <Link
            to={to}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
        >
            {/* subtle corner glow */}
            <div className={`pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 ${glowColor}`} />
            <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow ${glowColor} bg-opacity-10 border border-border`}>
                        {icon}
                    </div>
                    {badgeText && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColor}`}>
                            {badgeText}
                        </span>
                    )}
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                <div className="mt-5 flex items-center gap-1 text-sm font-medium text-indigo-500 transition-all group-hover:gap-2">
                    Explore now
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}

// ─── Diff legend row ──────────────────────────────────────────────────────────
function DiffBadge({ label, count, dotColor }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
            <span className="text-sm text-foreground">{label}</span>
            <span className="ml-auto text-sm font-semibold text-foreground">{count}</span>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashBoard() {
    const { user } = useAuth();
    const [problems, setProblems] = useState([]);
    const [loadingProblems, setLoadingProblems] = useState(true);

    useEffect(() => {
        getAllProblems()
            .then((res) => {
                const data = res?.data?.message;
                setProblems(Array.isArray(data) ? data : []);
            })
            .catch(() => setProblems([]))
            .finally(() => setLoadingProblems(false));
    }, []);

    // Difficulty buckets
    const getRating = (p) => {
        const raw = p?.difficulty;
        if (typeof raw === "number") return raw;
        const match = String(raw || "").match(/-?\d+(\.\d+)?/);
        const n = match ? Number(match[0]) : NaN;
        return Number.isFinite(n) ? n : NaN;
    };

    const diffCounts = problems.reduce(
        (acc, p) => {
            const r = getRating(p);
            if (!Number.isFinite(r)) return acc;
            if (r <= 1200) acc.easy++;
            else if (r <= 1700) acc.medium++;
            else acc.hard++;
            return acc;
        },
        { easy: 0, medium: 0, hard: 0 }
    );

    const total = problems.length;
    const easyPct = total ? Math.round((diffCounts.easy / total) * 100) : 0;
    const medPct = total ? Math.round((diffCounts.medium / total) * 100) : 0;
    const hardPct = total ? Math.round((diffCounts.hard / total) * 100) : 0;

    const featureCards = [
        {
            to: "/problems",
            icon: "⚡",
            title: "Problem Set",
            desc: "Tackle curated problems across arrays, graphs, DP, and more.",
            badgeText: `${total} Problems`,
            badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20",
            glowColor: "bg-indigo-500",
        },
        {
            to: "/contests",
            icon: "🏆",
            title: "Contests",
            desc: "Compete in timed rounds, climb the leaderboard, and earn your rank.",
            badgeText: "Live!",
            badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/20",
            glowColor: "bg-amber-500",
        },
        {
            to: "/interview",
            icon: "🎯",
            title: "Interview Prep",
            desc: "AI-powered mock interviews to get you ready for top-tier tech companies.",
            badgeText: "AI-Powered",
            badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/20",
            glowColor: "bg-emerald-500",
        },
        {
            to: "/discuss",
            icon: "💬",
            title: "Discuss",
            desc: "Share solutions, approaches, and insights with the CodeSM community.",
            badgeText: null,
            badgeColor: "",
            glowColor: "bg-sky-500",
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* ── HERO ─────────────────────────────────────────────────────────────── */}
            <section className="relative flex min-h-[52vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
                <FloatingOrbs />

                {/* Subtle dot-grid overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, currentColor 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                        color: "oklch(0.5 0 0 / 0.07)",
                    }}
                />

                <div className="relative z-10">
                    {/* Pill badge */}
                    <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/8 px-4 py-1.5 text-sm text-indigo-600 dark:text-indigo-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        The competitive programming platform
                    </div>

                    {/* Headline */}
                    <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight md:text-7xl leading-tight">
                        <span className="text-foreground">Code. Compete.</span>
                        <br />
                        <span className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                            Conquer.
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
                        Level up your coding skills with curated problems, live contests, and
                        AI-powered interview prep — all in one place.
                    </p>

                    {/* CTA buttons */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/problems"
                            className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-indigo-500 hover:shadow-indigo-500/25 hover:shadow-xl"
                        >
                            Start Solving
                            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
                            </svg>
                        </Link>
                        <Link
                            to="/contests"
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-base font-semibold text-foreground shadow-sm transition hover:bg-accent"
                        >
                            View Contests 🏆
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
            <section className="mx-auto max-w-5xl px-4 pb-10">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatTile value={total} label="Problems" color="text-indigo-600 dark:text-indigo-400" />
                    <StatTile value={diffCounts.easy} label="Easy" color="text-emerald-600 dark:text-emerald-400" />
                    <StatTile value={diffCounts.medium} label="Medium" color="text-amber-600 dark:text-amber-400" />
                    <StatTile value={diffCounts.hard} label="Hard" color="text-rose-600 dark:text-rose-400" />
                </div>
            </section>

            {/* ── MAIN GRID ────────────────────────────────────────────────────────── */}
            <section className="mx-auto max-w-7xl px-4 pb-20">
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Feature cards — 2 col wide */}
                    <div className="lg:col-span-2">
                        <h2 className="mb-5 text-xl font-bold text-foreground">Explore</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {featureCards.map((card) => (
                                <FeatureCard key={card.to} {...card} />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-5">

                        {/* Problem distribution */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-base font-bold text-foreground">Problem Distribution</h2>

                            {loadingProblems ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-4 animate-pulse rounded bg-border" />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-5">
                                        <DiffBadge label="Easy" count={diffCounts.easy} dotColor="bg-emerald-500" />
                                        <DiffBadge label="Medium" count={diffCounts.medium} dotColor="bg-amber-500" />
                                        <DiffBadge label="Hard" count={diffCounts.hard} dotColor="bg-rose-500" />
                                    </div>
                                    {/* Stacked bar */}
                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
                                        <div className="flex h-full">
                                            <div style={{ width: `${easyPct}%` }} className="bg-emerald-500 transition-all duration-700" />
                                            <div style={{ width: `${medPct}%` }} className="bg-amber-500 transition-all duration-700" />
                                            <div style={{ width: `${hardPct}%` }} className="bg-rose-500 transition-all duration-700" />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-right text-xs text-muted-foreground">{total} total</p>
                                </>
                            )}
                        </div>

                        {/* Quick actions */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-base font-bold text-foreground">Quick Actions</h2>
                            <div className="space-y-2.5">
                                {[
                                    { to: "/problems", label: "🌱 Start Easy", sub: "Warm up with beginner problems" },
                                    { to: "/problems", label: "🔥 Hard Mode", sub: "Challenge yourself" },
                                    { to: "/interview", label: "🎯 Mock Interview", sub: "AI-powered prep" },
                                    { to: "/contests", label: "🏆 Join a Contest", sub: "Test under pressure" },
                                ].map(({ to, label, sub }) => (
                                    <Link
                                        key={label}
                                        to={to}
                                        className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 transition hover:bg-accent"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{label}</p>
                                            <p className="text-xs text-muted-foreground">{sub}</p>
                                        </div>
                                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Auth / welcome card */}
                        {!user ? (
                            <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-indigo-500/5 p-6">
                                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl" />
                                <h3 className="mb-1 text-base font-bold text-foreground">Join CodeSM</h3>
                                <p className="mb-4 text-sm text-muted-foreground">Track progress, compete, and earn badges.</p>
                                <div className="flex gap-2">
                                    <Link to="/signup" className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-500">
                                        Sign Up Free
                                    </Link>
                                    <Link to="/login" className="flex-1 rounded-xl border border-border bg-card py-2.5 text-center text-sm font-semibold text-foreground transition hover:bg-accent">
                                        Log In
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl" />
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 text-lg">
                                        👋
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Welcome back!</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <Link to="/problems" className="block w-full rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-500">
                                    Continue Solving →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
            <section className="border-t border-border bg-card py-20">
                <div className="mx-auto max-w-5xl px-4 text-center">
                    <h2 className="mb-3 text-3xl font-bold text-foreground">How it works</h2>
                    <p className="mb-12 text-muted-foreground">Three simple steps to becoming a better coder.</p>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                        {[
                            { step: "01", title: "Pick a Problem", desc: "Browse by difficulty, tags, or rating. Find what challenges you.", color: "text-indigo-500" },
                            { step: "02", title: "Code & Submit", desc: "Write your solution in the browser with syntax highlighting and instant feedback.", color: "text-sky-500" },
                            { step: "03", title: "Learn & Rank", desc: "Review editorial solutions, discuss with peers, and climb the leaderboard.", color: "text-emerald-500" },
                        ].map(({ step, title, desc, color }) => (
                            <div key={step} className="group flex flex-col items-center text-center">
                                <span className={`mb-4 text-5xl font-black opacity-15 group-hover:opacity-40 transition-opacity ${color}`}>{step}</span>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOOTER CTA ───────────────────────────────────────────────────────── */}
            <section className="py-20 text-center">
                <div className="mx-auto max-w-xl px-4">
                    <h2 className="mb-4 text-3xl font-bold text-foreground">Ready to start coding?</h2>
                    <p className="mb-8 text-muted-foreground">Join thousands of developers sharpening their skills on CodeSM.</p>
                    <Link
                        to="/problems"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-xl transition hover:from-indigo-500 hover:to-emerald-500 hover:shadow-indigo-500/20 hover:shadow-2xl"
                    >
                        Browse Problems →
                    </Link>
                </div>
            </section>

        </div>
    );
}