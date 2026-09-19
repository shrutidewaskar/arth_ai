import React from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  FileText,
  HelpCircle,
} from "lucide-react";
import { DashboardSummary } from "@/types/financial";
import { AttentionItem, FinancialPulseResponse } from "@/lib/api";
import { EmptyState, LoadingState } from "@/components/shared/UIStates";

interface HomeHubProps {
  summaryData: DashboardSummary | null;
  pulseData: FinancialPulseResponse | null;
  pulseError: string | null;
  attentionItems: AttentionItem[];
  briefData: any;
  diagnosisData: any;
  actionPlansData?: any;
  onNavigateHub: (
    hub: "home" | "money" | "plan" | "evidence" | "cfo" | "profile",
    subTab?: string
  ) => void;
  onRetryPulse?: () => void;
  onRetryAttention?: () => void;
}

export function HomeHub({
  summaryData,
  pulseData,
  pulseError,
  attentionItems,
  briefData,
  diagnosisData,
  actionPlansData,
  onNavigateHub,
  onRetryPulse,
  onRetryAttention,
}: HomeHubProps) {
  const userName = summaryData?.profile?.name;
  const greeting = userName ? `Good day, ${userName}` : "Your Financial Overview";

  // Financial Snapshot derived from backend canonical summary & pulse
  const netWorth = summaryData?.net_worth?.net_worth;
  const totalAssets = summaryData?.net_worth?.total_assets;
  const totalLiabilities = summaryData?.net_worth?.total_liabilities;
  const monthlyIncome = summaryData?.cash_flow?.monthly_income;
  const monthlyExpenses = summaryData?.cash_flow?.monthly_expenses;
  const monthlyEmi = summaryData?.cash_flow?.monthly_emi || 0;
  const monthlySurplus = summaryData?.cash_flow?.monthly_surplus;
  const emergencyRunway =
    pulseData?.pulse?.emergency_runway_months ??
    summaryData?.financial_health?.emergency_runway_months;
  const healthScore =
    pulseData?.pulse?.health_score ??
    summaryData?.financial_health?.score ??
    50;
  const healthLabel = pulseData?.pulse?.health_label ?? "Financial Health Index";

  const hasData =
    Boolean(summaryData) &&
    ((summaryData?.net_worth?.total_assets ?? 0) > 0 ||
      (summaryData?.net_worth?.total_liabilities ?? 0) > 0 ||
      (summaryData?.cash_flow?.monthly_income ?? 0) > 0 ||
      (summaryData?.cash_flow?.monthly_expenses ?? 0) > 0);

  // Derive Next Best Action truthfully from existing deterministic backend action plan / attention / diagnosis
  const topAttentionItem = attentionItems.length > 0 ? attentionItems[0] : null;
  const viableActionPlan = actionPlansData?.plans?.find(
    (p: any) => p?.safety?.is_viable
  );
  const nextActionTitle =
    briefData?.suggested_action ||
    topAttentionItem?.next_step ||
    (viableActionPlan ? `Adopt Action Plan: ${viableActionPlan.label}` : null);
  const nextActionWhy =
    topAttentionItem?.why ||
    briefData?.biggest_risk ||
    (viableActionPlan
      ? "Closes milestone funding gaps while keeping DTI and liquidity runway within safe limits."
      : "Complete financial data setup to generate targeted next best actions.");
  const nextActionLabel =
    topAttentionItem?.action_label ||
    (viableActionPlan ? "Review Action Plan" : "Add Financial Data");
  const nextActionRoute =
    topAttentionItem?.target_route ||
    (viableActionPlan ? "plan" : "money");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Header / Context */}
      <div className="border-b border-slate-100 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {greeting}
            </h1>
            <span className="text-[10px] bg-emerald-50 text-primary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200/60">
              Canonical Pulse
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Here is what matters about your household balance sheet and cash flow right now.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateHub("money", "overview")}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
          >
            <Wallet className="h-3.5 w-3.5" />
            My Finances
          </button>
          <button
            onClick={() => onNavigateHub("cfo", "chat")}
            className="text-xs bg-primary hover:bg-[#074739] text-white px-4 py-2 rounded-xl font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI CFO
          </button>
        </div>
      </div>

      {/* 2. Financial Snapshot */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Financial Snapshot
          </h2>
          <span className="text-[11px] text-slate-400 font-semibold">
            Grounded in active ledger
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Worth Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 hover:border-slate-300 transition">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
              Net Worth
            </span>
            <p className="text-2xl font-black text-slate-900">
              {netWorth !== undefined && hasData
                ? `₹${netWorth.toLocaleString()}`
                : "Not enough info"}
            </p>
            <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Assets: ₹{totalAssets?.toLocaleString() ?? 0}</span>
              <button
                onClick={() => onNavigateHub("money", "overview")}
                className="text-emerald-700 hover:underline font-bold"
              >
                View &rarr;
              </button>
            </div>
          </div>

          {/* Monthly Surplus Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 hover:border-slate-300 transition">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
              Monthly Surplus
            </span>
            <p
              className={`text-2xl font-black ${monthlySurplus !== undefined && monthlySurplus < 0
                ? "text-rose-600"
                : "text-slate-900"
                }`}
            >
              {monthlySurplus !== undefined && monthlyIncome !== undefined && monthlyIncome > 0
                ? `₹${monthlySurplus.toLocaleString()}`
                : "Unknown"}
            </p>
            <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>
                In: ₹{monthlyIncome?.toLocaleString() ?? 0} | Out: ₹
                {((monthlyExpenses ?? 0) + (monthlyEmi ?? 0)).toLocaleString()}
              </span>
              <button
                onClick={() => onNavigateHub("money", "cashflow")}
                className="text-emerald-700 hover:underline font-bold"
              >
                Flow &rarr;
              </button>
            </div>
          </div>

          {/* Emergency Runway Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 hover:border-slate-300 transition">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
              Emergency Runway
            </span>
            <p className="text-2xl font-black text-slate-900">
              {emergencyRunway !== undefined && emergencyRunway > 0
                ? `${emergencyRunway.toFixed(1)} mo`
                : "Not designated"}
            </p>
            <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Target: 6.0 months</span>
              <button
                onClick={() => onNavigateHub("money", "assets")}
                className="text-emerald-700 hover:underline font-bold"
              >
                Reserves &rarr;
              </button>
            </div>
          </div>

          {/* Debt Service (DTI) Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 hover:border-slate-300 transition">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
              Debt Service (DTI)
            </span>
            <p
              className={`text-2xl font-black ${(summaryData?.financial_health?.dti_ratio_pct ?? 0) > 35
                ? "text-rose-600"
                : "text-slate-900"
                }`}
            >
              {monthlyIncome !== undefined && monthlyIncome > 0
                ? `${(summaryData?.financial_health?.dti_ratio_pct ?? 0).toFixed(1)}%`
                : "Unknown"}
            </p>
            <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>EMIs: ₹{monthlyEmi.toLocaleString()}/mo</span>
              <button
                onClick={() => onNavigateHub("money", "liabilities")}
                className="text-emerald-700 hover:underline font-bold"
              >
                Debts &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Financial Pulse & Pulse Explanation */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-150 flex items-center justify-center text-emerald-800 font-black">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Financial Pulse</h3>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  {healthScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{healthLabel}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateHub("money", "overview")}
            className="text-xs text-primary font-bold hover:underline self-start sm:self-center"
          >
            Explore Full Ledger &rarr;
          </button>
        </div>

        {pulseError ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-700">
            <span>{pulseError}</span>
            {onRetryPulse && (
              <button
                onClick={onRetryPulse}
                className="px-3 py-1 bg-white border border-rose-300 rounded-xl font-bold hover:bg-rose-100 transition"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Component Signals */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Component Signals
              </h4>
              <div className="space-y-2 text-xs font-semibold">
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-600">Savings Rate</span>
                  <span className="font-black text-emerald-800">
                    {summaryData
                      ? `${summaryData.financial_health.savings_rate_pct.toFixed(1)}%`
                      : "0.0%"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-600">Debt Pressure (DTI)</span>
                  <span
                    className={`font-black ${(summaryData?.financial_health?.dti_ratio_pct ?? 0) > 35
                      ? "text-rose-600"
                      : "text-slate-800"
                      }`}
                  >
                    {summaryData
                      ? `${summaryData.financial_health.dti_ratio_pct.toFixed(1)}%`
                      : "0.0%"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-600">Emergency Reserve</span>
                  <span className="font-black text-slate-800">
                    {pulseData?.pulse?.emergency_fund_status ||
                      "Unknown / Not designated"}
                  </span>
                </div>
              </div>
            </div>

            {/* What's Driving This Explanation */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                What’s Driving This Pulse
              </h4>
              <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2 border border-slate-150">
                {diagnosisData?.overall_state?.summary ? (
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {diagnosisData.overall_state.summary}
                  </p>
                ) : (
                  <p className="text-slate-600 leading-relaxed">
                    Financial pulse is computed deterministically from your recorded cash flows,
                    designated emergency reserves, and debt contracts.
                  </p>
                )}
                {diagnosisData?.strengths?.length > 0 && (
                  <p className="text-emerald-800 text-[11px] font-bold">
                    ✓ Strength: {diagnosisData.strengths[0].title}
                  </p>
                )}
                {diagnosisData?.risks?.length > 0 && (
                  <p className="text-amber-800 text-[11px] font-bold">
                    ⚠ Watch: {diagnosisData.risks[0].title}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Attention Center */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              What Needs Your Attention ({attentionItems.length})
            </h2>
          </div>
          {attentionItems.length > 0 && (
            <span className="text-[11px] text-slate-400 font-semibold">
              Ordered by deterministic severity
            </span>
          )}
        </div>

        {attentionItems.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="You're all caught up"
            description="There are no active critical issues or alerts requiring immediate attention on your financial profile."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attentionItems.slice(0, 4).map((item) => {
              const sevBadge =
                item.severity === "critical"
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : item.severity === "high"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : item.severity === "positive"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-blue-50 text-blue-800 border-blue-200";

              return (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${sevBadge}`}
                      >
                        {item.category} • {item.severity}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {item.description}
                    </p>

                    {item.why && (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 font-medium">
                        <strong className="text-slate-700">Why it matters:</strong> {item.why}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {item.next_step ? "Action available" : ""}
                    </span>
                    <button
                      onClick={() => {
                        if (item.target_route?.includes("goals")) {
                          onNavigateHub("plan", "goals");
                        } else if (item.target_route?.includes("cash_flow") || item.target_route?.includes("cashflow")) {
                          onNavigateHub("money", "cashflow");
                        } else if (item.target_route?.includes("investments")) {
                          onNavigateHub("money", "investments");
                        } else if (item.target_route?.includes("simulator")) {
                          onNavigateHub("plan", "decision_center");
                        } else if (item.target_route?.includes("onboarding")) {
                          onNavigateHub("profile");
                        } else {
                          onNavigateHub("money", "overview");
                        }
                      }}
                      className="text-xs font-bold text-white bg-primary hover:bg-[#074739] px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
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

      {/* 5. Next Best Action & 6. Executive Brief */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Best Action Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Prioritized Action
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900">
              {nextActionTitle || "Review Financial Pulse"}
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              <strong className="text-slate-800">Why:</strong> {nextActionWhy}
            </p>
          </div>

          <button
            onClick={() => {
              if (nextActionRoute === "plan") {
                onNavigateHub("plan", "action_plans");
              } else if (nextActionRoute === "evidence") {
                onNavigateHub("evidence", "vault");
              } else {
                onNavigateHub("money", "overview");
              }
            }}
            className="w-full text-xs font-bold text-white bg-primary hover:bg-[#074739] py-3 rounded-2xl transition shadow-sm flex items-center justify-center gap-2"
          >
            {nextActionLabel} &rarr;
          </button>
        </div>

        {/* AI Executive Brief */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                Executive Briefing
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Grounded AI</span>
            </div>
            <p className="text-xs md:text-sm text-slate-800 font-semibold leading-relaxed">
              {briefData?.summary_message ||
                (briefData?.summary && briefData.summary.length > 0
                  ? briefData.summary.join(" ")
                  : "Your financial executive briefing is computed from verified deterministic rules and active balances.")}
            </p>

            {briefData?.top_recommendation && (
              <p className="text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-100">
                <strong className="text-slate-800">Top Insight:</strong> {briefData.top_recommendation}
              </p>
            )}
          </div>

          <button
            onClick={() => onNavigateHub("cfo", "chat")}
            className="w-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-3 rounded-2xl transition flex items-center justify-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-800" />
            Discuss with AI CFO Advisor
          </button>
        </div>
      </div>
    </div>
  );
}
