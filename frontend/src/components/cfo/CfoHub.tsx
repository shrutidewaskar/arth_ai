import React, { useRef, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Send,
  HelpCircle,
  TrendingUp,
  Scale,
  ShieldCheck,
  Target,
  FileText,
  AlertCircle,
  Layers,
  ArrowRight,
} from "lucide-react";
import { CfoMessage } from "@/types/financial";
import { CfoMessageItem } from "./CfoMessageItem";

interface CfoHubProps {
  cfoMessages: CfoMessage[];
  cfoInput: string;
  setCfoInput: (val: string) => void;
  cfoThinking: boolean;
  suggestedActions: string[];
  handleCfoChat: (e: React.FormEvent) => void;
  onNavigateHub?: (hub: "home" | "money" | "plan" | "evidence" | "profile", subTab?: string) => void;
}

export function CfoHub({
  cfoMessages,
  cfoInput,
  setCfoInput,
  cfoThinking,
  suggestedActions,
  handleCfoChat,
  onNavigateHub,
}: CfoHubProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cfoMessages, cfoThinking]);

  const starterCategories = [
    {
      title: "Goal Affordability",
      prompt: "Can I afford my home downpayment goal with my current surplus?",
      hub: "plan" as const,
      subTab: "goals",
    },
    {
      title: "Loan Simulation",
      prompt: "Simulate taking a ₹15 Lakh car loan at 8.5% interest for 5 years.",
      hub: "plan" as const,
      subTab: "decision_center",
    },
    {
      title: "Emergency Runway",
      prompt: "Why is my emergency liquidity runway calculated at its current level?",
      hub: "money" as const,
      subTab: "overview",
    },
    {
      title: "Evidence Provenance",
      prompt: "What evidence documents support my current recorded liabilities?",
      hub: "evidence" as const,
      subTab: "vault",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-black text-slate-800 tracking-tight">
              AI Family CFO
            </h2>
            <span className="text-[10px] bg-emerald-50 text-primary font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200/60">
              Grounded Reasoning Layer
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Deterministic advisory grounded in your canonical balance sheet, evidence documents, and life goals.
          </p>
        </div>
      </div>

      {/* Main Chat & Reasoning Container */}
      <div className="flex flex-col h-150 bg-slate-50/70 rounded-3xl border border-slate-200/80 overflow-hidden relative shadow-xs">
        {/* Top Chat Bar */}
        <div className="p-4 bg-white border-b border-slate-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800 block">
                Financial Advisory Loop
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">
                Capability Registry Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Engines Synced</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {cfoMessages.map((msg, idx) => (
            <CfoMessageItem
              key={msg.id || idx}
              message={msg}
              onNavigateHub={onNavigateHub}
            />
          ))}

          {/* Thinking / Engine Execution State */}
          {cfoThinking && (
            <div className="flex justify-start items-start gap-2.5">
              <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl rounded-tl-xs p-4 max-w-md text-xs font-bold text-slate-600 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-primary font-black">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Executing Deterministic Financial Engines...</span>
                </div>
                <p className="text-[11px] text-slate-450 font-normal">
                  Classifying intent, querying BusinessRuleEngine, and pulling verified evidence context.
                </p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Footer Area: Starter Categories & Input */}
        <div className="p-4 bg-white border-t border-slate-150 space-y-3">
          {/* Starter Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[9px] font-black text-slate-400 uppercase shrink-0">
              Ask ArthAI:
            </span>
            {starterCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setCfoInput(cat.prompt)}
                className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition shrink-0 truncate max-w-xs"
                title={cat.prompt}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleCfoChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask your AI CFO a financial question, e.g. 'Can I invest in mutual funds instead of prepaying loan?'"
              value={cfoInput}
              onChange={(e) => setCfoInput(e.target.value)}
              disabled={cfoThinking}
              className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0b3e33] text-slate-800 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={cfoThinking || !cfoInput.trim()}
              className="bg-primary hover:bg-[#074739] disabled:opacity-40 text-white p-3.5 rounded-2xl transition shadow-xs flex items-center justify-center shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
