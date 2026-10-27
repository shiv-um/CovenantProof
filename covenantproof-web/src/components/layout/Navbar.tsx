"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  LayoutDashboard,
  Component,
  ShieldAlert,
  Activity,
  Menu,
  X,
  ExternalLink,
  Flame
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Executive Summary", path: "/", icon: <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> },
    { name: "Interactive Audit Desk", path: "/dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> },
    { name: "System Architecture", path: "/architecture", icon: <Component className="w-3.5 h-3.5 mr-1.5" /> },
    { name: "Evals & Guardrails", path: "/evals-security", icon: <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> },
    { name: "Arize Phoenix", path: "/observability", icon: <Activity className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> },
  ];

  return (
    <nav className="h-14 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-base md:text-lg text-emerald-400 tracking-tight">
            CovenantProof
          </span>
        </Link>
        <Badge
          variant="outline"
          className="hidden sm:inline-flex text-slate-400 border-slate-800 font-mono text-[10px]"
        >
          AWS TESLA T4 • LOCAL QLoRA
        </Badge>
      </div>

      {/* Desktop Navigation Links (Now 5 Tabs) */}
      <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800 text-xs">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-3 py-1.5 rounded-md font-medium transition-all ${
                isActive
                  ? "bg-slate-800 text-indigo-300 shadow-sm border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Live External Telemetry Link & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <a
          href="http://52.90.159.170:6006"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors border border-amber-500/30 bg-amber-950/20 px-2.5 py-1 rounded"
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Live Tracing (6006)</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-slate-950 border-b border-slate-800 p-4 space-y-2 md:hidden animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-indigo-300 border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <a
              href="http://52.90.159.170:6006"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-amber-400 hover:bg-slate-900"
            >
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Launch Live Phoenix (:6006)
              </span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
