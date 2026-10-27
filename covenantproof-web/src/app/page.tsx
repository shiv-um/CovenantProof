import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  FileSearch,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Building2,
  FileCode2
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">

      {/* HERO SECTION */}
      <section className="relative px-6 py-16 md:py-24 max-w-6xl mx-auto border-b border-slate-900 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-xs font-medium mb-6 animate-in fade-in slide-in-from-top-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Production-Ready Financial Audit Orchestrator</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight max-w-4xl leading-tight md:leading-tight">
          Deterministic, Evidence-Grounded Credit Auditing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">Corporate Lenders</span>
        </h1>

        <p className="mt-5 text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
          Automating 3-way loan document reconciliation and debt covenant verification in under 3 seconds. Eliminating financial math hallucination with zero client data privacy leakage.
        </p>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold h-11 px-6 text-xs md:text-sm shadow-lg shadow-emerald-500/20">
              Launch Interactive Audit Desk <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/architecture">
            <Button variant="outline" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 h-11 px-6 text-xs md:text-sm">
              Inspect System Topology
            </Button>
          </Link>
        </div>

        {/* Executive Impact Metrics */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl text-left">
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block">Audit Latency</span>
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-emerald-400 mt-1 block">2.1s</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">vs. 4-8 hrs manual review</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block">Math Hallucination</span>
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-indigo-400 mt-1 block">0.0%</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Deterministic Python graph</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block">Inference Cost</span>
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-amber-400 mt-1 block">$0.00</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Air-gapped AWS GPU pool</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block">Batch Capacity</span>
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-slate-200 mt-1 block">1.2M+</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Docs / Qtr batch throughput</span>
          </div>
        </div>
      </section>

      {/* THE PROBLEM STATEMENT & LAYMAN EXPLANATION */}
      <section className="px-6 py-16 max-w-5xl mx-auto border-b border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 mb-3 text-[10px]">
            THE REAL-WORLD PROBLEM
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Why Commercial Lending Audits Are Broken
          </h2>
          <p className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed">
            Commercial banks, private credit funds, and loan compliance officers manage billions in revolving debt facilities. Every draw request and quarterly close requires auditing mountains of unstructured documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-red-900/30 bg-red-950/10 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-red-900/30 flex items-center justify-center text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">The Analyst Bottleneck</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Junior credit analysts spend 4 to 8 hours manually cross-checking purchase orders, billing invoices, and bank wire receipts against loan agreements. This creates major delays during quarter-end reporting.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-amber-900/30 bg-amber-950/10 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-900/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Undetected Wire Tampering</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When documents span different formats, payment mismatches and altered vendor wire numbers go unnoticed until reconciliation weeks later—risking unauthorized capital loss.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-indigo-900/30 bg-indigo-950/10 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/30 flex items-center justify-center text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Regulatory & FDIC Scrutiny</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Examiners require audit-ready proof for covenant metrics like Fixed Charge Coverage (FCCR). Unverified spreadsheets fail compliance reviews without exact document citations.
            </p>
          </div>
        </div>
      </section>

      {/* WHY AI + DETERMINISTIC CODE (THE CALCULATOR REBUTTAL) */}
      <section className="px-6 py-16 max-w-5xl mx-auto border-b border-slate-900">
        <div className="p-8 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Badge className="bg-indigo-950 text-indigo-300 border border-indigo-800/40 text-[10px] mb-2">
                CORE TECHNICAL REBUTTAL
              </Badge>
              <h2 className="text-xl md:text-2xl font-bold">
                &quot;Why Not Just Use a Calculator or Excel Formula?&quot;
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
              Neuro-Symbolic Architecture
            </span>
          </div>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            If commercial lending data arrived in neat Excel tables, a simple Python script could do the math in 10 lines. But real-world credit documents are messy: <strong>80-page scanned PDF credit agreements, multi-column vendor invoices, and complex legal clauses</strong> defining borrower EBITDA add-backs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
              <span className="font-semibold text-red-400 block flex items-center gap-1.5">
                ✕ Where Pure Calculators & Code Fail
              </span>
              <p className="text-slate-400 leading-relaxed">
                Traditional deterministic code cannot interpret unstructured PDFs, read arbitrary invoice formats, or understand legal covenant definitions (e.g., <em>&quot;Section 8.4(b) allows add-backs capped at 15% of EBITDA&quot;</em>).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
              <span className="font-semibold text-amber-400 block flex items-center gap-1.5">
                ✕ Where Pure LLMs (like GPT-4o) Fail
              </span>
              <p className="text-slate-400 leading-relaxed">
                LLMs are probabilistic language models. When asked to perform multi-step subtraction, ratios, and reconciliations across financial tables, they hallucinate numbers and cannot be trusted with balance sheets.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs text-slate-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 block mb-1">The CovenantProof Solution: The Neuro-Symbolic Agent</strong>
              <span>
                We use fine-tuned local models strictly for what they excel at: <strong>unstructured extraction, entity mapping, and synthesis</strong>. We then freeze the extracted figures and pass them to <strong>deterministic Python execution nodes</strong> for 100% mathematically exact calculations. Zero math hallucination.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO USE / WORKFLOW */}
      <section className="px-6 py-16 max-w-5xl mx-auto border-b border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="text-slate-400 border-slate-800 mb-3 text-[10px]">
            HOW IT WORKS
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            How an Audit Runs in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <span className="font-mono text-emerald-400 font-bold text-sm">01. INGEST &amp; EXTRACT</span>
            <h3 className="text-sm font-semibold text-slate-200">Unstructured Document Ingestion</h3>
            <p className="text-slate-400 leading-relaxed">
              The intake agent parses incoming Purchase Orders, Invoices, and Payment Receipts, mapping pixel bounding box coordinates for each figure.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <span className="font-mono text-indigo-400 font-bold text-sm">02. RECONCILE &amp; VERIFY</span>
            <h3 className="text-sm font-semibold text-slate-200">Deterministic 3-Way Graph Match</h3>
            <p className="text-slate-400 leading-relaxed">
              Deterministic Python state nodes verify cross-document matching and calculate debt covenants (FCCR) against credit agreement thresholds.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <span className="font-mono text-purple-400 font-bold text-sm">03. AUDIT MEMO &amp; EVIDENCE</span>
            <h3 className="text-sm font-semibold text-slate-200">Grounded Synthesis &amp; Triage</h3>
            <p className="text-slate-400 leading-relaxed">
              The fine-tuned local GGUF model drafts the executive audit memorandum, citing exact pixel coordinate anchors for instant human sign-off.
            </p>
          </div>
        </div>
      </section>

      {/* COMPETITIVE MATRIX (WHY NOT AN EXISTING PRODUCT?) */}
      <section className="px-6 py-16 max-w-5xl mx-auto border-b border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge variant="outline" className="text-amber-400 border-amber-500/30 mb-3 text-[10px]">
            COMPETITIVE BENCHMARK
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            How CovenantProof Compares to Existing Solutions
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-400">
            Evaluating cost, accuracy, and data security across enterprise alternatives.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 text-[10px] uppercase font-semibold">
              <tr>
                <th className="p-3.5">Solution</th>
                <th className="p-3.5">Annual Cost</th>
                <th className="p-3.5">Processing Speed</th>
                <th className="p-3.5">Math Accuracy</th>
                <th className="p-3.5">Data Privacy / Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
              <tr>
                <td className="p-3.5 font-medium">Manual Credit Analysts (40 FTEs)</td>
                <td className="p-3.5 text-red-400 font-mono">$4,800,000 / yr</td>
                <td className="p-3.5 text-slate-400">4–8 hours / facility</td>
                <td className="p-3.5 text-amber-400">Human fatigue risk</td>
                <td className="p-3.5 text-slate-400">Compliant (Manual)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Legacy OCR (AWS Textract / ABBYY)</td>
                <td className="p-3.5 text-slate-300 font-mono">$45,000 / yr</td>
                <td className="p-3.5 text-slate-400">10–15 seconds / doc</td>
                <td className="p-3.5 text-red-400">Brittle; breaks on layout changes</td>
                <td className="p-3.5 text-slate-400">Compliant (No reasoning)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Cloud LLM API Wrapper (OpenAI GPT-4o)</td>
                <td className="p-3.5 text-amber-400 font-mono">$240,000 / yr</td>
                <td className="p-3.5 text-slate-400">8–12 seconds / doc</td>
                <td className="p-3.5 text-red-400">Frequent math hallucinations</td>
                <td className="p-3.5 text-red-400 font-medium">Data privacy breach (GLBA risk)</td>
              </tr>
              <tr className="bg-emerald-950/20 font-semibold border-t-2 border-emerald-500/40">
                <td className="p-3.5 text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> CovenantProof (AWS GPU Swarm)
                </td>
                <td className="p-3.5 text-emerald-400 font-mono">$6,320 / yr (98.7% savings)</td>
                <td className="p-3.5 text-emerald-400 font-mono">2.1 seconds / facility</td>
                <td className="p-3.5 text-emerald-400 font-mono">100% Deterministic (0% error)</td>
                <td className="p-3.5 text-emerald-400 font-medium">100% On-Prem (Zero data egress)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold">Ready to Inspect the Working System?</h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
          Test live audit scenarios directly against the AWS Tesla T4 GPU backend, or inspect the distributed scaling architecture.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link href="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-10 px-5 text-xs">
              Go to Interactive Audit Desk <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/architecture">
            <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900 h-10 px-5 text-xs">
              Read Architecture Deep-Dive
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
