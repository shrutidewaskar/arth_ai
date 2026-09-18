import React from "react";
import { Goal, DashboardSummary } from "@/types/financial";

interface GoalsVaultTabProps {
  goals: Goal[];
  feasibilityData: any;
  actionPlansData: any;
}

export function GoalsVaultTab({ goals, feasibilityData, actionPlansData }: GoalsVaultTabProps) {
  const statusColors: Record<string, string> = {
    ON_TRACK: "bg-emerald-50 text-emerald-700 border-emerald-200",
    AT_RISK: "bg-amber-50 text-amber-700 border-amber-200",
    UNDERFUNDED: "bg-rose-50 text-rose-700 border-rose-200",
    ALREADY_ACHIEVED: "bg-sky-50 text-sky-700 border-sky-200",
    OVERDUE: "bg-rose-100 text-rose-800 border-rose-300",
    INSUFFICIENT_DATA: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-display text-base font-bold text-slate-700">Life Milestone Goals Vault</h3>
        <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">
          {goals.length} Goals Active
        </span>
      </div>

      {/* Contribution Pressure Info Card */}
      {feasibilityData?.cashflow_capacity && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 mb-6">
          <div>
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Monthly Income Surplus</span>
            <p className="text-sm font-black text-slate-800 mt-0.5">
              ₹{feasibilityData.cashflow_capacity.monthly_surplus.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Total Planned Contributions</span>
            <p className="text-sm font-black text-slate-800 mt-0.5">
              ₹{feasibilityData.cashflow_capacity.total_current_goal_contributions.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Available Buffer After Goals</span>
            <p
              className={`text-sm font-black mt-0.5 ${
                feasibilityData.cashflow_capacity.available_after_goal_contributions < 0
                  ? "text-rose-600"
                  : "text-emerald-700"
              }`}
            >
              ₹{feasibilityData.cashflow_capacity.available_after_goal_contributions.toLocaleString()}
            </p>
          </div>
          {feasibilityData.cashflow_capacity.available_after_goal_contributions < 0 && (
            <div className="col-span-full text-[10px] bg-rose-50 text-rose-700 p-2.5 rounded-lg border border-rose-100 font-bold mt-1">
              ⚠️ Attention: Your total planned monthly goal contributions exceed your current available surplus by ₹
              {Math.abs(
                feasibilityData.cashflow_capacity.available_after_goal_contributions
              ).toLocaleString()}
              . Exposing contribution pressure.
            </div>
          )}
        </div>
      )}

      {goals.length === 0 ? (
        <p className="text-xs text-slate-450 text-center py-8">You haven't created a goal yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((g, idx) => {
            const fGoal = feasibilityData?.goals?.find(
              (fg: any) => fg.goal_id === g.id || fg.goal_name === g.goal_name
            );

            return (
              <div
                key={g.id || idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{g.goal_name}</h4>
                      <span className="text-[9px] text-slate-400 font-bold">{g.category || "General"}</span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                          g.priority === "Critical" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {g.priority}
                      </span>
                      {fGoal && (
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${
                            statusColors[fGoal.status] || "bg-slate-50"
                          }`}
                        >
                          {fGoal.status.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-655 mt-2">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Target Value</span>
                      <p className="text-sm font-black text-slate-700 mt-0.5">
                        ₹{Number(g.target_amount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Saved Amount</span>
                      <p className="text-sm font-black text-slate-700 mt-0.5">
                        ₹{Number(g.saved_amount).toLocaleString()}
                      </p>
                    </div>
                    {fGoal && (
                      <>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Target Date</span>
                          <p className="text-xs font-black text-slate-700 mt-0.5">
                            {new Date(fGoal.target_date).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Remaining Time</span>
                          <p className="text-xs font-black text-slate-700 mt-0.5">{fGoal.months_remaining} months</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">
                            Current Monthly Contribution
                          </span>
                          <p className="text-xs font-black text-slate-700 mt-0.5">
                            ₹{fGoal.current_monthly_contribution.toLocaleString()}/mo
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">
                            Required Monthly Contribution
                          </span>
                          <p className="text-xs font-black text-slate-700 mt-0.5 text-primary">
                            ₹{fGoal.required_monthly_contribution.toLocaleString()}/mo
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">
                            Projected Value (Nominal)
                          </span>
                          <p className="text-xs font-black text-slate-700 mt-0.5">
                            ₹{fGoal.projected_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">
                            Projected Funding Gap
                          </span>
                          <p
                            className={`text-xs font-black mt-0.5 ${
                              fGoal.funding_gap > 0 ? "text-rose-600" : "text-slate-700"
                            }`}
                          >
                            ₹{fGoal.funding_gap.toLocaleString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {fGoal && fGoal.reasons && fGoal.reasons.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-600 font-medium space-y-1">
                    {fGoal.reasons.map((reason: string, rIdx: number) => (
                      <p key={rIdx} className="leading-relaxed">
                        ℹ️ {reason}
                      </p>
                    ))}
                    <p className="text-[8px] text-slate-400 font-bold uppercase pt-1">
                      * {fGoal.projection_method?.replace("_", " ")} | {fGoal.inflation_method?.replace("_", " ")}
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-200/50 pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-455 font-extrabold uppercase">Fund Allocation</span>
                  <span className="text-[10px] text-[#0B5D4B] font-bold">Auto-indexed</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Plans Section */}
      {actionPlansData && actionPlansData.plans && actionPlansData.plans.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="mb-4">
            <h3 className="font-display text-base font-bold text-slate-700">Deterministic Financial Action Plans</h3>
            <p className="text-[10px] text-slate-450 mt-1">
              Hypothetical scenario packages constructed to close active goal funding deficits under safe limits.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {actionPlansData.plans.map((plan: any, pIdx: number) => {
              const isRecommended = plan.id === actionPlansData.recommendation?.plan_id;
              const isViable = plan.safety?.is_viable;

              return (
                <div
                  key={plan.id || pIdx}
                  className={`p-6 rounded-2xl border transition-all duration-200 ${
                    isRecommended
                      ? "bg-slate-50/70 border-[#0B5D4B]/40 shadow-sm"
                      : isViable
                      ? "bg-white border-slate-200 hover:border-slate-300"
                      : "bg-rose-50/20 border-rose-200/60"
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{plan.label}</h4>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Plan ID: {plan.id}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {isRecommended && (
                        <span className="text-[9px] bg-[#0B5D4B]/10 text-[#0B5D4B] px-2 py-0.5 rounded font-black uppercase">
                          Highest-Ranked Plan
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${
                          isViable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {isViable ? "Viable" : "Unsafe"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Recommended Outlay Steps</span>
                      <div className="space-y-1.5">
                        {plan.actions.map((act: any, aIdx: number) => (
                          <div key={aIdx} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#0B5D4B]" />
                            {act.type === "REDUCE_EXPENSE" && `Reduce expenses by ₹${act.amount.toLocaleString()}/mo`}
                            {act.type === "INCREASE_GOAL_CONTRIBUTION" && `Increase contribution by ₹${act.amount.toLocaleString()}/mo`}
                            {act.type === "INCREASE_INCOME" && `Target income adjustment of ₹${act.amount.toLocaleString()}/mo`}
                            {act.type === "EXTEND_GOAL_TIMELINE" && `Extend target date to ${act.months} months total`}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-655">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Projected Surplus</span>
                        <p className="text-sm font-black text-slate-800 mt-0.5">
                          ₹{plan.projected.monthly_surplus.toLocaleString()}/mo
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Projected Health Score</span>
                        <p className="text-sm font-black text-[#0B5D4B] mt-0.5">
                          {plan.projected.financial_health_score}/100
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Projected DTI Ratio</span>
                        <p className="text-xs font-black text-slate-700 mt-0.5">{plan.projected.dti_ratio_pct}%</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Projected Runway</span>
                        <p className="text-xs font-black text-slate-700 mt-0.5">
                          {plan.projected.emergency_runway_months} months
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-500 font-medium">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1">Trade-offs Analysis</span>
                      {plan.tradeoffs?.map((trade: string, tIdx: number) => (
                        <p key={tIdx} className="leading-relaxed">
                          ⚖️ {trade}
                        </p>
                      ))}
                    </div>
                  </div>

                  {!isViable && plan.safety?.violations && plan.safety.violations.length > 0 && (
                    <div className="mt-3 p-2.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-100 text-[10px] font-bold">
                      ⚠️ Safety gates violated: {plan.safety.violations.join(" ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {actionPlansData.recommendation?.reasons && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 mt-4 text-[10px] text-slate-600 font-medium space-y-1">
              <span className="text-[9px] text-slate-400 font-black block uppercase mb-1">Model Rationale</span>
              {actionPlansData.recommendation.reasons.map((reason: string, rIdx: number) => (
                <p key={rIdx} className="leading-relaxed">
                  💡 {reason}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
