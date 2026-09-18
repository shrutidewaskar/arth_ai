import React from "react";
import { Scale } from "lucide-react";
import { EmptyState } from "@/components/shared/UIStates";

interface SimulatorTabProps {
  compareMode: boolean;
  setCompareMode: (val: boolean) => void;
  simType: string;
  setSimType: (val: string) => void;
  simIncomeType: string;
  setSimIncomeType: (val: string) => void;
  simIncomeVal: number;
  setSimIncomeVal: (val: number) => void;
  simExpenseType: string;
  setSimExpenseType: (val: string) => void;
  simExpenseVal: number;
  setSimExpenseVal: (val: number) => void;
  simLoanPrincipal: number;
  setSimLoanPrincipal: (val: number) => void;
  simLoanInterest: number;
  setSimLoanInterest: (val: number) => void;
  simLoanTenure: number;
  setSimLoanTenure: (val: number) => void;
  simLoanAssetVal: number;
  setSimLoanAssetVal: (val: number) => void;
  simInvestVal: number;
  setSimInvestVal: (val: number) => void;
  simulatedData: any;
  setSimulatedData: (val: any) => void;
  simLoading: boolean;
  runScenarioSimulation: () => void;
  comparisonResult: any;
  setComparisonResult: (val: any) => void;
  runDecisionComparison: () => void;
  optAType: string;
  setOptAType: (val: string) => void;
  optAIncomeType: string;
  setOptAIncomeType: (val: string) => void;
  optAIncomeVal: number;
  setOptAIncomeVal: (val: number) => void;
  optAExpenseType: string;
  setOptAExpenseType: (val: string) => void;
  optAExpenseVal: number;
  setOptAExpenseVal: (val: number) => void;
  optALoanPrincipal: number;
  setOptALoanPrincipal: (val: number) => void;
  optALoanInterest: number;
  setOptALoanInterest: (val: number) => void;
  optALoanTenure: number;
  setOptALoanTenure: (val: number) => void;
  optALoanAssetVal: number;
  setOptALoanAssetVal: (val: number) => void;
  optAInvestVal: number;
  setOptAInvestVal: (val: number) => void;
  optBType: string;
  setOptBType: (val: string) => void;
  optBIncomeType: string;
  setOptBIncomeType: (val: string) => void;
  optBIncomeVal: number;
  setOptBIncomeVal: (val: number) => void;
  optBExpenseType: string;
  setOptBExpenseType: (val: string) => void;
  optBExpenseVal: number;
  setOptBExpenseVal: (val: number) => void;
  optBLoanPrincipal: number;
  setOptBLoanPrincipal: (val: number) => void;
  optBLoanInterest: number;
  setOptBLoanInterest: (val: number) => void;
  optBLoanTenure: number;
  setOptBLoanTenure: (val: number) => void;
  optBLoanAssetVal: number;
  setOptBLoanAssetVal: (val: number) => void;
  optBInvestVal: number;
  setOptBInvestVal: (val: number) => void;
}

