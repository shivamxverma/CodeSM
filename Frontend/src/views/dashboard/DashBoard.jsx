import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

// ─── Safe auth hook (works even if AuthContext isn't wired up) ────────────────
let useAuth;
try {
  useAuth = require("@/hooks/AuthContext").useAuth;
} catch {
  useAuth = () => ({ user: null });
}

// ─── Safe stats helper (falls back to hardcoded defaults) ────────────────────
function getProblemStats() {
  try {
    const { getDashboardProblemStats } = require("@/components/dashboard/helper");
    return getDashboardProblemStats();
  } catch {
    const easy = 42, medium = 31, hard = 17, total = 90;
    return {
      counts: { easy, medium, hard },
      total,
      percentages: {
        easy: Math.round((easy / total) * 100),
        medium: Math.round((medium / total) * 100),
        hard: Math.round((hard / total) * 100),
      },
    };
  }
}

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── Intersection observer hook for scroll animations ────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Noise texture SVG data URI ───────────────────────────────────────────────
const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

// ─── Animated mesh gradient background ───────────────────────────────────────
function MeshBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Orb 1 – indigo top-left */}
      <div
        className="absolute rounded-full blur-[160px]"
        style={{
          width: 600, height: 600,
          top: -180, left: -160,
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          animation: "drift1 18s ease-in-out infinite alternate",
        }}
      />
      {/* Orb 2 – emerald top-right */}
      <div
        className="absolute rounded-full blur-[140px]"
        style={{
          width: 500, height: 500,
          top: 40, right: -120,
          background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)",
          animation: "drift2 14s ease-in-out infinite alternate",
        }}
      />
      {/* Orb 3 – amber bottom-center */}
      <div
        className="absolute rounded-full blur-[180px]"
        style={{
          width: 400, height: 400,
          bottom: -60, left: "45%",
          background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)",
          animation: "drift3 20s ease-in-out infinite alternate",
        }}
      />
      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{ backgroundImage: noiseSvg, backgroundRepeat: "repeat", backgroundSize: "256px" }}
      />
      <style>{`
        @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,30px) scale(1.05); } }
        @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-30px,20px) scale(1.08); } }
        @keyframes drift3 { from { transform: translate(0,0) scale(1); } to { transform: translate(20px,-25px) scale(1.04); } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        .hero-badge { animation: fadeIn .7s ease both; }
        .hero-h1    { animation: fadeSlideUp .8s .15s ease both; }
        .hero-sub   { animation: fadeSlideUp .8s .3s ease both; }
        .hero-ctas  { animation: fadeSlideUp .8s .45s ease both; }
        .reveal     { transition: opacity .7s ease, transform .7s ease; }
        .reveal.hidden-el { opacity:0; transform:translateY(24px); }
        .reveal.visible   { opacity:1; transform:translateY(0); }
        .stat-tile:hover  { transform: translateY(-3px); box-shadow: 0 8px 30px -8px rgba(0,0,0,.18); }
        .stat-tile { transition: transform .25s ease, box-shadow .25s ease; }
        .feat-card:hover .feat-arrow { transform: translateX(4px); }
        .feat-arrow { transition: transform .2s ease; }
        .pulse-dot { animation: shimmer 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// ─── Dot grid overlay ─────────────────────────────────────────────────────────
function DotGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.22]"
      style={{
        backgroundImage: "radial-gradient(circle, oklch(0.55 0 0 / 0.35) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ value, label, color, accent }) {
  const count = useCountUp(value);
  return (
    <div
      className="stat-tile group relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border border-border bg-card px-6 py-6 shadow-sm"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent} 0%, transparent 70%)` }}
      />
      <span className={`relative text-4xl font-black tabular-nums ${color}`}>
        {count.toLocaleString()}
      </span>
      <span className="relative mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ to, icon, title, desc, badgeText, badgeColor, glowRgb, upcoming }) {
  const [ref, inView] = useInView();
  const glowStyle = { background: `radial-gradient(ellipse at top right, rgba(${glowRgb},0.18) 0%, transparent 65%)` };

  const inner = (
    <div ref={ref} className={`feat-card reveal ${inView ? "visible" : "hidden-el"} group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-sm h-full
      ${upcoming
        ? "border-dashed border-border/70 cursor-default"
        : "border-border hover:-translate-y-1.5 hover:border-foreground/15 hover:shadow-lg transition-all duration-300"}`}
    >
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={glowStyle} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon + badge row */}
        <div className="mb-5 flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl border border-border/60 shadow-sm"
            style={{ background: `rgba(${glowRgb}, 0.12)` }}
          >
            {icon}
          </div>
          {badgeText && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColor}`}>
              {badgeText}
            </span>
          )}
        </div>

        <h3 className="mb-2 text-base font-bold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground flex-1">{desc}</p>

        {upcoming ? (
          <p className="mt-5 text-xs font-medium text-muted-foreground tracking-wide">
            🔒 Coming soon — stay tuned
          </p>
        ) : (
          <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-indigo-500">
            Explore now
            <svg className="feat-arrow h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  if (upcoming) return inner;
  return <Link to={to} className="h-full">{inner}</Link>;
}

// ─── Diff badge row ───────────────────────────────────────────────────────────
function DiffBadge({ label, count, dotColor, pct }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
      <span className="text-sm text-foreground">{label}</span>
      <span className="ml-auto text-sm font-bold tabular-nums text-foreground">{count}</span>
      <span className="w-8 text-right text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
}

// ─── Quick action row ─────────────────────────────────────────────────────────
function QuickActionRow({ to, label, sub, disabled }) {
  if (disabled) {
    return (
      <div className="flex cursor-not-allowed items-center justify-between rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 opacity-70">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-xs text-muted-foreground/70">{sub}</p>
        </div>
        <span className="rounded-full bg-border/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Soon
        </span>
      </div>
    );
  }
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 transition-all hover:bg-accent hover:border-foreground/15 hover:-translate-y-0.5"
    >
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <svg
        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

// ─── Pillar card ──────────────────────────────────────────────────────────────
function PillarCard({ step, title, desc, color, delay }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "visible" : "hidden-el"} group flex flex-col items-center text-center`}
      style={{ transitionDelay: delay }}
    >
      <span className={`mb-4 text-6xl font-black opacity-10 group-hover:opacity-30 transition-opacity duration-500 ${color}`}>
        {step}
      </span>
      <h3 className="mb-2 text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{desc}</p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashBoard() {
  let user = useAuth();
  // Below line was causing problem , signup when user logged in
  // let user = null;
  // try {
  //   const auth = useAuth();
  //   user = auth?.user ?? null;
  // } catch { /* no auth context */ }

  const { counts: diffCounts, total, percentages } = getProblemStats();
  const { easy: easyPct, medium: medPct, hard: hardPct } = percentages;

  const featureCards = [
    {
      to: "/problems",
      icon: "⚡",
      title: "Problem-solving platform",
      desc: "Practice on a curated problem set with ratings, tags, and instant feedback—your home for serious competitive programming.",
      badgeText: `${total} problems`,
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20",
      glowRgb: "99,102,241",
    },
    {
      to: "/interview",
      icon: "🎯",
      title: "Interview platform",
      desc: "AI-powered mock interviews and structured prep so you walk into real screens with confidence.",
      badgeText: "AI prep",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/20",
      glowRgb: "16,185,129",
    },
    {
      to: "/contests",
      icon: "⚔️",
      title: "1v1 contests",
      desc: "Head-to-head duels on the same problem—fast, focused, and coming soon to CodeSM.",
      badgeText: "Upcoming",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/20",
      glowRgb: "245,158,11",
      upcoming: true,
    },
  ];

  const pillarItems = [
    { step: "01", title: "Problem-solving platform", desc: "Solve rated problems with instant feedback and a path from warm-ups to hard challenges.", color: "text-indigo-500", delay: "0ms" },
    { step: "02", title: "Interview platform", desc: "Use AI-driven mock interviews and structured prep for real hiring loops.", color: "text-emerald-500", delay: "120ms" },
    { step: "03", title: "1v1 contests", desc: "Face another coder on the same problem—fast rounds built for bragging rights. Coming soon.", color: "text-amber-500", delay: "240ms" },
  ];

  const quickActionItems = [
    { to: "/problems", label: "⚡ Problem solving", sub: "Browse the problem set" },
    { to: "/interview", label: "🎯 Interview prep", sub: "AI mock interviews" },
    { to: null, label: "⚔️ 1v1 contests", sub: "Head-to-head — coming soon", disabled: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[58vh] flex-col items-center justify-center overflow-hidden px-4 py-28 text-center">
        <MeshBackground />
        <DotGrid />

        <div className="relative z-10 flex flex-col items-center">
          {/* Pill badge */}
          <div className="hero-badge mx-auto mb-7 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-indigo-500/30 bg-indigo-500/8 px-5 py-2 text-sm text-indigo-600 dark:text-indigo-300 shadow-sm">
            <span className="pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
            <span className="font-medium">Problem solving</span>
            <span className="text-indigo-500/40">·</span>
            <span className="font-medium">Interviews</span>
            <span className="text-indigo-500/40">·</span>
            <span className="font-medium">1v1 contests</span>
            <span className="text-indigo-500/40 text-xs">(soon)</span>
          </div>

          {/* Headline */}
          <h1 className="hero-h1 mx-auto max-w-4xl text-6xl font-black tracking-tight md:text-8xl leading-[1.05]">
            <span className="text-foreground">Solve.</span>{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Prep.
            </span>{" "}
            <span className="bg-gradient-to-br from-indigo-400 via-sky-400 to-amber-400 bg-clip-text text-transparent">
              Duel.
            </span>
          </h1>

          <p className="hero-sub mx-auto mt-7 max-w-xl text-lg text-muted-foreground leading-relaxed">
            CodeSM is built around three ideas: a serious{" "}
            <span className="text-foreground font-semibold">problem-solving</span> platform, a
            dedicated <span className="text-foreground font-semibold">interview</span> experience,
            and <span className="text-foreground font-semibold">1v1 contests</span> rolling out
            soon.
          </p>

          {/* CTA buttons */}
          <div className="hero-ctas mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/problems"
              className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 hover:shadow-2xl hover:-translate-y-0.5"
            >
              Start solving
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" />
              </svg>
            </Link>
            <Link
              to="/interview"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 backdrop-blur px-8 py-3.5 text-base font-bold text-foreground shadow-sm transition-all hover:bg-accent hover:-translate-y-0.5"
            >
              Interview prep
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="mt-16 flex flex-col items-center gap-1.5 opacity-40">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Scroll</span>
            <svg className="h-4 w-4 text-muted-foreground animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile value={total} label="Problems" color="text-indigo-500 dark:text-indigo-400" accent="rgba(99,102,241,0.08)" />
          <StatTile value={diffCounts.easy} label="Easy" color="text-emerald-500 dark:text-emerald-400" accent="rgba(16,185,129,0.08)" />
          <StatTile value={diffCounts.medium} label="Medium" color="text-amber-500 dark:text-amber-400" accent="rgba(245,158,11,0.08)" />
          <StatTile value={diffCounts.hard} label="Hard" color="text-rose-500 dark:text-rose-400" accent="rgba(239,68,68,0.08)" />
        </div>
      </section>

      {/* ── MAIN GRID ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Feature cards */}
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-baseline gap-3">
              <h2 className="text-xl font-bold text-foreground">What CodeSM is</h2>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 h-full">
              {featureCards.map((card) => (
                <FeatureCard key={card.title} {...card} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">

            {/* Problem distribution */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-base font-bold text-foreground">Distribution</h2>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-3 mb-5">
                <DiffBadge label="Easy" count={diffCounts.easy} dotColor="bg-emerald-500" pct={easyPct} />
                <DiffBadge label="Medium" count={diffCounts.medium} dotColor="bg-amber-500" pct={medPct} />
                <DiffBadge label="Hard" count={diffCounts.hard} dotColor="bg-rose-500" pct={hardPct} />
              </div>
              {/* Stacked progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                <div className="flex h-full">
                  <div style={{ width: easyPct + "%" }} className="bg-emerald-500 transition-all duration-700" />
                  <div style={{ width: medPct + "%" }} className="bg-amber-500  transition-all duration-700 delay-150" />
                  <div style={{ width: hardPct + "%" }} className="bg-rose-500   transition-all duration-700 delay-300" />
                </div>
              </div>
              <p className="mt-2 text-right text-xs text-muted-foreground">{total} total problems</p>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-base font-bold text-foreground">Quick Actions</h2>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-2.5">
                {quickActionItems.map((item) => (
                  <QuickActionRow key={item.label} {...item} />
                ))}
              </div>
            </div>

            {/* Auth card */}
            {!user ? (
              <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/8 to-sky-500/5 p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-500/15 blur-3xl" />
                <h3 className="mb-1 text-base font-bold text-foreground">Join CodeSM</h3>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  Track progress, compete, and earn badges.
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/signup"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-bold text-white transition-all hover:bg-indigo-500 hover:-translate-y-0.5"
                  >
                    Sign up free
                  </Link>
                  <Link
                    to="/login"
                    className="flex-1 rounded-xl border border-border bg-card py-2.5 text-center text-sm font-bold text-foreground transition-all hover:bg-accent hover:-translate-y-0.5"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-teal-500/5 p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 text-lg">
                    👋
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Welcome back!</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/problems"
                  className="block w-full rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:-translate-y-0.5"
                >
                  Continue Solving →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-card/60 py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-12">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-500">The platform</p>
            <h2 className="text-3xl font-black text-foreground">Three pillars</h2>
            <p className="mt-3 text-muted-foreground">Practice, interview prep, and soon—live 1v1 duels.</p>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {pillarItems.map((item) => (
              <PillarCard key={item.step} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.10) 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-lg px-4">
          <h2 className="mb-3 text-4xl font-black text-foreground">Ready to start?</h2>
          <p className="mb-10 text-muted-foreground leading-relaxed">
            Problem solving, interview prep, and 1v1 contests—one place to level up your coding game.
          </p>
          <Link
            to="/problems"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-10 py-4 text-base font-bold text-white shadow-2xl transition-all hover:from-indigo-500 hover:to-emerald-500 hover:shadow-indigo-500/25 hover:-translate-y-1"
          >
            Browse Problems
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </section>

    </div>
  );

}