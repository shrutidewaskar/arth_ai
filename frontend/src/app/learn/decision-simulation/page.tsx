import React from "react";
import { Compass, Scale, Cpu, Calculator, TrendingDown, ArrowRight, Layers } from "lucide-react";
import { LearnPageShell } from "@/components/learn/LearnPageShell";
import { LearnHero } from "@/components/learn/LearnHero";
import { FlowDiagram, FlowStep } from "@/components/learn/FlowDiagram";
import { FormulaCard } from "@/components/learn/FormulaCard";
import { AssumptionCard } from "@/components/learn/AssumptionCard";
import { BoundaryCard } from "@/components/learn/BoundaryCard";
import { SourceOfTruthCard } from "@/components/learn/SourceOfTruthCard";
import { TryInArthAICta } from "@/components/learn/TryInArthAICta";

export const metadata = {
  title: "How Decision Simulation Works — ArthAI Learn",
  description: "Learn how ArthAI's scenario simulation engine evaluates loan EMIs, income changes, and expense spikes against your baseline cash flow.",
};

const SIMULATION_FLOW_STEPS: FlowStep[] = [
  {
    number: "01",
    title: "Baseline Snapshot",
    badge: "Immutable Deep Copy",
    description: "The engine takes an in-memory deep copy of your current financial context (incomes, expenses, assets, liabilities, goals). No database records are modified.",
    icon: Layers,
    subDetails: ["Pure memory state", "Zero DB mutation"],
  },
  {
    number: "02",
    title: "Apply Parameterized Scenario",
    badge: "Scenario Modification",
    description: "Modifications (e.g. ₹15L car loan at 8.5% for 5 years, or a 15% salary hike) are applied to the temporary context.",
    icon: Scale,
    subDetails: ["Standard amortization math", "Asset/Liability mapping"],
  },
  {
    number: "03",
    title: "Comparative Delta Analysis",
    badge: "Trade-off Evaluation",
    description: "The BusinessRuleEngine recomputes DTI, monthly surplus, and emergency runway, calculating exact deltas between baseline and scenario.",
    icon: Compass,
    subDetails: ["DTI shift", "Surplus impact", "Runway compression"],
  },
];

