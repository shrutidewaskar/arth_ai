import React from "react";
import {
  Brain,
  User,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  Scale,
  Target,
  FileText,
  Home,
} from "lucide-react";
import { CfoMessage } from "@/types/financial";

interface CfoMessageItemProps {
  message: CfoMessage;
  onNavigateHub?: (hub: "home" | "money" | "plan" | "evidence" | "profile", subTab?: string) => void;
}

export function CfoMessageItem({ message, onNavigateHub }: CfoMessageItemProps) {
  const isUser = message.sender === "user";
  const structured = message.structured;

  if (isUser) {
    return (
      <div className="flex justify-end items-start gap-2.5">
        <div className="bg-[#0B5D4B] text-white p-4 rounded-3xl rounded-tr-xs max-w-xl text-xs sm:text-sm font-semibold shadow-xs leading-relaxed">
          {message.text}
        </div>
        <div className="h-8 w-8 rounded-full bg-emerald-100 border border-emerald-200 text-[#0B5D4B] flex items-center justify-center shrink-0">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  // AI CFO Message
  const assessment = structured?.assessment;
  const keyFacts = structured?.key_facts || [];
  const reasons = structured?.reasons || [];
  const tradeoffs = structured?.tradeoffs || [];
  const assumptions = structured?.assumptions || [];
  const evidenceUsed = structured?.evidence_used || [];
  const missingData = structured?.missing_data || [];

  const assessmentStyles: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    Safe: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
      icon: ShieldCheck,
    },
    Healthy: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
      icon: ShieldCheck,
    },
    "Needs Attention": {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: AlertTriangle,
    },
    "Data Required": {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: AlertTriangle,
    },
    "High Risk": {
      bg: "bg-rose-50",
      text: "text-rose-800",
      border: "border-rose-200",
      icon: ShieldAlert,
    },
    Unsafe: {
      bg: "bg-rose-50",
      text: "text-rose-800",
      border: "border-rose-200",
      icon: ShieldAlert,
    },
  };

  const currentAssessmentStyle =
    assessment && assessmentStyles[assessment.label]
      ? assessmentStyles[assessment.label]
      : {
          bg: "bg-slate-100",
          text: "text-slate-800",
          border: "border-slate-200",
          icon: Brain,
        };

  const AssessmentIcon = currentAssessmentStyle.icon;

  return (
    <div className="flex justify-start items-start gap-2.5">
      <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
        <Brain className="h-4 w-4" />
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl rounded-tl-xs p-5 max-w-2xl text-xs sm:text-sm text-slate-800 shadow-xs space-y-4">
        {/* Headline & Assessment Badge */}
        {structured?.summary && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h4 className="font-display font-black text-slate-900 text-sm sm:text-base">
              {structured.summary}
            </h4>
            {assessment && (
              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border flex items-center gap-1 ${currentAssessmentStyle.bg} ${currentAssessmentStyle.text} ${currentAssessmentStyle.border}`}
              >
                <AssessmentIcon className="h-3 w-3" />
                {assessment.label}
              </span>
            )}
          </div>
        )}

        {/* Narrative Answer */}
        <div className="leading-relaxed font-medium text-slate-700 whitespace-pre-line">
          {structured?.answer || message.text}
        </div>

        {/* Missing Data Notice */}
        {missingData.length > 0 && (
          <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold space-y-1">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span>Incomplete Profile Information</span>
            </div>
            <p className="text-[11px] font-medium text-amber-900">
              Missing fields: {missingData.join(", ")}. Please update your profile in Money to receive grounded evaluation.
            </p>
          </div>
        )}

        {/* Key Metrics Grid */}
        {keyFacts.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">
              Grounded Metrics Considered
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {keyFacts.map((fact, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-450 block truncate uppercase">
                    {fact.label}
                  </span>
                  <span className="font-black text-slate-800 text-xs sm:text-sm mt-0.5 block truncate">
                    {typeof fact.value === "number"
                      ? fact.unit === "INR" || !fact.unit
                        ? `₹${fact.value.toLocaleString("en-IN")}`
                        : fact.unit === "percent"
                        ? `${fact.value}%`
                        : fact.unit === "months"
                        ? `${fact.value} mo`
                        : `${fact.value} ${fact.unit}`
                      : String(fact.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation Box */}
        {structured?.recommendation && (
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1 text-xs">
            <span className="text-[10px] font-black text-[#0B5D4B] uppercase tracking-wider block">
              Deterministic Action Recommendation
            </span>
            <p className="font-bold text-slate-800">{structured.recommendation}</p>
          </div>
        )}

        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">
              Supporting Evidence Points
            </span>
            <ul className="space-y-1 text-xs font-semibold text-slate-700 pl-3 border-l-2 border-[#0B5D4B]">
              {reasons.map((r, idx) => (
                <li key={idx} className="leading-relaxed">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tradeoffs */}
        {tradeoffs.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">
              Tradeoff Matrix
            </span>
            <div className="space-y-1 text-xs font-medium text-amber-900 bg-amber-50/50 p-3 rounded-xl border border-amber-150">
              {tradeoffs.map((t, idx) => (
                <p key={idx} className="leading-relaxed">
                  ⚖️ {t}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Assumptions */}
        {assumptions.length > 0 && (
          <div className="text-[10px] text-slate-450 font-medium pt-1">
            <span className="font-bold">Assumptions: </span>
            {assumptions.join(" • ")}
          </div>
        )}

        {/* Footer: Provenance & Deep Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-[11px]">
          {/* Provenance Footnote */}
          {evidenceUsed.length > 0 ? (
            <div className="flex items-center gap-1.5 text-slate-500 font-bold">
              <Layers className="h-3.5 w-3.5 text-[#0B5D4B]" />
              <span>Grounded via: {evidenceUsed.join(", ")}</span>
            </div>
          ) : (
            <div className="text-slate-400 font-medium">Canonical state analysis</div>
          )}

          {/* Deep Link Action */}
          {message.deepLink && onNavigateHub && (
            <button
              onClick={() => onNavigateHub(message.deepLink!.hub, message.deepLink!.subTab)}
              className="inline-flex items-center gap-1 text-[#0B5D4B] hover:text-[#074739] font-black transition self-end sm:self-center"
            >
              <span>{message.deepLink.label}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
