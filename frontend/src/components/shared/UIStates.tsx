import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`p-8 bg-slate-50 border border-slate-150 rounded-2xl text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      {Icon && (
        <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div>
        <h4 className="text-xs font-bold text-slate-700">{title}</h4>
        <p className="text-[11px] text-slate-450 font-medium max-w-sm mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 bg-[#0B5D4B] hover:bg-[#074739] text-white text-[11px] font-bold px-4 py-2 rounded-xl transition shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading financial data..." }: LoadingStateProps) {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
      <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-500">{message}</p>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  variant?: "emerald" | "amber" | "rose" | "slate" | "sky" | "indigo";
}

export function StatusBadge({ status, variant = "slate" }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200"
  };

  return (
    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border tracking-wider ${styles[variant] || styles.slate}`}>
      {status}
    </span>
  );
}
