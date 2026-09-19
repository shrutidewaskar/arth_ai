import React, { useState } from "react";
import { Plus, ShieldCheck, Upload, Calendar } from "lucide-react";
import { createInsurancePolicy } from "@/lib/api";
import { EmptyState } from "@/components/shared/UIStates";

interface InsuranceSectionProps {
  insurancePolicies: any[];
  onRefresh: () => void;
  onNavigateEvidence: () => void;
}

export function InsuranceSection({
  insurancePolicies,
  onRefresh,
  onNavigateEvidence,
}: InsuranceSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [policyName, setPolicyName] = useState("");
  const [provider, setProvider] = useState("");
  const [coverage, setCoverage] = useState("");
  const [premium, setPremium] = useState("");
  const [renewalDate, setRenewalDate] = useState("");

  const totalCoverage = insurancePolicies.reduce((acc, curr) => acc + (Number(curr.coverage) || 0), 0);
  const totalAnnualPremium = insurancePolicies.reduce((acc, curr) => acc + (Number(curr.premium) || 0), 0);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyName.trim() || !provider.trim() || !coverage || !premium) return;

    try {
      setLoading(true);
      setError(null);
      await createInsurancePolicy({
        policy_name: policyName.trim(),
        provider: provider.trim(),
        coverage: parseFloat(coverage),
        premium: parseFloat(premium),
        renewal_date: renewalDate || undefined,
      });
      setShowAddModal(false);
      setPolicyName("");
      setProvider("");
      setCoverage("");
      setPremium("");
      setRenewalDate("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to save insurance policy");
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
            Insurance & Risk Shield ({insurancePolicies.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Active health, term life, vehicle, and critical illness policies protecting your balance sheet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateEvidence}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition"
          >
            <Upload className="h-3.5 w-3.5 text-emerald-700" />
            Upload Insurance Document &rarr;
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-[#074739] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Policy
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Aggregate Coverage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-150">
          <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider block">
            Total Insured Risk Protection
          </span>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            {insurancePolicies.length > 0 ? `₹${totalCoverage.toLocaleString()}` : "No policies added"}
          </p>
          <p className="text-[11px] text-emerald-600/90 font-medium mt-1">
            Across {insurancePolicies.length} active policy contract{insurancePolicies.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">
            Total Annual Premium Outlay
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {insurancePolicies.length > 0 ? `₹${totalAnnualPremium.toLocaleString()}/yr` : "—"}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Combined policy maintenance cost
          </p>
        </div>
      </div>

      {/* Policies Grid */}
      {insurancePolicies.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No insurance policies cataloged yet"
          description="No insurance policies have been added yet. Add a policy or upload your insurance schedule PDF to protect your household from catastrophic debt."
          actionLabel="Add Insurance Policy"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insurancePolicies.map((pol, idx) => (
            <div
              key={pol.id || idx}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">{pol.policy_name}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                    {pol.provider}
                  </span>
                </div>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">
                  Active Policy
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Sum Insured (Coverage)</span>
                  <span className="font-black text-emerald-700 text-sm">
                    ₹{Number(pol.coverage).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Annual Premium</span>
                  <span className="font-bold text-slate-800 text-sm">
                    ₹{Number(pol.premium).toLocaleString()}
                  </span>
                </div>
              </div>

              {pol.renewal_date && (
                <div className="pt-2 border-t border-slate-50 flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Renewal Date: {new Date(pol.renewal_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-800">Add Insurance Policy</h3>
            <form onSubmit={handleCreatePolicy} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Policy Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., HDFC Life Click 2 Protect, Star Health Optima"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Insurer / Provider *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., HDFC Ergo, ICICI Lombard, LIC"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Sum Insured (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    placeholder="1000000"
                    value={coverage}
                    onChange={(e) => setCoverage(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Annual Premium (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    placeholder="18000"
                    value={premium}
                    onChange={(e) => setPremium(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Renewal Date (Optional)</label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                />
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
                  className="px-4 py-2 text-xs font-black text-white bg-primary hover:bg-[#074739] rounded-xl transition shadow-sm"
                >
                  {loading ? "Saving..." : "Save Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
