"use client";
import React from "react";

export interface BoundingBox {
  page: number;
  x_min: number; // 0.0 to 1.0
  y_min: number;
  x_max: number;
  y_max: number;
}

interface BoundingBoxViewerProps {
  pdfUrl: string;
  activeBox?: BoundingBox | null;
}

export function BoundingBoxViewer({ pdfUrl, activeBox }: BoundingBoxViewerProps) {
  return (
    <div className="relative w-full h-full bg-slate-900 overflow-auto flex justify-center p-4">

      {/* Custom Keyframe for the Glow Effect */}
      <style>{`
        @keyframes throb {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.2); }
          50% { box-shadow: 0 0 20px 4px rgba(245, 158, 11, 0.6); background-color: rgba(245, 158, 11, 0.35); }
        }
        .animate-throb {
          animation: throb 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Mock PDF Container / Layer */}
      <div className="relative w-[595px] h-[842px] bg-white text-slate-900 shadow-2xl p-8 rounded select-none">
        <h2 className="text-lg font-bold border-b pb-2 border-slate-300">BANK PAYMENT RECEIPT</h2>
        <div className="mt-4 text-xs space-y-2">
          <p><strong>Payment ID:</strong> PAY-2026-4412</p>
          <p><strong>Counterparty:</strong> Atlas Industrial Supply Inc.</p>
          <div className="mt-8 p-4 bg-slate-100 rounded border border-slate-200">
            <p className="text-sm"><strong>Amount Transferred:</strong> <span className="text-red-600 font-bold">$152,000.00</span></p>
          </div>
        </div>

        {/* Bounding Box Highlight Overlay */}
        {activeBox && (
          <div
            className="absolute border-2 border-amber-500 bg-amber-400/20 rounded pointer-events-none animate-throb transition-all duration-300"
            style={{
              left: `${activeBox.x_min * 100}%`,
              top: `${activeBox.y_min * 100}%`,
              width: `${(activeBox.x_max - activeBox.x_min) * 100}%`,
              height: `${(activeBox.y_max - activeBox.y_min) * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
