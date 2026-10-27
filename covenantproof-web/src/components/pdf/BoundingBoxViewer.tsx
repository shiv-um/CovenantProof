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
    <div className="h-full bg-slate-900/40 p-3 md:p-5 flex flex-col items-center justify-start overflow-y-auto">

      {/* WHY TIER-1 BATCH INGESTION FAILED BANNER */}
      <div className="w-full max-w-[640px] mb-3 p-2.5 rounded-lg border border-amber-900/50 bg-amber-950/20 text-amber-300 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider font-mono text-[9px] bg-amber-900/60 text-amber-200 px-1.5 py-0.5 rounded">
            Batch Exception
          </span>
          <span className="truncate">
            {activeDoc === "po" && "Non-standard fax resolution + handwritten pen override broke regex parser."}
            {activeDoc === "invoice" && "Credit memo deduction + multi-tier cash discounts confused OCR templates."}
            {activeDoc === "payment" && "Raw Fedwire MT103 SWIFT tags required semantic entity mapping."}
          </span>
        </div>
        <span className="font-mono text-[10px] text-amber-400/80 shrink-0 ml-2">Tier-2 Triaged</span>
      </div>

      {/* AUTHENTIC SCANNED DOCUMENT CANVAS */}
      <div className="relative w-full max-w-[640px] bg-[#fbfbfa] text-slate-900 rounded-lg shadow-2xl p-6 md:p-8 min-h-[640px] border border-stone-300 font-sans selection:bg-amber-200">

        {/* FAINT FAX / SCAN TRANSMISSION BANNER */}
        <div className="border-b border-stone-300/80 pb-2 mb-5 font-mono text-[9px] text-stone-500 flex justify-between tracking-tight">
          <span>FAX: +1 (201) 555-0144 • COBALT NY METRO OPERATIONS</span>
          <span>OCT 24, 2026 09:14:22 EST • 200 DPI SCAN</span>
          <span className="font-bold">PAGE 01/01</span>
        </div>

        {/* ======================================================== */}
        {/* DOCUMENT 1: PURCHASE ORDER (WITH VOIDED & HANDWRITTEN NOTES) */}
        {/* ======================================================== */}
        {activeDoc === "po" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header with Rubber Stamp */}
            <div className="flex justify-between items-start border-b border-stone-300 pb-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-stone-900 font-serif">
                  PURCHASE REQUISITION ORDER
                </h2>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                  DOCUMENT NO: PO-2026-8801 • ISSUED BY BORROWER
                </p>
              </div>

              {/* Tilted Blue Stamp */}
              <div className="border-2 border-indigo-700 text-indigo-700 text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded tracking-widest rotate-[-6deg] opacity-85 shadow-sm">
                CREDIT COMM. APPROVED
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b border-stone-200 pb-4">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-semibold">Buyer / Obligor</span>
                <span className="font-bold text-stone-900">Cobalt Equipment LLC</span>
                <span className="block text-stone-600 text-[11px]">100 Washington Blvd, Jersey City, NJ</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-semibold">Authorized Vendor</span>
                <span className="font-bold text-stone-900">Atlas Industrial Supply Inc.</span>
                <span className="block text-stone-600 text-[11px]">Philadelphia Logistics Center, PA</span>
              </div>
            </div>

            {/* Complex Multi-Line Item Breakdown */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Itemized Requisition &amp; Amendments
              </span>

              <div className="border border-stone-300 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 text-[10px] uppercase border-b border-stone-300">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800 text-[11px]">
                    <tr>
                      <td className="p-2">
                        <span className="font-medium block">Model 4B Hydraulic Actuator Assembly</span>
                        <span className="text-[10px] text-stone-500">Base Unit Requisition ($35,000 / unit)</span>
                      </td>
                      <td className="p-2 text-right font-mono">4</td>
                      <td className="p-2 text-right font-mono">$140,000.00</td>
                    </tr>
                    <tr className="text-stone-400 line-through">
                      <td className="p-2">
                        <span>Original Volume Incentive Rebate</span>
                        <span className="text-[10px] text-red-600 no-underline font-mono ml-2">[VOIDED PER COMM.]</span>
                      </td>
                      <td className="p-2 text-right font-mono">-</td>
                      <td className="p-2 text-right font-mono">-$20,000.00</td>
                    </tr>
                    <tr>
                      <td className="p-2">Heavy Rigging &amp; Expedited Transport Fee</td>
                      <td className="p-2 text-right font-mono">1</td>
                      <td className="p-2 text-right font-mono">+$5,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Simulated Handwritten Ink Amendment */}
            <div className="p-3 bg-stone-100/80 rounded border border-stone-300 relative">
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                Handwritten Operational Override:
              </span>
              <p className="font-serif italic text-blue-900 text-xs leading-relaxed">
                &quot;Per Credit Amendment #3, standard 10% retainage is waived. Final net authorized purchase order obligation fixed at {formatMoney(poAmount)}. — Verified: D.V.&quot;
              </p>
            </div>

            {/* Total Section */}
            <div className="p-3 bg-stone-100 border border-stone-300 rounded flex justify-between items-center">
              <span className="text-xs font-bold text-stone-800">NET AUTHORIZED PO TOTAL:</span>
              <span className="font-mono text-base font-extrabold text-stone-900">
                {formatMoney(poAmount)}
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DOCUMENT 2: COMMERCIAL INVOICE (DISCOUNTS & CREDIT MEMOS) */}
        {/* ======================================================== */}
        {activeDoc === "invoice" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header with Red Ink Stamp */}
            <div className="flex justify-between items-start border-b border-stone-300 pb-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-stone-900 font-sans">
                  COMMERCIAL BILLING INVOICE
                </h2>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                  INVOICE REF: INV-2026-9904 • ATLAS INDUSTRIAL SUPPLY
                </p>
              </div>

              {/* Tilted Red Stamp */}
              <div className="border-2 border-red-700 text-red-700 text-[10px] font-mono font-extrabold uppercase px-2 py-1 rounded tracking-widest rotate-[4deg] opacity-85 shadow-sm">
                ACCOUNTS PAYABLE RECEIVED
              </div>
            </div>

            {/* Invoice Line Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 text-[11px] pb-1 border-b border-stone-200">
                <span>Remit To: Atlas Industrial Supply Escrow</span>
                <span className="font-mono">Terms: 2% 10 / Net 30</span>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-stone-700">
                  <span>Gross Machinery Billed Total:</span>
                  <span className="font-mono font-medium">$140,000.00</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Hazmat Transport &amp; Rigging Fee:</span>
                  <span className="font-mono font-medium">+$2,500.00</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Trade-In Credit Memo Applied (CM-8812):</span>
                  <span className="font-mono font-bold">-$15,000.00</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px] italic">
                  <span>Early Settlement Discount Deducted:</span>
                  <span className="font-mono">-$2,500.00</span>
                </div>
              </div>
            </div>

            {/* Handwritten Accounts Payable Sticky Note */}
            <div className="p-3 bg-amber-50 rounded border border-amber-300 text-xs shadow-sm">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">
                AP Department Note (Oct 23, 2026):
              </span>
              <p className="font-serif italic text-stone-800 text-[11px] mt-0.5">
                &quot;Cross-referenced with PO-2026-8801. Credit Memo 8812 verified against return inventory. Net payable amount is {formatMoney(invAmount)}.&quot;
              </p>
            </div>

            {/* Total Due */}
            <div className="p-3 bg-stone-100 border border-stone-300 rounded flex justify-between items-center">
              <span className="text-xs font-bold text-stone-800">NET INVOICE BALANCE DUE:</span>
              <span className="font-mono text-base font-extrabold text-stone-900">
                {formatMoney(invAmount)}
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DOCUMENT 3: BANK WIRE CONFIRMATION (FEDWIRE MT103 WITH BOUNDING BOX) */}
        {/* ======================================================== */}
        {activeDoc === "payment" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header with Green Stamp */}
            <div className="flex justify-between items-start border-b border-stone-300 pb-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-stone-900 font-mono">
                  FEDWIRE SETTLEMENT ADVICE
                </h2>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                  FED REF: FED-889104-NY • WIRE ROOM DISBURSEMENT
                </p>
              </div>

              {/* Tilted Green Stamp */}
              <div className="border-2 border-emerald-700 text-emerald-700 text-[10px] font-mono font-extrabold uppercase px-2 py-1 rounded tracking-widest rotate-[-3deg] opacity-85 shadow-sm">
                FUNDS TRANSFERRED • CHASE NY
              </div>
            </div>

            {/* SWIFT / Fedwire Tag Block (Raw Messy Banking Format) */}
            <div className="bg-stone-100 p-3.5 rounded border border-stone-300 font-mono text-[11px] space-y-1.5 text-stone-800">
              <div>
                <span className="text-stone-400">{`{20:`}</span>
                <span className="font-bold">TRN-2026-PAY-4412</span>
                <span className="text-stone-400">{`}`}</span>
              </div>
              <div>
                <span className="text-stone-400">{`{50K:`}</span>
                <span>/ACCT/8891-042 COBALT EQUIPMENT LLC</span>
                <span className="text-stone-400">{`}`}</span>
              </div>
              <div>
                <span className="text-stone-400">{`{59:`}</span>
                <span>/ACCT/0091-884 ATLAS INDUSTRIAL SUPPLY INC</span>
                <span className="text-stone-400">{`}`}</span>
              </div>
              <div>
                <span className="text-stone-400">{`{70:`}</span>
                <span>SETTLEMENT PAYMENT RE PO-2026-8801</span>
                <span className="text-stone-400">{`}`}</span>
              </div>
            </div>

            {/* Dynamic Wire Amount with Calibrated Bounding Box */}
            <div className="p-4 bg-stone-100 border border-stone-300 rounded flex justify-between items-center relative">
              <span className="text-xs font-bold text-stone-800">
                SWIFT {`{32A}`} AMOUNT TRANSFERRED:
              </span>

              <div className="relative inline-flex items-center">
                <span
                  className={`font-mono text-base transition-colors duration-200 ${
                    hasDiscrepancy
                      ? "text-red-600 font-extrabold"
                      : "text-stone-900 font-extrabold"
                  }`}
                >
                  {formatMoney(payAmount)}
                </span>

                {/* Grounded Evidence Bounding Box Highlight */}
                {hasDiscrepancy && status === "complete" && (
                  <div
                    className="absolute -inset-2 border-2 border-amber-500 bg-amber-500/20 rounded pointer-events-none animate-pulse"
                    title="Grounded coordinate anchor: Wire variance detected"
                  >
                    <span className="absolute -top-3.5 -right-1 bg-amber-600 text-white text-[8px] font-mono font-bold px-1.5 rounded uppercase tracking-wider shadow">
                      Variance
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Audit Note */}
            <div className="text-[10px] font-mono text-stone-500 pt-1 flex justify-between">
              <span>Federal Reserve Bank of New York (Fedwire)</span>
              <span>Sequence: 004182-NY-26</span>
            </div>
          </div>
        )}

        {/* BOTTOM AUDIT CERTIFICATION FOOTNOTE */}
        <div className="absolute bottom-5 left-6 right-6 pt-3 border-t border-stone-200 flex justify-between items-center text-[9px] text-stone-400 font-mono">
          <span>OCR Hash: sha256-4c9f18a02d...</span>
          <span className="text-emerald-700 font-bold">✓ Pixel Anchor Grounded (Tesla T4)</span>
        </div>

      </div>
    </div>
  );
}
