import React from "react";
import { Brain, Cpu, FileText, Database, ShieldAlert, CheckCircle2, ArrowRight, Lock, Eye } from "lucide-react";
import { LearnPageShell } from "@/components/learn/LearnPageShell";
import { LearnHero } from "@/components/learn/LearnHero";
import { FlowDiagram, FlowStep } from "@/components/learn/FlowDiagram";
import { AssumptionCard } from "@/components/learn/AssumptionCard";
import { BoundaryCard } from "@/components/learn/BoundaryCard";
import { SourceOfTruthCard } from "@/components/learn/SourceOfTruthCard";
import { TryInArthAICta } from "@/components/learn/TryInArthAICta";

export const metadata = {
  title: "AI CFO Reasoning Architecture — ArthAI Learn",
  description: "Examine how ArthAI's AI Financial Advisor grounds LLM reasoning in deterministic balance sheet ledgers, document evidence, and static tax rules.",
};

const CFO_PIPELINE_STEPS: FlowStep[] = [
  {
    number: "01",
    title: "Intent Classification",
    badge: "14 Financial Domains",
    description: "Matches user queries across 14 financial domains (Tax, Loans, Goals, Cash Flow, Insurance, Subscriptions) using keyword & heuristic matching.",
    icon: Brain,
    subDetails: ["Multi-intent detection", "Domain specialist routing"],
  },
  {
    number: "02",
    title: "Deterministic Context Assembly",
    badge: "Structured Ledger Extraction",
    description: "Gathers verified profile records, incomes, expenses, assets, debts, and computes DTI, runway, and surplus via BusinessRuleEngine.",
    icon: Database,
    subDetails: ["Pure Python math", "Zero LLM calculation"],
  },
  {
    number: "03",
    title: "Evidence & Knowledge Injection",
    badge: "Static Rules & Documents",
    description: "Injects verified PDF statement facts and static Indian tax guidelines (Old vs. New regime slabs, 80C limits, 10x term insurance).",
    icon: FileText,
    subDetails: ["Document chunk citations", "Indian benchmark rules"],
  },
  {
    number: "04",
    title: "Missing-Data Detection",
    badge: "Anti-Hallucination Guardrail",
    description: "Detects unpopulated profile fields or missing cash flow numbers and explicitly flags them instead of generating placeholder estimates.",
    icon: ShieldAlert,
    subDetails: ["Explicit unknown state", "Clarifying prompts"],
  },
  {
    number: "05",
    title: "LLM Synthesis & Explanations",
    badge: "Constrained Prompting",
    description: "The LLM synthesizes structured trade-offs, evaluates opportunity costs, and recommends clear steps under strict system prompt constraints.",
    icon: Cpu,
    subDetails: ["Strict Markdown format", "No calculation authority"],
  },
  {
    number: "06",
    title: "Read-Only Output Delivery",
    badge: "Security Boundary",
    description: "Advice streams to the user interface. The AI CFO cannot directly mutate database records or execute financial transactions.",
    icon: Lock,
    subDetails: ["Zero write access", "Decision support only"],
  },
];

