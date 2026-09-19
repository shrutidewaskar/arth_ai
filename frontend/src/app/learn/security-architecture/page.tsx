import React from "react";
import { ShieldCheck, Lock, Database, UserCheck, Eye, Terminal, CheckCircle2, AlertTriangle, Key } from "lucide-react";
import { LearnPageShell } from "@/components/learn/LearnPageShell";
import { LearnHero } from "@/components/learn/LearnHero";
import { FlowDiagram, FlowStep } from "@/components/learn/FlowDiagram";
import { AssumptionCard } from "@/components/learn/AssumptionCard";
import { BoundaryCard } from "@/components/learn/BoundaryCard";
import { SourceOfTruthCard } from "@/components/learn/SourceOfTruthCard";
import { TryInArthAICta } from "@/components/learn/TryInArthAICta";

export const metadata = {
  title: "Security & Row-Level Isolation Architecture — ArthAI Learn",
  description: "Examine ArthAI's multi-layered security model: Supabase session authentication, PostgreSQL Row-Level Security (RLS), and read-only AI boundaries.",
};

const SECURITY_PIPELINE_STEPS: FlowStep[] = [
  {
    number: "01",
    title: "Cryptographic Authentication",
    badge: "Supabase Auth / PKCE",
    description: "User identity is authenticated via Supabase Auth with PKCE verification and cryptographically signed JWT session tokens.",
    icon: Key,
    subDetails: ["PKCE authorization flow", "Secure session tokens"],
  },
  {
    number: "02",
    title: "Tenant Context Propagation",
    badge: "FastAPI Dependency",
    description: "Every incoming backend API request is validated by get_current_user dependency, extracting and binding the verified user_id.",
    icon: Lock,
    subDetails: ["Token validation", "Request-scoped user identity"],
  },
  {
    number: "03",
    title: "PostgreSQL Row-Level Security",
    badge: "Database Policy Enforcement",
    description: "Database policies (auth.uid() = user_id) constrain every query at the engine level. No user can access or view another tenant's records.",
    icon: Database,
    subDetails: ["Kernel-level isolation", "Tenant data separation"],
  },
];

