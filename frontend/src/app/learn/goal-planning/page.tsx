import React from "react";
import { Target, CheckCircle2, AlertTriangle, Cpu, TrendingUp, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { LearnPageShell } from "@/components/learn/LearnPageShell";
import { LearnHero } from "@/components/learn/LearnHero";
import { FlowDiagram, FlowStep } from "@/components/learn/FlowDiagram";
import { FormulaCard } from "@/components/learn/FormulaCard";
import { AssumptionCard } from "@/components/learn/AssumptionCard";
import { BoundaryCard } from "@/components/learn/BoundaryCard";
import { SourceOfTruthCard } from "@/components/learn/SourceOfTruthCard";
import { TryInArthAICta } from "@/components/learn/TryInArthAICta";

export const metadata = {
  title: "How Goal Feasibility is Calculated — ArthAI Learn",
  description: "Understand the deterministic nominal goal planning formulas, required monthly contribution math, and conservative 0% CAGR model in ArthAI.",
};

const GOAL_FLOW_STEPS: FlowStep[] = [
  {
    number: "01",
    title: "Timeline & Target Evaluation",
    badge: "Calendar Horizon",
    description: "Calculates the exact months remaining until your target milestone date: months_remaining = max(1, round(days / 30)).",
    icon: Calendar,
    subDetails: ["Target date validation", "Overdue status check"],
  },
  {
    number: "02",
    title: "Nominal Trajectory Math",
    badge: "Contribution Modeling",
    description: "Computes projected savings using your current monthly contribution and calculates the exact required monthly contribution rate.",
    icon: Target,
    subDetails: ["0% speculative CAGR", "Nominal funding gap"],
  },
  {
    number: "03",
    title: "Cash Flow & Safety Check",
    badge: "Feasibility Verification",
    description: "Compares required contributions against your monthly surplus, while enforcing emergency runway (≥ 3 mo) and DTI (≤ 35%) safety limits.",
    icon: ShieldCheck,
    subDetails: ["Surplus affordability", "Liquidity preservation"],
  },
];

export default function GoalPlanningLearnPage() {
  return (
    <LearnPageShell
      topicTitle="Goal Planning"
      category="Planning & Simulations"
      relatedTopics={[
        {
          title: "Financial Pulse Architecture",
          description: "See how baseline surplus and emergency runway determine goal affordability.",
          href: "/learn/financial-pulse",
        },
        {
          title: "Decision & Scenario Simulation",
          description: "Test how taking a loan or increasing SIP contributions alters milestone timelines.",
          href: "/learn/decision-simulation",
        },
      ]}
    >
      {/* Hero Header */}
      <LearnHero
        badge="Deterministic Feasibility Model"
        badgeIcon={Target}
        title="Goal Feasibility & Timeline Mathematics"
        subtitle="How ArthAI deterministically evaluates whether your household aspirations—like child education, home down payments, or retirement—are on track."
        takeaway="ArthAI uses conservative, contribution-only modeling (0% speculative market CAGR). The calculation answers whether the nominal target can be reached under the stated contribution-only assumptions."
      />

      {/* Pipeline Flow */}
      <FlowDiagram
        title="Goal Feasibility Pipeline"
        subtitle="The three stages of evaluation executed by GoalFeasibilityEngine:"
        steps={GOAL_FLOW_STEPS}
      />

      {/* Mathematical Formulas */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Core Mathematical Formulas
        </h2>

        {/* Formula 1: Required Monthly Contribution */}
        <FormulaCard
          title="1. Required Monthly Contribution"
          formulaDisplay="Required Monthly Contribution = (Target Amount - Saved Amount) / Months Remaining"
          description="Calculates the exact monthly capital allocation needed from today until the target milestone date to fund the remaining balance."
          sourceFunction="GoalFeasibilityEngine.analyze_goals_feasibility(...)"
          parameters={[
            {
              symbol: "Target Amount",
              name: "Nominal Goal Value",
              description: "Total capital required at the milestone date (e.g. ₹20,00,000 for college education).",
            },
            {
              symbol: "Saved Amount",
              name: "Current Capital Allocated",
              description: "Total funds already accumulated or explicitly earmarked for this specific goal.",
            },
            {
              symbol: "Months Remaining",
              name: "Time Horizon in Months",
              description: "Calendar days from today until target date divided by 30: max(1, round(days / 30)).",
            },
          ]}
          example={{
            inputs: {
              "Target Amount": "₹20,00,000",
              "Saved Amount": "₹5,00,000",
              "Months Remaining": "60 months (5 years)",
            },
            result: "₹25,000 / month",
            explanation: "₹15 Lakhs remaining divided by 60 months requires exactly ₹25,000/month in dedicated contributions.",
          }}
        />

        {/* Formula 2: Projected Amount */}
        <FormulaCard
          title="2. Projected Goal Accumulation (Contribution-Only)"
          formulaDisplay="Projected Amount = Saved Amount + (Current Monthly Contribution × Months Remaining)"
          description="Projects the total nominal capital you will accumulate by the target date at your current contribution pace, assuming 0% speculative returns."
          sourceFunction="GoalFeasibilityEngine (projection_method: 'contribution_only')"
          parameters={[
            {
              symbol: "Current Monthly Contribution",
              name: "Active Monthly Allocation",
              description: "The amount you currently save or invest into this goal every month.",
            },
            {
              symbol: "Funding Gap",
              name: "Projected Shortfall",
              description: "max(Target Amount - Projected Amount, 0). The deficit that needs to be closed.",
            },
          ]}
          example={{
            inputs: {
              "Saved Amount": "₹5,00,000",
              "Current Contribution": "₹15,000/mo",
              "Months Remaining": "60 months",
            },
            result: "₹14,00,000 (Funding Gap: ₹6,00,000)",
            explanation: "Saving ₹15,000/mo over 60 months adds ₹9 Lakhs to the ₹5 Lakhs saved, leaving a ₹6 Lakhs shortfall at the milestone.",
          }}
        />
      </div>

      {/* Goal Status Classification */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-slate-900">
          Feasibility Status Classifications
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              ON_TRACK
            </span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Your current monthly contribution rate is sufficient to accumulate 100% of the nominal target by the milestone date.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              AT_RISK
            </span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Your current contribution produces a shortfall, but the required rate is <strong>affordable</strong> within your available monthly cash flow surplus.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
            <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
              UNDERFUNDED
            </span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              The required monthly contribution exceeds your total monthly cash flow surplus. Re-scoping target dates or cutting expenses is necessary.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
              ALREADY_ACHIEVED
            </span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              The saved amount has already reached or exceeded the nominal target amount.
            </p>
          </div>
        </div>
      </div>

      {/* Financial Safety Guardrails */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="font-display text-lg font-bold text-slate-900">
          Financial Safety Limits in Goal Analysis
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          ArthAI does not merely check if a goal is mathematically possible. It checks whether pursuing it will compromise household resilience. A goal is flagged as causing financial stress if:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-slate-700 font-medium">
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <strong>Emergency Runway:</strong> Drops below <strong>3.0 months</strong> of living expenses.
          </li>
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <strong>DTI Ratio:</strong> Household debt obligations exceed <strong>35.0%</strong>.
          </li>
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <strong>Surplus Buffer:</strong> Remaining free cash flow after goal funding drops below <strong>₹5,000/mo</strong>.
          </li>
        </ul>
      </div>

      {/* Assumptions */}
      <AssumptionCard
        assumptions={[
          {
            title: "0% Speculative Market Return Assumption",
            rationale: "ArthAI evaluates nominal feasibility based on actual savings capability, without relying on speculative stock market returns to magically bridge funding gaps.",
          },
          {
            title: "30-Day Month Horizon Standard",
            rationale: "Calendar duration is standardized using round(days / 30.0) with a safety minimum of 1 month.",
          },
          {
            title: "Dedicated Earmarking",
            rationale: "Capital allocated to one goal is isolated and not counted double across multiple overlapping milestones.",
          },
          {
            title: "Surplus Capacity Constraint",
            rationale: "Available surplus is defined as Gross Incomes - Expenses - EMIs from canonical ledger records.",
          },
        ]}
      />

      {/* Boundaries */}
      <BoundaryCard
        boundaries={[
          {
            limitation: "Does NOT model variable inflation automatically",
            explanation: "Target amounts should be entered as future expected nominal costs; the model does not auto-inflate targets.",
          },
          {
            limitation: "Does NOT speculate on asset appreciation",
            explanation: "Future capital gains on equities, gold, or property are not assumed in baseline feasibility math.",
          },
          {
            limitation: "Does NOT force automated deductions",
            explanation: "ArthAI recommends contribution rates; execution remains under full user control.",
          },
          {
            limitation: "Does NOT predict unplanned life disruptions",
            explanation: "The engine models current trajectory; unexpected expenses require updating baseline cash flows.",
          },
        ]}
      />

      {/* Source of Truth */}
      <SourceOfTruthCard
        files={[
          {
            filePath: "backend/app/engine/goal_feasibility.py",
            role: "Contains GoalFeasibilityEngine.analyze_goals_feasibility() with contribution-only math and safety checks.",
          },
          {
            filePath: "backend/app/engine/rules_engine.py",
            role: "Calculates individual goal completion percentages (saved / target * 100).",
          },
          {
            filePath: "frontend/src/components/plan/GoalsTab.tsx",
            role: "Renders goal cards, progress bars, required monthly allocations, and funding gaps.",
          },
        ]}
      />

      {/* Try in Product CTA */}
      <TryInArthAICta
        title="Track Your Milestones in Goals Vault"
        description="Catalog your family goals, see exact required monthly contributions, and monitor your nominal funding progress."
        buttonLabel="Open Goals Vault"
        targetHref="/dashboard?tab=plan&subTab=goals"
      />
    </LearnPageShell>
  );
}
