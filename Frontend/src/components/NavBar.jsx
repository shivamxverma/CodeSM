import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";
import { LOCAL_STORAGE_KEY } from "@/utils/local-storage-key";
import { Menu, X, Sun, Moon, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function NewNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const dropdownRef = useRef(null);

  const handleLogout = async () => {
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
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const nextDark = !html.classList.contains("dark");
    html.classList.toggle("dark");
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    setIsDark(nextDark);
  };

  const userRole = user?.role;
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/problems", label: "Problems" },
    ...(userRole === "author" || userRole === "admin"
      ? [
          { to: "/newproblem", label: "Create Problem" },
          { to: "/contests/create", label: "Create Contest" },
        ]
      : []),
    { to: "/contests", label: "Contests" },
    { to: "/interview", label: "Interview" },
  ];

  return (
    <div className="sticky top-0 z-50">
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <nav className="border-b border-white/10 bg-slate-900/80 backdrop-blur-md shadow-lg transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 opacity-75 blur transition group-hover:opacity-100" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xl border border-white/10 shadow-xl group-hover:scale-105 transition-transform">
                  C
                </div>
              </div>
              <span className="hidden sm:block text-2xl font-bold tracking-tight text-white">
                Code<span className="text-blue-500">SM</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                      isActive 
                        ? "bg-white/10 text-white shadow-inner" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Auth section */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md group-hover:rotate-12 transition-transform">
                    {user?.username?.charAt(0).toUpperCase() || <User size={16} />}
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 z-[60]"
                    >
                      <div className="px-4 py-3 border-b border-white/5 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">{user?.username || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                        <span className="inline-flex mt-2 items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                          {userRole || 'Learner'}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <LayoutDashboard size={16} className="text-slate-500" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <LogOut size={16} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/signup">
                  <button className="relative inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/25 active:scale-95">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-white/10 bg-slate-900 overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                        isActive 
                          ? "bg-blue-600/10 text-blue-400" 
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                
                {!user && (
                  <div className="mt-6 space-y-3 pt-6 border-t border-white/5">
                    <Link to="/login" className="block w-full text-center py-3 text-base font-semibold text-white bg-white/5 rounded-xl border border-white/10">
                      Login
                    </Link>
                    <Link to="/signup" className="block w-full text-center py-3 text-base font-bold text-white bg-blue-600 rounded-xl">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}