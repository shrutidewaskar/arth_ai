import React, { useState } from "react";
import { Plus, TrendingUp, ShieldAlert, Sparkles, Upload } from "lucide-react";
import { createInvestment } from "@/lib/api";
import { EmptyState } from "@/components/shared/UIStates";

interface InvestmentsSectionProps {
  investments: any[];
  onRefresh: () => void;
  onNavigateEvidence: () => void;
}

export function InvestmentsSection({
  investments,
  onRefresh,
  onNavigateEvidence,
}: InvestmentsSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [investmentType, setInvestmentType] = useState("MutualFunds");
  const [platform, setPlatform] = useState("");
  const [investedAmount, setInvestedAmount] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");

  const totalInvested = investments.reduce((acc, curr) => acc + (Number(curr.invested_amount) || 0), 0);
  const totalCurrentValue = investments.reduce((acc, curr) => acc + (Number(curr.current_value) || 0), 0);
  const unrealizedGain = totalCurrentValue - totalInvested;
  const gainPct = totalInvested > 0 ? ((unrealizedGain / totalInvested) * 100) : 0;

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investedAmount || !currentValue) return;

    try {
      setLoading(true);
      setError(null);
      await createInvestment({
        investment_type: investmentType,
        platform: platform.trim() || undefined,
        invested_amount: parseFloat(investedAmount),
        current_value: parseFloat(currentValue),
        expected_return: expectedReturn ? parseFloat(expectedReturn) : undefined,
      });
      setShowAddModal(false);
      setPlatform("");
      setInvestedAmount("");
      setCurrentValue("");
      setExpectedReturn("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to create investment record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-display text-lg font-black text-slate-800">
            Investment Holdings ({investments.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Verified mutual funds, direct equities, fixed income, and retirement portfolios. No fabricated CAGR.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateEvidence}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition"
          >
            <Upload className="h-3.5 w-3.5 text-emerald-700" />
            Upload CAS / Demat PDF &rarr;
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B5D4B] hover:bg-[#074739] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Investment
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Aggregate Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
            Current Portfolio Value
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {investments.length > 0 ? `₹${totalCurrentValue.toLocaleString()}` : "No investments added"}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Across {investments.length} canonical holding{investments.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
            Invested Principal
          </span>
          <p className="text-2xl font-black text-slate-700 mt-1">
            {investments.length > 0 ? `₹${totalInvested.toLocaleString()}` : "—"}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Net capital invested
          </p>
        </div>

        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-150">
          <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider block">
            Unrealized Returns
          </span>
          <p className={`text-2xl font-black mt-1 ${unrealizedGain >= 0 ? "text-emerald-800" : "text-rose-700"}`}>
            {investments.length > 0 ? `${unrealizedGain >= 0 ? "+" : ""}₹${unrealizedGain.toLocaleString()} (${gainPct.toFixed(1)}%)` : "—"}
          </p>
          <p className="text-[11px] text-emerald-600/90 font-medium mt-1">
            {investments.length > 0 ? "Calculated from current vs invested value" : "Awaiting investment data"}
          </p>
        </div>
      </div>

      {/* Investments List */}
      {investments.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No investment holdings cataloged yet"
          description="You haven't added any investments yet. Upload your NSDL / CDSL Consolidated Account Statement (CAS) or add mutual funds manually."
          actionLabel="Upload CAS Document"
          onAction={onNavigateEvidence}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map((inv, idx) => (
            <div
              key={inv.id || idx}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    {inv.platform ? `${inv.platform} (${inv.investment_type})` : inv.investment_type}
                  </h4>
                  <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                    {inv.investment_type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Invested</span>
                  <span className="font-bold text-slate-600 text-sm">
                    ₹{Number(inv.invested_amount).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Current Value</span>
                  <span className="font-black text-emerald-700 text-sm">
                    ₹{Number(inv.current_value).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Investment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-800">Add Investment Holding</h3>
            <form onSubmit={handleCreateInvestment} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Investment Class *</label>
                <select
                  value={investmentType}
                  onChange={(e) => setInvestmentType(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="MutualFunds">Mutual Funds</option>
                  <option value="DirectEquity">Direct Stocks / Equities</option>
                  <option value="FixedDeposit">Fixed Deposit (FD)</option>
                  <option value="PPF">Public Provident Fund (PPF)</option>
                  <option value="NPS">National Pension Scheme (NPS)</option>
                  <option value="GoldBonds">Sovereign Gold Bonds (SGB)</option>
                  <option value="Other">Other Asset Class</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Platform / Scheme Name</label>
                <input
                  type="text"
                  placeholder="e.g., Zerodha Coin, Groww, Parag Parikh Flexi Cap"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Invested Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    placeholder="100000"
                    value={investedAmount}
                    onChange={(e) => setInvestedAmount(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Current Value (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    placeholder="125000"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-black text-white bg-[#0B5D4B] hover:bg-[#074739] rounded-xl transition shadow-sm"
                >
                  {loading ? "Saving..." : "Save Investment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
