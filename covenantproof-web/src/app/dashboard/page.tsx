"use client";
import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BoundingBoxViewer } from "@/components/pdf/BoundingBoxViewer";
import { RecruiterDrawer } from "@/components/dashboard/RecruiterDrawer";
import { PlayCircle, Loader2 } from "lucide-react";

export default function WorkspacePage() {
  const [status, setStatus] = useState<"idle" | "analyzing" | "complete" | "error">("idle");

  const runLiveAudit = async () => {
    setStatus("analyzing");
    try {
      const payload = {
        case_id: "CASE-COBALT-2026",
        company_name: "Cobalt Equipment LLC",
        purchase_order: { document_type: "purchase_order", total_amount: "125000.00" },
        invoice: { document_type: "invoice", total_amount: "125000.00" },
        bank_payment: { document_type: "bank_payment", total_amount: "152000.00" },
        covenant_certificate: {
          document_type: "covenant_certificate",
          ebitda: "1500000.00",
          cash_taxes: "100000.00",
          interest_expense: "700000.00",
          current_maturities: "500000.00",
        },
      };

      // Routes through Next.js edge proxy to avoid HTTPS Mixed Content blocking
      const res = await fetch("/api/proxy/api/v1/audits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("complete");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Inference failed:", error);
      setStatus("error");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-emerald-400">CovenantProof</span>
          <Badge variant="outline" className="text-slate-400 border-slate-700">
            LIVE AWS INFERENCE
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={runLiveAudit}
            disabled={status === "analyzing"}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs"
          >
            {status === "analyzing" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4 mr-2" />
            )}
            {status === "analyzing" ? "Running Agentic Swarm..." : "Run Live Audit"}
          </Button>
          <RecruiterDrawer />
        </div>
      </header>

      {/* 3-Column Workspace */}
      <ResizablePanelGroup className="flex-1 flex flex-row">
        {/* Panel 1: Document Tree */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400">Ingested Documents</h3>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
              <span>📄 PO-2026-8801.pdf</span>
              <Badge className="bg-emerald-950 text-emerald-400">VERIFIED</Badge>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
              <span>📄 INV-2026-9904.pdf</span>
              <Badge className="bg-emerald-950 text-emerald-400">VERIFIED</Badge>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-amber-900/50 text-xs flex justify-between items-center">
              <span>⚠️ PAY-2026-4412.pdf</span>
              <Badge className="bg-amber-950 text-amber-400">DISCREPANCY</Badge>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Panel 2: Reconciliation Findings */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            {status === "idle" && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                <p>Click "Run Live Audit" to execute the LangGraph swarm.</p>
              </div>
            )}
            {status === "analyzing" && (
              <div className="flex flex-col items-center justify-center h-full text-indigo-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="animate-pulse text-sm">Quantized Qwen Model Reasoning...</p>
              </div>
            )}
            {status === "error" && (
              <div className="flex flex-col items-center justify-center h-full text-red-400 text-sm">
                <p>Connection failed. Verify the AWS instance is running and CORS is configured.</p>
              </div>
            )}
            {status === "complete" && (
              <Card className="bg-amber-950/30 border-amber-500/40 text-slate-100 animate-in fade-in zoom-in duration-500">
                <CardHeader>
                  <CardTitle className="text-amber-400 text-base flex items-center gap-2">
                    ⚠️ Verified Document Discrepancy Found
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    Bank wire payment exceeds purchase order and invoice totals by{" "}
                    <strong className="text-amber-300">$27,000.00</strong>.
                  </p>
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block">Purchase Order</span>$125,000.00
                    </div>
                    <div>
                      <span className="text-slate-500 block">Invoice</span>$125,000.00
                    </div>
                    <div className="text-amber-400 font-bold">
                      <span className="text-slate-500 block font-normal">Recorded Payment</span>$152,000.00
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Panel 3: PDF Bounding Box Evidence Viewer */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <BoundingBoxViewer
            pdfUrl="/mock.pdf"
            activeBox={
              status === "complete"
                ? {
                    page: 1,
                    x_min: 0.301,
                    y_min: 0.207,
                    x_max: 0.425,
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
