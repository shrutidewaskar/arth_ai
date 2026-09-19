import React from "react";
import { FolderOpen, FileText, CheckCircle2, UserCheck, ShieldAlert, Cpu, Database, Eye, Layers } from "lucide-react";
import { LearnPageShell } from "@/components/learn/LearnPageShell";
import { LearnHero } from "@/components/learn/LearnHero";
import { FlowDiagram, FlowStep } from "@/components/learn/FlowDiagram";
import { AssumptionCard } from "@/components/learn/AssumptionCard";
import { BoundaryCard } from "@/components/learn/BoundaryCard";
import { SourceOfTruthCard } from "@/components/learn/SourceOfTruthCard";
import { TryInArthAICta } from "@/components/learn/TryInArthAICta";

export const metadata = {
  title: "Evidence & Document Intelligence Pipeline — ArthAI Learn",
  description: "Examine how ArthAI parses financial statements with pypdf, stages candidate entities, and enforces human-in-the-loop review before updating canonical state.",
};

const EVIDENCE_PIPELINE_STEPS: FlowStep[] = [
  {
    number: "01",
    title: "Page-by-Page PDF Parsing",
    badge: "Native Text Extraction",
    description: "PDF files are ingested page-by-page using pypdf, extracting native digital text streams while tracking explicit page number indices.",
    icon: FileText,
    subDetails: ["Page index tracking", "Native digital parsing"],
  },
  {
    number: "02",
    title: "Classification & Fact Extraction",
    badge: "Pattern Matching",
    description: "Classifies document type (Salary Slip, Loan Schedule, Bank Statement, Tax Return) and extracts candidate numbers with confidence scores.",
    icon: Cpu,
    subDetails: ["7 document classes", "Confidence scoring"],
  },
  {
    number: "03",
    title: "Candidate Entity Staging",
    badge: "PENDING_REVIEW State",
    description: "Extracted entities are staged into the candidate_financial_entities table. They are completely isolated from your active balance sheet.",
    icon: Layers,
    subDetails: ["Candidate ≠ Canonical", "Transient holding area"],
  },
  {
    number: "04",
    title: "Human Review & Reconciliation",
    badge: "Human-in-the-Loop",
    description: "You review, edit, or reject candidate facts in the Evidence Review Queue. Conflicts with existing records can be merged or overwritten.",
    icon: UserCheck,
    subDetails: ["User verification", "Conflict resolution"],
  },
  {
    number: "05",
    title: "Canonical State & Provenance",
    badge: "Trusted Ledger Integration",
    description: "Approved facts become trusted canonical records in your Money workspace, retaining permanent audit links to the source document and page.",
    icon: Database,
    subDetails: ["Document audit trail", "Permanent page citations"],
  },
];

