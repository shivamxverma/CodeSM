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
    ...(userRole === "AUTHOR" || userRole === "ADMIN"
      ? [
        { to: "/createProblem", label: "Create Problem" },
        { to: "/contests/create", label: "Create Contest" },
      ]
      : []),
    { to: "/contests", label: "Contests" },
    { to: "/interview", label: "Interview" },
  ];

  return (
    <div className="sticky top-0 z-50">
      <nav className="border-b border-hairline bg-canvas/80 backdrop-blur-md shadow-xs transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-primary-foreground font-semibold text-lg shadow-sm group-hover:scale-102 transition-transform duration-200">
                  C
                </div>
              </div>
              <span className="hidden sm:block text-xl font-semibold tracking-tight text-ink">
                Code<span className="text-mute font-normal">SM</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md ${isActive
                      ? "bg-canvas-soft-2 text-ink"
                      : "text-body hover:text-ink hover:bg-canvas-soft-2/50"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-body hover:text-ink rounded-full hover:bg-canvas-soft-2 border border-hairline bg-canvas shadow-xs transition-colors duration-200 cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Auth section */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full bg-canvas-soft border border-hairline hover:bg-canvas-soft-2 transition-colors duration-200 cursor-pointer group"
                >
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shadow-xs">
                    {user?.username?.charAt(0).toUpperCase() || <User size={12} />}
                  </div>
                  <ChevronDown size={14} className={`text-body transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-60 origin-top-right rounded-md border border-hairline bg-canvas p-1.5 shadow-lg z-[60]"
                    >
                      <div className="px-3.5 py-2.5 border-b border-hairline overflow-hidden">
                        <p className="text-sm font-semibold text-ink truncate">{user?.username || 'User'}</p>
                        <p className="text-xs text-body truncate mt-0.5">{user?.email}</p>
                        <span className="inline-flex mt-2 items-center rounded-full bg-link-bg-soft px-2 py-0.5 text-[10px] font-medium text-link border border-link/10 uppercase tracking-wider">
                          {userRole || 'Learner'}
                        </span>
                      </div>

                      <div className="mt-1.5 space-y-0.5">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-body hover:text-ink hover:bg-canvas-soft-2 rounded-sm transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-mute" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/5 rounded-sm transition-colors cursor-pointer"
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3 py-1.5 text-xs font-semibold border border-hairline rounded-sm hover:bg-canvas-soft bg-canvas text-ink transition-colors flex items-center justify-center h-8">
                  Login
                </Link>
                <Link to="/signup">
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center h-8 cursor-pointer">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 text-body hover:text-ink rounded-md hover:bg-canvas-soft-2 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
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
              className="lg:hidden border-t border-hairline bg-canvas overflow-hidden"
            >
              <div className="p-4 space-y-1 bg-canvas-soft">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-canvas-soft-2 text-ink font-semibold"
                        : "text-body hover:bg-canvas-soft-2/50 hover:text-ink"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                {!user && (
                  <div className="mt-4 space-y-2 pt-4 border-t border-hairline">
                    <Link to="/login" className="block w-full text-center py-2 text-sm font-semibold text-ink bg-canvas rounded-md border border-hairline">
                      Login
                    </Link>
                    <Link to="/signup" className="block w-full text-center py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-md">
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