export function SimulatorTab({
  compareMode,
  setCompareMode,
  simType,
  setSimType,
  simIncomeType,
  setSimIncomeType,
  simIncomeVal,
  setSimIncomeVal,
  simExpenseType,
  setSimExpenseType,
  simExpenseVal,
  setSimExpenseVal,
  simLoanPrincipal,
  setSimLoanPrincipal,
  simLoanInterest,
  setSimLoanInterest,
  simLoanTenure,
  setSimLoanTenure,
  simLoanAssetVal,
  setSimLoanAssetVal,
  simInvestVal,
  setSimInvestVal,
  simulatedData,
  setSimulatedData,
  simLoading,
  runScenarioSimulation,
  comparisonResult,
  setComparisonResult,
  runDecisionComparison,
  optAType,
  setOptAType,
  optAIncomeType,
  setOptAIncomeType,
  optAIncomeVal,
  setOptAIncomeVal,
  optAExpenseType,
  setOptAExpenseType,
  optAExpenseVal,
  setOptAExpenseVal,
  optALoanPrincipal,
  setOptALoanPrincipal,
  optALoanInterest,
  setOptALoanInterest,
  optALoanTenure,
  setOptALoanTenure,
  optALoanAssetVal,
  setOptALoanAssetVal,
  optAInvestVal,
  setOptAInvestVal,
  optBType,
  setOptBType,
  optBIncomeType,
  setOptBIncomeType,
  optBIncomeVal,
  setOptBIncomeVal,
  optBExpenseType,
  setOptBExpenseType,
  optBExpenseVal,
  setOptBExpenseVal,
  optBLoanPrincipal,
  setOptBLoanPrincipal,
  optBLoanInterest,
  setOptBLoanInterest,
  optBLoanTenure,
  setOptBLoanTenure,
  optBLoanAssetVal,
  setOptBLoanAssetVal,
  optBInvestVal,
  setOptBInvestVal,
}: SimulatorTabProps) {
  const renderFormFields = (
    prefix: string,
    t: string,
    setT: (v: string) => void,
    incType: string,
    setIncType: (v: string) => void,
    incVal: number,
    setIncVal: (v: number) => void,
    expType: string,
    setExpType: (v: string) => void,
    expVal: number,
    setExpVal: (v: number) => void,
    loanP: number,
    setLoanP: (v: number) => void,
    loanI: number,
    setLoanI: (v: number) => void,
    loanT: number,
    setLoanT: (v: number) => void,
    loanA: number,
    setLoanA: (v: number) => void,
    investVal: number,
    setInvestVal: (v: number) => void
  ) => {
    return (
      <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
        <div className="flex gap-2">
          {["NEW_LIABILITY", "INCOME_CHANGE", "EXPENSE_CHANGE", "INVESTMENT_CONTRIBUTION"].map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setT(opt);
                setComparisonResult(null);
                setSimulatedData(null);
              }}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition border ${
                t === opt
                  ? "bg-slate-700 text-white border-slate-700"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {opt.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="pt-2">
          {t === "INCOME_CHANGE" && (
            <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Adjustment Mode</label>
                <select
                  value={incType}
                  onChange={(e) => setIncType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-bold"
                >
                  <option value="percentage">Percentage Change (%)</option>
                  <option value="absolute">Absolute Change (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Value Change (+/-)</label>
                <input
                  type="number"
                  value={incVal}
                  onChange={(e) => setIncVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-black"
                />
              </div>
            </div>
          )}

          {t === "EXPENSE_CHANGE" && (
            <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Adjustment Mode</label>
                <select
                  value={expType}
                  onChange={(e) => setExpType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-bold"
                >
                  <option value="absolute">Absolute Change (₹)</option>
                  <option value="percentage">Percentage Change (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Value Change (+/-)</label>
                <input
                  type="number"
                  value={expVal}
                  onChange={(e) => setExpVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-black"
                />
              </div>
            </div>
          )}

          {t === "NEW_LIABILITY" && (
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Principal (₹)</label>
                <input
                  type="number"
                  value={loanP}
                  onChange={(e) => setLoanP(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-black"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Interest Rate (% APR)</label>
                <input
                  type="number"
                  step="0.1"
                  value={loanI}
                  onChange={(e) => setLoanI(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-black"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Tenure (Years)</label>
                <input
                  type="number"
                  value={loanT}
                  onChange={(e) => setLoanT(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-black"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Asset Value (₹)</label>
                <input
                  type="number"
                  value={loanA}
                  onChange={(e) => setLoanA(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-black"
                />
              </div>
            </div>
          )}

          {t === "INVESTMENT_CONTRIBUTION" && (
            <div className="text-[11px] font-semibold">
              <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Monthly Change (+/- ₹)</label>
              <input
                type="number"
                value={investVal}
                onChange={(e) => setInvestVal(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-black"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-display text-base font-bold text-slate-700">Interactive Scenario Simulator</h3>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border">
          <button
            onClick={() => {
              setCompareMode(false);
              setComparisonResult(null);
              setSimulatedData(null);
            }}
            className={`px-3 py-1 rounded-md text-[10px] font-extrabold ${
              !compareMode ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
            }`}
          >
            Single Scenario
          </button>
          <button
            onClick={() => {
              setCompareMode(true);
              setComparisonResult(null);
              setSimulatedData(null);
            }}
            className={`px-3 py-1 rounded-md text-[10px] font-extrabold ${
              compareMode ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
            }`}
          >
            Compare Options
          </button>
        </div>
      </div>

      {!compareMode ? (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
          <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Configure Scenario Type</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: "NEW_LIABILITY", label: "New Loan/Liability" },
              { id: "INCOME_CHANGE", label: "Income Change" },
              { id: "EXPENSE_CHANGE", label: "Expense Change" },
              { id: "INVESTMENT_CONTRIBUTION", label: "Investment Contribution" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSimType(opt.id);
                  setSimulatedData(null);
                }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition border text-center ${
                  simType === opt.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-slate-600 border-slate-200/60 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200/40">
            {simType === "INCOME_CHANGE" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Adjustment Mode</label>
                  <select
                    value={simIncomeType}
                    onChange={(e) => setSimIncomeType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold"
                  >
                    <option value="percentage">Percentage Change (%)</option>
                    <option value="absolute">Absolute Change (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Value Change (+/-)</label>
                  <input
                    type="number"
                    value={simIncomeVal}
                    onChange={(e) => setSimIncomeVal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                  />
                </div>
              </div>
            )}

            {simType === "EXPENSE_CHANGE" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Adjustment Mode</label>
                  <select
                    value={simExpenseType}
                    onChange={(e) => setSimExpenseType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold"
                  >
                    <option value="absolute">Absolute Change (₹)</option>
                    <option value="percentage">Percentage Change (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Value Change (+/-)</label>
                  <input
                    type="number"
                    value={simExpenseVal}
                    onChange={(e) => setSimExpenseVal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                  />
                </div>
              </div>
            )}

            {simType === "NEW_LIABILITY" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Principal (₹)</label>
                  <input
                    type="number"
                    value={simLoanPrincipal}
                    onChange={(e) => setSimLoanPrincipal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Interest Rate (% APR)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simLoanInterest}
                    onChange={(e) => setSimLoanInterest(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Tenure (Years)</label>
                  <input
                    type="number"
                    value={simLoanTenure}
                    onChange={(e) => setSimLoanTenure(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Asset Value (₹)</label>
                  <input
                    type="number"
                    value={simLoanAssetVal}
                    onChange={(e) => setSimLoanAssetVal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                  />
                </div>
              </div>
            )}

            {simType === "INVESTMENT_CONTRIBUTION" && (
              <div className="text-xs font-semibold max-w-md">
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Monthly Change (+/- ₹)</label>
                <input
                  type="number"
                  value={simInvestVal}
                  onChange={(e) => setSimInvestVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={runScenarioSimulation}
              className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-1.5"
            >
              Calculate Scenario Impact
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-5">
          <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Configure Scenario Alternatives</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Option A Parameters</h4>
              {renderFormFields(
                "optA",
                optAType,
                setOptAType,
                optAIncomeType,
                setOptAIncomeType,
                optAIncomeVal,
                setOptAIncomeVal,
                optAExpenseType,
                setOptAExpenseType,
                optAExpenseVal,
                setOptAExpenseVal,
                optALoanPrincipal,
                setOptALoanPrincipal,
                optALoanInterest,
                setOptALoanInterest,
                optALoanTenure,
                setOptALoanTenure,
                optALoanAssetVal,
                setOptALoanAssetVal,
                optAInvestVal,
                setOptAInvestVal
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Option B Parameters</h4>
              {renderFormFields(
                "optB",
                optBType,
                setOptBType,
                optBIncomeType,
                setOptBIncomeType,
                optBIncomeVal,
                setOptBIncomeVal,
                optBExpenseType,
                setOptBExpenseType,
                optBExpenseVal,
                setOptBExpenseVal,
                optBLoanPrincipal,
                setOptBLoanPrincipal,
                optBLoanInterest,
                setOptBLoanInterest,
                optBLoanTenure,
                setOptBLoanTenure,
                optBLoanAssetVal,
                setOptBLoanAssetVal,
                optBInvestVal,
                setOptBInvestVal
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={runDecisionComparison}
              className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-1.5"
            >
              Run Decision Comparison
            </button>
          </div>
        </div>
      )}

      {simLoading && (
        <div className="bg-slate-50 p-6 rounded-2xl border text-center text-xs font-bold text-slate-500 animate-pulse">
          ⌛ Executing rules-engine simulations on modified context...
        </div>
      )}

      {simulatedData && !simLoading && !compareMode && (
        <div className="space-y-6">
          <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-2xl relative">
            <span className="absolute top-4 right-4 text-[8px] uppercase tracking-widest font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              SIMULATION — NOT SAVED
            </span>

            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-800">Assessment: {simulatedData.assessment.label}</h4>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
                {simulatedData.assessment.severity} Impact
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-2">
              {simulatedData.assessment.summary}
            </p>

            {simulatedData.assessment.warnings?.length > 0 && (
              <div className="mt-3.5 space-y-1.5 pt-3.5 border-t border-amber-200/50">
                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Warnings Detected</p>
                {simulatedData.assessment.warnings.map((warn: string, idx: number) => (
                  <p key={idx} className="text-xs text-rose-750 font-medium">
                    ⚠️ {warn}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b font-bold text-slate-500 text-[10px] uppercase">
                <tr>
                  <th className="p-4">Financial Metric</th>
                  <th className="p-4">Current Baseline</th>
                  <th className="p-4">Projected Scenario</th>
                  <th className="p-4">Absolute Delta</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-slate-700 divide-y divide-slate-100">
                {[
                  {
                    label: "Net Worth",
                    base: simulatedData.baseline.net_worth,
                    proj: simulatedData.projected.net_worth,
                    delta: simulatedData.impact.net_worth_delta,
                    format: "currency",
                  },
                  {
                    label: "Monthly Surplus",
                    base: simulatedData.baseline.monthly_surplus,
                    proj: simulatedData.projected.monthly_surplus,
                    delta: simulatedData.impact.monthly_surplus_delta,
                    format: "currency",
                  },
                  {
                    label: "Savings Rate",
                    base: simulatedData.baseline.savings_rate_pct,
                    proj: simulatedData.projected.savings_rate_pct,
                    delta: simulatedData.impact.savings_rate_delta,
                    format: "percent",
                  },
                  {
                    label: "Debt-to-Income",
                    base: simulatedData.baseline.dti_ratio_pct,
                    proj: simulatedData.projected.dti_ratio_pct,
                    delta: simulatedData.impact.dti_delta,
                    format: "percent",
                  },
                  {
                    label: "Emergency Runway",
                    base: simulatedData.baseline.emergency_runway_months,
                    proj: simulatedData.projected.emergency_runway_months,
                    delta: simulatedData.impact.runway_delta,
                    format: "months",
                  },
                  {
                    label: "Health Score",
                    base: simulatedData.baseline.financial_health_score,
                    proj: simulatedData.projected.financial_health_score,
                    delta: simulatedData.impact.health_score_delta,
                    format: "score",
                  },
                ].map((row, idx) => {
                  const isPos = row.delta > 0;
                  const isNeg = row.delta < 0;
                  let deltaClass = "text-slate-500 font-bold";
                  if (row.label === "Debt-to-Income") {
                    deltaClass = isPos ? "text-rose-600 font-black" : isNeg ? "text-emerald-700 font-black" : deltaClass;
                  } else {
                    deltaClass = isPos ? "text-emerald-700 font-black" : isNeg ? "text-rose-600 font-black" : deltaClass;
                  }

                  const formatVal = (v: number, fmt: string) => {
                    if (fmt === "currency") return `₹${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                    if (fmt === "percent") return `${v.toFixed(1)}%`;
                    if (fmt === "months") return `${v.toFixed(1)} mo`;
                    return `${v.toFixed(0)}`;
                  };

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{row.label}</td>
                      <td className="p-4">{formatVal(row.base, row.format)}</td>
                      <td className="p-4">{formatVal(row.proj, row.format)}</td>
                      <td className={`p-4 ${deltaClass}`}>
                        {isPos ? "+" : ""}
                        {formatVal(row.delta, row.format)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setSimulatedData(null)}
              className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Back to Baseline Position
            </button>
          </div>
        </div>
      )}

      {comparisonResult && !simLoading && compareMode && (() => {
        const optA = comparisonResult.options.find((o: any) => o.id === "option_a");
        const optB = comparisonResult.options.find((o: any) => o.id === "option_b");
        const recOpt = comparisonResult.comparison.recommended_option;

        const formatVal = (v: number, fmt: string) => {
          if (v === undefined || v === null) return "-";
          if (fmt === "currency") return `₹${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
          if (fmt === "percent") return `${v.toFixed(1)}%`;
          if (fmt === "months") return `${v.toFixed(1)} mo`;
          return `${v.toFixed(0)}`;
        };

        return (
          <div className="space-y-6">
            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl relative">
              <span className="absolute top-4 right-4 text-[8px] uppercase tracking-widest font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                DECISION INTELLIGENCE RECOMMENDATION
              </span>

              <h4 className="text-sm font-black text-slate-800">
                Recommended Option:{" "}
                <span className="text-primary font-black uppercase">
                  {recOpt === "option_a"
                    ? "Option A"
                    : recOpt === "option_b"
                    ? "Option B"
                    : "None (Insufficient Data)"}
                </span>
              </h4>

              <div className="mt-3.5 space-y-2">
                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                  Deterministic Decision Logic
                </p>
                {comparisonResult.comparison.reasons.map((r: string, idx: number) => (
                  <p key={idx} className="text-xs text-slate-700 leading-relaxed font-semibold">
                    ✅ {r}
                  </p>
                ))}
              </div>

              {comparisonResult.comparison.tradeoffs?.length > 0 && (
                <div className="mt-3.5 space-y-1.5 pt-3.5 border-t border-emerald-100">
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Option Tradeoffs</p>
                  {comparisonResult.comparison.tradeoffs.map((t: string, idx: number) => (
                    <p key={idx} className="text-xs text-amber-800 font-medium">
                      ⚠️ {t}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b font-bold text-slate-500 text-[10px] uppercase">
                  <tr>
                    <th className="p-4">Financial Metric</th>
                    <th className="p-4">Baseline Position</th>
                    <th className="p-4">Option A projected</th>
                    <th className="p-4">Option B projected</th>
                  </tr>
                </thead>
                <tbody className="font-semibold text-slate-700 divide-y divide-slate-100">
                  {[
                    { label: "Net Worth", key: "net_worth", format: "currency" },
                    { label: "Monthly Surplus", key: "monthly_surplus", format: "currency" },
                    { label: "Savings Rate", key: "savings_rate_pct", format: "percent" },
                    { label: "Debt-to-Income", key: "dti_ratio_pct", format: "percent" },
                    { label: "Emergency Runway", key: "emergency_runway_months", format: "months" },
                    { label: "Health Score", key: "financial_health_score", format: "score" },
                  ].map((row, idx) => {
                    const baseVal = comparisonResult.baseline ? comparisonResult.baseline[row.key] : 0;
                    const valA = optA ? optA.projected[row.key] : 0;
                    const valB = optB ? optB.projected[row.key] : 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-800">{row.label}</td>
                        <td className="p-4 font-bold text-slate-500">{formatVal(baseVal, row.format)}</td>
                        <td className={`p-4 ${recOpt === "option_a" ? "text-emerald-700 font-extrabold" : ""}`}>
                          {formatVal(valA, row.format)}
                        </td>
                        <td className={`p-4 ${recOpt === "option_b" ? "text-emerald-700 font-extrabold" : ""}`}>
                          {formatVal(valB, row.format)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setComparisonResult(null)}
                className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Clear Comparison Output
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
