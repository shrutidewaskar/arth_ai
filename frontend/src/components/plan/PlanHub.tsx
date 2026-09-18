import React, { useState } from "react";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Scale,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Goal } from "@/types/financial";
import { EmptyState, LoadingState } from "@/components/shared/UIStates";
import { SimulatorTab } from "@/components/dashboard/SimulatorTab";
import { DeleteConfirmationModal } from "@/components/money/DeleteConfirmationModal";
import { createGoal, updateGoal, deleteGoal } from "@/lib/api";

interface PlanHubProps {
  goals: Goal[];
  feasibilityData: any;
  actionPlansData: any;
  initialSubTab?: string;
  onRefreshParent?: () => void;
  // Simulator props
  compareMode: boolean;
  setCompareMode: (val: boolean) => void;
  simType: string;
  setSimType: (val: string) => void;
  simIncomeType: string;
  setSimIncomeType: (val: string) => void;
  simIncomeVal: number;
  setSimIncomeVal: (val: number) => void;
  simExpenseType: string;
  setSimExpenseType: (val: string) => void;
  simExpenseVal: number;
  setSimExpenseVal: (val: number) => void;
  simLoanPrincipal: number;
  setSimLoanPrincipal: (val: number) => void;
  simLoanInterest: number;
  setSimLoanInterest: (val: number) => void;
  simLoanTenure: number;
  setSimLoanTenure: (val: number) => void;
  simLoanAssetVal: number;
  setSimLoanAssetVal: (val: number) => void;
  simInvestVal: number;
  setSimInvestVal: (val: number) => void;
  simulatedData: any;
  setSimulatedData: (val: any) => void;
  simLoading: boolean;
  runScenarioSimulation: () => void;
  comparisonResult: any;
  setComparisonResult: (val: any) => void;
  runDecisionComparison: () => void;
  optAType: string;
  setOptAType: (val: string) => void;
  optAIncomeType: string;
  setOptAIncomeType: (val: string) => void;
  optAIncomeVal: number;
  setOptAIncomeVal: (val: number) => void;
  optAExpenseType: string;
  setOptAExpenseType: (val: string) => void;
  optAExpenseVal: number;
  setOptAExpenseVal: (val: number) => void;
  optALoanPrincipal: number;
  setOptALoanPrincipal: (val: number) => void;
  optALoanInterest: number;
  setOptALoanInterest: (val: number) => void;
  optALoanTenure: number;
  setOptALoanTenure: (val: number) => void;
  optALoanAssetVal: number;
  setOptALoanAssetVal: (val: number) => void;
  optAInvestVal: number;
  setOptAInvestVal: (val: number) => void;
  optBType: string;
  setOptBType: (val: string) => void;
  optBIncomeType: string;
  setOptBIncomeType: (val: string) => void;
  optBIncomeVal: number;
  setOptBIncomeVal: (val: number) => void;
  optBExpenseType: string;
  setOptBExpenseType: (val: string) => void;
  optBExpenseVal: number;
  setOptBExpenseVal: (val: number) => void;
  optBLoanPrincipal: number;
  setOptBLoanPrincipal: (val: number) => void;
  optBLoanInterest: number;
  setOptBLoanInterest: (val: number) => void;
  optBLoanTenure: number;
  setOptBLoanTenure: (val: number) => void;
  optBLoanAssetVal: number;
  setOptBLoanAssetVal: (val: number) => void;
  optBInvestVal: number;
  setOptBInvestVal: (val: number) => void;
}

