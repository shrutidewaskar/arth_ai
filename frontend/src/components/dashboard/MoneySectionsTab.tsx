import React from "react";
import { DashboardSummary } from "@/types/financial";
import { EmptyState } from "@/components/shared/UIStates";
import { Wallet, TrendingUp, ShieldCheck, Coins } from "lucide-react";

interface MoneySectionsTabProps {
  section: "cash_flow" | "investments" | "insurance" | "subscriptions";
  summaryData: DashboardSummary | null;
}

export function MoneySectionsTab({ section, summaryData }: MoneySectionsTabProps) {
  if (section === "cash_flow") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-display text-base font-bold text-slate-700">Income & Expense Cashflows</h3>
          <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">
            {summaryData ? `${summaryData.financial_health.savings_rate_pct.toFixed(1)}% Savings Rate` : "0.0%"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mb-4">Household Monthly Inflow</p>
            <ul className="space-y-3 text-xs font-semibold text-slate-700">
              <li className="flex justify-between items-center border-b pb-2">
                <span>Monthly Take-home Income</span>
                <span className="text-emerald-700 font-black">
                  ₹{summaryData ? summaryData.cash_flow.monthly_income.toLocaleString() : "0"}
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mb-4">Outflows & Fixed Debts</p>
            <ul className="space-y-3 text-xs font-semibold text-slate-700">
              <li className="flex justify-between items-center border-b pb-2">
                <span>Monthly Living Expenses</span>
                <span className="text-rose-600 font-black">
                  ₹{summaryData ? summaryData.cash_flow.monthly_expenses.toLocaleString() : "0"}
                </span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span>Outstanding EMIs</span>
                <span className="text-rose-600 font-black">
                  ₹{summaryData ? summaryData.cash_flow.monthly_emi.toLocaleString() : "0"}
                </span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span>Monthly Surplus</span>
                <span className="text-emerald-700 font-black">
                  ₹{summaryData ? summaryData.cash_flow.monthly_surplus.toLocaleString() : "0"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (section === "investments") {
    const hasInvestments = summaryData && summaryData.investments.total_invested > 0;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-display text-base font-bold text-slate-700">Investments Portfolio</h3>
          <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">
            ₹{summaryData ? summaryData.investments.current_value.toLocaleString() : "0"} Total Value
          </span>
        </div>

        {!hasInvestments ? (
          <EmptyState
            icon={TrendingUp}
            title="No investments recorded yet"
            description="Add mutual fund folios, direct equity, or fixed deposits to track portfolio allocation and returns."
          />
        ) : (
          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-700">
              <div>
                <p className="font-black text-slate-800">Aggregate Investments Portfolio</p>
                <p className="text-[9px] text-slate-450 mt-0.5 uppercase">Mutual Funds / Equity holdings</p>
              </div>
              <div className="text-right">
                <p className="font-black text-emerald-700">
                  ₹{summaryData?.investments.current_value.toLocaleString()}
                </p>
                <p className="text-[9px] text-slate-400 font-bold">
                  Cost Basis: ₹{summaryData?.investments.total_invested.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (section === "insurance") {
    const hasInsurance = summaryData && summaryData.insurance.count > 0;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-display text-base font-bold text-slate-700">Insurance Policies & Protection</h3>
          <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">
            {summaryData ? summaryData.insurance.count : 0} Policies Recorded
          </span>
        </div>

        {!hasInsurance ? (
          <EmptyState
            icon={ShieldCheck}
            title="No insurance policies added yet"
            description="Add health insurance, term life, or motor insurance policies to analyze coverage adequacy."
          />
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">
            {summaryData?.insurance.count} active policies managed inside your financial records.
          </p>
        )}
      </div>
    );
  }

  if (section === "subscriptions") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-display text-base font-bold text-slate-700">Bills & Recurring Subscriptions</h3>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
            Recurring Expenses
          </span>
        </div>

        <EmptyState
          icon={Coins}
          title="No active subscriptions tracked"
          description="Upload bank statements to automatically detect recurring memberships and subscription leaks."
        />
      </div>
    );
  }

  return null;
}
