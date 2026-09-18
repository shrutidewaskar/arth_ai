import React, { useState } from "react";
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet, Check } from "lucide-react";
import { createIncome, deleteIncome, createExpense, deleteExpense } from "@/lib/api";
import { EmptyState } from "@/components/shared/UIStates";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface CashFlowSectionProps {
  incomes: any[];
  expenses: any[];
  liabilities: any[];
  onRefresh: () => void;
  onNavigateEvidence: () => void;
}

export function CashFlowSection({
  incomes,
  expenses,
  liabilities,
  onRefresh,
  onNavigateEvidence,
}: CashFlowSectionProps) {
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Income Form
  const [incomeName, setIncomeName] = useState("");
  const [incomeType, setIncomeType] = useState("Salary");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeFreq, setIncomeFreq] = useState("Monthly");

  // Expense Form
  const [expenseCat, setExpenseCat] = useState("Housing / Rent");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseEssential, setExpenseEssential] = useState(true);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: "income" | "expense" } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalInflows = incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalLivingExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalEmi = liabilities.reduce((acc, curr) => acc + (Number(curr.emi) || 0), 0);
  const totalOutflows = totalLivingExpenses + totalEmi;
  const netMonthlySurplus = totalInflows - totalOutflows;
  const savingsRate = totalInflows > 0 ? ((netMonthlySurplus / totalInflows) * 100) : 0;

  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeName.trim() || !incomeAmount) return;
    try {
      setLoading(true);
      setError(null);
      await createIncome({
        source_name: incomeName.trim(),
        type: incomeType,
        amount: parseFloat(incomeAmount),
        frequency: incomeFreq,
      });
      setShowIncomeModal(false);
      setIncomeName("");
      setIncomeAmount("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to create income source");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseCat.trim() || !expenseAmount) return;
    try {
      setLoading(true);
      setError(null);
      await createExpense({
        category: expenseCat.trim(),
        amount: parseFloat(expenseAmount),
        essential: expenseEssential,
      });
      setShowExpenseModal(false);
      setExpenseAmount("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to create expense category");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      if (deleteTarget.type === "income") {
        await deleteIncome(deleteTarget.id);
      } else {
        await deleteExpense(deleteTarget.id);
      }
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cash Flow Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider">Total Monthly Inflows</span>
            <div className="p-1.5 bg-emerald-100/70 rounded-xl text-emerald-700">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-2">
            {incomes.length > 0 ? `₹${totalInflows.toLocaleString()}` : "No income added"}
          </p>
          <p className="text-[11px] text-emerald-600/90 font-medium mt-1">
            {incomes.length} canonical income source{incomes.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-800 font-black uppercase tracking-wider">Total Monthly Outflows</span>
            <div className="p-1.5 bg-rose-100/70 rounded-xl text-rose-700">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-800 mt-2">
            {expenses.length > 0 || liabilities.length > 0 ? `₹${totalOutflows.toLocaleString()}` : "No expenses added"}
          </p>
          <p className="text-[11px] text-rose-600/90 font-medium mt-1">
            Living: ₹{totalLivingExpenses.toLocaleString()} | Loan EMIs: ₹{totalEmi.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Net Monthly Surplus</span>
            <div className="p-1.5 bg-slate-200/70 rounded-xl text-slate-700">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${netMonthlySurplus >= 0 ? "text-slate-900" : "text-rose-600"}`}>
            {incomes.length > 0 ? `₹${netMonthlySurplus.toLocaleString()}` : "Unknown"}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {incomes.length > 0 ? `Savings Rate: ${savingsRate.toFixed(1)}%` : "Requires income data"}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Incomes & Expenses Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Sources Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800">Income Sources</h3>
              <p className="text-[11px] text-slate-400">Canonical recurring inflows</p>
            </div>
            <button
              onClick={() => setShowIncomeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Income
            </button>
          </div>

          {incomes.length === 0 ? (
            <EmptyState
              icon={ArrowUpRight}
              title="No income sources added yet"
              description="Add your primary salary, freelance contracts, or rental income manually or upload a salary slip."
              actionLabel="Add Income Source"
              onAction={() => setShowIncomeModal(true)}
            />
          ) : (
            <div className="space-y-2.5">
              {incomes.map((inc) => (
                <div
                  key={inc.id || inc.source_name}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-slate-300 transition"
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{inc.source_name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      {inc.type || "Income"} • {inc.frequency || "Monthly"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-700">
                      ₹{Number(inc.amount).toLocaleString()}
                    </span>
                    {inc.id && (
                      <button
                        onClick={() => setDeleteTarget({ id: inc.id, name: inc.source_name, type: "income" })}
                        className="text-slate-300 hover:text-rose-600 transition p-1"
                        title="Delete income source"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800">Living Expenses</h3>
              <p className="text-[11px] text-slate-400">Canonical monthly expense line items</p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-xl text-xs font-bold transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Expense
            </button>
          </div>

          {expenses.length === 0 ? (
            <EmptyState
              icon={ArrowDownRight}
              title="No expenses added yet"
              description="Add your housing, food, transport, or utility expenses to compute truthful household surplus."
              actionLabel="Add Expense"
              onAction={() => setShowExpenseModal(true)}
            />
          ) : (
            <div className="space-y-2.5">
              {expenses.map((exp) => (
                <div
                  key={exp.id || exp.category}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-slate-300 transition"
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{exp.category}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      {exp.essential !== false ? "Essential" : "Discretionary"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-rose-700">
                      ₹{Number(exp.amount).toLocaleString()}
                    </span>
                    {exp.id && (
                      <button
                        onClick={() => setDeleteTarget({ id: exp.id, name: exp.category, type: "expense" })}
                        className="text-slate-300 hover:text-rose-600 transition p-1"
                        title="Delete expense category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-800">Add Income Source</h3>
            <form onSubmit={handleCreateIncome} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Source Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Full-Time Salary (Google)"
                  value={incomeName}
                  onChange={(e) => setIncomeName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Type</label>
                  <select
                    value={incomeType}
                    onChange={(e) => setIncomeType(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Business">Business</option>
                    <option value="Rental">Rental</option>
                    <option value="Dividends">Dividends</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Frequency</label>
                  <select
                    value={incomeFreq}
                    onChange={(e) => setIncomeFreq(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  placeholder="85000"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-sm"
                >
                  {loading ? "Saving..." : "Save Income"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-800">Add Expense Category</h3>
            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Category *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Housing Rent, Groceries, Utilities"
                  value={expenseCat}
                  onChange={(e) => setExpenseCat(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Monthly Outlay (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  placeholder="25000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="essentialCheck"
                  checked={expenseEssential}
                  onChange={(e) => setExpenseEssential(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="essentialCheck" className="text-xs font-semibold text-slate-700">
                  Essential living cost (non-discretionary)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm"
                >
                  {loading ? "Saving..." : "Save Expense"}
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
          title={`Delete ${deleteTarget.type === "income" ? "Income Source" : "Expense"}`}
          entityName={deleteTarget.name}
          entityType={deleteTarget.type}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
