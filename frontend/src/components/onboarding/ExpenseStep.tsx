import React from "react";
import { ExpenseCategory } from "@/types/financial";
import { Plus, Trash2 } from "lucide-react";

interface ExpenseStepProps {
  expenses: ExpenseCategory[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>;
  setDeletedExpenses: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ExpenseStep({ expenses, setExpenses, setDeletedExpenses }: ExpenseStepProps) {
  const addExpense = () => {
    setExpenses((prev) => [
      ...prev,
      {
        category: "Groceries & Food",
        amount: 15000,
        essential: true,
      },
    ]);
  };

  const removeExpense = (index: number) => {
    const item = expenses[index];
    if (item.id) {
      setDeletedExpenses((prev) => [...prev, item.id!]);
    }
    setExpenses((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExpense = (index: number, field: keyof ExpenseCategory, val: any) => {
    setExpenses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const totalMonthlyExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display text-xl font-black text-slate-800 tracking-tight">Monthly Expenses</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Specify living costs, rent, utilities, dining, insurance premiums, and discretionary spending.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Monthly Expenses</span>
          <span className="text-base font-black text-rose-600">₹{totalMonthlyExpenses.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-4">
        {expenses.map((exp, idx) => (
          <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Expense Category</label>
              <input
                type="text"
                placeholder="e.g. Housing & Rent / Food"
                value={exp.category}
                onChange={(e) => updateExpense(idx, "category", e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Monthly Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={exp.amount || ""}
                onChange={(e) => updateExpense(idx, "amount", parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 pt-2 md:pt-4">
              <input
                type="checkbox"
                id={`essential-${idx}`}
                checked={exp.essential ?? true}
                onChange={(e) => updateExpense(idx, "essential", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor={`essential-${idx}`} className="text-xs font-semibold text-slate-600 cursor-pointer">
                Essential
              </label>
            </div>

            <div className="md:col-span-1 flex justify-end pt-4 md:pt-0">
              <button
                onClick={() => removeExpense(idx)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Remove category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addExpense}
        className="w-full py-3 bg-white border-2 border-dashed border-slate-200 hover:border-primary text-slate-600 hover:text-primary rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" /> Add Expense Category
      </button>
    </div>
  );
}
