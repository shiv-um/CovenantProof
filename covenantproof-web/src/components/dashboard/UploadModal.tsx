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
  Sparkles,
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

  // 1-Click: Instantly stages mock PDF files into all 4 slots
  const handleAutoLoadSamples = () => {
    const mockPo = new File(["PO Mock Data"], "PO-2026-8801.pdf", { type: "application/pdf" });
    const mockInv = new File(["Invoice Mock Data"], "INV-2026-9904.pdf", { type: "application/pdf" });
    const mockPay = new File(["Wire Receipt Mock Data"], "PAY-2026-4412.pdf", { type: "application/pdf" });
    const mockCov = new File(["Covenant Cert Mock Data"], "COV-CERT-2026-Q3.pdf", { type: "application/pdf" });

    setFiles({
      po: mockPo,
      invoice: mockInv,
      payment: mockPay,
      certificate: mockCov,
    });
  };

  // Downloads the actual mock PDF so users can test file upload manually
  const handleDownloadSamplePdf = () => {
    const link = document.createElement("a");
    link.href = "/mock.pdf";
    link.download = "Sample-Bank-Wire-Receipt.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulateCustomIngest = () => {
    onIngestComplete({
      poName: files.po?.name || "PO-2026-8801.pdf",
      poAmount: "125000.00",
      invName: files.invoice?.name || "INV-2026-9904.pdf",
      invAmount: "125000.00",
      payName: files.payment?.name || "PAY-2026-4412.pdf",
      payAmount: files.payment ? "152000.00" : "152000.00",
      ebitda: "1500000.00",
    });
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const allLoaded = Boolean(files.po && files.invoice && files.payment && files.certificate);

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
              Upload compliance PDFs or auto-load sample credit packages for agentic reconciliation
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

          {/* Sample Helper Box */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Don&apos;t have loan files on your machine?
              </span>
              <p className="text-[11px] text-slate-400">
                Instantly populate all 4 audit artifacts or download a sample receipt PDF to test uploading.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={handleDownloadSamplePdf}
                variant="outline"
                size="sm"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs h-7 px-2.5"
              >
                <Download className="w-3 h-3 mr-1 text-slate-400" />
                Get Sample PDF
              </Button>
              <Button
                onClick={handleAutoLoadSamples}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-3 shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-3 h-3 mr-1 text-amber-300" />
                Auto-Fill 4 Files
              </Button>
            </div>
          </div>

          {/* 4-Document Dropzone Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Required Audit Artifacts (4 Documents)
              </span>
              {allLoaded && (
                <span className="text-[10px] text-emerald-400 font-medium">✓ All 4 Artifacts Staged</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">

              {/* PO Dropzone */}
              <div className={`p-3 rounded-lg border space-y-2 transition-colors ${
                files.po ? "bg-slate-900/90 border-emerald-800/60" : "bg-slate-900/40 border-dashed border-slate-800"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> 1. Purchase Order
                  </span>
                  {files.po ? (
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px]">LOADED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 text-[9px] border-slate-800">REQUIRED</Badge>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange("po", e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer w-full"
                />
                {files.po && (
                  <p className="text-[10px] font-mono text-slate-400 truncate">{files.po.name}</p>
                )}
              </div>

              {/* Invoice Dropzone */}
              <div className={`p-3 rounded-lg border space-y-2 transition-colors ${
                files.invoice ? "bg-slate-900/90 border-emerald-800/60" : "bg-slate-900/40 border-dashed border-slate-800"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" /> 2. Commercial Invoice
                  </span>
                  {files.invoice ? (
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px]">LOADED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 text-[9px] border-slate-800">REQUIRED</Badge>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange("invoice", e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer w-full"
                />
                {files.invoice && (
                  <p className="text-[10px] font-mono text-slate-400 truncate">{files.invoice.name}</p>
                )}
              </div>

              {/* Bank Wire Confirmation Dropzone */}
              <div className={`p-3 rounded-lg border space-y-2 transition-colors ${
                files.payment ? "bg-slate-900/90 border-emerald-800/60" : "bg-slate-900/40 border-dashed border-slate-800"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" /> 3. Wire Receipt
                  </span>
                  {files.payment ? (
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px]">LOADED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 text-[9px] border-slate-800">REQUIRED</Badge>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange("payment", e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer w-full"
                />
                {files.payment && (
                  <p className="text-[10px] font-mono text-slate-400 truncate">{files.payment.name}</p>
                )}
              </div>

              {/* Compliance Certificate Dropzone */}
              <div className={`p-3 rounded-lg border space-y-2 transition-colors ${
                files.certificate ? "bg-slate-900/90 border-emerald-800/60" : "bg-slate-900/40 border-dashed border-slate-800"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" /> 4. Covenant Certificate
                  </span>
                  {files.certificate ? (
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px]">LOADED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 text-[9px] border-slate-800">REQUIRED</Badge>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange("certificate", e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer w-full"
                />
                {files.certificate && (
                  <p className="text-[10px] font-mono text-slate-400 truncate">{files.certificate.name}</p>
                )}
              </div>

            </div>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Uploaded documents are parsed by the LangGraph intake node for three-way cross-verification and covenant calculation on AWS without persistent storage retention.
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
