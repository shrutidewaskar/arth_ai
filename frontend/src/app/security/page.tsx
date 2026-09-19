import React from "react";
import Link from "next/link";
import { Layers, ShieldCheck, Lock, Database, FileCheck, Eye, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Security & Architecture — ArthAI Financial OS",
  description: "Security architecture, row-level isolation, and data governance in ArthAI.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative overflow-x-hidden flex flex-col justify-between">
      {/* Decorative Background meshes */}
      <div className="absolute top-0 left-1/4 h-[600px] w-[600px] mesh-glow-1 pointer-events-none rounded-full opacity-60" />
      <div className="absolute top-[300px] right-1/4 h-[700px] w-[700px] mesh-glow-2 pointer-events-none rounded-full opacity-50" />

      {/* Navbar */}
      <nav className="z-10 border-b border-slate-200/50 px-6 py-5 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="h-10 w-10 rounded-2xl bg-[#0B5D4B] flex items-center justify-center shadow-lg">
              <Layers className="text-white h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-black tracking-tight text-[#0B5D4B]">
              Arth<span className="text-[#18B27A] font-extrabold">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-bold px-5 py-2.5 rounded-full transition uppercase tracking-widest"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs md:text-sm font-bold px-6 py-2.5 rounded-full transition shadow-xl uppercase tracking-widest"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex-1 relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100/60 px-4 py-2 rounded-full text-xs font-extrabold text-[#0B5D4B] shadow-sm">
            <Sparkles className="h-4 w-4 text-[#18B27A]" />
            Security & Trust Architecture
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-[#0F172A] tracking-tight">
            Security & Data Isolation Architecture
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            ArthAI is architected around strict database row-level security, tenant-scoped API authentication, and transparent provenance.
          </p>
        </div>

        {/* Security Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">PostgreSQL Row-Level Security (RLS)</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Every financial record, goal, liability, and asset is protected by strict PostgreSQL RLS policies ensuring database-level query isolation per authenticated user ID.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Session & Auth Token Validation</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Authentication is managed via Supabase Auth with cryptographic JWT tokens and PKCE verification flow. All backend endpoints validate active session tokens.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Read-Only Advisory Guardrails</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              The AI CFO operates as an advisory layer over validated context. It cannot unilaterally execute financial transactions or modify your ledger without explicit user interaction.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Document Provenance & Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              All parsed financial statements in the Evidence Vault maintain audit trails with source document IDs and extraction metadata for complete user verification.
            </p>
          </div>
        </div>

        {/* Verification Summary Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-900">Verified Technical Guarantees</h2>
          <ul className="space-y-3 text-xs md:text-sm text-slate-650 font-medium">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#0B5D4B] shrink-0 mt-0.5" />
              <span><strong>Tenant Isolation:</strong> Backend API routes require valid authorization tokens and scope all database operations to the requesting user ID.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#0B5D4B] shrink-0 mt-0.5" />
              <span><strong>Deterministic Logic:</strong> Core financial indicators (DTI, runway, EMI calculations) are evaluated using verified domain algorithms.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#0B5D4B] shrink-0 mt-0.5" />
              <span><strong>Transparent Grounding:</strong> AI recommendations cite specific balance sheet metrics and document extracts.</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/55 py-8 text-center text-xs text-slate-400 font-bold bg-white/50 backdrop-blur-sm relative z-10">
        © {new Date().getFullYear()} ArthAI Financial Technologies Private Limited. All rights reserved.
      </footer>
    </div>
  );
}
