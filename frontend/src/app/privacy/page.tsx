import React from "react";
import Link from "next/link";
import { Layers, ShieldCheck, UserCheck, EyeOff, Lock, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — ArthAI Financial OS",
  description: "Learn how ArthAI protects and respects your personal financial data.",
};

export default function PrivacyPage() {
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
            Privacy & Data Governance
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-[#0F172A] tracking-tight">
            Your Financial Data Belongs to You
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            We treat household financial information with strict confidentiality.
          </p>
        </div>

        {/* Privacy Commitments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <EyeOff className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Zero Data Monetization</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              We never sell, rent, or trade your financial records, income numbers, or portfolio data to advertisers or third-party lead generators.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">User Data Ownership</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              All financial entities, goals, and assets cataloged in your workspace are tied strictly to your authenticated profile and accessible solely by you.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Isolated Execution</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              AI advisor prompts are built on transient, session-scoped context. Your raw documents and ledgers are query-isolated by PostgreSQL Row-Level Security.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Transparent Control</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              You maintain direct control over your notification preferences, profile details, and financial entries via the authenticated Profile workspace.
            </p>
          </div>
        </div>

        {/* Policy Summary Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-900">Data Governance Principles</h2>
          <div className="space-y-3 text-xs md:text-sm text-slate-650 leading-relaxed font-medium">
            <p>
              1. <strong>Collection:</strong> We collect only the financial records, goals, and profile information you directly input or upload to provide the financial operating system services.
            </p>
            <p>
              2. <strong>Purpose:</strong> Your data is used exclusively to generate financial calculations, balance sheet insights, scenario simulations, and grounded CFO recommendations.
            </p>
            <p>
              3. <strong>Security:</strong> All communications use HTTPS/TLS and session-authenticated API headers. Database queries strictly enforce user identity boundaries.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/55 py-8 text-center text-xs text-slate-400 font-bold bg-white/50 backdrop-blur-sm relative z-10">
        © {new Date().getFullYear()} ArthAI Financial Technologies Private Limited. All rights reserved.
      </footer>
    </div>
  );
}
