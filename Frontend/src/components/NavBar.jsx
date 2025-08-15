import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

export default function NewNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const mobileRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
    navigate("/login");
  };

  // Close dropdown & mobile menu on outside click
  useEffect(() => {
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        // Only close if click isn't on the burger button
        if (!e.target.closest("#burger-btn")) setIsMobileOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        setIsMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/problems", label: "Problems" },
    { to: "/newproblem", label: "Create Problem" },
  ];

  const linkBase =
    "group relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:text-white";
  const linkActive =
    "text-white after:scale-x-100"; // underline animation controlled via after: below

  return (
    <div className="sticky top-0 z-50">
      {/* Glow line */}
      <div className="h-px w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-emerald-400/0" />

      <nav className="supports-[backdrop-filter]:bg-slate-900/60 bg-slate-900/90 backdrop-blur border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="relative block">
              <span className="absolute -inset-1 -z-10 rounded-lg bg-gradient-to-r from-indigo-500/30 via-sky-500/30 to-emerald-500/30 blur-md" />
              <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-2xl font-extrabold tracking-wide text-transparent">
                CodeSM
              </span>
            </Link>
            <span className="hidden text-xs text-slate-400 md:inline-flex">Practice • Compete • Grow</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    linkBase,
                    isActive ? linkActive : "",
                    // underline shimmer
                    "after:pointer-events-none after:absolute after:inset-x-3 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-indigo-400/0 after:via-indigo-400/80 after:to-indigo-400/0 after:transition-transform"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* Search (decorative, wire up as needed) */}
            <div className="relative ml-2 hidden lg:block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
              <input
                placeholder="Search problems, tags…"
                className="w-64 rounded-xl border border-white/10 bg-white/5 px-9 py-2 text-sm text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {/* CTA */}
            <Link to="/newproblem" className="ml-2">
              <button className="relative inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500">
                <span className="relative z-10">New Problem</span>
              </button>
            </Link>
          </div>

          {/* Right: Avatar + Burger */}
          <div className="flex items-center gap-3">
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((s) => !s)}
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
                className="flex size-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                {/* User icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="size-5 text-slate-300"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 8a4 4 0 11-8 0 4 4 0 018 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7Z" />
                </svg>
              </button>

              {/* Menu */}
              <div
                role="menu"
                className={`absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-slate-800/95 p-1 shadow-2xl backdrop-blur transition-all ${
                  isDropdownOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
                }`}
              >
                {/* <Link
                  to="/profile"
                  role="menuitem"
                  className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                >
                  Your Profile
                </Link> */}
                <button
                  onClick={handleLogout}
                  role="menuitem"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-200 hover:bg-rose-500/10"
                >
                  Sign out
                </button>
              </div>
            </div>

            {/* Mobile burger */}
            <button
              id="burger-btn"
              aria-label="Toggle menu"
              aria-expanded={isMobileOpen}
              onClick={() => setIsMobileOpen((s) => !s)}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="block">
                <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileRef}
          className={`md:hidden ${isMobileOpen ? "block" : "hidden"}`}
        >
          <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-slate-900/80 p-2 backdrop-blur">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm ${
                    isActive ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-2 border-t border-white/10 p-2">
              <Link to="/newproblem" className="block">
                <button className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500">
                  New Problem
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
