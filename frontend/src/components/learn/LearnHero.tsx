import React from "react";
import { LucideIcon, Sparkles } from "lucide-react";

interface LearnHeroProps {
  badge: string;
  badgeIcon?: LucideIcon;
  title: string;
  subtitle: string;
  takeaway: string;
}

export function LearnHero({
  badge,
  badgeIcon: BadgeIcon = Sparkles,
  title,
  subtitle,
  takeaway,
}: LearnHeroProps) {
  return (
    <div className="space-y-6 text-center sm:text-left">
      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100/60 px-4 py-2 rounded-full text-xs font-extrabold text-[#0B5D4B] shadow-xs">
        <BadgeIcon className="h-3.5 w-3.5 text-[#18B27A]" />
        {badge}
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl">
          {subtitle}
        </p>
      </div>

      {/* Quick Takeaway Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-500/20 shadow-xs flex items-start gap-3.5 text-left">
        <div className="h-8 w-8 rounded-xl bg-emerald-50 text-[#0B5D4B] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
          💡
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#0B5D4B] block mb-0.5">
            Core Grounding Principle
          </span>
          <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
            {takeaway}
          </p>
        </div>
      </div>
    </div>
  );
}
