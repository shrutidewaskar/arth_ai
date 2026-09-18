import React from "react";
import { Asset } from "@/types/financial";
import { Plus, Trash2 } from "lucide-react";

interface AssetsStepProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  setDeletedAssets: React.Dispatch<React.SetStateAction<string[]>>;
}

export function AssetsStep({ assets, setAssets, setDeletedAssets }: AssetsStepProps) {
  const addAsset = () => {
    setAssets((prev) => [
      ...prev,
      {
        asset_name: "Savings Account / FD",
        asset_type: "Cash",
        current_value: 100000,
      },
    ]);
  };

  const removeAsset = (index: number) => {
    const item = assets[index];
    if (item.id) {
      setDeletedAssets((prev) => [...prev, item.id!]);
    }
    setAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAsset = (index: number, field: keyof Asset, val: any) => {
    setAssets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const totalAssets = assets.reduce((acc, curr) => acc + (Number(curr.current_value) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display text-xl font-black text-slate-800 tracking-tight">Assets & Holdings</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Record savings, fixed deposits, mutual funds, physical gold, real estate, and EPF/PPF balances.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Asset Value</span>
          <span className="text-base font-black text-emerald-700">₹{totalAssets.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-4">
        {assets.map((ast, idx) => (
          <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Asset Description</label>
              <input
                type="text"
                placeholder="e.g. HDFC Liquid Fund / Sovereign Gold"
                value={ast.asset_name}
                onChange={(e) => updateAsset(idx, "asset_name", e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Asset Class</label>
              <select
                value={ast.asset_type}
                onChange={(e) => updateAsset(idx, "asset_type", e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
              >
                <option value="Cash">Cash & Savings</option>
                <option value="MutualFunds">Mutual Funds / Equity</option>
                <option value="FixedDeposit">Fixed Deposit</option>
                <option value="Gold">Physical Gold / Sovereign</option>
                <option value="RealEstate">Real Estate Property</option>
                <option value="Retirement">EPF / PPF / NPS</option>
                <option value="Other">Other Asset</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1">Current Value (₹)</label>
              <input
                type="number"
                placeholder="e.g. 150000"
                value={ast.current_value || ""}
                onChange={(e) => updateAsset(idx, "current_value", parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-1 flex justify-end pt-4 md:pt-0">
              <button
                onClick={() => removeAsset(idx)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Remove asset"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addAsset}
        className="w-full py-3 bg-white border-2 border-dashed border-slate-200 hover:border-primary text-slate-600 hover:text-primary rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" /> Add Asset Holding
      </button>
    </div>
  );
}
