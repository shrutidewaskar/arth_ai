import React, { useState } from "react";
import { UserProfile } from "@/types/financial";
import { apiPost } from "@/lib/api";
import { Settings, Shield, User, AlertCircle, CheckCircle2 } from "lucide-react";

interface SettingsTabProps {
  profileData: any;
  onRefresh: () => void;
}

export function SettingsTab({ profileData, onRefresh }: SettingsTabProps) {
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    setFeedback(null);
    try {
      const res = await apiPost("/api/v1/demo/seed", {});
      if (res.ok) {
        setFeedback({
          type: "success",
          message: "Demo household data seeded for Rajesh Sharma.",
        });
        onRefresh();
      } else {
        throw new Error("Failed to seed demo data");
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error seeding demo data.",
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-display text-base font-bold text-slate-700">Configurations & System Settings</h3>
        <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">Active</span>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Account Security & Storage</h4>
            <p className="text-[11px] text-slate-450 font-medium">
              Your household balance sheet and documents are protected with Postgres Row-Level Security (RLS).
            </p>
          </div>
        </div>
      </div>

      {/* Developer & Demo Mode Section - Safely Isolated */}
      <div className="bg-amber-50/50 border border-amber-200/80 p-6 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Developer & Demo Mode</h4>
            <p className="text-[11px] text-amber-800 font-medium mt-0.5">
              Reset or initialize a pre-populated Sharma household scenario for testing and engine demonstration.
            </p>
          </div>
          <button
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {seeding ? "Seeding..." : "Load Demo Scenario"}
          </button>
        </div>
      </div>
    </div>
  );
}
