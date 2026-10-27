"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Terminal,
  Database,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Server,
  DollarSign,
  Cpu
} from "lucide-react";

interface PortfolioScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STREAMING_LOGS = [
  "[Worker-04/EKS-Node-2] Ingested batch 104,200: 500 PDFs from s3://covenant-lake/2026-q3/ (348 pgs/sec)",
  "[Worker-11/EKS-Node-1] FACILITY-APEX-8891: PO-INV-PAY 3-way match clean -> Auto-Committed to ledger",
  "[Worker-08/EKS-Node-3] FACILITY-TERRA-4102: Fixed Charge Ratio 1.42x >= 1.15x -> Compliant",
  "[Worker-02/EKS-Node-4] Running continuous batching inference on Tesla T4 pool (45.2 tokens/sec)",
  "[Worker-03/EKS-Node-1] ⚠️ FACILITY-COBALT-2026: Wire variance $27,000.00 detected -> Pushed to Exception Desk (#4182)",
  "[Worker-14/EKS-Node-2] Chunked 84-page syndicated credit agreement for Section 8.4 EBITDA add-back definitions",
  "[Worker-07/EKS-Node-4] Evaluated 250 compliance certificates: 247 pass, 3 routed for human triage",
  "[Worker-09/EKS-Node-3] Sharded Parquet commit: 12,500 audit trace records synced to AWS RDS/PostgreSQL"
];

export function PortfolioScaleModal({ isOpen, onClose }: PortfolioScaleModalProps) {
  const [logIndex, setLogIndex] = useState(3);

  // Simulate real-time distributed worker log streaming
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % STREAMING_LOGS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold tracking-tight">Enterprise Portfolio Scale & Distributed Batch Engine</h2>
              <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px]">
                1.2M Docs Audited
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Demonstrating how CovenantProof scales from a single loan exception to millions of unstructured corporate documents.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Audited Portfolio</span>
              <span className="text-lg font-bold font-mono text-slate-100">$42.8 Billion</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">416,160 Loan Facilities</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Ingested</span>
              <span className="text-lg font-bold font-mono text-indigo-400">1,248,500</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">PDFs Ingested in Q3 2026</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Auto-Approved</span>
              <span className="text-lg font-bold font-mono text-emerald-400">96.4%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">1,203,554 Clean Matches</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Human Triage Queue</span>
              <span className="text-lg font-bold font-mono text-amber-400">3.6%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">44,946 Edge Cases</span>
            </div>
          </div>

          {/* Two-Tier Architecture Explanation */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-2">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Why the UI Shows 3 Documents: The Two-Tier Paradigm
            </h3>
            <p className="text-slate-300 leading-relaxed text-xs">
              No human auditor manually reviews 1.2 million clean invoices. In production, <strong>Tier 1 (The Asynchronous Batch Engine)</strong> processes millions of documents in parallel using Ray/Celery distributed workers on AWS EKS. It automatically reconciles and commits the <strong>96.4% of facilities</strong> with zero variances.
            </p>
            <p className="text-slate-300 leading-relaxed text-xs">
              <strong>Tier 2 (This Interactive Workspace):</strong> Represents the <strong>Exception Resolution Desk</strong>. When the batch swarm flags wire tampering or a covenant breach (like Facility #4,182: Cobalt Equipment), it routes the exact file triplet directly to this UI for sub-second forensic verification.
            </p>
          </div>

          {/* Live Distributed Worker Terminal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Live Distributed Worker Cluster Logs (Simulated Kafka/Celery Consumer)
              </span>
              <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 font-mono">
                1,850 Pages / Sec
              </Badge>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1.5 h-36 overflow-hidden flex flex-col justify-end">
              {STREAMING_LOGS.slice(0, logIndex + 1).map((log, i) => (
                <div key={i} className="animate-in fade-in slide-in-from-bottom-1 text-slate-400">
                  <span className="text-slate-600 mr-2">{new Date().toISOString().slice(11, 19)}</span>
                  <span className={log.includes("⚠️") ? "text-amber-300 font-semibold" : log.includes("Clean") ? "text-emerald-400" : "text-slate-300"}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Cost & ROI Benchmark */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Cost Analysis: Auditing 1.2M Documents Annually
            </span>
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Approach</th>
                    <th className="p-2.5">Annual Cost</th>
                    <th className="p-2.5">Latency</th>
                    <th className="p-2.5">Data Privacy / Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                  <tr>
                    <td className="p-2.5 font-medium">Manual Credit Analyst Team (40 FTEs)</td>
                    <td className="p-2.5 text-red-400 font-mono">$4,800,000 / yr</td>
                    <td className="p-2.5 text-slate-400">4-8 hours / audit</td>
                    <td className="p-2.5 text-slate-400">Human error & fatigue</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Commercial Cloud API (GPT-4o)</td>
                    <td className="p-2.5 text-amber-400 font-mono">$240,000 / yr</td>
                    <td className="p-2.5 text-slate-400">8-12 seconds / call</td>
                    <td className="p-2.5 text-red-400 font-medium">Data privacy liability (GLBA/SOC 2)</td>
                  </tr>
                  <tr className="bg-indigo-950/20 font-semibold">
                    <td className="p-2.5 text-indigo-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" /> CovenantProof (AWS GPU Cluster)
                    </td>
                    <td className="p-2.5 text-emerald-400 font-mono">$6,320 / yr (98.7% savings)</td>
                    <td className="p-2.5 text-emerald-400 font-mono">2.1 seconds / call</td>
                    <td className="p-2.5 text-emerald-400 font-medium">100% On-Prem / Zero Data Egress</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Orchestration: Ray Core • Celery • LangGraph • vLLM (PagedAttention)
          </span>
          <Button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-4"
          >
            Return to Exception Desk
          </Button>
        </div>

      </div>
    </div>
  );
}
