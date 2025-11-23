import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export default function NewNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const mobileRef = useRef(null);

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    logout();
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
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

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
  }, [location.pathname]);

  const userRole = user?.role;
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/problems", label: "Problems" },
    { to: "/discussion", label: "Discussions" },
    ...(userRole === "author" || userRole === "admin"
      ? [{ to: "/newproblem", label: "Create Problem" }]
      : []),
    ...(userRole === "author" || userRole === "admin"
      ? [{ to: "/contests/create", label: "Create Contest" }]
      : []),
    { to: "/contests", label: "Contests" },
    { to: "/interview", label: "Interview Prep" }
  ];

  return (
    <div className="sticky top-0 z-50">
      <div className="h-px w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-emerald-400/0" />

      <nav className="supports-[backdrop-filter]:bg-slate-900/60 bg-slate-900/90 backdrop-blur border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          
          <div className="flex items-center gap-3">
            <Link to="/" className="relative block">
              <span className="absolute -inset-1 -z-10 rounded-lg bg-gradient-to-r from-indigo-500/30 via-sky-500/30 to-emerald-500/30 blur-md" />
              <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-2xl font-extrabold tracking-wide text-transparent">
                CodeSM
              </span>
            </Link>
            <span className="hidden text-xs text-slate-400 md:inline-flex">Practice • Compete • Grow</span>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:text-white ${isActive ? "text-white after:scale-x-100" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((s) => !s)}
                  className="flex size-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                    className="size-5 text-slate-300" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 8a4 4 0 11-8 0 4 4 0 018 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7Z" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-slate-800/95 p-1 shadow-2xl backdrop-blur">
                    <button
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-200 hover:bg-rose-500/10"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}