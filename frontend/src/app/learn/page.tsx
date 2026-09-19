import React from "react";
import Link from "next/link";
import {
  Layers,
  Activity,
  Compass,
  Target,
  Brain,
  FolderOpen,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Learn & Architecture — ArthAI Financial OS",
  description: "Understand the deterministic algorithms, grounded AI architecture, and security layers powering ArthAI.",
};

const LEARN_TOPICS = [
  {
    category: "Financial Intelligence",
    topics: [
      {
        slug: "financial-pulse",
        title: "Financial Pulse & Health Score",
        badge: "Deterministic Metrics",
        icon: Activity,
        description:
          "How ArthAI computes Net Worth, DTI, Savings Rate, Emergency Runway, and the 6-component Financial Health Score without LLM hallucination.",
        readMore: "View formulas & scoring weights",
      },
    ],
  },
  {
    category: "Planning & Simulations",
    topics: [
      {
        slug: "decision-simulation",
        title: "Decision & Scenario Simulation",
        badge: "Comparative Modeling",
        icon: Compass,
        description:
          "Explore how scenario parameterization simulates income changes, expense spikes, and new loan EMIs against baseline household cash flows.",
        readMore: "View scenario mechanics & EMI formulas",
      },
      {
        slug: "goal-planning",
        title: "Goal Feasibility & Timeline Analysis",
        badge: "Target Feasibility",
        icon: Target,
        description:
          "Understand nominal goal feasibility calculations, required monthly contribution formulas, and why ArthAI uses a 0% speculative CAGR assumption.",
        readMore: "View feasibility math & safety limits",
      },
    ],
  },
  {
    category: "Grounded AI Reasoning",
    topics: [
      {
        slug: "ai-financial-advisor",
        title: "AI CFO Reasoning Pipeline",
        badge: "8-Stage Orchestration",
        icon: Brain,
        description:
          "The 8-stage architecture that grounds conversational advice in deterministic ledgers, evidence provenance, and static Indian tax knowledge.",
        readMore: "Explore the reasoning flow & read-only guardrails",
      },
    ],
  },
  {
    category: "Evidence & Security",
    topics: [
      {
        slug: "evidence-intelligence",
        title: "Evidence Ingestion & Review",
        badge: "Document Provenance",
        icon: FolderOpen,
        description:
          "How statement PDFs are parsed, staged as candidate facts, reviewed by humans, and reconciled before entering canonical financial state.",
        readMore: "Explore candidate-to-canonical pipeline",
      },
      {
        slug: "security-architecture",
        title: "Security & Row-Level Isolation",
        badge: "Tenant Isolation",
        icon: ShieldCheck,
        description:
          "Examine PostgreSQL Row-Level Security (RLS), Supabase session tokens, and strict tenant boundaries that isolate every household's records.",
        readMore: "Explore security controls & verified boundaries",
      },
    ],
  },
];

export default function LearnIndexPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative overflow-x-hidden flex flex-col justify-between">
      {/* Background Meshes */}
      <div className="absolute top-0 left-1/4 h-[600px] w-[600px] mesh-glow-1 pointer-events-none rounded-full opacity-60" />
      <div className="absolute top-[400px] right-1/4 h-[700px] w-[700px] mesh-glow-2 pointer-events-none rounded-full opacity-50" />

      {/* Navigation */}
      <nav className="z-30 border-b border-slate-200/60 px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition">
            <div className="h-9 w-9 rounded-xl bg-[#0B5D4B] flex items-center justify-center shadow-md">
              <Layers className="text-white h-4.5 w-4.5" />
            </div>
            <span className="font-display text-xl font-black tracking-tight text-[#0B5D4B]">
              Arth<span className="text-[#18B27A] font-extrabold">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-full transition uppercase tracking-wider"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs font-bold px-5 py-2 rounded-full transition shadow-md uppercase tracking-wider"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-14 flex-1 relative z-10 space-y-16 w-full">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100/60 px-4 py-2 rounded-full text-xs font-extrabold text-[#0B5D4B] shadow-xs">
            <BookOpen className="h-3.5 w-3.5 text-[#18B27A]" />
            Explainable Financial OS Architecture
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-black text-[#0F172A] tracking-tight leading-tight">
            How ArthAI Actually Works
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Transparent, verifiable explanations of the deterministic calculation engines, scenario algorithms, grounded AI CFO pipeline, and security boundaries active in the codebase today.
          </p>
        </div>

        {/* Categorized Topic Directory */}
        <div className="space-y-12">
          {LEARN_TOPICS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {section.category}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {section.topics.map((topic, tIdx) => {
                  const Icon = topic.icon;
                  return (
                    <Link
                      key={tIdx}
                      href={`/learn/${topic.slug}`}
                      className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-[#18B27A]/60 hover:shadow-lg transition-all flex flex-col justify-between group space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
                            {topic.badge}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#0B5D4B] transition-colors">
                            {topic.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-1">
                            {topic.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0B5D4B]">
                        <span>{topic.readMore}</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Global Transparency Callout */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 text-center sm:text-left">
          <h3 className="font-display text-xl font-bold text-slate-900">
            Truth in Engineering Principle
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-3xl">
            ArthAI separates <strong>deterministic mathematical calculations</strong> from <strong>LLM natural language synthesis</strong>. Financial indicators (DTI, runway, surplus, goal feasibility) are calculated in pure Python logic with 100% reproducible tests. The AI CFO reasons strictly over these verified numbers without inventing speculative returns.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-8 text-center text-xs text-slate-400 font-bold bg-white/50 backdrop-blur-sm relative z-10">
        © {new Date().getFullYear()} ArthAI Financial Technologies Private Limited. All rights reserved.
      </footer>
    </div>
  );
}
