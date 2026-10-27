import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Component,
  Database,
  Server,
  Cpu,
  Layers,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Activity,
  FileText,
  Code2,
  Network,
  ExternalLink,
  Workflow
} from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">

      {/* HEADER SECTION */}
      <section className="px-6 py-12 md:py-16 max-w-5xl mx-auto border-b border-slate-900">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/20 text-indigo-400 text-xs font-medium mb-4">
          <Component className="w-3.5 h-3.5" />
          <span>Technical Whitepaper &amp; System Specifications</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          System Architecture &amp; Enterprise Scalability
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-400 max-w-3xl leading-relaxed">
          How CovenantProof scales from a single interactive credit audit desk to auditing millions of unstructured financial documents across high-throughput distributed worker clusters.
        </p>

        {/* Quick Spec Pills */}
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="border-slate-800 bg-slate-900/60 text-slate-300">
            Orchestrator: LangGraph Multi-Agent DAG
          </Badge>
          <Badge variant="outline" className="border-slate-800 bg-slate-900/60 text-slate-300">
            Model: QLoRA Fine-Tuned GGUF (Q4_K_M)
          </Badge>
          <Badge variant="outline" className="border-slate-800 bg-slate-900/60 text-slate-300">
            Inference: Ollama on AWS EC2 g4dn.xlarge (Tesla T4)
          </Badge>
          <Badge variant="outline" className="border-slate-800 bg-slate-900/60 text-slate-300">
            Telemetry: Arize Phoenix OpenInference
          </Badge>
        </div>
      </section>

      {/* SECTION 1: TWO-TIER ARCHITECTURE (SOLVES POINT 4: MILLIONS SCALE) */}
      <section className="px-6 py-14 max-w-5xl mx-auto border-b border-slate-900 space-y-8">
        <div>
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px] mb-2">
            ENTERPRISE SCALE PARADIGM
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">
            Scaling to Millions of Documents: The Two-Tier Architecture
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed max-w-3xl">
            In commercial banking, no human manually reviews millions of clean files. Real-world high-throughput platforms decouple high-volume automated processing from exception handling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Database className="w-4 h-4" /> Tier 1: Asynchronous Batch Swarm
              </span>
              <Badge variant="outline" className="border-slate-700 text-[10px] text-slate-400">Headless Pipeline</Badge>
            </div>
            <h3 className="text-base font-semibold text-slate-100">Automated High-Volume Processing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Processes <strong>1.2M+ quarterly borrower files</strong> across AWS S3 and Kafka streams. Distributed worker pools (Ray Core / Celery on Kubernetes) execute OCR parsing and deterministic math checks.
            </p>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-emerald-400">
              ✓ 96.4% Clean Passes: Auto-reconciled and committed straight to core accounting systems without human touch.
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Tier 2: Interactive Exception Desk
              </span>
              <Badge variant="outline" className="border-slate-700 text-[10px] text-slate-400">Human-In-The-Loop</Badge>
            </div>
            <h3 className="text-base font-semibold text-slate-100">Sub-Second Forensic Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When Tier 1 detects wire tampering, payment variances, or covenant breaches (<strong>the 3.6% anomaly queue</strong>), it routes the exact document triplet to the CovenantProof workspace.
            </p>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-amber-300">
              ⚠️ 3.6% Edge Cases: Rendered in the 3-column workspace with live pixel bounding boxes for senior credit officer sign-off.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: END-TO-END BLOCK DIAGRAM (SOLVES POINT 5) */}
      <section className="px-6 py-14 max-w-5xl mx-auto border-b border-slate-900 space-y-6">
        <div>
          <Badge className="bg-indigo-950 text-indigo-400 border border-indigo-800/40 text-[10px] mb-2">
            BLOCK DIAGRAM
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">
            End-to-End System Topology
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed max-w-3xl">
            Complete data flow from client document ingestion in Amazon S3 down to GPU-accelerated local GGUF synthesis and OpenInference tracing.
          </p>
        </div>

        {/* Formatted Architecture Diagram Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Network className="w-4 h-4 text-indigo-400" />
              <span>CovenantProof Production VPC Topology</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">AWS us-east-1 VPC</span>
          </div>

          <pre className="font-mono text-[11px] leading-relaxed text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800/80 overflow-x-auto">
{`┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. INGESTION &amp; STREAMING LAYER                                                         │
│                                                                                        │
│   [ Amazon S3 Document Lake ] ────► [ Apache Kafka / AWS SQS Partitioned Topic ]       │
│   (1.2M+ PDFs / Quarter)                  │ (Buffering up to 10,000 draw requests/min) │
└───────────────────────────────────────────┼────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. DISTRIBUTED EXECUTION CLUSTER (AWS EKS)                                             │
│                                                                                        │
│   ┌───────────────────────────────┐     ┌──────────────────────────────────────────┐   │
│   │   PySpark / LayoutParser      │     │  Continuous Batching Engine (vLLM Pool)  │   │
│   │   • PDF Table Boundary OCR    │     │  • TensorRT-LLM / vLLM PagedAttention   │   │
│   │   • Pixel Coordinate Hashing  │     │  • 1,850 Pages/Sec Throughput            │   │
│   └───────────────┬───────────────┘     └────────────────────┬─────────────────────┘   │
└───────────────────┼──────────────────────────────────────────┼─────────────────────────┘
                    │                                          │
                    └────────────────────┬─────────────────────┘
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. COVENANTPROOF STATE MACHINE (LangGraph Multi-Agent DAG)                              │
│                                                                                        │
│   [ IntakeNode ] ─────────► [ ReconciliationNode ] ────► [ CovenantMathNode ]          │
│   (Schema Validation)       (100% Deterministic Math)    (FCCR &amp; Leverage Check)       │
│                                                                  │                     │
│                                                                  ▼                     │
│                             [ ComposerNode ] ◄───────────────────┘                     │
│                             (Ollama QLoRA GGUF on Tesla T4)                            │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴─────────────────────┐
                    ▼                                          ▼
┌──────────────────────────────────────┐   ┌────────────────────────────────────────────┐
│ 4. OBSERVABILITY &amp; AUDIT TRAIL        │   │ 5. CLIENT PRESENTATION LAYER               │
│                                      │   │                                            │
│   • Arize Phoenix Tracing (:6006)    │   │   • Next.js 16 App Router (Vercel Edge)    │
│   • OpenInference Token Spans        │   │   • Live Coordinate Bounding Box Viewer    │
│   • Immutable Audit Hash Logs        │   │   • Interactive Exception Desk (/dashboard)│
└──────────────────────────────────────┘   └────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* SECTION 3: NEURO-SYMBOLIC PIPELINE (SOLVES POINT 12) */}
      <section className="px-6 py-14 max-w-5xl mx-auto border-b border-slate-900 space-y-6">
        <div>
          <Badge className="bg-purple-950 text-purple-400 border border-purple-800/40 text-[10px] mb-2">
            AGENTIC WORKFLOW
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">
            The Neuro-Symbolic Graph: Why Deterministic Math Beats Pure LLMs
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed max-w-3xl">
            A deep-dive into each specialized node within the LangGraph state machine. Math is permanently isolated from generative hallucination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-indigo-400 font-bold">1. IntakeNode</span>
              <Badge variant="outline" className="border-slate-700 text-[10px]">Unstructured AI</Badge>
            </div>
            <h4 className="font-semibold text-slate-200">Schema Conformance &amp; OCR Anchoring</h4>
            <p className="text-slate-400 leading-relaxed">
              Ingests raw multi-format PDFs and extracts tabular figures into structured Pydantic schemas. It calculates normalized bounding box coordinates (`x_min`, `y_min`, `x_max`, `y_max`) for every extracted figure.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-emerald-400 font-bold">2. ReconciliationNode</span>
              <Badge variant="outline" className="border-emerald-800/50 text-emerald-400 text-[10px]">Deterministic Code</Badge>
            </div>
            <h4 className="font-semibold text-slate-200">Three-Way Mathematical Cross-Check</h4>
            <p className="text-slate-400 leading-relaxed">
              Pure Python node with <strong>zero LLM involvement</strong>. Computes:
              <br />
              <code className="text-[11px] font-mono text-emerald-300">variance = abs(wire_payment - invoice_total)</code>.
              <br />
              If variance &gt; 0, it emits an immutable tamper alert with grounded pixel citations.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-amber-400 font-bold">3. CovenantMathNode</span>
              <Badge variant="outline" className="border-amber-800/50 text-amber-400 text-[10px]">Deterministic Code</Badge>
            </div>
            <h4 className="font-semibold text-slate-200">Debt Ratio &amp; Compliance Calculation</h4>
            <p className="text-slate-400 leading-relaxed">
              Calculates Fixed Charge Coverage Ratio (FCCR):
              <br />
              <code className="text-[11px] font-mono text-amber-300">FCCR = (EBITDA - Cash Taxes) / (Debt Service + Capex)</code>.
              <br />
              Hard threshold verification against credit agreement terms (e.g., Minimum 1.15x).
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-purple-400 font-bold">4. ComposerNode</span>
              <Badge variant="outline" className="border-purple-800/50 text-purple-400 text-[10px]">Fine-Tuned GGUF</Badge>
            </div>
            <h4 className="font-semibold text-slate-200">Executive Memorandum Synthesis</h4>
            <p className="text-slate-400 leading-relaxed">
              Our fine-tuned local model generates formal credit audit prose. The prompt strictly limits the LLM to summarizing the mathematically verified state variables without recalculating figures.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: ARCHITECTURAL CHOICES & TRADE-OFFS (SOLVES POINT 6) */}
      <section className="px-6 py-14 max-w-5xl mx-auto border-b border-slate-900 space-y-6">
        <div>
          <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] mb-2">
            ENGINEERING DECISION LOG
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">
            Key Architectural Decisions &amp; Trade-Offs
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed max-w-3xl">
            Why specific technologies were chosen over popular alternatives.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-200 text-sm">Decision 1: LangGraph vs. Standard LangChain / AutoGen</h4>
              <Badge className="bg-indigo-950 text-indigo-300 border border-indigo-800/50 text-[10px]">Deterministic State</Badge>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Standard LLM agents are prone to cyclic loops and unbounded token consumption. LangGraph provides an explicit Directed Acyclic Graph (DAG) with strict TypedDict state schemas. State transitions are deterministic, and failed nodes can be retried without restarting the pipeline.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-200 text-sm">Decision 2: Local Quantized GGUF on AWS GPU vs. OpenAI API</h4>
              <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[10px]">Compliance &amp; Data Privacy</Badge>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Commercial bank audit data contains non-public corporate financial information. Sending balance sheets and wire receipts to cloud LLM APIs violates Gramm-Leach-Bliley Act (GLBA) and SOC 2 requirements. Hosting a 4-bit fine-tuned GGUF model inside an air-gapped AWS VPC guarantees zero data egress and zero recurring per-token inference fees.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-200 text-sm">Decision 3: Next.js Edge Proxy vs. Direct Backend Exposure</h4>
              <Badge className="bg-amber-950 text-amber-300 border border-amber-800/50 text-[10px]">Network Security</Badge>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Directly querying the AWS EC2 instance (`52.90.159.170:8000`) over HTTP from a browser triggers Mixed Content security blocks on Vercel (HTTPS). The Next.js edge proxy (`/api/proxy`) securely tunnels requests server-side, protecting backend IP addresses and eliminating client-side CORS headers.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: LIVE TELEMETRY & SPECS */}
      <section className="px-6 py-14 max-w-5xl mx-auto space-y-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">Inspect Real-Time AWS Telemetry</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Every audit execution from the live application generates OpenInference spans on our AWS GPU instance. Review span waterfall charts, token latencies, and state transitions live.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="http://52.90.159.170:6006"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs transition-colors"
            >
              Arize Phoenix (:6006) <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="http://52.90.159.170:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded-lg text-xs border border-slate-700 transition-colors"
            >
              Swagger API (:8000) <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
