import React from "react";
import { LogOut } from "lucide-react";
import { CANONICAL_HUBS } from "@/lib/constants";
import { PrimaryHub } from "@/types/financial";

interface DashboardSidebarProps {
  activeHub: PrimaryHub;
  setActiveHub: (id: PrimaryHub) => void;
  pendingReviewCount?: number;
  attentionCount?: number;
  onLogout: () => void;
}

export function DashboardSidebar({
  activeHub,
  setActiveHub,
  pendingReviewCount = 0,
  attentionCount = 0,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <aside className="lg:col-span-3 flex flex-col gap-3">
      <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-3xl flex flex-col gap-2">
        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider px-3 mb-1">
          Financial OS Hubs
        </p>

        {CANONICAL_HUBS.map((hub) => {
          const isActive = activeHub === hub.id;
          const badgeCount =
            hub.id === "evidence" && pendingReviewCount > 0
              ? pendingReviewCount
              : hub.id === "home" && attentionCount > 0
              ? attentionCount
              : null;

          return (
            <button
              key={hub.id}
              onClick={() => setActiveHub(hub.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs md:text-sm font-bold transition uppercase tracking-wider text-left ${
                isActive
                  ? "bg-[#0B5D4B] text-white font-black shadow-md"
                  : "text-slate-600 hover:bg-slate-100/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <hub.icon className="h-4.5 w-4.5 shrink-0" />
                <span>{hub.label}</span>
              </div>

              {badgeCount !== null && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : hub.id === "evidence"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs md:text-sm font-bold transition uppercase tracking-wider text-left text-rose-600 hover:bg-rose-50 mt-4 border-t border-slate-200/50 pt-4"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

