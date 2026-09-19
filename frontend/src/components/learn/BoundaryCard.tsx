import React from "react";
import { AlertTriangle } from "lucide-react";

interface BoundaryItem {
  limitation: string;
  explanation: string;
}

interface BoundaryCardProps {
  title?: string;
  subtitle?: string;
  boundaries: BoundaryItem[];
}

export function BoundaryCard({
  title = "Explicit System Boundaries & Limitations",
  subtitle = "What this engine intentionally does NOT claim or do:",
  boundaries,
}: BoundaryCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200/70 shadow-xs space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-rose-900 font-bold text-base">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <h3>{title}</h3>
        </div>
        <p className="text-xs text-rose-800/80 font-medium">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {boundaries.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-white/90 border border-rose-100 space-y-1">
            <h4 className="font-bold text-xs text-rose-950">
              ✕ {item.limitation}
            </h4>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              {item.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
