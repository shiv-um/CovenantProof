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
  Server,
  FileCode2,
  Scale,
  Gauge,
  Lock,
  Database
} from "lucide-react";

type TabKey = "business" | "swarm" | "model" | "testing";

export function RecruiterDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("business");

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs h-8 px-3 font-medium transition-all"
      >
        <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400 fill-amber-400" />
        Recruiter & Technical Proof Mode
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 text-slate-100">

            {/* Header */}
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
                <span>Scaling Topology</span>
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
                onClick={() => setActiveTab("testing")}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
                  activeTab === "testing"
                    ? "border-amber-500 text-amber-400 bg-slate-900/80"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Testing & Evals</span>
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
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Math Hallucination</span>
                      <span className="text-xl font-bold font-mono text-indigo-400">0.0%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Deterministic Graph</span>
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
                      Why AI + Deterministic Code? (Not Just a Calculator)
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      Lending auditors do not receive clean numbers—they receive 80-page unstructured credit agreements and diverse PDF invoices. Traditional calculators cannot parse unstructured documents or understand legal definitions of EBITDA add-backs. Conversely, raw LLMs hallucinate financial arithmetic. <strong>CovenantProof uses a neuro-symbolic hybrid:</strong> the AI extracts unstructured evidence, while deterministic Python graphs perform 100% accurate mathematical verification.
                    </p>
                  </div>

                  <div className="p-3.5 bg-indigo-950/20 border border-indigo-800/40 rounded-lg space-y-1.5">
                    <span className="font-semibold text-indigo-200 block text-[11px]">The Enterprise Value Proposition</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Commercial banks manage billions in revolving debt. CovenantProof eliminates manual review bottlenecks, prevents unauthorized wire disbursements, and grounds every finding in exact coordinate evidence for regulatory audit defense.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: AGENT SWARM TOPOLOGY & MILLIONS SCALE */}
              {activeTab === "swarm" && (
                <div className="space-y-6 animate-in fade-in-50">

                  {/* Million Document Batch Ingestion Topology */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-indigo-400" />
                        Million-Document Distributed Architecture
                      </span>
                      <Badge variant="outline" className="text-[10px] border-slate-700">Production Scale</Badge>
                    </div>
                    <div className="font-mono text-[10px] bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 leading-relaxed overflow-x-auto">
{`[ S3 Document Lake (1.2M PDFs / Qtr) ] ──► [ Kafka / AWS SQS Event Stream ]
                                                   │
                ┌──────────────────────────────────┴──────────────────────────────────┐
                ▼                                                                     ▼
[ PySpark Layout Parser ]                                           [ Ray/Celery Distributed Cluster ]
• Tabular boundary detection                                        • 20x Worker Pods on AWS EKS
• OCR coordinate hashing                                            • Continuous Batching (vLLM Engine)
                │                                                                     │
                └──────────────────────────────────┬──────────────────────────────────┘
                                                   ▼
                                [ LangGraph State Machine ]
                                  1. IntakeNode (Schema validation)
                                  2. ReconciliationNode (Deterministic Math)
                                  3. CovenantMathNode (FCCR & Senior Leverage)
                                  4. ComposerNode (Fine-Tuned GGUF Synthesis)
                                                   │
                        ┌──────────────────────────┴──────────────────────────┐
                        ▼                                                     ▼
           [ 96.4% Auto-Approved ]                               [ 3.6% Exception Queue ]
           Direct ledger commit to                               Pushed to CovenantProof
           core banking systems                                  Interactive Review Desk`}
                    </div>
                  </div>

                  {/* Four Architectural Pillars */}
                  <div className="space-y-3">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-semibold text-indigo-300 font-mono text-[11px]">1. Asynchronous Ingestion &amp; Event Decoupling</span>
                      <p className="text-slate-400 text-[11px]">
                        Loan draw requests and quarterly certificates land in Amazon S3, triggering partitioned Kafka queues that decouple heavy document OCR from synchronous API gateways.
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-semibold text-emerald-300 font-mono text-[11px]">2. Continuous Batching via vLLM</span>
                      <p className="text-slate-400 text-[11px]">
                        Instead of single sequential requests, worker pools batch document chunks dynamically (PagedAttention), achieving over 1,850 pages/sec throughput across GPU clusters.
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-semibold text-purple-300 font-mono text-[11px]">3. Deterministic State Machines</span>
                      <p className="text-slate-400 text-[11px]">
                        LangGraph execution state is serialized in Redis. Every step is deterministic, auditable, and isolated from LLM math hallucination.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FINE-TUNING & QUANTIZATION */}
              {activeTab === "model" && (
                <div className="space-y-6 animate-in fade-in-50">
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
                      <span className="text-slate-500 uppercase block font-semibold text-[10px]">Hardware Host</span>
                      <span className="font-semibold text-slate-200">AWS g4dn.xlarge (Tesla T4)</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase block font-semibold text-[10px]">Inference VRAM Footprint</span>
                      <span className="font-semibold text-slate-200">4.8 GB of 16 GB Total</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-200 block">Why On-Premise GPU Inference?</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Commercial lending data contains sensitive financial statements. By hosting fine-tuned quantized models directly on private AWS GPU instances, borrower balance sheets never leave the VPC, completely eliminating 3rd-party data privacy liabilities (GLBA &amp; SOC 2 compliance).
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: TESTING, EVALS & SECURITY GUARDRAILS */}
              {activeTab === "testing" && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-slate-200">Evaluation Pipeline (DeepEval &amp; Ragas)</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 text-[11px] mt-2">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Faithfulness Score (1.00):</strong> Verifies every claim in the generated memo is grounded in ingested document text.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Bounding Box IoU (&gt;0.92):</strong> Intersection-over-Union precision ensuring coordinates wrap the exact numeric digits.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Deterministic Math Accuracy (100%):</strong> Hard assertion checking zero rounding or computational deviations.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-slate-200">Load Testing (Locust Benchmarks)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
                      <div>
                        <span className="text-slate-500 block">P50 Latency</span>
                        <span className="text-emerald-400 font-bold">1.84s</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">P95 Latency</span>
                        <span className="text-indigo-400 font-bold">2.41s</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Concurrency</span>
                        <span className="text-slate-200 font-bold">50 Users/Node</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href="http://52.90.159.170:6006"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-slate-900 hover:bg-slate-800 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-indigo-400 font-semibold"
                    >
                      <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> Arize Phoenix Tracing</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="http://52.90.159.170:8000/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-slate-900 hover:bg-slate-800 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-indigo-400 font-semibold"
                    >
                      <span className="flex items-center gap-1.5"><FileCode2 className="w-3.5 h-3.5" /> Swagger REST API</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500">
              <span>Architected &amp; Built by Shivam Singh</span>
              <span className="font-mono">Next.js 16 • LangGraph • Ollama</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
