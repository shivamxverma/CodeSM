import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

// ─── Safe auth hook ───────────────────────────────────────────
let useAuth;
try {
  useAuth = require("@/hooks/AuthContext").useAuth;
} catch {
  useAuth = () => ({ user: null });
}

// ─── Safe stats helper ────────────────────────────────────────
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

// ─── Animated counter hook ────────────────────────────────────
function useCountUp(target, duration = 1200) {
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

// ─── Intersection observer hook for scroll animations ─────────
function useInView(threshold = 0.1) {
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

// ─── Noise texture SVG data URI ───────────────────────────────
const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

// ─── Animated mesh gradient background ────────────────────────
function MeshBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Orb 1 – Cyan/Blue top-left (Develop stop) */}
      <div
        className="absolute rounded-full blur-[140px]"
        style={{
          width: 550, height: 550,
          top: -150, left: -120,
          background: "radial-gradient(circle, rgba(80,227,194,0.12) 0%, transparent 70%)",
          animation: "drift1 20s ease-in-out infinite alternate",
        }}
      />
      {/* Orb 2 – Violet/Pink top-right (Preview stop) */}
      <div
        className="absolute rounded-full blur-[150px]"
        style={{
          width: 500, height: 500,
          top: 30, right: -100,
          background: "radial-gradient(circle, rgba(121,40,202,0.09) 0%, transparent 70%)",
          animation: "drift2 16s ease-in-out infinite alternate",
        }}
      />
      {/* Orb 3 – Coral/Amber bottom-center (Ship stop) */}
      <div
        className="absolute rounded-full blur-[160px]"
        style={{
          width: 450, height: 450,
          bottom: -80, left: "40%",
          background: "radial-gradient(circle, rgba(255,77,77,0.07) 0%, transparent 70%)",
          animation: "drift3 22s ease-in-out infinite alternate",
        }}
      />
      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{ backgroundImage: noiseSvg, backgroundRepeat: "repeat", backgroundSize: "256px" }}
      />
      <style>{`
        @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,25px) scale(1.04); } }
        @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-25px,20px) scale(1.06); } }
        @keyframes drift3 { from { transform: translate(0,0) scale(1); } to { transform: translate(20px,-20px) scale(1.03); } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { 0%,100% { opacity:.5; } 50% { opacity:1; } }
        .hero-badge { animation: fadeIn 0.7s ease both; }
        .hero-h1    { animation: fadeSlideUp 0.8s 0.1s ease both; }
        .hero-sub   { animation: fadeSlideUp 0.8s 0.2s ease both; }
        .hero-ctas  { animation: fadeSlideUp 0.8s 0.3s ease both; }
        .reveal     { transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.hidden-el { opacity:0; transform:translateY(16px); }
        .reveal.visible   { opacity:1; transform:translateY(0); }
        .pulse-dot { animation: shimmer 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// ─── Dot grid overlay ─────────────────────────────────────────
function DotGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.15]"
      style={{
        backgroundImage: "radial-gradient(circle, var(--color-hairline-strong) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
  );
}

// ─── Stat tile ────────────────────────────────────────────────
function StatTile({ value, label, color }) {
  const count = useCountUp(value);
  return (
    <div
      className="group relative flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-md border border-hairline bg-canvas px-6 py-5.5 shadow-xs hover:border-hairline-strong transition-all duration-200"
    >
      <span className={`relative font-mono font-semibold text-3xl sm:text-4xl tracking-tight tabular-nums ${color}`}>
        {count.toLocaleString()}
      </span>
      <span className="relative font-caption-mono text-[10px] text-body">
        {label}
      </span>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────
function FeatureCard({ to, icon, title, desc, badgeText, badgeColor, upcoming }) {
  const [ref, inView] = useInView();

  const inner = (
    <div
      ref={ref}
      className={`reveal ${inView ? "visible" : "hidden-el"} group relative flex flex-col overflow-hidden rounded-md border bg-canvas p-6.5 shadow-xs h-full transition-all duration-200
        ${upcoming
          ? "border-dashed border-hairline/80 cursor-default"
          : "border-hairline hover:-translate-y-1 hover:border-hairline-strong hover:shadow-sm"}`}
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon + badge row */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-md text-lg bg-canvas-soft-2 border border-hairline/50 text-ink shadow-xs">
            {icon}
          </div>
          {badgeText && (
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide border border-current/10 ${badgeColor}`}>
              {badgeText}
            </span>
          )}
        </div>

        <h3 className="mb-2 text-base font-semibold text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-body flex-1">{desc}</p>

        {upcoming ? (
          <p className="mt-5 text-xs font-medium text-mute tracking-wide">
            🔒 Coming soon — stay tuned
          </p>
        ) : (
          <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-link group-hover:text-link-deep transition-colors duration-150">
            Explore now…
            <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  if (upcoming) return inner;
  return <Link to={to} className="h-full block">{inner}</Link>;
}

// ─── Diff badge row ───────────────────────────────────────────
function DiffBadge({ label, count, dotColor, pct }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="ml-auto font-mono text-sm font-semibold tabular-nums text-ink">{count}</span>
      <span className="w-8 text-right font-mono text-xs text-mute">{pct}%</span>
    </div>
  );
}

