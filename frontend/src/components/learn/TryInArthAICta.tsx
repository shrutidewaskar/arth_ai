import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface TryInArthAICtaProps {
  title: string;
  description: string;
  buttonLabel: string;
  targetHref: string;
}

export function TryInArthAICta({
  title,
  description,
  buttonLabel,
  targetHref,
}: TryInArthAICtaProps) {
  return (
    <div
      className="p-8 rounded-3xl bg-[#0B5D4B] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0B5D4B 0%, #06382D 100%)" }}
    >
      <div className="space-y-2.5 max-w-xl relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
          <Sparkles className="h-3 w-3 text-emerald-300" />
          Interactive Product Workspace
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
          {description}
        </p>
      </div>

      <Link
        href={targetHref}
        className="bg-white hover:bg-emerald-50 text-[#0B5D4B] text-xs sm:text-sm font-black px-7 py-3.5 rounded-full transition shadow-lg shrink-0 uppercase tracking-wider flex items-center justify-center gap-2 group relative z-10"
      >
        <span>{buttonLabel}</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
