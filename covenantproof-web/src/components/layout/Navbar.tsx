"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, LayoutDashboard, Component, ShieldAlert, Activity } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Business Case", path: "/", icon: <ShieldCheck className="w-4 h-4 mr-2" /> },
    { name: "Live Exception Desk", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    { name: "System Architecture", path: "/architecture", icon: <Component className="w-4 h-4 mr-2" /> },
    { name: "Testing & Guardrails", path: "/evals-security", icon: <ShieldAlert className="w-4 h-4 mr-2" /> },
  ];

  return (
    <nav className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-lg text-emerald-400 tracking-tight">CovenantProof</span>
        </Link>
        <Badge variant="outline" className="hidden md:flex text-slate-400 border-slate-700 font-mono text-[10px] ml-2">
          AWS TESLA T4 • LOCAL QLoRA
        </Badge>
      </div>

      <div className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "bg-slate-800 text-indigo-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Live Telemetry Link */}
      <a
        href="http://52.90.159.170:6006"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <Activity className="w-4 h-4" />
        Live Tracing (6006)
      </a>
    </nav>
  );
}
