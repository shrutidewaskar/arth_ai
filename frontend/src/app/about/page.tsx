import React from "react";
import Link from "next/link";
import { Layers, ShieldCheck, Cpu, ArrowRight, Brain, CheckCircle2, Sparkles } from "lucide-react";

export const metadata = {
  title: "About Us — ArthAI Financial OS",
  description: "Learn about ArthAI, an AI-powered financial operating system designed for Indian households.",
};

export default function AboutPage() {
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
            About ArthAI
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-[#0F172A] tracking-tight">
            Financial Operating System for Indian Households
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            ArthAI is engineered to replace fragmented spreadsheets and passive expense trackers with an active, deterministic financial reasoning engine.
          </p>
        </div>

        {/* Core Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Deterministic Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Core financial metrics—DTI ratios, emergency runways, EMI amortization, and compounding—are computed by deterministic code, not probabilistic guesses.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Grounded Advisory</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              The AI CFO advises on trade-offs (e.g. loan prepayment vs. SIP investment) strictly anchored to verified user ledger data and household constraints.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Provenance & Isolation</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Every document uploaded to the Evidence Vault is isolated by PostgreSQL Row-Level Security, allowing line-by-line verification.
            </p>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">Our Focus</h2>
          <div className="space-y-4 text-sm text-slate-650 leading-relaxed font-medium">
            <p>
              Middle-class Indian households navigate complex, multi-asset portfolios spanning physical gold, provident funds, fixed deposits, home loans, and mutual fund SIPs. Most personal finance tools only categorize yesterday's spending.
            </p>
            <p>
              ArthAI connects current cash flows with long-term aspirations: child education milestones, home acquisitions, tax regime optimization, and retirement runways. We believe every household deserves institutional-grade financial intelligence.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs font-bold px-6 py-3 rounded-full transition shadow-sm uppercase tracking-wider inline-flex items-center gap-2"
            >
              Explore OS Workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/security"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-6 py-3 rounded-full transition uppercase tracking-wider"
            >
              Security Architecture
            </Link>
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
