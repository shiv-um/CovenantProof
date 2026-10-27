import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Server,
  ExternalLink,
  Cpu,
  Layers,
  Clock,
  CheckCircle2,
  Network,
  Zap,
  Code2,
  Terminal,
  ArrowRight,
  Flame,
  Gauge
} from "lucide-react";

export default function ObservabilityPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">

      {/* HEADER SECTION */}
      <section className="px-6 py-12 md:py-16 max-w-5xl mx-auto border-b border-slate-900">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/20 text-amber-400 text-xs font-medium mb-4">
          <Activity className="w-3.5 h-3.5" />
          <span>OpenInference Specification • Production Telemetry</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Arize Phoenix Observability &amp; Distributed Tracing
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-400 max-w-3xl leading-relaxed">
          Deep, span-level runtime visibility into the LangGraph state machine. Instrumenting token latencies, prompt-response payloads, and deterministic agent state transitions directly on our AWS GPU cluster.
        </p>

        {/* Live Collector Status Bar */}
        <div className="mt-6 p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <span className="text-xs font-bold text-slate-200">Active Phoenix Collector:</span>
              <span className="text-xs font-mono text-emerald-400 ml-2">http://52.90.159.170:6006</span>
            </div>
          </div>
          <a
            href="http://52.90.159.170:6006"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
          >
            Launch Live Collector UI <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* SECTION 1: INTERACTIVE TRACE WATERFALL VISUALIZER */}
      <section className="px-6 py-14 max-w-5xl mx-auto border-b border-slate-900 space-y-6">
        <div>
          <Badge className="bg-indigo-950 text-indigo-400 border border-indigo-800/40 text-[10px] mb-2">
            RUNTIME TRACE WATERFALL
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">
            Anatomy of a Single 2.1-Second Audit Trace
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed max-w-3xl">
            In Arize Phoenix, every audit request spawns a parent trace containing child spans for both deterministic code execution and neural inference on the Tesla T4 GPU.
          </p>
        </div>

        {/* Trace Waterfall Container */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6 space-y-4 font-mono text-xs">

          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-400 text-[11px]">
            <span>SPAN OPERATION / NODE</span>
            <div className="flex gap-6">
              <span>LATENCY</span>
              <span>TOKEN FOOTPRINT</span>
            </div>
          </div>

          {/* Root Trace */}
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-400" /> [TRACE] covenant_audit_pipeline
              </span>
              <div className="flex gap-6 font-semibold">
                <span className="text-emerald-400">2,122 ms</span>
                <span className="text-indigo-400">1,842 tokens</span>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-full"></div>
            </div>
          </div>

          {/* Child Span 1: Intake */}
          <div className="pl-6 border-l-2 border-indigo-800/40 space-y-1.5">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" /> span.IntakeNode (Schema &amp; OCR Anchor)
              </span>
              <div className="flex gap-8">
                <span className="text-slate-300">182 ms</span>
                <span className="text-slate-500">0 tokens</span>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-400 h-full w-[8.5%]"></div>
            </div>
          </div>

          {/* Child Span 2: Reconciliation */}
          <div className="pl-6 border-l-2 border-emerald-800/40 space-y-1.5">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> span.ReconciliationNode (Deterministic Math)
              </span>
              <div className="flex gap-8">
                <span className="text-slate-300">12 ms</span>
                <span className="text-slate-500">0 tokens</span>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[1%]"></div>
            </div>
          </div>

          {/* Child Span 3: Covenant Math */}
          <div className="pl-6 border-l-2 border-amber-800/40 space-y-1.5">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-amber-400" /> span.CovenantMathNode (FCCR Assertion)
              </span>
              <div className="flex gap-8">
                <span className="text-slate-300">8 ms</span>
                <span className="text-slate-500">0 tokens</span>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full w-[0.5%]"></div>
            </div>
          </div>

          {/* Child Span 4: Composer LLM Generation */}
          <div className="pl-6 border-l-2 border-purple-800/40 space-y-1.5">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> span.ComposerNode (covenant-auditor GGUF)
              </span>
              <div className="flex gap-8">
                <span className="text-purple-300 font-semibold">1,920 ms</span>
                <span className="text-indigo-400 font-semibold">1,842 tokens</span>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-400 h-full w-[90%]"></div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: WHY ARIZE PHOENIX OVER TRADITIONAL APMS */}
      <section className="px-6 py-14 max-w-5xl mx-auto border-b border-slate-900 space-y-8">
        <div>
          <Badge className="bg-purple-950 text-purple-400 border border-purple-800/40 text-[10px] mb-2">
            ENTERPRISE OBSERVABILITY
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">
            Why Phoenix Beats Traditional APMs (Datadog / Dynatrace)
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed max-w-3xl">
            Generic APMs only measure HTTP status codes and CPU load. In agentic credit auditing, we require LLM-native observability that captures prompt drift, token generation rates, and state mutations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2.5">
            <span className="font-mono text-emerald-400 font-bold text-xs uppercase">01. OpenInference Standards</span>
            <h3 className="text-sm font-semibold text-slate-200">Semantic Token Inspection</h3>
            <p className="text-slate-400 leading-relaxed">
              Every LLM call records exact system prompts, temperature parameters, context documents, and raw GGUF completions without custom wrapper code.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2.5">
            <span className="font-mono text-indigo-400 font-bold text-xs uppercase">02. StateGraph Correlation</span>
            <h3 className="text-sm font-semibold text-slate-200">LangGraph Execution DAGs</h3>
            <p className="text-slate-400 leading-relaxed">
              Maps how state variables mutate across graph transitions. When a variance is flagged, Phoenix displays the exact node that triggered the routing decision.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2.5">
            <span className="font-mono text-amber-400 font-bold text-xs uppercase">03. Automated Evals Sync</span>
            <h3 className="text-sm font-semibold text-slate-200">Continuous Faithfulness Scoring</h3>
            <p className="text-slate-400 leading-relaxed">
              DeepEval &amp; Ragas benchmarks push evaluation scores directly into Phoenix trace records, tracking model drift across model retraining runs.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: ARCHITECTURE SPECS */}
      <section className="px-6 py-14 max-w-5xl mx-auto space-y-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">Live Tracing Ready for Inspection</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Trigger an audit on the <strong>Interactive Audit Desk (`/dashboard`)</strong>, then refresh your Arize Phoenix tab to watch the span appear in real time.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="http://52.90.159.170:6006"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              Open Phoenix Dashboard (:6006) <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900 h-10 px-4 text-xs">
                Back to Audit Desk <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
