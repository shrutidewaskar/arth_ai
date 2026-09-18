import React from "react";
import { UserProfile, IncomeSource, ExpenseCategory, Asset, Liability, Goal } from "@/types/financial";
import { CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react";

interface ReviewStepProps {
  fullName: string;
  age: number | "";
  city: string;
  occupation: string;
  maritalStatus: string;
  dependents: number;
  riskAppetite: string;
  incomes: IncomeSource[];
  expenses: ExpenseCategory[];
  assets: Asset[];
  liabilities: Liability[];
  goals: Goal[];
  liveSummary: any;
  approvedFactsCount?: number;
}

export function ReviewStep({
  fullName,
  age,
  city,
  occupation,
  maritalStatus,
  dependents,
  riskAppetite,
  incomes,
  expenses,
  assets,
  liabilities,
  goals,
  liveSummary,
  approvedFactsCount = 0,
}: ReviewStepProps) {
  const totalIncome = incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalAssets = assets.reduce((acc, curr) => acc + (Number(curr.current_value) || 0), 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + (Number(curr.outstanding) || 0), 0);
  const totalEMIs = liabilities.reduce((acc, curr) => acc + (Number(curr.emi) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlySurplus = totalIncome - totalExpenses - totalEMIs;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-black text-slate-800 tracking-tight">Review & Launch Command Center</h3>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Review your baseline snapshot before initializing your deterministic AI Financial Operating System.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Net Worth</span>
          <p className="text-lg font-black text-slate-800 mt-1">₹{netWorth.toLocaleString()}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Monthly Inflow</span>
          <p className="text-lg font-black text-emerald-700 mt-1">₹{totalIncome.toLocaleString()}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Monthly Outflows</span>
          <p className="text-lg font-black text-rose-600 mt-1">₹{(totalExpenses + totalEMIs).toLocaleString()}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Monthly Surplus</span>
          <p className="text-lg font-black text-emerald-700 mt-1">₹{monthlySurplus.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs font-semibold text-slate-700">
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500 font-bold">Profile Identity</span>
          <span className="font-black text-slate-800">{fullName || "User"} ({age || 0} yrs) • {city || "India"}</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500 font-bold">Risk Appetite</span>
          <span className="font-black text-slate-800">{riskAppetite}</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500 font-bold">Incomes Configured</span>
          <span className="font-black text-slate-800">{incomes.length} Sources</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500 font-bold">Assets Recorded</span>
          <span className="font-black text-slate-800">{assets.length} Holdings (₹{totalAssets.toLocaleString()})</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500 font-bold">Liabilities Active</span>
          <span className="font-black text-slate-800">{liabilities.length} Loans (₹{totalLiabilities.toLocaleString()})</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500 font-bold">Life Goals Tracked</span>
          <span className="font-black text-slate-800">{goals.length} Milestones</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500 font-bold">Verified Evidence Items</span>
          <span className="font-black text-emerald-700">
            {approvedFactsCount > 0 ? `${approvedFactsCount} Extracted Facts Approved` : "Manual Entry Baseline"}
          </span>
        </div>
      </div>
    </div>
  );
}