export default function EvidenceIntelligenceLearnPage() {
  return (
    <LearnPageShell
      topicTitle="Evidence Intelligence"
      category="Evidence & Security"
      relatedTopics={[
        {
          title: "AI CFO Reasoning Pipeline",
          description: "See how approved evidence facts provide grounding context for the advisor.",
          href: "/learn/ai-financial-advisor",
        },
        {
          title: "Security & Row-Level Isolation",
          description: "Examine how document chunks and candidate entities are isolated by PostgreSQL RLS.",
          href: "/learn/security-architecture",
        },
      ]}
    >
      {/* Hero Header */}
      <LearnHero
        badge="Human-in-the-Loop Ingestion"
        badgeIcon={FolderOpen}
        title="Evidence Intelligence: Candidate vs. Canonical State"
        subtitle="How ArthAI transforms raw bank statements, salary slips, and loan schedules into verified, auditable balance sheet records."
        takeaway="Candidate Evidence ≠ Canonical Financial State. Machine extraction is treated as a proposal. No extracted number ever touches your trusted financial ledger without explicit human review."
      />

      {/* 5-Step Pipeline Visualizer */}
      <FlowDiagram
        title="The Ingestion & Review Pipeline"
        subtitle="How an uploaded PDF becomes a verified balance sheet entry:"
        steps={EVIDENCE_PIPELINE_STEPS}
      />

      {/* Candidate vs Canonical State Explainer */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          The Two Tiers of Financial Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Candidate Card */}
          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-amber-950">1. Candidate Entity (Unverified)</h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                PENDING_REVIEW
              </span>
            </div>
            <p className="text-xs text-slate-750 font-medium leading-relaxed">
              <em>"ArthAI extracted this fact from your PDF with 85% confidence."</em>
            </p>
            <ul className="text-[11px] text-slate-650 space-y-1.5 font-medium pt-1">
              <li>• Staged in a separate holding table.</li>
              <li>• <strong>Does NOT</strong> participate in Financial Pulse or Net Worth.</li>
              <li>• Awaiting user verification in the Evidence Review Queue.</li>
            </ul>
          </div>

          {/* Canonical Card */}
          <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-emerald-950">2. Canonical State (Trusted)</h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                VERIFIED_RECORD
              </span>
            </div>
            <p className="text-xs text-slate-750 font-medium leading-relaxed">
              <em>"A reviewed and approved fact active in your financial operating system."</em>
            </p>
            <ul className="text-[11px] text-slate-650 space-y-1.5 font-medium pt-1">
              <li>• Participates directly in DTI, runway, and net worth math.</li>
              <li>• Used as context by the AI CFO.</li>
              <li>• Retains permanent provenance links to source PDF page.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Document Parsing Technology & Limitations */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="font-display text-lg font-bold text-slate-900">
          Native Text Extraction (pypdf) & True Limitations
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          ArthAI parses documents using native digital PDF stream reading (<code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">pypdf</code>). It extracts text directly from digitally generated statements provided by banks, employers, and insurers.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2 text-xs text-slate-700 font-medium">
          <strong className="text-slate-900 block">Current Technical Boundaries:</strong>
          <ul className="space-y-1.5 list-disc pl-4 text-slate-650 text-[11px]">
            <li><strong>No OCR Engine:</strong> Image-only scans and photocopies without digital text streams cannot be parsed natively.</li>
            <li><strong>Password-Protected Files:</strong> Encrypted statement PDFs must be decrypted before ingestion.</li>
            <li><strong>Handwritten Notes:</strong> Handwritten physical receipts are unsupported.</li>
          </ul>
        </div>
      </div>

      {/* Assumptions */}
      <AssumptionCard
        assumptions={[
          {
            title: "Zero Automated Commit Without Review",
            rationale: "Even high-confidence extractions require human confirmation before becoming canonical ledger facts.",
          },
          {
            title: "Exact Page-Level Provenance",
            rationale: "Every extracted fact stores the originating document ID and source page number for complete auditability.",
          },
          {
            title: "Multi-Document Classification",
            rationale: "Documents are classified into 7 categories: Salary Slip, Bank Statement, Tax Document, Insurance Policy, Loan Schedule, Investment Statement, and Other.",
          },
          {
            title: "Isolated Vector Embeddings",
            rationale: "Document chunks generate embeddings for AI CFO retrieval, isolated strictly under PostgreSQL Row-Level Security.",
          },
        ]}
      />

      {/* Boundaries */}
      <BoundaryCard
        boundaries={[
          {
            limitation: "Does NOT perform Optical Character Recognition (OCR)",
            explanation: "Scanned photo documents require native digital text streams for extraction.",
          },
          {
            limitation: "Does NOT auto-sync via screen scraping",
            explanation: "Documents are uploaded directly by the user; ArthAI does not store bank login credentials.",
          },
          {
            limitation: "Does NOT silently overwrite existing records",
            explanation: "Conflicting numbers trigger a reconciliation choice (Merge, Overwrite, or Keep Existing).",
          },
          {
            limitation: "Does NOT share document chunks across users",
            explanation: "All extracted text and chunk embeddings are constrained strictly by user_id RLS policies.",
          },
        ]}
      />

      {/* Source of Truth */}
      <SourceOfTruthCard
        files={[
          {
            filePath: "backend/app/documents/parser.py",
            role: "Executes page-aware digital text extraction using pypdf.",
          },
          {
            filePath: "backend/app/documents/classifier.py",
            role: "Classifies documents into 7 supported financial categories.",
          },
          {
            filePath: "backend/app/documents/processor.py",
            role: "Coordinates extraction, chunking, and candidate entity generation.",
          },
          {
            filePath: "database/migrations/004_candidate_financial_entities.sql",
            role: "PostgreSQL schema for candidate entities, review statuses, and provenance tracking.",
          },
        ]}
      />

      {/* Try in Product CTA */}
      <TryInArthAICta
        title="Upload Statements to Evidence Vault"
        description="Ingest your bank statements or salary slips, inspect extracted candidate facts, and verify your canonical records."
        buttonLabel="Open Evidence Vault"
        targetHref="/dashboard?tab=evidence&subTab=vault"
      />
    </LearnPageShell>
  );
}
