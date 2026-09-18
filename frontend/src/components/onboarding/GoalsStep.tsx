import React from "react";
import { Goal } from "@/types/financial";
import { Plus, Trash2 } from "lucide-react";

interface GoalsStepProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  setDeletedGoals: React.Dispatch<React.SetStateAction<string[]>>;
  riskAppetite: string;
  setRiskAppetite: (val: string) => void;
}

export function GoalsStep({
  goals,
  setGoals,
  setDeletedGoals,
  riskAppetite,
  setRiskAppetite,
}: GoalsStepProps) {
  const addGoal = () => {
    setGoals((prev) => [
      ...prev,
      {
        goal_name: "Retirement / Home Goal",
        category: "Retirement",
        target_amount: 10000000,
        saved_amount: 500000,
        monthly_contribution: 15000,
        priority: "High",
      },
    ]);
  };

  const removeGoal = (index: number) => {
    const item = goals[index];
    if (item.id) {
      setDeletedGoals((prev) => [...prev, item.id!]);
    }
    setGoals((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: keyof Goal, val: any) => {
    setGoals((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-black text-slate-800 tracking-tight">Milestone Goals & Risk Profile</h3>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Define your targets (home downpayment, children education, retirement) and your risk appetite.
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
          Household Investment Risk Appetite
        </label>
        <div className="grid grid-cols-3 gap-3">
          {["Conservative", "Moderate", "Aggressive"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRiskAppetite(r)}
              className={`py-3 px-4 rounded-xl text-xs font-black transition border ${
                riskAppetite === r
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {goals.map((g, idx) => (
          <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-3">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Goal Name</label>
              <input
                type="text"
                placeholder="e.g. Home Downpayment"
                value={g.goal_name}
                onChange={(e) => updateGoal(idx, "goal_name", e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Category</label>
              <select
                value={g.category}
                onChange={(e) => updateGoal(idx, "category", e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
              >
                <option value="Home">Home Purchase</option>
                <option value="Retirement">Retirement</option>
                <option value="Education">Education</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Emergency">Emergency Reserve</option>
                <option value="Other">Other Milestone</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Target (₹)</label>
              <input
                type="number"
                placeholder="e.g. 2500000"
                value={g.target_amount || ""}
                onChange={(e) => updateGoal(idx, "target_amount", parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Saved So Far (₹)</label>
              <input
                type="number"
                placeholder="e.g. 500000"
                value={g.saved_amount || ""}
                onChange={(e) => updateGoal(idx, "saved_amount", parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Monthly Plan (₹)</label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={g.monthly_contribution || ""}
                onChange={(e) => updateGoal(idx, "monthly_contribution", parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-1 flex justify-end pt-4 md:pt-0">
              <button
                onClick={() => removeGoal(idx)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Remove goal"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addGoal}
        className="w-full py-3 bg-white border-2 border-dashed border-slate-200 hover:border-primary text-slate-600 hover:text-primary rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" /> Add Life Goal
      </button>
    </div>
  );
}
