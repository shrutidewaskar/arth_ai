import React from "react";
import { IncomeSource } from "@/types/financial";
import { Plus, Trash2 } from "lucide-react";

interface IncomeStepProps {
  incomes: IncomeSource[];
  setIncomes: React.Dispatch<React.SetStateAction<IncomeSource[]>>;
  setDeletedIncomes: React.Dispatch<React.SetStateAction<string[]>>;
}

export function IncomeStep({ incomes, setIncomes, setDeletedIncomes }: IncomeStepProps) {
  const addIncome = () => {
    setIncomes((prev) => [
      ...prev,
      {
        source_name: "Primary Salary",
        type: "Salary",
        amount: 80000,
        frequency: "Monthly",
      },
    ]);
  };

  const removeIncome = (index: number) => {
    const item = incomes[index];
    if (item.id) {
      setDeletedIncomes((prev) => [...prev, item.id!]);
    }
    setIncomes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIncome = (index: number, field: keyof IncomeSource, val: any) => {
    setIncomes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const totalMonthlyIncome = incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display text-xl font-black text-slate-800 tracking-tight">Income Inflows</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Add all recurring monthly household cash inflows (salary, consulting, rental, business).
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Monthly Inflow</span>
          <span className="text-base font-black text-emerald-700">₹{totalMonthlyIncome.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-4">
        {incomes.map((inc, idx) => (
          <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-4">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Source Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Tech Salary"
                value={inc.source_name}
                onChange={(e) => updateIncome(idx, "source_name", e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Type</label>
              <select
                value={inc.type}
                onChange={(e) => updateIncome(idx, "type", e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
              >
                <option value="Salary">Salary / Payroll</option>
                <option value="Freelance">Freelance / Consulting</option>
                <option value="Rental">Rental Income</option>
                <option value="Business">Business / Dividend</option>
                <option value="Other">Other Inflow</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Monthly Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 85000"
                value={inc.amount || ""}
                onChange={(e) => updateIncome(idx, "amount", parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-1 flex justify-end pt-4 md:pt-0">
              <button
                onClick={() => removeIncome(idx)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Remove source"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addIncome}
        className="w-full py-3 bg-white border-2 border-dashed border-slate-200 hover:border-primary text-slate-600 hover:text-primary rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" /> Add Another Income Stream
      </button>
    </div>
  );
}