export default function SecurityArchitectureLearnPage() {
  return (
    <LearnPageShell
      topicTitle="Security Architecture"
      category="Evidence & Security"
      relatedTopics={[
        {
          title: "AI CFO Reasoning Pipeline",
          description: "See how the read-only AI boundary prevents unauthorized database changes.",
          href: "/learn/ai-financial-advisor",
        },
        {
          title: "Evidence & Document Intelligence",
          description: "Examine how document chunks and candidate entities maintain tenant isolation.",
          href: "/learn/evidence-intelligence",
        },
      ]}
    >
      {/* Hero Header */}
      <LearnHero
        badge="Technical Security Model"
        badgeIcon={ShieldCheck}
        title="Security & Data Isolation Architecture"
        subtitle="How ArthAI enforces database-level tenant isolation, session-scoped API authentication, and read-only advisory boundaries."
        takeaway="Security in ArthAI is built on PostgreSQL Row-Level Security and strict tenant scoping. Your financial records are isolated at the database layer, not just by application code."
      />

      {/* 3-Step Pipeline Visualizer */}
      <FlowDiagram
        title="The Authentication & Isolation Flow"
        subtitle="How requests are authenticated and isolated from client to database:"
        steps={SECURITY_PIPELINE_STEPS}
      />

      {/* Core Architectural Controls */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Verified Technical Security Controls
        </h2>

        {/* Control 1 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#0B5D4B]">
            <Database className="h-5 w-5" />
            <h3 className="font-bold text-base text-slate-900">1. PostgreSQL Row-Level Security (RLS)</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            All core tables (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">profiles</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">income_sources</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">expense_categories</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">assets</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">liabilities</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">goals</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">documents</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">candidate_financial_entities</code>) enforce PostgreSQL RLS policies ensuring that queries automatically filter by <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">auth.uid() = user_id</code>.
          </p>
        </div>

        {/* Control 2 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#0B5D4B]">
            <Lock className="h-5 w-5" />
            <h3 className="font-bold text-base text-slate-900">2. Request-Scoped Tenant Propagation</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Backend API endpoints in FastAPI enforce the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">Depends(get_current_user)</code> dependency. The user identity is extracted from validated JWT bearer headers, ensuring endpoints cannot access cross-tenant data even if a client sends arbitrary user IDs in query parameters.
          </p>
        </div>

        {/* Control 3 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#0B5D4B]">
            <Eye className="h-5 w-5" />
            <h3 className="font-bold text-base text-slate-900">3. Read-Only AI Advisory Boundary</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            The AI CFO reasoning service receives a structured JSON context payload. It operates entirely as an advisory layer over verified state. The LLM has zero database write access and cannot execute SQL queries or alter records without explicit user confirmation in the UI.
          </p>
        </div>
      </div>

      {/* Explicit What We Do NOT Claim Section */}
      <div className="p-7 rounded-3xl bg-slate-900 text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded">
            Engineering Transparency
          </span>
          <h3 className="font-display text-lg font-bold text-white">
            Explicit Security Boundary Commitments
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
          ArthAI adheres to a strict policy of architectural honesty. We do not claim external certifications or capabilities that are not actively implemented:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-300 font-medium">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
            <strong className="text-white block">✕ No SOC 2 / ISO Certifications</strong>
            <p className="text-[11px] text-slate-400">ArthAI does not currently hold formal SOC 2 Type II or ISO 27001 certifications.</p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
            <strong className="text-white block">✕ No Application-Level AES-256 Claim</strong>
            <p className="text-[11px] text-slate-400">We rely on standard cloud storage encryption and HTTPS/TLS transport; we do not claim bespoke AES-256 application-level payload encryption.</p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
            <strong className="text-white block">✕ No Banking / Account Aggregator License</strong>
            <p className="text-[11px] text-slate-400">ArthAI is not a licensed banking entity or RBI-regulated NBFC Account Aggregator.</p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
            <strong className="text-white block">✕ No Biometric KYC</strong>
            <p className="text-[11px] text-slate-400">Identity is managed via email/password authentication tokens; we do not capture biometric or Aadhaar e-KYC data.</p>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <AssumptionCard
        assumptions={[
          {
            title: "Cryptographic JWT Session Tokens",
            rationale: "Authentication tokens are verified using standard cryptographic public key signatures on every API request.",
          },
          {
            title: "Database-Enforced Tenant Isolation",
            rationale: "Row-Level Security runs inside the PostgreSQL engine, guaranteeing that multi-tenant isolation does not depend solely on application code.",
          },
          {
            title: "Document Hash & Provenance Linking",
            rationale: "Parsed PDF chunks and candidate entities retain immutable document IDs linking directly to the source file.",
          },
          {
            title: "Session Expiry & Token Rotation",
            rationale: "Supabase Auth automatically manages refresh token rotation and short-lived session lifetimes.",
          },
        ]}
      />

      {/* Boundaries */}
      <BoundaryCard
        boundaries={[
          {
            limitation: "Does NOT store plain-text passwords",
            explanation: "All user credentials are cryptographically hashed and managed via Supabase Auth.",
          },
          {
            limitation: "Does NOT expose cross-tenant data in AI prompts",
            explanation: "Context payloads injected into LLM queries contain only the authenticated user's records.",
          },
          {
            limitation: "Does NOT monetize user data",
            explanation: "Household financial profiles are never sold, rented, or distributed to advertising networks.",
          },
          {
            limitation: "Does NOT bypass RLS in standard endpoints",
            explanation: "All standard application endpoints query the database under the authenticated tenant context.",
          },
        ]}
      />

      {/* Source of Truth */}
      <SourceOfTruthCard
        files={[
          {
            filePath: "backend/app/dependencies.py",
            role: "Validates Supabase JWT session tokens and injects current_user context.",
          },
          {
            filePath: "database/migrations/001_initial_schema.sql",
            role: "Enables PostgreSQL Row-Level Security on core balance sheet and profile tables.",
          },
          {
            filePath: "database/migrations/004_candidate_financial_entities.sql",
            role: "Applies RLS policies to document staging and candidate entity records.",
          },
        ]}
      />

      {/* Try in Product CTA */}
      <TryInArthAICta
        title="Manage Your Profile & Security Settings"
        description="Review your active session, update notification preferences, and manage account security in your Profile workspace."
        buttonLabel="Open Profile & Security"
        targetHref="/dashboard?tab=profile"
      />
    </LearnPageShell>
  );
}
