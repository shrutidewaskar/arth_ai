import React from "react";
import { Sparkles } from "lucide-react";
import { DashboardSummary } from "@/types/financial";
import { AttentionItem, FinancialPulseResponse } from "@/lib/api";
import { useRouter } from "next/navigation";

interface OverviewTabProps {
  summaryData: DashboardSummary | null;
  pulseData: FinancialPulseResponse | null;
  pulseError: string | null;
  attentionItems: AttentionItem[];
  briefData: any;
  diagnosisData: any;
  setActiveTab: (tab: string) => void;
  setWorkspaceExpanded: (val: boolean) => void;
}

export function OverviewTab({
  summaryData,
  pulseData,
  pulseError,
  attentionItems,
  briefData,
  diagnosisData,
  setActiveTab,
  setWorkspaceExpanded,
}: OverviewTabProps) {
  const router = useRouter();
  const totalAssets = summaryData ? summaryData.net_worth.total_assets : 0;
  const totalLiabilities = summaryData ? summaryData.net_worth.total_liabilities : 0;
  const netWorth = summaryData ? summaryData.net_worth.net_worth : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-display text-xl font-black text-dark">Financial Command Center</h3>
          <p className="text-sm text-slate-400 font-semibold mt-0.5">
            {summaryData ? `${summaryData.profile.risk_appetite} Risk Appetite Profile` : "Family balance sheet summary"}
          </p>
        </div>
        <span className="bg-emerald-50 text-primary border border-emerald-100 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold">
          {summaryData ? summaryData.financial_health.score : 50}/100 Health Score
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financial Health Snapshot card */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
          <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider mb-3">Financial Health</p>
          <div className="space-y-2 text-xs font-semibold text-slate-655">
            <div className="flex justify-between">
              <span>Health Score</span>
              <span className="font-black text-slate-800">{summaryData ? summaryData.financial_health.score : 50}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Savings Rate</span>
              <span className="font-black text-[#0B5D4B]">{summaryData ? summaryData.financial_health.savings_rate_pct.toFixed(1) : "0.0"}%</span>
            </div>
            <div className="flex justify-between">
              <span>Debt-to-Income</span>
              <span className="font-black text-rose-600">{summaryData ? summaryData.financial_health.dti_ratio_pct.toFixed(1) : "0.0"}%</span>
            </div>
            <div className="flex justify-between">
              <span>Runway (Designated)</span>
              <span className="font-black text-slate-800">{summaryData ? summaryData.financial_health.emergency_runway_months.toFixed(1) : "0.0"} mo</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[10px]">
              <span className="text-slate-500 font-bold">Reserve Status</span>
              <span className={`font-black px-1.5 py-0.5 rounded text-[9px] ${
                pulseData?.pulse?.emergency_fund_status?.includes("Robust") ? "bg-emerald-100 text-emerald-800" :
                pulseData?.pulse?.emergency_fund_status?.includes("Unknown") ? "bg-amber-100 text-amber-800" :
                "bg-rose-100 text-rose-800"
              }`}>
                {pulseData?.pulse?.emergency_fund_status || "Unknown / Not designated"}
              </span>
            </div>
          </div>
        </div>

        {/* AI Executive Briefing */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
          <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">AI Executive Briefing</p>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-semibold mt-3">
            {briefData ? briefData.briefing : "Your financial command center is initialized. Query your personal AI CFO to unlock custom calculations."}
          </p>
        </div>

        {/* Balance Sheet Summary card */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 flex flex-col justify-between">
          <div>
            <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">Balance Sheet Summary</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Aggregated Assets</span>
                <p className="text-base font-black text-emerald-700 mt-1">₹{totalAssets.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Active Debts</span>
                <p className="text-base font-black text-rose-600 mt-1">₹{totalLiabilities.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200/50 pt-3 mt-4 flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Calculated Net Worth</span>
            <span className="text-primary font-black text-sm">₹{netWorth.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Workspace Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Asset Breakdown list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150">
          <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider mb-3">Asset Distribution</p>
          {(!summaryData || !summaryData.net_worth.asset_breakdown || summaryData.net_worth.asset_breakdown.length === 0) ? (
            <p className="text-xs text-slate-450 text-center py-4">No assets recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {summaryData.net_worth.asset_breakdown.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-700 border-b pb-1.5">
                  <span>{item.label}</span>
                  <span className="font-black text-emerald-700">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liability Breakdown list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150">
          <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider mb-3">Liabilities & Debts</p>
          {(!summaryData || !summaryData.net_worth.liability_breakdown || summaryData.net_worth.liability_breakdown.length === 0) ? (
            <p className="text-xs text-slate-450 text-center py-4">No liabilities recorded.</p>
          ) : (
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {summaryData.net_worth.liability_breakdown.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-750 border-b pb-1.5">
                  <div>
                    <span className="font-bold text-slate-800 block">{item.loan_name}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{item.loan_type} | {item.interest_rate}% APR</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-600 block">₹{item.outstanding.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-450 font-bold">EMI: ₹{item.emi.toLocaleString()}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attention Aggregator Section: Needs Your Attention */}
      <div className="mt-8 border-t pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-lg font-black text-dark flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-emerald-700 animate-pulse" />
              Needs Your Attention
            </h4>
            <p className="text-xs text-slate-500 font-medium">Deterministic risk aggregation and actionable handoffs</p>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
            {attentionItems.length} active items
          </span>
        </div>

        {pulseError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700">
            {pulseError}
          </div>
        )}

        {attentionItems.length === 0 && !pulseError ? (
          <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl text-center text-xs text-slate-500 font-semibold">
            All diagnostic markers healthy. No outstanding items requiring attention.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attentionItems.map((item) => {
              const isCritical = item.severity === "critical";
              const isHigh = item.severity === "high";
              const isPositive = item.severity === "positive";

              const cardBg = isCritical
                ? "bg-rose-50/70 border-rose-200"
                : isHigh
                ? "bg-amber-50/70 border-amber-200"
                : isPositive
                ? "bg-emerald-50/70 border-emerald-200"
                : "bg-slate-50 border-slate-200";

              const badgeColor = isCritical
                ? "bg-rose-100 text-rose-800"
                : isHigh
                ? "bg-amber-100 text-amber-800"
                : isPositive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-700";

              return (
                <div key={item.id} className={`p-4 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-black tracking-wider ${badgeColor}`}>
                        {item.category} • {item.severity}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs md:text-sm text-slate-850">{item.title}</h5>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{item.description}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-2 text-[11px]">
                      {item.what && (
                        <div className="flex items-start gap-1.5">
                          <span className="font-extrabold uppercase text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded shrink-0">WHAT</span>
                          <span className="text-slate-700 font-semibold">{item.what}</span>
                        </div>
                      )}
                      {item.why && (
                        <div className="flex items-start gap-1.5">
                          <span className="font-extrabold uppercase text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded shrink-0">WHY</span>
                          <span className="text-slate-600">{item.why}</span>
                        </div>
                      )}
                      {item.impact && (
                        <div className="flex items-start gap-1.5">
                          <span className="font-extrabold uppercase text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded shrink-0">IMPACT</span>
                          <span className="text-slate-700 font-medium">{item.impact}</span>
                        </div>
                      )}
                      {item.next_step && (
                        <div className="flex items-start gap-1.5">
                          <span className="font-extrabold uppercase text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0">NEXT</span>
                          <span className="text-primary font-bold">{item.next_step}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (item.action_type === "navigate") {
                          router.push(item.target_route);
                        } else if (item.action_type === "tab_switch") {
                          setActiveTab(item.target_route);
                          setWorkspaceExpanded(true);
                        }
                      }}
                      className="text-xs font-bold text-[#0B5D4B] hover:text-emerald-800 flex items-center gap-1.5"
                    >
                      {item.action_label} &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Financial Diagnosis Results Section */}
      {diagnosisData && (
        <div className="mt-8 border-t pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg font-black text-dark flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-emerald-700 animate-pulse" />
              ArthAI Financial Diagnosis
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
              {diagnosisData.overall_state?.label || "Diagnosis Ready"}
            </span>
          </div>

          <p className="text-xs md:text-sm text-slate-655 leading-relaxed font-semibold">
            {diagnosisData.overall_state?.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider mb-2.5">Key Strengths</p>
                {(!diagnosisData.strengths || diagnosisData.strengths.length === 0) ? (
                  <p className="text-xs text-slate-400">No major strengths identified yet.</p>
                ) : (
                  <div className="space-y-2">
                    {diagnosisData.strengths.map((str: any) => (
                      <div key={str.id} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs">
                        <p className="font-black text-emerald-900">{str.title}</p>
                        <p className="text-emerald-705 mt-0.5 font-medium">{str.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] text-rose-800 font-extrabold uppercase tracking-wider mb-2.5">Identified Risks</p>
                {(!diagnosisData.risks || diagnosisData.risks.length === 0) ? (
                  <p className="text-xs text-slate-455">No immediate risks detected.</p>
                ) : (
                  <div className="space-y-2">
                    {diagnosisData.risks.map((risk: any) => (
                      <div key={risk.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-xs">
                        <div className="flex justify-between items-center">
                          <p className="font-black text-rose-900">{risk.title}</p>
                          <span className="text-[8px] uppercase px-1.5 py-0.2 bg-rose-100 text-rose-800 font-extrabold rounded">{risk.severity}</span>
                        </div>
                        <p className="text-rose-705 mt-0.5 font-medium">{risk.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider mb-2.5">Ranked Priorities</p>
                {(!diagnosisData.priorities || diagnosisData.priorities.length === 0) ? (
                  <p className="text-xs text-slate-400">All indicators healthy. No prioritized actions.</p>
                ) : (
                  <div className="space-y-3">
                    {diagnosisData.priorities.map((prio: any) => (
                      <div key={prio.id} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs relative">
                        <span className="absolute top-3.5 right-3.5 text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">Rank #{prio.rank}</span>
                        <p className="font-black text-slate-800 pr-12">{prio.title}</p>
                        <p className="text-slate-500 mt-1 font-semibold">{prio.reason}</p>
                        <div className="mt-2.5 pt-2 border-t text-[10px] text-primary font-bold">
                          💡 Action: {prio.recommended_action}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
