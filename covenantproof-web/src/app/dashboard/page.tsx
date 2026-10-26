"use client";

import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BoundingBoxViewer } from "@/components/pdf/BoundingBoxViewer";
import { RecruiterDrawer } from "@/components/dashboard/RecruiterDrawer";
import {
  PlayCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from "lucide-react";

type ScenarioType = "tampering" | "clean" | "covenant_breach";

interface AuditInputs {
  poAmount: string;
  invAmount: string;
  payAmount: string;
  ebitda: string;
  cashTaxes: string;
  interestExpense: string;
  currentMaturities: string;
}

const SCENARIOS: Record<ScenarioType, { title: string; subtitle: string; inputs: AuditInputs }> = {
  tampering: {
    title: "1. Wire Tampering",
    subtitle: "$27,000 payment over-draw variance",
    inputs: {
      poAmount: "125000.00",
      invAmount: "125000.00",
      payAmount: "152000.00",
      ebitda: "1500000.00",
      cashTaxes: "100000.00",
      interestExpense: "700000.00",
      currentMaturities: "500000.00",
    },
  },
  clean: {
    title: "2. Clean 3-Way Match",
    subtitle: "100% document reconciliation",
    inputs: {
      poAmount: "125000.00",
      invAmount: "125000.00",
      payAmount: "125000.00",
      ebitda: "1500000.00",
      cashTaxes: "100000.00",
      interestExpense: "700000.00",
      currentMaturities: "500000.00",
    },
  },
  covenant_breach: {
    title: "3. Covenant Breach",
    subtitle: "FCCR falls below 1.15x threshold",
    inputs: {
      poAmount: "125000.00",
      invAmount: "125000.00",
      payAmount: "125000.00",
      ebitda: "1100000.00",
      cashTaxes: "150000.00",
      interestExpense: "750000.00",
      currentMaturities: "550000.00",
    },
  },
};

export default function WorkspacePage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>("tampering");
  const [auditInputs, setAuditInputs] = useState<AuditInputs>(SCENARIOS.tampering.inputs);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "analyzing" | "complete" | "error">("idle");
  const [auditResult, setAuditResult] = useState<any>(null);

  const applyScenario = (type: ScenarioType) => {
    setSelectedScenario(type);
    setAuditInputs(SCENARIOS[type].inputs);
    setStatus("idle");
    setAuditResult(null);
  };

  const runLiveAudit = async () => {
    setStatus("analyzing");
    try {
      const payload = {
        case_id: `CASE-COBALT-${Date.now().toString().slice(-4)}`,
        company_name: "Cobalt Equipment LLC",
        purchase_order: { document_type: "purchase_order", total_amount: auditInputs.poAmount },
        invoice: { document_type: "invoice", total_amount: auditInputs.invAmount },
        bank_payment: { document_type: "bank_payment", total_amount: auditInputs.payAmount },
        covenant_certificate: {
          document_type: "covenant_certificate",
          ebitda: auditInputs.ebitda,
          cash_taxes: auditInputs.cashTaxes,
          interest_expense: auditInputs.interestExpense,
          current_maturities: auditInputs.currentMaturities,
        },
      };

      const res = await fetch("/api/proxy/api/v1/audits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
        setStatus("complete");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Inference failed:", error);
      setStatus("error");
    }
  };

  const po = parseFloat(auditInputs.poAmount) || 0;
  const inv = parseFloat(auditInputs.invAmount) || 0;
  const pay = parseFloat(auditInputs.payAmount) || 0;
  const hasWireDiscrepancy = pay !== po || pay !== inv;
  const variance = Math.abs(pay - inv);

  const ebitda = parseFloat(auditInputs.ebitda) || 1;
  const taxes = parseFloat(auditInputs.cashTaxes) || 0;
  const interest = parseFloat(auditInputs.interestExpense) || 1;
  const maturities = parseFloat(auditInputs.currentMaturities) || 0;
  const fccr = (ebitda - taxes) / (interest + maturities);
  const isCovenantBreached = fccr < 1.15;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-emerald-400 tracking-tight">CovenantProof</span>
          <Badge variant="outline" className="text-slate-400 border-slate-700 font-mono text-[10px]">
            AWS TESLA T4 • LOCAL QLoRA
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditor(!showEditor)}
            className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs h-8"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            {showEditor ? "Hide Field Editor" : "Edit Audit Values"}
          </Button>

          <Button
            onClick={runLiveAudit}
            disabled={status === "analyzing"}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs px-4 shadow-lg shadow-indigo-600/20"
          >
            {status === "analyzing" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4 mr-2" />
            )}
            {status === "analyzing" ? "Running LangGraph Swarm..." : "Run Live Audit"}
          </Button>

          <RecruiterDrawer />
        </div>
      </header>

      {/* Recruiter Scenario Guidance Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium text-slate-300">Recruiter Test Scenarios:</span>
        </div>
        <div className="flex items-center gap-2">
          {(["tampering", "clean", "covenant_breach"] as ScenarioType[]).map((type) => (
            <button
              key={type}
              onClick={() => applyScenario(type)}
              className={`px-3 py-1 rounded text-xs transition-colors border ${
                selectedScenario === type
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 font-medium"
                  : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {SCENARIOS[type].title}
            </button>
          ))}
        </div>
      </div>

      {/* In-Browser Editable Values Bar (Collapsible) */}
      {showEditor && (
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 transition-all animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Interactive Value Injection (Updates Live Audit Payload)
            </span>
            <button
              onClick={() => applyScenario(selectedScenario)}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Scenario Defaults
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Purchase Order ($)</label>
              <input
                type="text"
                value={auditInputs.poAmount}
                onChange={(e) => setAuditInputs({ ...auditInputs, poAmount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Commercial Invoice ($)</label>
              <input
                type="text"
                value={auditInputs.invAmount}
                onChange={(e) => setAuditInputs({ ...auditInputs, invAmount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Bank Payment Wire ($)</label>
              <input
                type="text"
                value={auditInputs.payAmount}
                onChange={(e) => setAuditInputs({ ...auditInputs, payAmount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Borrower EBITDA ($)</label>
              <input
                type="text"
                value={auditInputs.ebitda}
                onChange={(e) => setAuditInputs({ ...auditInputs, ebitda: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main 3-Column Audit Workspace */}
      <ResizablePanelGroup className="flex-1 flex flex-row">
        {/* Panel 1: Document Tree */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="p-4 space-y-3 h-full overflow-y-auto border-r border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ingested Documents
              </h3>
              <span className="text-[10px] font-mono text-slate-500">3 Verified</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
              <div>
                <span className="block font-medium">📄 PO-2026-8801.pdf</span>
                <span className="text-[10px] font-mono text-slate-400">${auditInputs.poAmount}</span>
              </div>
              <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[10px]">
                MATCH
              </Badge>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
              <div>
                <span className="block font-medium">📄 INV-2026-9904.pdf</span>
                <span className="text-[10px] font-mono text-slate-400">${auditInputs.invAmount}</span>
              </div>
              <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[10px]">
                MATCH
              </Badge>
            </div>

            <div
              className={`p-3 rounded-lg border text-xs flex justify-between items-center transition-all ${
                hasWireDiscrepancy
                  ? "bg-slate-900 border-amber-800/60 shadow-sm shadow-amber-950"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <div>
                <span className="block font-medium">
                  {hasWireDiscrepancy ? "⚠️ PAY-2026-4412.pdf" : "📄 PAY-2026-4412.pdf"}
                </span>
                <span
                  className={`text-[10px] font-mono ${
                    hasWireDiscrepancy ? "text-amber-400 font-semibold" : "text-slate-400"
                  }`}
                >
                  ${auditInputs.payAmount}
                </span>
              </div>
              <Badge
                className={
                  hasWireDiscrepancy
                    ? "bg-amber-950/80 text-amber-400 border border-amber-800/40 text-[10px]"
                    : "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[10px]"
                }
              >
                {hasWireDiscrepancy ? "VARIANCE" : "MATCH"}
              </Badge>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Compliance Certificate
              </span>
              <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/60 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Borrower EBITDA:</span>
                  <span className="font-mono text-slate-200">${auditInputs.ebitda}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Covenant FCCR:</span>
                  <span
                    className={`font-mono font-medium ${
                      isCovenantBreached ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {fccr.toFixed(2)}x (Min 1.15x)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Panel 2: Reconciliation Findings & LLM Memo */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            {status === "idle" && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm space-y-2">
                <ShieldCheck className="w-10 h-10 text-slate-700" />
                <p className="font-medium text-slate-400">Ready to audit {selectedScenario.replace("_", " ")}</p>
                <p className="text-xs text-slate-500">
                  Click &quot;Run Live Audit&quot; to trigger the LangGraph swarm on AWS GPU.
                </p>
              </div>
            )}

            {status === "analyzing" && (
              <div className="flex flex-col items-center justify-center h-full text-indigo-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium">Executing LangGraph Multi-Agent Swarm...</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Deterministic Math Node → Fine-Tuned GGUF Synthesis on Tesla T4
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center justify-center h-full text-red-400 text-sm space-y-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <p className="font-medium">Inference endpoint communication failed.</p>
                <p className="text-xs text-slate-500">Verify AWS EC2 instance is active at 52.90.159.170.</p>
              </div>
            )}

            {status === "complete" && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                {/* 3-Way Reconciliation Card */}
                {hasWireDiscrepancy ? (
                  <Card className="bg-amber-950/20 border-amber-500/40 text-slate-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Verified Document Discrepancy Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <p className="text-slate-300">
                        Bank wire payment exceeds purchase order and invoice totals by{" "}
                        <strong className="text-amber-300">
                          ${variance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </strong>
                        .
                      </p>
                      <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-3 rounded border border-slate-800 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Purchase Order</span>
                          <span className="font-mono">${auditInputs.poAmount}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Invoice</span>
                          <span className="font-mono">${auditInputs.invAmount}</span>
                        </div>
                        <div className="text-amber-400 font-bold">
                          <span className="text-slate-500 block font-normal">Recorded Payment</span>
                          <span className="font-mono">${auditInputs.payAmount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-emerald-950/20 border-emerald-500/40 text-slate-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-emerald-400 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Three-Way Reconciliation Verified Clean
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <p className="text-slate-300">
                        Purchase Order, Commercial Invoice, and Bank Payment wire amounts match at{" "}
                        <strong className="text-emerald-300">${auditInputs.payAmount}</strong>.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Covenant Math Card */}
                <Card
                  className={`text-slate-100 ${
                    isCovenantBreached
                      ? "bg-red-950/20 border-red-500/40"
                      : "bg-slate-900/50 border-slate-800"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle
                      className={`text-sm flex items-center gap-2 ${
                        isCovenantBreached ? "text-red-400" : "text-slate-200"
                      }`}
                    >
                      {isCovenantBreached ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                      Covenant Compliance (Fixed Charge Coverage Ratio)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Calculated FCCR:</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          isCovenantBreached ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {fccr.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Covenant Threshold:</span>
                      <span className="font-mono">1.15x Required Minimum</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Fine-Tuned Model Generated Audit Memo */}
                {auditResult?.candidate_assertions?.[0]?.summary && (
                  <div className="bg-slate-900/80 rounded-lg border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                        Fine-Tuned GGUF Synthesis (covenant-auditor)
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Token Cost: $0.00</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      &quot;{auditResult.candidate_assertions[0].summary}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Panel 3: PDF Bounding Box Evidence Viewer */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <BoundingBoxViewer
            pdfUrl="/mock.pdf"
            activeBox={
              status === "complete" && hasWireDiscrepancy
                ? {
                    page: 1,
                    x_min: 0.322,
                    y_min: 0.207,
                    x_max: 0.495,
                    y_max: 0.245,
                  }
                : null
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