// ─── Quick action row ─────────────────────────────────────────
function QuickActionRow({ to, label, sub, disabled }) {
  if (disabled) {
    return (
      <div className="flex cursor-not-allowed items-center justify-between rounded-sm border border-dashed border-hairline/80 bg-canvas-soft-2/50 px-4 py-3 opacity-60">
        <div>
          <p className="text-sm font-medium text-mute">{label}</p>
          <p className="text-xs text-mute/80">{sub}</p>
        </div>
        <span className="rounded-full bg-canvas-soft border border-hairline px-2 py-0.5 text-[9px] font-semibold text-mute uppercase tracking-wide">
          Soon
        </span>
      </div>
    );
  }
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-sm border border-hairline bg-canvas-soft px-4 py-3 transition-colors hover:bg-canvas-soft-2 hover:border-hairline-strong"
    >
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-body">{sub}</p>
      </div>
      <svg
        className="h-3.5 w-3.5 text-mute transition-transform group-hover:translate-x-0.5 duration-200"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

// ─── Pillar card ──────────────────────────────────────────────
function PillarCard({ step, title, desc, color, delay }) {
  const [ref, inView] = useInView(0.05);
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "visible" : "hidden-el"} group flex flex-col items-center text-center`}
      style={{ transitionDelay: delay }}
    >
      <span className={`mb-3 font-mono font-bold text-6xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${color}`}>
        {step}
      </span>
      <h3 className="mb-2 text-base font-semibold text-ink">{title}</h3>
      <p className="text-sm text-body leading-relaxed max-w-xs">{desc}</p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function DashBoard() {
  let user = useAuth();
  const { counts: diffCounts, total, percentages } = getProblemStats();
  const { easy: easyPct, medium: medPct, hard: hardPct } = percentages;

  const featureCards = [
    {
      to: "/problems",
      icon: "⚡",
      title: "Problem-solving platform",
      desc: "Practice on a curated problem set with ratings, tags, and instant feedback—your home for serious competitive programming.",
      badgeText: `${total} problems`,
      badgeColor: "bg-link-bg-soft text-link border border-link/10",
      glowRgb: "0,112,243",
    },
    {
      to: "/interview",
      icon: "🎯",
      title: "Interview platform",
      desc: "AI-powered mock interviews and structured prep so you walk into real screens with confidence.",
      badgeText: "AI prep",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10",
      glowRgb: "80,227,194",
    },
    {
      to: "/contests",
      icon: "⚔️",
      title: "1v1 contests",
      desc: "Head-to-head duels on the same problem—fast, focused, and coming soon to CodeSM.",
      badgeText: "Upcoming",
      badgeColor: "bg-warning-soft text-warning-deep border border-warning/10",
      glowRgb: "245,158,11",
      upcoming: true,
    },
  ];

  const pillarItems = [
    { step: "01", title: "Problem-solving platform", desc: "Solve rated problems with instant feedback and a path from warm-ups to hard challenges.", color: "text-link", delay: "0ms" },
    { step: "02", title: "Interview platform", desc: "Use AI-driven mock interviews and structured prep for real hiring loops.", color: "text-cyan-deep", delay: "100ms" },
    { step: "03", title: "1v1 contests", desc: "Face another coder on the same problem—fast duels built for bragging rights. Coming soon.", color: "text-warning", delay: "200ms" },
  ];

  const quickActionItems = [
    { to: "/problems", label: "⚡ Problem solving", sub: "Browse the problem set" },
    { to: "/interview", label: "🎯 Interview prep", sub: "AI mock interviews" },
    { to: null, label: "⚔️ 1v1 contests", sub: "Head-to-head — coming soon", disabled: true },
  ];

  return (
    <div className="min-h-screen bg-canvas-soft text-ink">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[55vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        <MeshBackground />
        <DotGrid />

        <div className="relative z-10 flex flex-col items-center max-w-4xl w-full">
          {/* Pill badge */}
          <div className="hero-badge mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-canvas-soft px-3.5 py-1.5 text-xs text-body shadow-xs">
            <span className="pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
            <span className="font-medium">Problem solving</span>
            <span className="text-hairline-strong">·</span>
            <span className="font-medium">Interviews</span>
            <span className="text-hairline-strong">·</span>
            <span className="font-medium">1v1 contests</span>
            <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-canvas-soft-2 text-mute rounded-full leading-none">soon</span>
          </div>

          {/* Headline */}
          <h1 className="hero-h1 font-semibold tracking-[-0.045em] text-5xl sm:text-7xl md:text-8xl text-ink leading-[1.05] max-w-3xl mx-auto">
            Solve. <span className="bg-gradient-to-r from-cyan to-link bg-clip-text text-transparent">Prep.</span> <span className="bg-gradient-to-r from-violet to-highlight-pink bg-clip-text text-transparent">Duel.</span>
          </h1>

          <p className="hero-sub mx-auto mt-6 max-w-xl text-base sm:text-lg text-body leading-relaxed">
            CodeSM is built around three ideas: a serious{" "}
            <span className="text-ink font-medium">problem-solving</span> platform, a
            dedicated <span className="text-ink font-medium">interview</span> experience,
            and <span className="text-ink font-medium">1v1 contests</span> rolling out
            soon.
          </p>

          {/* CTA buttons */}
          <div className="hero-ctas mt-8.5 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/problems"
              className="btn-primary h-11 px-8 text-sm font-semibold tracking-wide"
            >
              Start solving
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" />
              </svg>
            </Link>
            <Link
              to="/interview"
              className="btn-secondary h-11 px-8 text-sm font-semibold tracking-wide"
            >
              Interview prep
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile value={total} label="Problems" color="text-ink" />
          <StatTile value={diffCounts.easy} label="Easy" color="text-emerald-500 dark:text-emerald-400" />
          <StatTile value={diffCounts.medium} label="Medium" color="text-warning-deep dark:text-warning" />
          <StatTile value={diffCounts.hard} label="Hard" color="text-rose-500 dark:text-rose-400" />
        </div>
      </section>

      {/* ── MAIN GRID ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Feature cards */}
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-baseline gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-ink">What CodeSM is</h2>
              <span className="h-px flex-1 bg-hairline" />
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
            <div className="rounded-md border border-hairline bg-canvas p-6 shadow-xs">
              <div className="mb-4.5 flex items-baseline gap-3">
                <h2 className="text-sm font-semibold tracking-tight text-ink">Distribution</h2>
                <span className="h-px flex-1 bg-hairline" />
              </div>
              <div className="space-y-3 mb-5">
                <DiffBadge label="Easy" count={diffCounts.easy} dotColor="bg-emerald-500" pct={easyPct} />
                <DiffBadge label="Medium" count={diffCounts.medium} dotColor="bg-warning" pct={medPct} />
                <DiffBadge label="Hard" count={diffCounts.hard} dotColor="bg-rose-500" pct={hardPct} />
              </div>
              {/* Stacked progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-soft-2">
                <div className="flex h-full">
                  <div style={{ width: easyPct + "%" }} className="bg-emerald-500 transition-all duration-700" />
                  <div style={{ width: medPct + "%" }} className="bg-warning transition-all duration-700 delay-100" />
                  <div style={{ width: hardPct + "%" }} className="bg-rose-500 transition-all duration-700 delay-200" />
                </div>
              </div>
              <p className="mt-2.5 text-right font-mono text-[10px] text-mute">{total} total problems</p>
            </div>

            {/* Quick actions */}
            <div className="rounded-md border border-hairline bg-canvas p-6 shadow-xs">
              <div className="mb-4.5 flex items-baseline gap-3">
                <h2 className="text-sm font-semibold tracking-tight text-ink">Quick Actions</h2>
                <span className="h-px flex-1 bg-hairline" />
              </div>
              <div className="space-y-2">
                {quickActionItems.map((item) => (
                  <QuickActionRow key={item.label} {...item} />
                ))}
              </div>
            </div>

            {/* Auth card */}
            {!user ? (
              <div className="relative overflow-hidden rounded-md border border-link/10 bg-gradient-to-br from-link/5 to-cyan/5 p-6 shadow-xs">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-link/5 blur-3xl" />
                <h3 className="mb-1 text-sm font-semibold text-ink">Join CodeSM</h3>
                <p className="mb-4 text-xs text-body leading-relaxed">
                  Track progress, compete, and earn badges.
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/signup"
                    className="flex-1 rounded-sm bg-primary py-2 text-center text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Sign up free
                  </Link>
                  <Link
                    to="/login"
                    className="flex-1 rounded-sm border border-hairline bg-canvas py-2 text-center text-xs font-semibold text-ink hover:bg-canvas-soft-2 transition-colors"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-md border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-cyan/5 p-6 shadow-xs">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />
                <div className="mb-3.5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/10 text-base">
                    👋
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">Welcome back!</p>
                    <p className="text-[10px] text-body truncate max-w-[150px]">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/problems"
                  className="block w-full rounded-sm bg-primary py-2 text-center text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Continue Solving →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────────────────────── */}
      <section className="border-t border-hairline bg-canvas/40 py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-12">
            <p className="mb-2 font-caption-mono text-link">The platform</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">Three pillars</h2>
            <p className="mt-2 text-sm text-body">Practice, interview prep, and soon—live 1v1 duels.</p>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {pillarItems.map((item) => (
              <PillarCard key={item.step} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 text-center border-t border-hairline bg-canvas-soft">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(0,112,243,0.04) 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-lg px-4">
          <h2 className="mb-3 text-3xl sm:text-4xl font-semibold tracking-tight text-ink">Ready to start?</h2>
          <p className="mb-8 text-sm text-body leading-relaxed">
            Problem solving, interview prep, and 1v1 contests—one place to level up your coding game.
          </p>
          <Link
            to="/problems"
            className="btn-primary h-11 px-10 text-sm font-semibold tracking-wide"
          >
            Browse Problems
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </section>

    </div>
  );
}