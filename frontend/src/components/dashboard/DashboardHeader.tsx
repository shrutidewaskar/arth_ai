import React from "react";
import { Sparkles, Layers, LogOut, Bell } from "lucide-react";
import { AttentionItem } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  attentionItems: AttentionItem[];
  showNotifPopover: boolean;
  setShowNotifPopover: (val: boolean) => void;
  pulseError: string | null;
  onLogout: () => void;
  onSelectAttentionItem: (item: AttentionItem) => void;
}

export function DashboardHeader({
  attentionItems,
  showNotifPopover,
  setShowNotifPopover,
  pulseError,
  onLogout,
  onSelectAttentionItem,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/50 pb-5 mb-8 flex items-center justify-between relative">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#0B5D4B] flex items-center justify-center shadow-lg shadow-[#0B5D4B]/15">
          <Layers className="text-white h-5 w-5" />
        </div>
        <span className="font-display text-2xl font-black tracking-tight text-primary">
          Arth<span className="text-accent font-extrabold">AI</span> Dashboard
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="bg-slate-100 hover:bg-slate-200/80 p-3 rounded-full relative transition flex items-center justify-center"
            title="Attention Feed"
          >
            <Bell className="h-5 w-5 text-slate-700" />
            {attentionItems.length > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-600 border border-white animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotifPopover && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-3 w-84 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xl z-50 text-left max-h-[420px] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <p className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider">
                    Attention & Action Feed
                  </p>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    {attentionItems.length} active
                  </span>
                </div>

                {attentionItems.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                    {pulseError ? pulseError : "No critical items requiring immediate attention."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attentionItems.map((item) => {
                      const sevColor =
                        item.severity === "critical"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : item.severity === "high"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : item.severity === "positive"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200";

                      return (
                        <div key={item.id} className="border-b border-slate-100 pb-2.5 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${sevColor}`}>
                              {item.category} • {item.severity}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-1">{item.title}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                          <button
                            onClick={() => onSelectAttentionItem(item)}
                            className="text-[10px] text-primary font-bold mt-1.5 hover:underline flex items-center gap-1"
                          >
                            {item.action_label} &rarr;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onLogout}
          className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 p-3 rounded-full relative transition flex items-center justify-center border border-slate-200/40"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
