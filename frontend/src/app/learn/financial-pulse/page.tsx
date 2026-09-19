import React from "react";
import { Activity, ShieldCheck, Cpu, ArrowRight, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { LearnPageShell } from "@/components/learn/LearnPageShell";
import { LearnHero } from "@/components/learn/LearnHero";
import { FlowDiagram, FlowStep } from "@/components/learn/FlowDiagram";
import { FormulaCard } from "@/components/learn/FormulaCard";
import { AssumptionCard } from "@/components/learn/AssumptionCard";
import { BoundaryCard } from "@/components/learn/BoundaryCard";
import { SourceOfTruthCard } from "@/components/learn/SourceOfTruthCard";
import { TryInArthAICta } from "@/components/learn/TryInArthAICta";

export const metadata = {
  title: "How Financial Pulse is Calculated — ArthAI Learn",
  description: "Examine the deterministic formulas for Net Worth, DTI, Emergency Runway, and the 6-component Financial Health Score in ArthAI.",
};

const PULSE_FLOW_STEPS: FlowStep[] = [
  {
    number: "01",
    title: "Canonical Financial State",
    badge: "User Input & Evidence",
    description: "Income sources, expense categories, bank balances, debts/EMIs, and verified document extracts are assembled into structured context.",
    icon: TrendingUp,
    subDetails: ["User-isolated database tables", "Zero synthetic data injection"],
  },
  {
    number: "02",
    title: "Deterministic Calculation",
    badge: "Pure Python Algorithms",
    description: "Formulas for Net Worth, DTI, Emergency Runway, and Component Ratios run in backend domain engines without LLM involvement.",
    icon: Cpu,
    subDetails: ["Reproducible math", "Exact decimal precision"],
  },
  {
    number: "03",
    title: "Prioritized Pulse Directives",
    badge: "Action Planning",
    description: "The Financial Diagnosis Engine compares metrics against Indian household benchmarks to generate ranked attention items.",
    icon: AlertCircle,
    subDetails: ["Target runway: 6.0 months", "Safe DTI ceiling: 35.0%"],
  },
];

export default function FinancialPulseLearnPage() {
  return (
    <LearnPageShell
      topicTitle="Financial Pulse"
      category="Financial Intelligence"
      relatedTopics={[
        {
          title: "Decision & Scenario Simulation",
          description: "See how parameter variations impact your DTI and monthly cash flows.",
          href: "/learn/decision-simulation",
        },
        {
          title: "Goal Feasibility Analysis",
          description: "Understand nominal goal funding timelines and required contributions.",
          href: "/learn/goal-planning",
        },
      ]}
    >
      {/* Hero Header */}
      <LearnHero
        badge="Deterministic Core Engine"
        badgeIcon={Activity}
        title="Financial Pulse & Health Score Architecture"
        subtitle="How ArthAI transforms your verified household assets, liabilities, and monthly cash flows into grounded financial health indicators."
        takeaway="Every metric in your Financial Pulse is calculated deterministically in backend Python engines. The AI CFO never guesses, rounds, or hallucinates your financial ratios."
      />

      {/* Pipeline Flow */}
      <FlowDiagram
        title="From Raw Entries to Financial Health"
        subtitle="The three-stage pipeline connecting your balance sheet to actionable health indicators:"
        steps={PULSE_FLOW_STEPS}
      />

      {/* Formula 1: Net Worth */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Core Mathematical Formulas
        </h2>

        <FormulaCard
          title="1. Net Worth Formula"
          formulaDisplay="Net Worth = Total Assets - Total Liabilities"
          description="Calculates the absolute balance sheet equity of the household by subtracting all outstanding debt obligations from current asset valuations."
          sourceFunction="calculate_net_worth(assets_val, liabilities_val)"
          parameters={[
            {
              symbol: "Total Assets",
              name: "Current Asset Sum",
              description: "Sum of liquid bank accounts, fixed deposits, gold holdings, mutual funds, EPF, and properties.",
            },
            {
              symbol: "Total Liabilities",
              name: "Outstanding Debt Sum",
              description: "Sum of remaining principal balances across home loans, vehicle loans, personal loans, and credit lines.",
            },
          ]}
          example={{
            inputs: { "Total Assets": "₹45,00,000", "Total Liabilities": "₹18,50,000" },
            result: "₹26,50,000",
            explanation: "Subtracting ₹18.5L in liabilities from ₹45L in assets yields a net worth of ₹26.5 Lakhs.",
          }}
        />

        {/* Formula 2: Debt-to-Income (DTI) */}
        <FormulaCard
          title="2. Debt-to-Income (DTI) Ratio"
          formulaDisplay="DTI (%) = (Total Monthly EMIs / Monthly Income) × 100"
          description="Measures what fraction of gross monthly income is committed to mandatory debt servicing. If monthly income is ₹0, the ratio returns 0.0% to avoid division-by-zero."
          sourceFunction="calculate_debt_to_income_ratio(monthly_emis, monthly_income)"
          parameters={[
            {
              symbol: "Total EMIs",
              name: "Monthly Debt Servicing",
              description: "Total monthly installment obligations across all active household loans.",
            },
            {
              symbol: "Monthly Income",
              name: "Gross Monthly Inflows",
              description: "Aggregated monthly earnings across salaries, business revenue, and rental income.",
            },
          ]}
          example={{
            inputs: { "Total EMIs": "₹38,000/mo", "Monthly Income": "₹1,20,000/mo" },
            result: "31.7%",
            explanation: "₹38,000 divided by ₹1,20,000 produces a 31.7% DTI ratio, which sits safely below the 35% safe household ceiling.",
          }}
        />

        {/* Formula 3: Emergency Runway */}
        <FormulaCard
          title="3. Emergency Fund Runway"
          formulaDisplay="Emergency Runway (Months) = Dedicated Emergency Fund / Monthly Expenses"
          description="Evaluates how many months the household can sustain essential living expenses if all income ceased immediately. Only dedicated liquid emergency funds are counted."
          sourceFunction="calculate_emergency_fund_coverage(emergency_fund, monthly_expenses)"
          parameters={[
            {
              symbol: "Emergency Fund",
              name: "Liquid Contingency Reserves",
              description: "Liquid savings bank balances or auto-sweep fixed deposits designated for emergencies.",
            },
            {
              symbol: "Monthly Expenses",
              name: "Essential Monthly Burn",
              description: "Baseline monthly household outflows including groceries, utilities, rent, and loan EMIs.",
            },
          ]}
          example={{
            inputs: { "Emergency Fund": "₹3,60,000", "Monthly Expenses": "₹60,000/mo" },
            result: "6.0 months",
            explanation: "₹3.6 Lakhs in liquid reserves provides exactly 6.0 months of emergency runway, matching the benchmark target.",
          }}
        />

        {/* Formula 4: Financial Health Score */}
        <FormulaCard
          title="4. Financial Health Score (6-Component Weighted Model)"
          formulaDisplay="Health Score (10–100) = Savings (25%) + DTI (20%) + Runway (20%) + Investments (15%) + Insurance (10%) + Goals (10%)"
          description="A multi-dimensional scoring heuristic that evaluates household stability across six core financial domains. The aggregate score ranges from 10 (baseline floor) to 100."
          sourceFunction="calculate_financial_health_score(...)"
          parameters={[
            {
              symbol: "Savings (25 pts)",
              name: "Savings Ratio Component",
              description: "min((Savings Ratio / 30.0) × 25.0, 25.0) — Target is a 30% savings rate.",
            },
            {
              symbol: "Debt (20 pts)",
              name: "DTI Component",
              description: "max(20.0 - (DTI / 40.0) × 20.0, 0.0) — Penalizes DTI ratios above 40%.",
            },
            {
              symbol: "Runway (20 pts)",
              name: "Liquidity Component",
              description: "min((Emergency Runway / 6.0) × 20.0, 20.0) — Target is 6.0 months of runway.",
            },
            {
              symbol: "Investments (15 pts)",
              name: "Yield & Allocation",
              description: "min((Portfolio Yield Ratio / 100.0) × 15.0, 15.0).",
            },
            {
              symbol: "Insurance (10 pts)",
              name: "Coverage Ratio",
              description: "min((Current Coverage / Target 10x Income) × 10.0, 10.0).",
            },
            {
              symbol: "Goals (10 pts)",
              name: "Goal Progress Ratio",
              description: "min((Average Goal Completion Pct / 100.0) × 10.0, 10.0).",
            },
          ]}
          example={{
            inputs: {
              "Savings Rate": "30% (25 pts)",
              "DTI": "30% (5 pts)",
              "Runway": "4.5 mo (15 pts)",
              "Investments": "Benchmark (15 pts)",
              "Insurance": "10x Income (10 pts)",
              "Goals": "70% avg (7 pts)",
            },
            result: "77 / 100",
            explanation: "Summing component scores: 25 + 5 + 15 + 15 + 10 + 7 = 77/100, placing the household in the 'Good' stability tier.",
          }}
        />
      </div>

      {/* Assumptions */}
      <AssumptionCard
        assumptions={[
          {
            title: "Liquid-Only Emergency Reserves",
            rationale: "Illiquid assets (real estate, jewelry, physical gold) are never counted toward emergency runway because they cannot be liquidated instantly during emergencies.",
          },
          {
            title: "Zero-Income Safety Floor",
            rationale: "If income is unpopulated or zero, DTI and Savings Rate return 0.0% instead of throwing division-by-zero runtime exceptions.",
          },
          {
            title: "Conservative 10x Term Cover Benchmark",
            rationale: "Recommended life insurance coverage is benchmarked to 10× annual household income (120× monthly income).",
          },
          {
            title: "Deterministic Heuristic, Not Credit Bureau",
            rationale: "The Health Score is an internal decision-support heuristic designed to guide planning, not a regulated CIBIL/Experian credit score.",
          },
        ]}
      />

      {/* Boundaries */}
      <BoundaryCard
        boundaries={[
          {
            limitation: "Does NOT estimate credit scores",
            explanation: "ArthAI does not pull credit bureau files or predict creditworthiness.",
          },
          {
            limitation: "Does NOT assume market growth for runway",
            explanation: "Runway calculations rely strictly on current cash balances, assuming zero market return during emergency drawdowns.",
          },
          {
            limitation: "Does NOT invent data when inputs are missing",
            explanation: "If you have not added expenses or income, Financial Pulse states 'Insufficient Data' rather than displaying synthetic averages.",
          },
          {
            limitation: "Does NOT perform automated tax filing",
            explanation: "Tax considerations in pulse are advisory comparisons based on static Indian tax rules.",
          },
        ]}
      />

      {/* Source of Truth */}
      <SourceOfTruthCard
        files={[
          {
            filePath: "backend/app/utils/financial_formulas.py",
            role: "Contains pure mathematical calculation functions (Net Worth, DTI, Runway, Health Score).",
          },
          {
            filePath: "backend/app/engine/rules_engine.py",
            role: "Orchestrates profile aggregation and executes BusinessRuleEngine without LLM involvement.",
          },
          {
            filePath: "backend/app/engine/financial_diagnosis.py",
            role: "Evaluates strengths, risks, severity thresholds, and prioritized action recommendations.",
          },
        ]}
      />

      {/* Try in Product CTA */}
      <TryInArthAICta
        title="View Your Live Financial Pulse"
        description="Check your real-time Net Worth, DTI ratio, Emergency Runway, and Health Score breakdown in your authenticated workspace."
        buttonLabel="Open Financial Home"
        targetHref="/dashboard?tab=home"
      />
    </LearnPageShell>
  );
}
