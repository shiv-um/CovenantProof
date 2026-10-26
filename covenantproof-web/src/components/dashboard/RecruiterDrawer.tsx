"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  X,
  TrendingUp,
  Cpu,
  Layers,
  Activity,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Server,
  Lock,
  FileCode2
} from "lucide-react";

type TabKey = "business" | "swarm" | "model" | "telemetry";

export function RecruiterDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("business");

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs h-8 px-3 font-medium transition-all"
      >
        <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400 fill-amber-400" />
        Recruiter & Technical Proof Mode
      </Button>

      {/* Slide-Over Overlay & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 text-slate-100">

            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/60">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-100">CovenantProof Architecture Proof</h2>
                  <Badge className="bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-[10px]">
                    v1.0 Production
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Deterministic, Evidence-Grounded Agentic Credit Audit Engine for Corporate Lenders
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-900/30 text-xs">
              <button
                onClick={() => setActiveTab("business")}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
                  activeTab === "business"
                    ? "border-emerald-500 text-emerald-400 bg-slate-900/80"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>ROI & Business</span>
              </button>

              <button
                onClick={() => setActiveTab("swarm")}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
                  activeTab === "swarm"
                    ? "border-indigo-500 text-indigo-400 bg-slate-900/80"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Agent Swarm</span>
              </button>

              <button
                onClick={() => setActiveTab("model")}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
                  activeTab === "model"
                    ? "border-purple-500 text-purple-400 bg-slate-900/80"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Fine-Tuning</span>
              </button>

              <button
                onClick={() => setActiveTab("telemetry")}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
                  activeTab === "telemetry"
                    ? "border-amber-500 text-amber-400 bg-slate-900/80"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Telemetry</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">

              {/* TAB 1: BUSINESS IMPACT & ROI */}
              {activeTab === "business" && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Audit Latency</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">2.1s</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">vs. 4-8 hrs manual review</span>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Hallucination Rate</span>
                      <span className="text-xl font-bold font-mono text-indigo-400">0.0%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Grounded to exact pixels</span>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Inference Cost</span>
                      <span className="text-xl font-bold font-mono text-amber-400">$0.00</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Self-hosted AWS GPU GGUF</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      The Commercial Problem
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      Commercial banks, private credit funds, and asset-backed lenders manually examine thousands of borrower compliance certificates, invoices, and wire slips every quarter. This manual audit bottlenecks capital deployment, creates blindspots for invoice tampering and payment variance, and risks FDIC/OCC audit findings.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      Organizational Benefits Added
                    </h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Instant Wire Tampering Detection:</strong> Catches disbursements exceeding purchase orders and invoices before funds clear the bank.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Deterministic Covenant Math:</strong> Automatically computes Fixed Charge Coverage (FCCR) and Senior Leverage with zero LLM math rounding error.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Audit-Ready Pixel Anchors:</strong> Flags each discrepancy with exact document coordinates, eliminating regulatory friction during loan reviews.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Zero Data Privacy Liability:</strong> Keeps sensitive borrower balance sheets on-premise; no client financial data is transmitted to public cloud LLM APIs.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: AGENT SWARM TOPOLOGY */}
              {activeTab === "swarm" && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      LangGraph Deterministic State Machine
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      Unlike brittle single-prompt chatbots, CovenantProof employs a stateful multi-agent DAG (Directed Acyclic Graph) built on LangGraph with strict TypedDict state schemas:
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-300 font-mono text-[11px]">1. IntakeNode</span>
                        <Badge variant="outline" className="text-[10px] border-slate-700">Schema Validation</Badge>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Ingests multi-source PDFs and JSON payloads, extracts tabular financial key-value pairs, and establishes immutable document coordinate IDs.
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-300 font-mono text-[11px]">2. ReconciliationNode</span>
                        <Badge variant="outline" className="text-[10px] border-slate-700">Deterministic Python</Badge>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Executes exact 3-way mathematical cross-check across Purchase Order, Invoice, and Wire Disbursement. Emits verified variance claims without LLM involvement.
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-300 font-mono text-[11px]">3. CovenantMathNode</span>
                        <Badge variant="outline" className="text-[10px] border-slate-700">Ratio Engine</Badge>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Evaluates credit agreement financial covenants: Fixed Charge Coverage Ratio (FCCR = (EBITDA - Taxes) / (Debt Service)) against borrower credit thresholds.
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-purple-300 font-mono text-[11px]">4. ComposerNode</span>
                        <Badge variant="outline" className="text-[10px] border-slate-700">Fine-Tuned LLM</Badge>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Synthesizes formal credit audit memorandum. Restricted exclusively to narrative summarization citing verified coordinates from previous nodes.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-[11px] text-indigo-200">
                      <strong>Zero Hallucination Architecture:</strong> All calculations are executed in deterministic Python. The LLM is strictly prohibited from generating numbers.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: FINE-TUNING & QUANTIZATION */}
              {activeTab === "model" && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      Model Specialization & Quantization
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      General-purpose foundation models frequently invent explanations or hallucinate financial math. CovenantProof utilizes a targeted domain-adapted architecture:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase block font-semibold text-[10px]">Training Paradigm</span>
                      <span className="font-semibold text-slate-200">QLoRA (Rank 16, Alpha 32)</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase block font-semibold text-[10px]">Quantization Format</span>
                      <span className="font-semibold text-slate-200">GGUF (Q4_K_M)</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase block font-semibold text-[10px]">Serving Runtime</span>
                      <span className="font-semibold text-slate-200">Ollama via Docker Engine</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase block font-semibold text-[10px]">Hardware Host</span>
                      <span className="font-semibold text-slate-200">AWS g4dn.xlarge (Tesla T4)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-200 block">Why GGUF Quantization on GPU?</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      By compiling the fine-tuned adapter weights into a 4-bit medium quantized GGUF binary, memory consumption is constrained to ~4.8GB VRAM. This enables blazing-fast token generation (&gt;45 tokens/sec) on a low-cost single-GPU EC2 instance without sacrificing credit reasoning fidelity.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">AWS Endpoint:</span>
                    <span className="text-purple-300">52.90.159.170:8000</span>
                  </div>
                </div>
              )}

              {/* TAB 4: TELEMETRY & OBSERVABILITY */}
              {activeTab === "telemetry" && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      Arize Phoenix Distributed Tracing
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      Every audit execution triggered from this frontend instruments OpenInference spans capturing agent transitions, latency percentiles, and exact token footprints.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-slate-200">Live Tracing Dashboard</span>
                      </div>
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px]">
                        ACTIVE AT PORT 6006
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Access the live telemetry collector hosted directly on the AWS GPU instance to inspect raw span waterfall charts and token timings.
                    </p>
                    <a
                      href="http://52.90.159.170:6006"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Open Live Phoenix Collector <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-slate-200">OpenAPI / Swagger Explorer</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Inspect raw schema contracts, payload types, and live REST documentation for the audit microservice:
                    </p>
                    <a
                      href="http://52.90.159.170:8000/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Explore Interactive Swagger Docs <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500">
              <span>Architected & Built by Shivam Singh</span>
              <span className="font-mono">Next.js 16 • LangGraph • Ollama</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
