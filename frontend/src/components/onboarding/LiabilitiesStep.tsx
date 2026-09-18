import React from "react";
import { Liability } from "@/types/financial";
import { Plus, Trash2 } from "lucide-react";

interface LiabilitiesStepProps {
  liabilities: Liability[];
  setLiabilities: React.Dispatch<React.SetStateAction<Liability[]>>;
  setDeletedLiabilities: React.Dispatch<React.SetStateAction<string[]>>;
}

export function LiabilitiesStep({ liabilities, setLiabilities, setDeletedLiabilities }: LiabilitiesStepProps) {
  const addLiability = () => {
    setLiabilities((prev) => [
      ...prev,
      {
        loan_name: "Home Loan / Vehicle Loan",
        loan_type: "HomeLoan",
        principal: 2000000,
        outstanding: 1800000,
        interest_rate: 8.5,
        emi: 22000,
      },
    ]);
  };

  const removeLiability = (index: number) => {
    const item = liabilities[index];
    if (item.id) {
      setDeletedLiabilities((prev) => [...prev, item.id!]);
    }
    setLiabilities((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLiability = (index: number, field: keyof Liability, val: any) => {
    setLiabilities((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const totalOutstanding = liabilities.reduce((acc, curr) => acc + (Number(curr.outstanding) || 0), 0);
  const totalEMIs = liabilities.reduce((acc, curr) => acc + (Number(curr.emi) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display text-xl font-black text-slate-800 tracking-tight">Liabilities & Debts</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Specify existing mortgages, car loans, personal loans, student debt, and credit card balances.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Outstanding Debt</span>
          <span className="text-base font-black text-rose-600">₹{totalOutstanding.toLocaleString()}</span>
          <span className="text-[10px] text-slate-450 block font-semibold">Monthly EMIs: ₹{totalEMIs.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-4">
        {liabilities.map((liab, idx) => (
          <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-3">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Loan Name / Lender</label>
              <input
                type="text"
                placeholder="e.g. HDFC Home Loan"
                value={liab.loan_name}
                onChange={(e) => updateLiability(idx, "loan_name", e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Type</label>
              <select
                value={liab.loan_type}
                onChange={(e) => updateLiability(idx, "loan_type", e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
              >
                <option value="HomeLoan">Home Loan</option>
                <option value="AutoLoan">Auto / Car Loan</option>
                <option value="PersonalLoan">Personal Loan</option>
                <option value="EducationLoan">Education Loan</option>
                <option value="CreditCard">Credit Card Debt</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Outstanding Balance (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1800000"
                value={liab.outstanding || ""}
                onChange={(e) => updateLiability(idx, "outstanding", parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Interest (% APR)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 8.5"
                value={liab.interest_rate || ""}
                onChange={(e) => updateLiability(idx, "interest_rate", parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">EMI (₹)</label>
              <input
                type="number"
                placeholder="e.g. 22000"
                value={liab.emi || ""}
                onChange={(e) => updateLiability(idx, "emi", parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-1 flex justify-end pt-4 md:pt-0">
              <button
                onClick={() => removeLiability(idx)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Remove liability"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addLiability}
        className="w-full py-3 bg-white border-2 border-dashed border-slate-200 hover:border-primary text-slate-600 hover:text-primary rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" /> Add Liability / Loan
      </button>
    </div>
  );
}
