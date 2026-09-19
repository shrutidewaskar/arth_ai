import React from "react";
import { LucideIcon, ArrowRight, ArrowDown } from "lucide-react";

export interface FlowStep {
  number: string;
  title: string;
  badge?: string;
  description: string;
  icon?: LucideIcon;
  subDetails?: string[];
}

interface FlowDiagramProps {
  title?: string;
  subtitle?: string;
  steps: FlowStep[];
}

export function FlowDiagram({ title, subtitle, steps }: FlowDiagramProps) {
  return (
    <div className="space-y-6">
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>}
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between relative group hover:border-emerald-500/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0B5D4B] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    Step {step.number}
                  </span>
                  {Icon && (
                    <div className="h-7 w-7 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#0B5D4B]" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {step.title}
                  </h3>
                  {step.badge && (
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                      {step.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>

              {step.subDetails && step.subDetails.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                  {step.subDetails.map((detail, dIdx) => (
                    <div key={dIdx} className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#18B27A]" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