export default function AiFinancialAdvisorLearnPage() {
  return (
    <LearnPageShell
      topicTitle="AI Financial Advisor"
      category="Grounded AI Reasoning"
      relatedTopics={[
        {
          title: "Evidence & Document Intelligence",
          description: "See how parsed PDF statements provide verified facts to the AI CFO.",
          href: "/learn/evidence-intelligence",
        },
        {
          title: "Financial Pulse Architecture",
          description: "Explore the deterministic metrics that feed into CFO prompt contexts.",
          href: "/learn/financial-pulse",
        },
      ]}
    >
      {/* Hero Header */}
      <LearnHero
        badge="Grounded Reasoning Engine"
        badgeIcon={Brain}
        title="AI CFO Architecture: Why It Is Not Just a Chatbot"
        subtitle="How ArthAI prevents LLM hallucinations by anchoring every advisory response in deterministic ledger calculations, document evidence, and Indian tax benchmarks."
        takeaway="The LLM does not calculate your numbers. Backend deterministic engines compute your metrics; the LLM only synthesizes, explains trade-offs, and structures actionable guidance."
      />

      {/* 6-Step Pipeline Visualizer */}
      <FlowDiagram
        title="The 6-Stage Reasoning Pipeline"
        subtitle="How a user question travels from input to grounded response:"
        steps={CFO_PIPELINE_STEPS}
      />

      {/* Deep-Dive Architectural Breakdown */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Architectural Grounding Layers
        </h2>

        {/* Layer 1 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#0B5D4B]">
            <Database className="h-5 w-5" />
            <h3 className="font-bold text-base text-slate-900">1. Strict Separation of Math and Language</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Large Language Models frequently make basic arithmetic errors when multiplying compounding curves or dividing loan balances. In ArthAI, all mathematical calculations (DTI, runway, EMI amortization, nominal goal funding) are computed by deterministic Python code before the prompt is generated. The LLM receives final calculated numbers in its JSON context payload.
          </p>
        </div>

        {/* Layer 2 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#0B5D4B]">
            <FileText className="h-5 w-5" />
            <h3 className="font-bold text-base text-slate-900">2. Document Provenance Anchoring</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            When a user asks questions like <em>"Should I prepay my home loan?"</em>, the context builder searches the user's Evidence Vault for reviewed facts (e.g. outstanding balance: ₹42,00,000, interest rate: 8.5%, EMI: ₹38,000). The model cites these specific parameters rather than asking the user to re-type their statement details.
          </p>
        </div>

        {/* Layer 3 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#0B5D4B]">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="font-bold text-base text-slate-900">3. Missing Data Transparency</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            If a calculation requires knowing your emergency fund or health insurance coverage, and those entries are missing in your profile, the system prompt explicitly commands the model to highlight the data gap rather than assuming placeholder Indian averages.
          </p>
        </div>
      </div>

      {/* Critical Section: Grounded Does Not Mean Infallible */}
      <div className="p-7 rounded-3xl bg-emerald-950 text-white shadow-lg space-y-3 border border-emerald-900/60">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded">
            Transparency Note
          </span>
          <h3 className="font-display text-lg font-bold text-white">
            Grounded Does Not Mean Infallible
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
          While ArthAI grounds every prompt in verified ledgers and deterministic metrics, natural language synthesis is inherently probabilistic. Recommendations generated by the AI CFO should be treated as <strong>structured decision support</strong> to clarify trade-offs, not formal certified financial advice from a registered investment advisor.
        </p>
      </div>

      {/* Assumptions */}
      <AssumptionCard
        assumptions={[
          {
            title: "Read-Only Execution Boundary",
            rationale: "The AI CFO has zero write permissions to your database. It cannot execute transactions, alter budgets, or delete records.",
          },
          {
            title: "Transient Prompt Construction",
            rationale: "Prompt payloads are constructed ephemerally during the API call and are query-isolated by PostgreSQL Row-Level Security.",
          },
          {
            title: "Static Indian Financial Guidelines",
            rationale: "Tax regime rules, standard deductions, and insurance benchmarks are drawn from static, human-curated guideline files.",
          },
          {
            title: "Deterministic Fallbacks",
            rationale: "If API keys are missing or offline, the system returns deterministic structured rule summaries rather than crashing.",
          },
        ]}
      />

      {/* Boundaries */}
      <BoundaryCard
        boundaries={[
          {
            limitation: "Does NOT execute stock trades or bank transfers",
            explanation: "ArthAI is an analytical intelligence platform, not a broking terminal or payment gateway.",
          },
          {
            limitation: "Does NOT provide regulated investment advisory",
            explanation: "The AI CFO provides mathematical decision support; it is not a SEBI-registered investment advisor.",
          },
          {
            limitation: "Does NOT auto-file income tax returns (ITR)",
            explanation: "Tax regime analysis highlights structural trade-offs; formal tax filing requires standard compliance channels.",
          },
          {
            limitation: "Does NOT guess missing document facts",
            explanation: "Unextracted fields in uploaded statements must be added or reviewed manually by the user.",
          },
        ]}
      />

      {/* Source of Truth */}
      <SourceOfTruthCard
        files={[
          {
            filePath: "backend/app/engine/openai_service.py",
            role: "Assembles context_payload and streams strictly constrained system prompts to the LLM.",
          },
          {
            filePath: "backend/app/engine/intent_classifier.py",
            role: "Categorizes user queries into 14 financial domains using keyword matching.",
          },
          {
            filePath: "backend/app/agents/orchestrator.py",
            role: "Coordinates specialist agents (Tax, Debt, Cash Flow, Budget) and compiles insights.",
          },
          {
            filePath: "backend/app/knowledge/tax_rules.json",
            role: "Static reference guidelines for Indian tax regimes (Old vs. New) and standard deductions.",
          },
        ]}
      />

      {/* Try in Product CTA */}
      <TryInArthAICta
        title="Consult Your AI CFO"
        description="Ask strategic financial questions about home loans, tax regimes, or major purchases and see how it grounds advice in your balance sheet."
        buttonLabel="Open AI CFO"
        targetHref="/dashboard?tab=cfo"
      />
    </LearnPageShell>
  );
}
