import React from "react";
import { Calculator } from "lucide-react";

interface ParameterDef {
  symbol: string;
  name: string;
  description: string;
}

interface ExampleData {
  inputs: Record<string, string>;
  result: string;
  explanation: string;
}

interface FormulaCardProps {
  title: string;
  formulaDisplay: string;
  description: string;
  parameters: ParameterDef[];
  example?: ExampleData;
  sourceFunction?: string;
}

export function FormulaCard({
  title,
  formulaDisplay,
  description,
  parameters,
  example,
  sourceFunction,
}: FormulaCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
      {/* Title & Function reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
            <Calculator className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-base text-slate-900">{title}</h3>
        </div>
        {sourceFunction && (
          <code className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md self-start sm:self-auto border border-slate-200/60">
            {sourceFunction}
          </code>
        )}
      </div>

      {/* Formula Equation Box */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-center text-xs sm:text-sm shadow-inner overflow-x-auto py-5 tracking-wide">
        <div className="text-emerald-400 font-bold">{formulaDisplay}</div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
        {description}
      </p>

      {/* Parameters list */}
      <div className="space-y-2.5">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Parameter Definitions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {parameters.map((param, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-150/70 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-0.5">
                <span className="font-mono text-[#0B5D4B]">{param.symbol}</span>
                <span>=</span>
                <span>{param.name}</span>
              </div>
              <p className="text-[11px] text-slate-550 font-medium">{param.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Example Calculation Box (Strictly marked as an illustrative example) */}
      {example && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
              Example Calculation
            </span>
            <span className="text-[10px] text-amber-700 font-semibold">(Illustrative only, not live user data)</span>
          </div>

          <div className="text-xs text-slate-700 space-y-1">
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-slate-600 pt-1">
              {Object.entries(example.inputs).map(([k, v], i) => (
                <span key={i}>
                  <strong>{k}:</strong> {v}
                </span>
              ))}
            </div>
            <p className="font-bold text-[#0B5D4B] pt-1">
              Result: {example.result}
            </p>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              {example.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
