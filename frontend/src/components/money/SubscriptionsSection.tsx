import React, { useState } from "react";
import { Plus, Trash2, Coins, Upload, Calendar } from "lucide-react";
import { createSubscription, deleteSubscription } from "@/lib/api";
import { EmptyState } from "@/components/shared/UIStates";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface SubscriptionsSectionProps {
  subscriptions: any[];
  onRefresh: () => void;
  onNavigateEvidence: () => void;
}

export function SubscriptionsSection({
  subscriptions,
  onRefresh,
  onNavigateEvidence,
}: SubscriptionsSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [renewalDate, setRenewalDate] = useState("");

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalMonthlyRecurring = subscriptions.reduce((acc, curr) => {
    const amt = Number(curr.amount) || 0;
    return acc + (curr.billing_cycle === "Annual" ? amt / 12 : amt);
  }, 0);

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service.trim() || !amount) return;

    try {
      setLoading(true);
      setError(null);
      await createSubscription({
        service: service.trim(),
        amount: parseFloat(amount),
        billing_cycle: billingCycle,
        renewal_date: renewalDate || undefined,
      });
      setShowAddModal(false);
      setService("");
      setAmount("");
      setRenewalDate("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteSubscription(deleteTarget.id);
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete subscription");
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
            Bills & Subscriptions ({subscriptions.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Recurring software, utility, and entertainment subscriptions. No hardcoded mock services.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateEvidence}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition"
          >
            <Upload className="h-3.5 w-3.5 text-emerald-700" />
            Upload Bank / Card Statement &rarr;
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B5D4B] hover:bg-[#074739] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Subscription
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Aggregate Overview Card */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
            Estimated Monthly Recurring Burn
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {subscriptions.length > 0 ? `₹${totalMonthlyRecurring.toFixed(0)}/mo` : "No recurring bills"}
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {subscriptions.length} recurring subscription{subscriptions.length === 1 ? "" : "s"} tracked
        </div>
      </div>

      {/* Subscriptions Grid */}
      {subscriptions.length === 0 ? (
        <EmptyState
          icon={Coins}
          title="No recurring bills or subscriptions added yet"
          description="Add your monthly memberships or upload bank statements to track recurring outlays."
          actionLabel="Add First Subscription"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id || sub.service}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">{sub.service}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                    {sub.billing_cycle || "Monthly"}
                  </span>
                </div>
                {sub.id && (
                  <button
                    onClick={() => setDeleteTarget({ id: sub.id, name: sub.service })}
                    className="text-slate-300 hover:text-rose-600 transition p-1"
                    title="Delete subscription"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Cost</span>
                <span className="text-base font-black text-slate-800">
                  ₹{Number(sub.amount).toLocaleString()}
                </span>
              </div>

              {sub.renewal_date && (
                <div className="pt-1 flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span>Renews: {new Date(sub.renewal_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-800">Add Subscription</h3>
            <form onSubmit={handleCreateSubscription} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Service / Bill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., AWS Cloud, Electricity Board, Gym Membership"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="649"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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
                  className="px-4 py-2 text-xs font-black text-white bg-[#0B5D4B] hover:bg-[#074739] rounded-xl transition shadow-sm"
                >
                  {loading ? "Saving..." : "Save Subscription"}
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
          title="Delete Subscription"
          entityName={deleteTarget.name}
          entityType="Subscription"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
