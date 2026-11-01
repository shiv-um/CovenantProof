"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Terminal,
  Database,
  TrendingUp,
  Cpu,
  Layers,
  FileText,
  Filter,
  CheckCircle2,
  DollarSign
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
  "[Worker-14/EKS-Node-2] Hybrid BM25/Vector retrieval indexed 1,200-page Credit Agreement for Section 8.4 EBITDA definitions (1.4s)",
  "[Worker-07/EKS-Node-4] Evaluated 250 compliance certificates: 247 pass, 3 routed for human triage",
  "[Worker-09/EKS-Node-3] Sharded Parquet commit: 12,500 audit trace records synced to PostgreSQL (covenant_app role with RLS)"
];

export function PortfolioScaleModal({ isOpen, onClose }: PortfolioScaleModalProps) {
  const [logIndex, setLogIndex] = useState(3);

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
              <h2 className="text-base font-bold tracking-tight">Enterprise Portfolio Scale: 10M Document Ingestion Engine</h2>
              <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px]">
                10M Ingested / Qtr
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Demonstrating the Two-Tier architecture: High-speed line-rate filtering vs. surgical multi-agent exception triage.
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
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Ingested Volume</span>
              <span className="text-lg font-bold font-mono text-slate-100">10,000,000</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Documents / Quarter</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Tier-1 Auto-Approved</span>
              <span className="text-lg font-bold font-mono text-emerald-400">96.4%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">9.64M Clean Matches ($0.0001/doc)</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Tier-2 Exception Swarm</span>
              <span className="text-lg font-bold font-mono text-amber-400">3.6%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">360,000 Complex Packages</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Audited Portfolio Debt</span>
              <span className="text-lg font-bold font-mono text-indigo-400">$42.8 Billion</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Revolving Credit Facilities</span>
            </div>
          </div>

          {/* Architecture Cards: 10M Funnel & 1,000-Page Handling */}
          <div className="grid grid-cols-2 gap-4">

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400" />
                The 10M Document Funnel &amp; Batching Strategy
              </h3>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Passing 10 million documents through raw LLM calls would cost over $300,000 and take weeks. CovenantProof uses a cost-optimized two-tier funnel:
              </p>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Tier 1 (96.4%):</strong> Line-rate OCR and regex rules auto-reconcile standard invoices and wires at $0.0001/doc without triggering an LLM.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Tier 2 (3.6%):</strong> The 360,000 exception documents (unreadable OCR, wire mismatches, covenant add-backs) are sharded across Kafka topics and processed in parallel by the LangGraph swarm.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                1,000+ Page Messy Document Slicing
              </h3>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Syndicated Credit Agreements and 10-K filings frequently exceed 1,000 pages. They are never dumped raw into prompt context windows:
              </p>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Hierarchical Spatial Indexing:</strong> PDF pages are pre-indexed into coordinate bounding boxes with layout block caching.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Hybrid Clause Retrieval:</strong> BM25 keyword matching for contractual section codes plus vector embeddings extracts only the 4–8 relevant candidate pages.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Sub-2s Bound:</strong> LangGraph nodes process only targeted candidate slices, bounding execution latency to 1.3–1.8 seconds.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Live Distributed Worker Terminal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Distributed Batch Worker Cluster Stream (Kafka Consumer / Celery Pool)
              </span>
              <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 font-mono">
                1,850 Pages / Sec
              </Badge>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1.5 h-36 overflow-hidden flex flex-col justify-end">
              {STREAMING_LOGS.slice(0, logIndex + 1).map((log, i) => (
                <div key={i} className="animate-in fade-in slide-in-from-bottom-1 text-slate-400">
                  <span className="text-slate-600 mr-2">{new Date().toISOString().slice(11, 19)}</span>
                  <span className={log.includes("⚠️") ? "text-amber-300 font-semibold" : log.includes("Clean") || log.includes("Compliant") ? "text-emerald-400" : "text-slate-300"}>
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
              Annual Cost Comparison (10,000,000 Documents)
            </span>
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Approach</th>
                    <th className="p-2.5">Annual Cost</th>
                    <th className="p-2.5">Throughput</th>
                    <th className="p-2.5">Data Privacy / Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                  <tr>
                    <td className="p-2.5 font-medium">Manual Credit Reviewers (80 FTEs)</td>
                    <td className="p-2.5 text-red-400 font-mono">$9,600,000 / yr</td>
                    <td className="p-2.5 text-slate-400">4-8 hrs / facility</td>
                    <td className="p-2.5 text-slate-400">Fatigue &amp; missed ratio breaches</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Commercial Cloud API (GPT-4o Direct)</td>
                    <td className="p-2.5 text-amber-400 font-mono">$320,000 / yr</td>
                    <td className="p-2.5 text-slate-400">8-12 sec / call</td>
                    <td className="p-2.5 text-red-400 font-medium">GLBA / SOC 2 data egress liability</td>
                  </tr>
                  <tr className="bg-indigo-950/20 font-semibold">
                    <td className="p-2.5 text-indigo-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" /> CovenantProof (Two-Tier Swarm)
                    </td>
                    <td className="p-2.5 text-emerald-400 font-mono">$11,440 / yr (98.8% savings)</td>
                    <td className="p-2.5 text-emerald-400 font-mono">15.04 req/s (1.3s latency)</td>
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
            Stack: Kafka Event Stream • LangGraph • PostgreSQL RLS • PySpark
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
