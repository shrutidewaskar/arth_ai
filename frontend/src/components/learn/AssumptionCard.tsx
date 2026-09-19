import React from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";

interface AssumptionItem {
  title: string;
  rationale: string;
}

interface AssumptionCardProps {
  title?: string;
  assumptions: AssumptionItem[];
}

export function AssumptionCard({
  title = "Core Mathematical Assumptions & Conservative Standards",
  assumptions,
}: AssumptionCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-slate-900">
        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-base">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {assumptions.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150/70 space-y-1">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0B5D4B]" />
              {item.title}
            </h4>
            <p className="text-[11px] text-slate-550 font-medium leading-relaxed pl-3">
              {item.rationale}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
