"use client";

interface BoundingBoxViewerProps {
  pdfUrl?: string;
  amount?: string;
  hasDiscrepancy?: boolean;
  activeBox?: {
    page: number;
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  } | null;
}

export function BoundingBoxViewer({
  amount = "152000.00",
  hasDiscrepancy = true,
  activeBox,
}: BoundingBoxViewerProps) {
  // Dynamically format input into standard currency ($125,000.00, $1,520,001.00, etc.)
  const formattedAmount = (() => {
    const cleanNum = parseFloat(amount.toString().replace(/,/g, ""));
    if (isNaN(cleanNum)) return `$${amount}`;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cleanNum);
  })();

  return (
    <div className="h-full bg-slate-900/40 p-4 flex flex-col items-center justify-start overflow-y-auto">
      {/* Virtual Document Canvas */}
      <div className="relative w-full max-w-[620px] bg-white text-slate-900 rounded-lg shadow-2xl p-8 min-h-[580px] border border-slate-200">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            BANK PAYMENT RECEIPT
          </h2>
        </div>

        {/* Metadata */}
        <div className="space-y-3 text-xs mb-8">
          <div>
            <span className="font-semibold text-slate-800">Payment ID: </span>
            <span className="font-mono text-slate-600">PAY-2026-4412</span>
          </div>
          <div>
            <span className="font-semibold text-slate-800">Counterparty: </span>
            <span className="text-slate-600">Atlas Industrial Supply Inc.</span>
          </div>
        </div>

        {/* Amount Section */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md relative flex items-center">
          <span className="text-xs font-semibold text-slate-800 mr-2">
            Amount Transferred:
          </span>

          {/* Dynamic Amount with Responsive Bounding Box Anchor */}
          <div className="relative inline-flex items-center">
            <span
              className={`font-mono text-sm transition-colors duration-200 ${
                hasDiscrepancy
                  ? "text-red-600 font-bold"
                  : "text-slate-900 font-semibold"
              }`}
            >
              {formattedAmount}
            </span>

            {/* Bounding box highlights ONLY when audit completes AND discrepancy exists */}
            {activeBox && hasDiscrepancy && (
              <div
                className="absolute -inset-1.5 border-2 border-amber-500 bg-amber-500/15 rounded pointer-events-none animate-pulse"
                title="Grounded coordinate anchor: Wire variance detected"
              >
                <span className="absolute -top-3 -right-1 bg-amber-600 text-white text-[8px] font-mono font-bold px-1 rounded uppercase tracking-wider">
                  Variance
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Audit Trail Footnote */}
        <div className="absolute bottom-6 left-8 right-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
          <span>Federal Wire Reference: FED-889104-NY</span>
          <span className="font-mono">Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
