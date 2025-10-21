"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface NavBarProps {
    to: string;
    label: string;
}

const navItems: NavBarProps[] = [
    { to: "/", label: "Home" },
    { to: "/problems", label: "Problems" },
    { to: "/contests", label: "Contests" },
    { to: "/discuss", label: "Discuss" },
    { to: "/interview", label: "Interview" },
    { to: "/explore", label: "Explore" },
    { to: "/match", label: "Match" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-black text-white border-b border-white/10">
      <div className="mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <div className="text-2xl font-bold">CodeSM</div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full"></span>
                )}
              </Link>
            );
          })}
          <Button variant="secondary">Login</Button>
          <Button variant="secondary">Sign Up</Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col items-start bg-slate-900 border-t border-slate-700 px-4 py-3 space-y-3 animate-slideDown">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setMenuOpen(false)}
                className={`block w-full px-3 py-2 text-base font-medium rounded-md ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="flex gap-3 pt-3 border-t border-slate-700 w-full">
            <Button className="flex-1">Login</Button>
            <Button className="flex-1">Sign Up</Button>
          </div>
        </nav>
      )}
    </header>
  );
}
