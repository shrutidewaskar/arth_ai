"use client";

import React from "react";
import { LineChart, ArrowRight, Sparkles, Layers } from "lucide-react";

export default function GoldAssetTrackingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative grid-bg-overlay overflow-hidden flex flex-col justify-between">
      {/* Decorative Background meshes */}
      <div className="absolute top-0 left-1/4 h-[600px] w-[600px] mesh-glow-1 pointer-events-none rounded-full opacity-60" />
      <div className="absolute top-[300px] right-1/4 h-[700px] w-[700px] mesh-glow-2 pointer-events-none rounded-full opacity-50" />

      {/* Navbar */}
      <nav className="z-10 border-b border-slate-200/50 px-6 py-5 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="h-10 w-10 rounded-2xl bg-[#0B5D4B] flex items-center justify-center shadow-lg">
              <Layers className="text-white h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-black tracking-tight text-primary">
              Arth<span className="text-accent font-extrabold">AI</span>
            </span>
          </a>
        </div>
      </nav>

      {/* Hero / Feature details */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100/60 px-4 py-2 rounded-full text-xs md:text-sm font-extrabold text-primary mb-8 shadow-sm">
          <Sparkles className="h-4 w-4 text-accent animate-pulse" />
          ✨ Asset Valuation Module
        </div>

        <div className="h-24 w-24 rounded-3xl bg-emerald-50 border-2 border-emerald-100/50 flex items-center justify-center text-primary shadow-xl mb-8 transform hover:scale-105 transition duration-300">
          <LineChart className="h-12 w-12 text-[#0B5D4B]" />
        </div>

        <h1 className="font-display text-5xl lg:text-7xl font-black text-dark tracking-tight leading-tight mb-6">
          Gold Asset Tracking
        </h1>

        <p className="text-lg md:text-xl text-slate-550 leading-relaxed max-w-2xl mb-12 font-semibold">
          Seamlessly catalog ancestral, physical, and digital gold weight holdings. Track current market valuations and integrate gold assets directly into your household net worth calculations and goal collateral modeling.
        </p>

        <a 
          href="/?tab=investments" 
          className="bg-primary hover:bg-[#074739] text-white font-bold px-10 py-5 rounded-full transition shadow-2xl shadow-primary/20 flex items-center gap-2.5 text-xs md:text-sm uppercase tracking-widest"
        >
          Launch Module <ArrowRight className="h-5 w-5" />
        </a>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/55 py-8 text-center text-xs md:text-sm text-slate-400 font-bold bg-white/50 backdrop-blur-sm relative z-10">
        © {new Date().getFullYear()} ArthAI Financial Technologies Private Limited. All rights reserved.
      </footer>
    </div>
  );
}
