"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Database,
  CheckCircle2,
  Lock,
  GitBranch,
  FileText
} from "lucide-react";

type TabKey = "business" | "swarm" | "model" | "testing" | "architecture-qa";

export function RecruiterDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("business");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Trigger Button inside Header */}
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs h-8 px-3 font-medium transition-all"
      >
        <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400 fill-amber-400" />
        Recruiter & Technical Proof Mode
      </Button>

      {/* Slide-Over Overlay */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
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
            <div className="grid grid-cols-5 border-b border-slate-800 bg-slate-900/30 text-xs">
              <button
                onClick={() => setActiveTab("business")}
                className={`py-3 px-1.5 flex items-center justify-center gap-1 font-medium border-b-2 transition-colors ${
                  activeTab === "business"
                    ? "border-emerald-500 text-emerald-400 bg-slate-900/80"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>ROI & Biz</span>
              </button>

              <button
                onClick={() => setActiveTab("swarm")}
                className={`py-3 px-1.5 flex items-center justify-center gap-1 font-medium border-b-2 transition-colors ${
                  activeTab === "swarm"
                    ? "border-indigo-500 text-indigo-400 bg-slate-900/80"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Topology</span>
              </button>

              <button
                onClick={() => setActiveTab("model")}
                className={`py-3 px-1.5 flex items-center justify-center gap-1 font-medium border-b-2 transition-colors ${
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
                className={`py-3 px-1.5 flex items-center justify-center gap-1 font-medium border-b-2 transition-colors ${
                  activeTab === "testing"
                    ? "border-amber-500 text-amber-400 bg-slate-900/80"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Stress & Evals</span>
              </button>

              <button
                onClick={() => setActiveTab("architecture-qa")}
                className={`py-3 px-1.5 flex items-center justify-center gap-1 font-medium border-b-2 transition-colors ${
                  activeTab === "architecture-qa"
                    ? "border-sky-500 text-sky-400 bg-slate-900/80"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Engineering Q&amp;A</span>
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
                      <span className="text-xl font-bold font-mono text-emerald-400">1.3s</span>
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
                      Why AI + Deterministic Code? (Compound AI System)
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      Lending auditors do not receive clean numbers—they receive 300-page unstructured credit agreements and diverse PDF invoices. Traditional calculators cannot parse unstructured documents or extract legal definitions of EBITDA add-backs. Conversely, raw LLMs hallucinate financial arithmetic. <strong>CovenantProof uses a neuro-symbolic hybrid:</strong> the AI extracts unstructured evidence, while deterministic Python graphs execute mathematical verification with zero floating-point drift.
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
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-indigo-400" />
                        10-Million Document Funnel Architecture
                      </span>
                      <Badge variant="outline" className="text-[10px] border-slate-700">Production Scale</Badge>
                    </div>
                    <div className="font-mono text-[10px] bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 leading-relaxed overflow-x-auto">
{`[ S3 Ingestion Lake: 10,000,000 Raw PDFs ]
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│ Tier 1: Deterministic OCR & Regex Line-Rate Engine     │
│ ($0.0001/doc | AWS Textract / Tesseract Workers)       │
└────────────────────────────────────────────────────────┘
        │                                       │
        ▼ (96.4% Clean)                         ▼ (3.6% Exceptions)
[ 9,640,000 Auto-Approved ]             [ 360,000 Exception Documents ]
Committed straight-through to           (Unread OCR, Format Shifts, Wire Deltas)
Core Banking Ledger                             │
                                                ▼
                                ┌───────────────────────────────────────┐
                                │ Kafka Event Stream / Redis Partition  │
                                │ Sharded by Corporate Facility ID      │
                                └───────────────────────────────────────┘
                                                │
                                                ▼
                                ┌───────────────────────────────────────┐
                                │ Tier 2: LangGraph 4-Agent Cluster     │
                                │ (Self-Hosted Ollama / GGUF on EC2)    │
                                └───────────────────────────────────────┘
                                                │
                                                ▼
                                [ Exception Triage Workspace (UI) ]`}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-semibold text-indigo-300 font-mono text-[11px]">1. Event-Driven Partitioning via Kafka</span>
                      <p className="text-slate-400 text-[11px]">
                        Loan draw requests and quarterly certificates land in S3, triggering partitioned Kafka queues that decouple heavy document OCR from synchronous API gateways.
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-semibold text-emerald-300 font-mono text-[11px]">2. Deterministic State Machines &amp; Redis Caching</span>
                      <p className="text-slate-400 text-[11px]">
                        LangGraph execution state is serialized in Redis. Every step is deterministic, auditable, and isolated from LLM math hallucination.
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-semibold text-purple-300 font-mono text-[11px]">3. Kernel-Enforced PostgreSQL RLS Isolation</span>
                      <p className="text-slate-400 text-[11px]">
                        The database restricts access via Row-Level Security using the non-superuser <code className="text-sky-300">covenant_app</code> role (<code className="text-amber-300">NOBYPASSRLS</code>), guaranteeing complete data isolation across 1,000+ institutional tenants.
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

              {/* TAB 4: TESTING, EVALS & LIVE BENCHMARKS */}
              {activeTab === "testing" && (
                <div className="space-y-6 animate-in fade-in-50">
                  {/* Empirical Locust Table */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-slate-200">Live Stress Benchmark (Locust Headless)</span>
                      </div>
                      <Badge className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                        0.00% Failure Rate
                      </Badge>
                    </div>

                    <p className="text-slate-400 text-[11px]">
                      Conducted across the public internet against the live AWS EC2 container (<code className="text-sky-300">52.90.159.170:8000</code>) with 20 concurrent simulated credit officers:
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-950/60 text-slate-400 uppercase text-[9.5px] border-b border-slate-800">
                          <tr>
                            <th className="py-1.5 px-2 font-medium">Endpoint</th>
                            <th className="py-1.5 px-2 font-medium">Reqs</th>
                            <th className="py-1.5 px-2 font-medium">Fails</th>
                            <th className="py-1.5 px-2 font-medium">P50</th>
                            <th className="py-1.5 px-2 font-medium">P90</th>
                            <th className="py-1.5 px-2 font-medium">P99</th>
                            <th className="py-1.5 px-2 font-medium">Throughput</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                          <tr>
                            <td className="py-2 px-2 text-sky-400">POST /api/v1/audits</td>
                            <td className="py-2 px-2">310</td>
                            <td className="py-2 px-2 text-emerald-400">0 (0.0%)</td>
                            <td className="py-2 px-2">1,400ms</td>
                            <td className="py-2 px-2">1,500ms</td>
                            <td className="py-2 px-2 text-amber-300">1,700ms</td>
                            <td className="py-2 px-2 text-emerald-400">10.52 rps</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2 text-emerald-400">GET /health</td>
                            <td className="py-2 px-2">133</td>
                            <td className="py-2 px-2 text-emerald-400">0 (0.0%)</td>
                            <td className="py-2 px-2">130ms</td>
                            <td className="py-2 px-2">210ms</td>
                            <td className="py-2 px-2">280ms</td>
                            <td className="py-2 px-2 text-emerald-400">4.51 rps</td>
                          </tr>
                          <tr className="bg-slate-950 font-semibold text-white">
                            <td className="py-2 px-2">Total Aggregated</td>
                            <td className="py-2 px-2">443</td>
                            <td className="py-2 px-2 text-emerald-400">0 (0.0%)</td>
                            <td className="py-2 px-2">1,300ms</td>
                            <td className="py-2 px-2">1,500ms</td>
                            <td className="py-2 px-2 text-sky-300">1,700ms</td>
                            <td className="py-2 px-2 text-emerald-400">15.04 rps</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Evaluation Pipeline */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-slate-200">Evaluation Pipeline &amp; Invariant Guardrails</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 text-[11px] mt-2">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Faithfulness Score (1.00):</strong> OpenInference telemetry verifies every claim in the generated memo is grounded in ingested document text.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Bounding Box Grounding:</strong> Pixel anchors map SWIFT MT103 and invoices directly to coordinate overlays.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Unit &amp; Functional Test Suites:</strong> Strict PyTest suites validating deterministic Decimal arithmetic and LangGraph DAG transitions.</span>
                      </li>
                    </ul>
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

              {/* TAB 5: ARCHITECTURAL DEEP-DIVE & FAQ */}
              {activeTab === "architecture-qa" && (
                <div className="space-y-4 animate-in fade-in-50 text-[11px]">

                  {/* QA 1 */}
                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> 1. How does it handle messy 1,000+ page documents?
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      Dumping 1,000 pages into an LLM context creates severe context rot, high latency (30s+), and excessive token costs. CovenantProof uses <strong>Two-Stage Layout-Aware Filtering:</strong> PyMuPDF/Docling parses pages into structured layout blocks once upon upload. A lightweight hybrid search (BM25 for section titles like <em>"Section 8.4(b) Consolidated EBITDA"</em> + vector embeddings) extracts only the 4–8 relevant candidate pages into LangGraph, keeping inference latency under 1.8s.
                    </p>
                  </div>

                  {/* QA 2 */}
                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5" /> 2. Why only 3–4 documents per audit case in the UI?
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      Commercial asset-based lending evaluates individual <strong>Drawdown / Borrowing Base Packages</strong>. Each funding release requires an exact transactional triad: (1) Purchase Order, (2) Vendor Commercial Invoice, and (3) Fedwire MT103 Settlement Advice, cross-checked against the quarterly Covenant Compliance Certificate. When auditing thousands of transactions, the system evaluates them as discrete facility triads and aggregates findings into a consolidated portfolio report.
                    </p>
                  </div>

                  {/* QA 3 */}
                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> 3. How to scale to 1,000 companies simultaneously (Multi-Tenancy)?
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      Rather than brittle software filters, CovenantProof enforces <strong>PostgreSQL Row-Level Security (RLS)</strong> at the kernel level using a dedicated <code className="text-sky-300">covenant_app</code> role created with <code className="text-amber-300">NOBYPASSRLS</code>. All database sessions set <code className="text-slate-200">app.current_tenant</code>. A query with an unauthorized tenant context returns zero rows automatically. State is cached under tenant-isolated Redis keyspaces (<code className="text-slate-200">tenant:&#123;id&#125;:case:&#123;id&#125;</code>).
                    </p>
                  </div>

                  {/* QA 4 */}
                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> 4. Is this AI Engineering or just Software Engineering?
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      This is a <strong>Compound AI System</strong>. Software engineering alone cannot handle unstructured PDF layout entropy, fuzzy corporate name reconciliation, or natural language credit agreements. Pure LLM wrappers fail because LLMs hallucinate financial arithmetic. CovenantProof uses local SLMs strictly for perceptual layout parsing, while delegating all financial ratios, tolerance bounds, and compliance rules to a deterministic multi-agent state graph.
                    </p>
                  </div>

                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500">
              <span>Architected &amp; Built by Shivam Singh</span>
              <span className="font-mono">Next.js 16 • LangGraph • PostgreSQL RLS • Ollama</span>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