export function PlanHub({
  goals,
  feasibilityData,
  actionPlansData,
  initialSubTab = "goals",
  onRefreshParent,
  ...simProps
}: PlanHubProps) {
  const [subTab, setSubTab] = useState<string>(initialSubTab);

  // Goal Creation / Editing Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalForm, setGoalForm] = useState<{
    goal_name: string;
    category: string;
    target_amount: number;
    saved_amount: number;
    monthly_contribution: number;
    target_date: string;
    priority: string;
  }>({
    goal_name: "",
    category: "General",
    target_amount: 100000,
    saved_amount: 0,
    monthly_contribution: 5000,
    target_date: "",
    priority: "Medium",
  });
  const [submittingGoal, setSubmittingGoal] = useState(false);
  const [goalFeedback, setGoalFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Goal Deletion State
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const statusColors: Record<string, string> = {
    ON_TRACK: "bg-emerald-50 text-emerald-700 border-emerald-200",
    AT_RISK: "bg-amber-50 text-amber-700 border-amber-200",
    UNDERFUNDED: "bg-rose-50 text-rose-700 border-rose-200",
    ALREADY_ACHIEVED: "bg-sky-50 text-sky-700 border-sky-200",
    OVERDUE: "bg-rose-100 text-rose-800 border-rose-300",
    INSUFFICIENT_DATA: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const handleOpenCreateGoal = () => {
    setEditingGoal(null);
    setGoalForm({
      goal_name: "",
      category: "General",
      target_amount: 500000,
      saved_amount: 0,
      monthly_contribution: 10000,
      target_date: "",
      priority: "Medium",
    });
    setGoalFeedback(null);
    setShowGoalModal(true);
  };

  const handleOpenEditGoal = (g: Goal) => {
    setEditingGoal(g);
    setGoalForm({
      goal_name: g.goal_name,
      category: g.category || "General",
      target_amount: g.target_amount,
      saved_amount: g.saved_amount,
      monthly_contribution: g.monthly_contribution || 0,
      target_date: g.target_date ? g.target_date.substring(0, 10) : "",
      priority: g.priority || "Medium",
    });
    setGoalFeedback(null);
    setShowGoalModal(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.goal_name.trim()) return;

    try {
      setSubmittingGoal(true);
      setGoalFeedback(null);

      const payload: any = {
        goal_name: goalForm.goal_name.trim(),
        category: goalForm.category,
        target_amount: Number(goalForm.target_amount),
        saved_amount: Number(goalForm.saved_amount),
        monthly_contribution: Number(goalForm.monthly_contribution),
        priority: goalForm.priority,
      };
      if (goalForm.target_date) {
        payload.target_date = goalForm.target_date;
      }

      if (editingGoal && editingGoal.id) {
        await updateGoal(editingGoal.id, payload);
        setGoalFeedback({
          type: "success",
          message: `Goal "${payload.goal_name}" updated successfully. Feasibility refreshed!`,
        });
      } else {
        await createGoal(payload);
        setGoalFeedback({
          type: "success",
          message: `Goal "${payload.goal_name}" created successfully. Feasibility modeled!`,
        });
      }

      setShowGoalModal(false);
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setGoalFeedback({
        type: "error",
        message: err.message || "Failed to save goal.",
      });
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleConfirmDeleteGoal = async () => {
    if (!deletingGoal || !deletingGoal.id) return;
    try {
      setDeleteLoading(true);
      await deleteGoal(deletingGoal.id);
      setGoalFeedback({
        type: "success",
        message: `Goal "${deletingGoal.goal_name}" removed from planning ledger.`,
      });
      setDeletingGoal(null);
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setGoalFeedback({
        type: "error",
        message: err.message || "Failed to delete goal.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-black text-slate-800 tracking-tight">
              Planning & Decision Center
            </h2>
            <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200/60">
              Deterministic Reasoning
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            <strong className="text-slate-700">Goals</strong> define what you want. <strong className="text-slate-700">Action Plans</strong> reveal what is required. <strong className="text-slate-700">Decision Center</strong> simulates what happens under different choices.
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: "goals", label: `Goals (${goals.length})` },
            { id: "action_plans", label: `Action Plans (${actionPlansData?.plans?.length ?? 0})` },
            { id: "decision_center", label: "Decision Center" },
            { id: "forecasts", label: "Forecast" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                subTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GOALS VAULT & FEASIBILITY                                              */}
      {/* ========================================================================= */}
      {subTab === "goals" && (
        <div className="space-y-6">
          {goalFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                goalFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {goalFeedback.type === "success" ? (
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{goalFeedback.message}</span>
            </div>
          )}

          {/* Cashflow Capacity Summary */}
          {feasibilityData?.cashflow_capacity && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <span className="text-[10px] text-slate-450 font-bold block uppercase">Monthly Income Surplus</span>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  ₹{feasibilityData.cashflow_capacity.monthly_surplus.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-450 font-bold block uppercase">Planned Goal Outlays</span>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  ₹{feasibilityData.cashflow_capacity.total_current_goal_contributions.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-450 font-bold block uppercase">Available Buffer After Goals</span>
                <p
                  className={`text-sm font-black mt-0.5 ${
                    feasibilityData.cashflow_capacity.available_after_goal_contributions < 0
                      ? "text-rose-600"
                      : "text-[#0B5D4B]"
                  }`}
                >
                  ₹{feasibilityData.cashflow_capacity.available_after_goal_contributions.toLocaleString("en-IN")}
                </p>
              </div>
              {feasibilityData.cashflow_capacity.available_after_goal_contributions < 0 && (
                <div className="col-span-full text-[11px] bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 font-bold mt-1 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>
                    Attention: Planned monthly goal contributions exceed your current surplus by ₹
                    {Math.abs(feasibilityData.cashflow_capacity.available_after_goal_contributions).toLocaleString("en-IN")}.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Goals Header & Create Button */}
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800">
                Milestone Goals ({goals.length})
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Target milestones evaluated against current cashflow, savings, and investment run rates.
              </p>
            </div>
            <button
              onClick={handleOpenCreateGoal}
              className="px-4 py-2 bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Goal</span>
            </button>
          </div>

          {goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="You haven't created a financial goal yet"
              description="Define something you're working toward (e.g. Higher Education, Emergency Fund, Home Purchase) and ArthAI will evaluate how it fits into your financial situation."
              actionLabel="Create First Goal"
              onAction={handleOpenCreateGoal}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {goals.map((g, idx) => {
                const fGoal = feasibilityData?.goals?.find(
                  (fg: any) => fg.goal_id === g.id || fg.goal_name === g.goal_name
                );

                const progressPct = g.target_amount > 0 ? (g.saved_amount / g.target_amount) * 100 : 0;

                return (
                  <div
                    key={g.id || idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <h4 className="text-sm font-black text-slate-800">{g.goal_name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{g.category || "General"}</span>
                        </div>
                        <div className="flex gap-1.5 items-center flex-wrap justify-end">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                              g.priority === "Critical" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {g.priority}
                          </span>
                          {fGoal && (
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${
                                statusColors[fGoal.status] || "bg-slate-50 text-slate-600"
                              }`}
                            >
                              {fGoal.status.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Values Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
                        <div>
                          <span className="text-slate-450 block text-[10px] font-bold uppercase">Target Amount</span>
                          <span className="font-black text-slate-800 text-sm">
                            ₹{g.target_amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-450 block text-[10px] font-bold uppercase">Current Saved</span>
                          <span className="font-black text-[#0B5D4B] text-sm">
                            ₹{g.saved_amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Accumulated Progress</span>
                          <span>{progressPct.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0B5D4B] h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                          />
                        </div>
                      </div>

                      {/* Deterministic Feasibility Insights */}
                      {fGoal && (
                        <div className="bg-slate-50/80 p-3 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-200/80">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500 font-semibold">Required Monthly Outlay:</span>
                            <span className="font-black text-slate-800">
                              {fGoal.required_monthly_contribution !== undefined && fGoal.required_monthly_contribution !== null
                                ? `₹${Math.round(fGoal.required_monthly_contribution).toLocaleString("en-IN")}`
                                : fGoal.required_monthly_savings !== undefined
                                ? `₹${Math.round(fGoal.required_monthly_savings).toLocaleString("en-IN")}`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500 font-semibold">Projected Value at Horizon:</span>
                            <span className="font-black text-[#0B5D4B]">
                              {fGoal.projected_amount !== undefined && fGoal.projected_amount !== null
                                ? `₹${Math.round(fGoal.projected_amount).toLocaleString("en-IN")}`
                                : "—"}
                            </span>
                          </div>
                          {fGoal.reasons && fGoal.reasons.length > 0 ? (
                            <div className="pt-1.5 border-t border-slate-200/60 space-y-1">
                              {fGoal.reasons.map((r: string, rIdx: number) => (
                                <p key={rIdx} className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                  • {r}
                                </p>
                              ))}
                            </div>
                          ) : fGoal.explanation ? (
                            <p className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/60 font-medium leading-relaxed">
                              {fGoal.explanation}
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEditGoal(g)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setDeletingGoal(g)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete Goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTION PLANS SECTION                                                   */}
      {/* ========================================================================= */}
      {subTab === "action_plans" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800">
                Deterministic Action Recommendations ({actionPlansData?.plans?.length ?? 0})
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Required adjustments to pursue underfunded or at-risk goals based on canonical cashflow capacity.
              </p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-black uppercase border border-emerald-200/60">
              Safety Verified
            </span>
          </div>

          {!actionPlansData?.plans || actionPlansData.plans.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No action plans required"
              description="All your defined goals are currently on track with available cashflow capacity, or no underfunded goals were detected."
            />
          ) : (
            <div className="space-y-4">
              {actionPlansData.plans.map((plan: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      {plan.label || plan.goal_name || `Plan for Goal #${idx + 1}`}
                    </h4>
                    <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded font-black uppercase">
                      {plan.feasibility_status || "Needs Action"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-150">
                    {plan.primary_action}
                  </p>

                  {plan.steps && plan.steps.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-450 font-bold uppercase block">Action Roadmap</span>
                      <ul className="space-y-1.5 pl-4 border-l-2 border-[#0B5D4B] text-xs text-slate-700 font-semibold">
                        {plan.steps.map((step: string, sIdx: number) => (
                          <li key={sIdx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {plan.safety && (
                    <div className="text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-100 flex items-center gap-2">
                      <span className="font-bold text-slate-700">Safety Check:</span>
                      <span>
                        Surplus Impact: ₹{plan.safety.surplus_impact?.toLocaleString("en-IN") || 0}/mo • Viable: {plan.safety.is_viable ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DECISION CENTER (Simulator & Tradeoff Comparison)                       */}
      {/* ========================================================================= */}
      {subTab === "decision_center" && (
        <div className="space-y-6">
          <SimulatorTab {...simProps} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FORECAST / FINANCIAL TWIN (Truthful Insufficient-History State)         */}
      {/* ========================================================================= */}
      {subTab === "forecasts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800">
                Forward Projection Engine
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Deterministic forward modeling grounded in verified financial history and liabilities.
              </p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-black uppercase border border-slate-200">
              Truth-Grounded Engine
            </span>
          </div>

          <EmptyState
            icon={Cpu}
            title="A grounded forecast requires sufficient financial history"
            description="Upload at least 3 months of bank statements and catalog all active liabilities in Evidence to generate deterministic 5-15 year net worth projections without synthetic assumptions."
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT GOAL MODAL                                                  */}
      {/* ========================================================================= */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-[#0B5D4B]">
                <Target className="h-5 w-5" />
                <h4 className="font-display text-base font-black text-slate-800">
                  {editingGoal ? "Edit Financial Goal" : "Create Financial Goal"}
                </h4>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Downpayment, Higher Education"
                  value={goalForm.goal_name}
                  onChange={(e) => setGoalForm({ ...goalForm, goal_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0B5D4B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Category
                  </label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  >
                    <option value="General">General</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Home">Home</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Education">Education</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Priority
                  </label>
                  <select
                    value={goalForm.priority}
                    onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={goalForm.target_amount}
                    onChange={(e) => setGoalForm({ ...goalForm, target_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Current Saved (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={goalForm.saved_amount}
                    onChange={(e) => setGoalForm({ ...goalForm, saved_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Monthly SIP Outlay (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={goalForm.monthly_contribution}
                    onChange={(e) => setGoalForm({ ...goalForm, monthly_contribution: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={goalForm.target_date}
                    onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  disabled={submittingGoal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGoal}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-[#0B5D4B] text-white hover:bg-[#074739] transition shadow-xs flex items-center gap-2"
                >
                  {submittingGoal ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE GOAL CONFIRMATION MODAL                                            */}
      {/* ========================================================================= */}
      {deletingGoal && (
        <DeleteConfirmationModal
          isOpen={!!deletingGoal}
          title="Delete Financial Goal"
          entityName={deletingGoal.goal_name}
          entityType="Goal"
          onConfirm={handleConfirmDeleteGoal}
          onCancel={() => setDeletingGoal(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
