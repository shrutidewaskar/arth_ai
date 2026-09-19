import React, { useState } from "react";
import { Plus, Trash2, Building, Layers } from "lucide-react";
import { createAsset, deleteAsset } from "@/lib/api";
import { EmptyState } from "@/components/shared/UIStates";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface AssetsSectionProps {
  assets: any[];
  onRefresh: () => void;
  onNavigateEvidence: () => void;
}

export function AssetsSection({
  assets,
  onRefresh,
  onNavigateEvidence,
}: AssetsSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("Cash & Bank");
  const [currentValue, setCurrentValue] = useState("");

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalAssets = assets.reduce((acc, curr) => acc + (Number(curr.current_value) || 0), 0);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !currentValue) return;

    try {
      setLoading(true);
      setError(null);
      await createAsset({
        asset_name: assetName.trim(),
        asset_type: assetType,
        current_value: parseFloat(currentValue),
      });
      setShowAddModal(false);
      setAssetName("");
      setCurrentValue("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteAsset(deleteTarget.id);
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete asset");
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
            Household Assets ({assets.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real balance sheet assets including bank balances, fixed deposits, gold, and properties.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateEvidence}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition"
          >
            Upload Bank / CAS Statement &rarr;
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-[#074739] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Asset
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
            Total Asset Position
          </span>
          <p className="text-3xl font-black text-emerald-800 mt-1">
            {assets.length > 0 ? `₹${totalAssets.toLocaleString()}` : "No assets cataloged"}
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {assets.length} canonical line item{assets.length === 1 ? "" : "s"} actively tracked
        </div>
      </div>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <EmptyState
          icon={Building}
          title="No assets recorded in your profile"
          description="Catalog your savings accounts, fixed deposits, properties, or physical gold to construct your net worth."
          actionLabel="Add First Asset"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id || asset.asset_name}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">{asset.asset_name}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                    {asset.asset_type || "General Asset"}
                  </span>
                </div>
                {asset.id && (
                  <button
                    onClick={() => setDeleteTarget({ id: asset.id, name: asset.asset_name })}
                    className="text-slate-300 hover:text-rose-600 transition p-1"
                    title="Delete asset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Value</span>
                <span className="text-base font-black text-emerald-700">
                  ₹{Number(asset.current_value).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-800">Add Household Asset</h3>
            <form onSubmit={handleCreateAsset} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., HDFC Savings Account, SBI Fixed Deposit, Gold Sovereign"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Asset Classification</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Cash & Bank">Cash & Bank Accounts</option>
                  <option value="Fixed Deposit">Fixed Deposit (FD/RD)</option>
                  <option value="Mutual Funds">Mutual Funds & Equities</option>
                  <option value="Real Estate">Real Estate / Property</option>
                  <option value="Gold">Gold & Precious Metals</option>
                  <option value="EPF/PPF">Retirement Funds (EPF / PPF / NPS)</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Other">Other Asset</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Current Valued Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  placeholder="250000"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
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
                  {loading ? "Saving..." : "Save Asset"}
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
          title="Delete Asset"
          entityName={deleteTarget.name}
          entityType="Asset"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