export default function DecisionSimulationLearnPage() {
  return (
    <LearnPageShell
      topicTitle="Decision Simulation"
      category="Planning & Simulations"
      relatedTopics={[
        {
          title: "Financial Pulse Architecture",
          description: "See how baseline DTI, runway, and surplus are computed before simulation.",
          href: "/learn/financial-pulse",
        },
        {
          title: "Goal Feasibility Analysis",
          description: "Examine how new EMI obligations impact milestone funding timelines.",
          href: "/learn/goal-planning",
        },
      ]}
    >
      {/* Hero Header */}
      <LearnHero
        badge="Comparative Decision Engine"
        badgeIcon={Compass}
        title="Decision & Scenario Simulation Architecture"
        subtitle="How ArthAI lets you test major financial decisions—like purchasing a vehicle, switching careers, or prepaying debt—before committing capital."
        takeaway="Scenario simulation answers: 'What would your cash flow and DTI look like if these parameters changed?' It is a deterministic comparison tool, not a market crystal ball."
      />

      {/* Pipeline Flow */}
      <FlowDiagram
        title="How a Scenario is Evaluated"
        subtitle="The step-by-step comparative workflow executed by SimulationEngine:"
        steps={SIMULATION_FLOW_STEPS}
      />

      {/* Core Simulation Mathematics */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Core Mathematical Mechanics
        </h2>

        {/* EMI Formula Card */}
        <FormulaCard
          title="Standard Loan EMI Amortization Formula"
          formulaDisplay="EMI = [ P × r × (1 + r)^n ] / [ (1 + r)^n - 1 ]"
          description="Used by the NEW_LIABILITY scenario to compute exact monthly debt servicing for vehicle loans, mortgages, and personal borrowings."
          sourceFunction="SimulationEngine.simulate_scenario('NEW_LIABILITY', ...)"
          parameters={[
            {
              symbol: "P",
              name: "Principal Borrowing Amount",
              description: "Total loan principal to be borrowed in Indian Rupees.",
            },
            {
              symbol: "r",
              name: "Monthly Interest Rate",
              description: "Annual interest percentage divided by 12 and 100: (Annual Rate / 12) / 100.",
            },
            {
              symbol: "n",
              name: "Total Payment Months",
              description: "Loan tenure in years multiplied by 12: Tenure (Years) × 12.",
            },
          ]}
          example={{
            inputs: {
              "Principal (P)": "₹15,00,000",
              "Interest Rate": "8.50% p.a.",
              "Tenure (n)": "5 years (60 months)",
            },
            result: "₹30,772 / month",
            explanation: "Applying monthly rate r = 0.007083 over 60 months yields an exact monthly EMI of ₹30,772.",
          }}
        />

        {/* Delta Formulas Card */}
        <FormulaCard
          title="Comparative Delta Metrics"
          formulaDisplay="Delta = Projected Scenario Metric - Baseline Metric"
          description="Evaluates the precise marginal impact of the simulated decision on your household stability indicators."
          sourceFunction="SimulationEngine.compare_options(option_a, option_b)"
          parameters={[
            {
              symbol: "Δ Monthly Surplus",
              name: "Cash Flow Delta",
              description: "Projected Surplus - Baseline Surplus. Shows how much free cash flow is consumed.",
            },
            {
              symbol: "Δ DTI Ratio",
              name: "Debt Obligation Shift",
              description: "Projected DTI (%) - Baseline DTI (%). Highlights whether borrowing exceeds safe limits.",
            },
            {
              symbol: "Δ Emergency Runway",
              name: "Liquidity Impact",
              description: "Shows how increased monthly obligations compress the coverage duration of cash reserves.",
            },
          ]}
          example={{
            inputs: {
              "Baseline Surplus": "₹45,000/mo",
              "New Car EMI": "₹30,772/mo",
              "Projected Surplus": "₹14,228/mo",
            },
            result: "-₹30,772/mo surplus, DTI increases by +25.6%",
            explanation: "The simulation flags that while the loan is affordable, it leaves only ₹14,228/mo in monthly buffer.",
          }}
        />
      </div>

      {/* Critical Section: Simulation is Not Prediction */}
      <div className="p-7 rounded-3xl bg-emerald-950 text-white shadow-lg space-y-3 border border-emerald-900/60">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded">
            Foundational Distinction
          </span>
          <h3 className="font-display text-lg font-bold text-white">
            Scenario Simulation ≠ Market Prediction
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
          ArthAI scenario simulation is a <strong>deterministic sensitivity model</strong>. It calculates the exact mathematical consequences of explicit assumptions (e.g. <em>"If you take a ₹15L loan at 8.5%"</em>). It does <strong>not</strong> attempt to forecast stock market fluctuations, macroeconomic GDP shifts, or arbitrary speculative return curves.
        </p>
      </div>

      {/* Supported Scenario Types */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-slate-900">
          Supported Scenario Variations in ArthAI
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-800">1. NEW_LIABILITY</h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Models new car loans, home mortgages, or personal credit lines. Adds amortized EMI to monthly outflows and tracks asset equity additions.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-800">2. INCOME_CHANGE</h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Models percentage raises, bonus additions, or career transitions with temporary income reductions.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-800">3. EXPENSE_CHANGE</h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Simulates lifestyle adjustments, child schooling costs, or relocation expenses on household savings rates.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-800">4. INVESTMENT_CONTRIBUTION</h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Tests increasing monthly SIPs or recurring deposits to evaluate impact on liquid monthly surplus.
            </p>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <AssumptionCard
        assumptions={[
          {
            title: "Fixed Interest Rate Amortization",
            rationale: "Loan calculations use standard fixed monthly compounding formulas. Floating rate benchmark shifts are not speculative.",
          },
          {
            title: "Strict Database Immutability",
            rationale: "Simulations execute on transient Python dictionary copies. Your verified ledger records remain 100% untouched.",
          },
          {
            title: "Immediate Cash Flow Propagation",
            rationale: "EMI and income adjustments take effect immediately in the simulated month to demonstrate maximum cash flow impact.",
          },
          {
            title: "Multi-Option Comparison (A vs. B)",
            rationale: "The engine supports side-by-side comparison of two independent scenario options against the common baseline.",
          },
        ]}
      />

      {/* Boundaries */}
      <BoundaryCard
        boundaries={[
          {
            limitation: "Does NOT forecast variable market returns",
            explanation: "Simulations do not guess future equity market CAGR or commodity price swings.",
          },
          {
            limitation: "Does NOT guarantee loan approval terms",
            explanation: "Bank lending rates and processing fees in simulations are user-provided assumptions.",
          },
          {
            limitation: "Does NOT replace legal or tax advice",
            explanation: "Simulated tax deductions under regime shifts are reference estimates based on static guidelines.",
          },
          {
            limitation: "Does NOT auto-execute financial transactions",
            explanation: "ArthAI is an advisory operating system; it cannot initiate loan applications or bank transfers.",
          },
        ]}
      />

      {/* Source of Truth */}
      <SourceOfTruthCard
        files={[
          {
            filePath: "backend/app/engine/simulation_engine.py",
            role: "Contains SimulationEngine.simulate_scenario() and compare_options() with EMI amortization math.",
          },
          {
            filePath: "backend/app/engine/rules_engine.py",
            role: "Recomputes projected DTI, savings rates, and runway on temporary scenario context.",
          },
          {
            filePath: "frontend/src/components/plan/SimulatorTab.tsx",
            role: "Interactive UI panel for inputting scenario parameters and viewing side-by-side deltas.",
          },
        ]}
      />

      {/* Try in Product CTA */}
      <TryInArthAICta
        title="Test a Scenario in Decision Center"
        description="Compare new loan EMIs, income changes, or major expenses side-by-side against your actual household cash flows."
        buttonLabel="Open Decision Center"
        targetHref="/dashboard?tab=plan&subTab=decision_center"
      />
    </LearnPageShell>
  );
}
