"use client";

export type ActiveDocType = "po" | "invoice" | "payment";

interface BoundingBoxViewerProps {
  activeDoc: ActiveDocType;
  poAmount: string;
  invAmount: string;
  payAmount: string;
  hasDiscrepancy: boolean;
  status: "idle" | "analyzing" | "complete" | "error";
}

export function BoundingBoxViewer({
  activeDoc,
  poAmount,
  invAmount,
  payAmount,
  hasDiscrepancy,
  status,
}: BoundingBoxViewerProps) {
  const formatMoney = (val: string) => {
    const num = parseFloat(val.replace(/,/g, ""));
    return isNaN(num)
      ? `$${val}`
      : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  };

  return (
    <div className="h-full bg-slate-900/40 p-4 flex flex-col items-center justify-start overflow-y-auto">
      <div className="relative w-full max-w-[620px] bg-white text-slate-900 rounded-lg shadow-2xl p-8 min-h-[560px] border border-slate-200">

        {/* DOCUMENT HEADER */}
        <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {activeDoc === "po" && "PURCHASE ORDER"}
              {activeDoc === "invoice" && "COMMERCIAL INVOICE"}
              {activeDoc === "payment" && "BANK PAYMENT RECEIPT"}
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {activeDoc === "po" && "REF: PO-2026-8801 • ISSUED BY BORROWER"}
              {activeDoc === "invoice" && "REF: INV-2026-9904 • VENDOR BILLING"}
              {activeDoc === "payment" && "REF: PAY-2026-4412 • FEDWIRE SETTLEMENT"}
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
            Page 1 of 1
          </span>
        </div>

        {/* METADATA SECTION */}
        <div className="space-y-2.5 text-xs mb-8">
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="font-semibold text-slate-700">Buyer / Obligor:</span>
            <span className="text-slate-600">Cobalt Equipment LLC (Jersey City, NJ)</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="font-semibold text-slate-700">Vendor / Payee:</span>
            <span className="text-slate-600">Atlas Industrial Supply Inc.</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="font-semibold text-slate-700">Settlement Date:</span>
            <span className="font-mono text-slate-600">October 24, 2026</span>
          </div>
        </div>

        {/* DOCUMENT BODY */}
        <div className="space-y-4 mb-8">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Line Item Verification
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs flex justify-between items-center">
            <span className="text-slate-700">Industrial Hydraulic Actuators (Heavy Machinery Lot)</span>
            <span className="font-mono text-slate-600">Qty: 4 Units</span>
          </div>
        </div>

        {/* DOCUMENT TOTAL & BOUNDING BOX ANCHOR */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            {activeDoc === "po" && "Authorized PO Amount:"}
            {activeDoc === "invoice" && "Billed Invoice Amount:"}
            {activeDoc === "payment" && "Amount Transferred:"}
          </span>

          <div className="relative inline-flex items-center">
            <span
              className={`font-mono text-sm ${
                activeDoc === "payment" && hasDiscrepancy
                  ? "text-red-600 font-bold"
                  : "text-slate-900 font-semibold"
              }`}
            >
              {activeDoc === "po" && formatMoney(poAmount)}
              {activeDoc === "invoice" && formatMoney(invAmount)}
              {activeDoc === "payment" && formatMoney(payAmount)}
            </span>

            {/* Bounding box highlight: Appears on Payment receipt when audit completes & discrepancy exists */}
            {activeDoc === "payment" && hasDiscrepancy && status === "complete" && (
              <div className="absolute -inset-1.5 border-2 border-amber-500 bg-amber-500/15 rounded pointer-events-none animate-pulse">
                <span className="absolute -top-3 -right-1 bg-amber-600 text-white text-[8px] font-mono font-bold px-1 rounded uppercase tracking-wider">
                  Tamper Variance
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AUDIT GROUNDING FOOTNOTE */}
        <div className="absolute bottom-6 left-8 right-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
          <span>OCR Hash: sha256-4c9f18a02d...</span>
          <span className="font-mono text-emerald-600 font-medium">✓ Pixel Coordinates Calibrated</span>
        </div>
      </div>
    </div>
  );
}
