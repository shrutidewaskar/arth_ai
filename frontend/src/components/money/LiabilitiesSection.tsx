import React, { useState } from "react";
import { Plus, Trash2, CreditCard, AlertCircle } from "lucide-react";
import { createLiability, deleteLiability } from "@/lib/api";
import { EmptyState } from "@/components/shared/UIStates";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface LiabilitiesSectionProps {
  liabilities: any[];
  onRefresh: () => void;
  onNavigateEvidence: () => void;
}

export function LiabilitiesSection({
  liabilities,
  onRefresh,
  onNavigateEvidence,
}: LiabilitiesSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [loanName, setLoanName] = useState("");
  const [loanType, setLoanType] = useState("HomeLoan");
  const [principal, setPrincipal] = useState("");
  const [outstanding, setOutstanding] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [emi, setEmi] = useState("");

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalOutstanding = liabilities.reduce((acc, curr) => acc + (Number(curr.outstanding) || 0), 0);
  const totalMonthlyEmi = liabilities.reduce((acc, curr) => acc + (Number(curr.emi) || 0), 0);

  const handleCreateLiability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanName.trim() || !outstanding || !emi) return;

    try {
      setLoading(true);
      setError(null);
      await createLiability({
        loan_name: loanName.trim(),
        loan_type: loanType,
        principal: principal ? parseFloat(principal) : parseFloat(outstanding),
        outstanding: parseFloat(outstanding),
        interest_rate: interestRate ? parseFloat(interestRate) : 0,
        emi: parseFloat(emi),
      });
      setShowAddModal(false);
      setLoanName("");
      setPrincipal("");
      setOutstanding("");
      setInterestRate("");
      setEmi("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to create liability");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteLiability(deleteTarget.id);
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete liability");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-display text-lg font-black text-slate-800">
            Liabilities & Debt Ledger ({liabilities.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Active debt contracts, outstanding principal balances, interest rates, and monthly EMIs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateEvidence}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition"
          >
            Upload Loan Statement &rarr;
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-650 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm bg-rose-600"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Liability
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Aggregate Metrics Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-150">
          <span className="text-[10px] text-rose-800 font-black uppercase tracking-wider block">
            Total Outstanding Principal
          </span>
          <p className="text-2xl font-black text-rose-800 mt-1">
            {liabilities.length > 0 ? `₹${totalOutstanding.toLocaleString()}` : "No debts recorded"}
          </p>
          <p className="text-[11px] text-rose-600/90 font-medium mt-1">
            Across {liabilities.length} active obligation{liabilities.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">
            Aggregated Monthly EMI Obligation
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {liabilities.length > 0 ? `₹${totalMonthlyEmi.toLocaleString()}/mo` : "₹0/mo"}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Direct recurring outflow from monthly income
          </p>
        </div>
      </div>

      {/* Liabilities Grid */}
      {liabilities.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No active liabilities or loans"
          description="If you have a home loan, car loan, education loan, or credit card EMI, add it here to ensure accurate Debt-to-Income (DTI) calculations."
          actionLabel="Add First Liability"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liabilities.map((loan) => (
            <div
              key={loan.id || loan.loan_name}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">{loan.loan_name}</h4>
                  <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                    {loan.loan_type || "Loan"}
                  </span>
                </div>
                {loan.id && (
                  <button
                    onClick={() => setDeleteTarget({ id: loan.id, name: loan.loan_name })}
                    className="text-slate-300 hover:text-rose-600 transition p-1"
                    title="Delete liability"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Outstanding</span>
                  <span className="font-black text-rose-600 text-sm">
                    ₹{Number(loan.outstanding).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Monthly EMI</span>
                  <span className="font-black text-slate-800 text-sm">
                    ₹{Number(loan.emi).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Interest Rate</span>
                  <span className="font-bold text-slate-700 text-sm">
                    {loan.interest_rate ? `${loan.interest_rate}%` : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Liability Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-800">Add Liability / Loan Contract</h3>
            <form onSubmit={handleCreateLiability} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Loan / Liability Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., HDFC Home Loan, SBI Auto Loan"
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Type</label>
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="HomeLoan">Home Loan</option>
                    <option value="PersonalLoan">Personal Loan</option>
                    <option value="VehicleLoan">Vehicle / Auto Loan</option>
                    <option value="EducationLoan">Education Loan</option>
                    <option value="CreditCard">Credit Card Balance</option>
                    <option value="Other">Other Debt</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    placeholder="8.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Outstanding (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    placeholder="2500000"
                    value={outstanding}
                    onChange={(e) => setOutstanding(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Monthly EMI (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    placeholder="28000"
                    value={emi}
                    onChange={(e) => setEmi(e.target.value)}
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
                  className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm"
                >
                  {loading ? "Saving..." : "Save Liability"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmationModal
          isOpen={true}
          title="Delete Liability"
          entityName={deleteTarget.name}
          entityType="Liability"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
