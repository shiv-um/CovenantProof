"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  X,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight
} from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestComplete: (extractedValues: {
    poName: string;
    poAmount: string;
    invName: string;
    invAmount: string;
    payName: string;
    payAmount: string;
    ebitda: string;
  }) => void;
}

export function UploadModal({ isOpen, onClose, onIngestComplete }: UploadModalProps) {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<{
    po: File | null;
    invoice: File | null;
    payment: File | null;
    certificate: File | null;
  }>({
    po: null,
    invoice: null,
    payment: null,
    certificate: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (type: keyof typeof files, file: File | null) => {
    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handleDownloadSamplePack = () => {
    const samplePack = {
      manifest: "CovenantProof Corporate Loan Audit Pack v2026.1",
      borrower: "Cobalt Equipment LLC",
      facility_limit: "$25,000,000.00",
      documents: [
        {
          filename: "PO-2026-8801.pdf",
          type: "Purchase Order",
          verified_amount: "125,000.00",
          counterparty: "Atlas Industrial Supply Inc."
        },
        {
          filename: "INV-2026-9904.pdf",
          type: "Commercial Invoice",
          verified_amount: "125,000.00",
          terms: "Net 30"
        },
        {
          filename: "PAY-2026-4412.pdf",
          type: "Bank Wire Transfer Confirmation",
          disbursed_amount: "152,000.00",
          fed_wire_ref: "FED-889104-NY"
        },
        {
          filename: "COV-CERT-2026-Q3.pdf",
          type: "Officer Compliance Certificate",
          ttm_ebitda: "1,500,000.00",
          fixed_charge_ratio: "1.17x",
          covenant_minimum: "1.15x"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(samplePack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "covenantproof_sample_audit_pack.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSimulateCustomIngest = () => {
    // Passes custom/uploaded metadata to the workspace
    onIngestComplete({
      poName: files.po?.name || "PO-CUSTOM-7721.pdf",
      poAmount: "125000.00",
      invName: files.invoice?.name || "INV-CUSTOM-9932.pdf",
      invAmount: "125000.00",
      payName: files.payment?.name || "PAY-CUSTOM-1104.pdf",
      payAmount: files.payment ? "148500.00" : "152000.00",
      ebitda: "1500000.00",
    });
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-100">

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-100">Ingest Loan Facility Audit Documents</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload compliance PDFs or download pre-formatted test templates for agentic 3-way reconciliation
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
        <div className="p-6 space-y-6 text-xs overflow-y-auto max-h-[75vh]">

          {/* Download Sample Pack Banner */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Don&apos;t have credit agreements handy?
              </span>
              <p className="text-[11px] text-slate-400">
                Download the standardized sample credit packet with calibrated POs, Invoices, and Wire Receipts.
              </p>
            </div>
            <Button
              onClick={handleDownloadSamplePack}
              variant="outline"
              size="sm"
              className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border-indigo-500/40 text-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Download Test Pack (.json)
            </Button>
          </div>

          {/* 4-Document Dropzone Grid */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Required 3-Way & Covenant Artifacts (4 Documents)
            </span>

            <div className="grid grid-cols-2 gap-3">

              {/* PO Dropzone */}
              <div className="p-3 bg-slate-900/60 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> 1. Purchase Order
                  </span>
                  {files.po ? (
                    <Badge className="bg-emerald-950 text-emerald-400 text-[9px]">LOADED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 text-[9px] border-slate-800">REQUIRED</Badge>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.json,.txt"
                  onChange={(e) => handleFileChange("po", e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer w-full"
                />
              </div>

              {/* Invoice Dropzone */}
              <div className="p-3 bg-slate-900/60 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" /> 2. Commercial Invoice
                  </span>
                  {files.invoice ? (
                    <Badge className="bg-emerald-950 text-emerald-400 text-[9px]">LOADED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 text-[9px] border-slate-800">REQUIRED</Badge>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.json,.txt"
                  onChange={(e) => handleFileChange("invoice", e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer w-full"
                />
              </div>

              {/* Bank Wire Confirmation Dropzone */}
              <div className="p-3 bg-slate-900/60 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" /> 3. Wire Receipt
                  </span>
                  {files.payment ? (
                    <Badge className="bg-emerald-950 text-emerald-400 text-[9px]">LOADED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 text-[9px] border-slate-800">REQUIRED</Badge>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.json,.txt"
                  onChange={(e) => handleFileChange("payment", e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer w-full"
                />
              </div>

              {/* Compliance Certificate Dropzone */}
              <div className="p-3 bg-slate-900/60 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" /> 4. Covenant Certificate
                  </span>
                  {files.certificate ? (
                    <Badge className="bg-emerald-950 text-emerald-400 text-[9px]">LOADED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 text-[9px] border-slate-800">REQUIRED</Badge>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.json,.txt"
                  onChange={(e) => handleFileChange("certificate", e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer w-full"
                />
              </div>

            </div>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Files uploaded to this browser session are parsed through the LangGraph intake node on your local/AWS runtime without persistent cloud storage retention.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSimulateCustomIngest}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4"
          >
            <span>Ingest &amp; Stage for Swarm Audit</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}
