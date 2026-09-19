import React from "react";
import Link from "next/link";
import { Layers, Terminal, Compass, Sparkles, Mail, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Careers — ArthAI Financial OS",
  description: "Engineering and quantitative finance opportunities at ArthAI.",
};

export default function CareersPage() {
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
            Careers at ArthAI
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-[#0F172A] tracking-tight">
            Building High-Reliability Financial Software
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            We are engineering deterministic engines and grounded AI systems that power household wealth decisions.
          </p>
        </div>

        {/* Engineering Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Mathematical Precision</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              We never approximate math with LLMs. We build rigorous financial models with verified test suites, strict schemas, and deterministic execution.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center font-bold">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">User First & Privacy Centric</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Financial data is deeply sensitive. We enforce database-level row isolation and transparent document provenance across every single feature.
            </p>
          </div>
        </div>

        {/* General Inquiry Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center mx-auto">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Open Inquiries</h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed">
            We are always looking for exceptional software engineers, full-stack builders, and quantitative thinkers who care deeply about financial craftsmanship.
          </p>
          <div className="pt-2">
            <a
              href="mailto:careers@arthai.app"
              className="inline-flex items-center gap-2 bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs font-bold px-6 py-3 rounded-full transition shadow-sm uppercase tracking-wider"
            >
              Contact Engineering Team <ArrowRight className="h-4 w-4" />
            </a>
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
