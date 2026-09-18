import React, { useState } from "react";
import { SettingsTab } from "@/components/dashboard/SettingsTab";

interface ProfileHubProps {
  profileData: any;
  onRefresh: () => void;
  initialSubTab?: string;
}

export function ProfileHub({ profileData, onRefresh, initialSubTab = "settings" }: ProfileHubProps) {
  const [subTab, setSubTab] = useState<string>(initialSubTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-black text-slate-800 tracking-tight">
              Profile & Configuration
            </h2>
            <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] font-bold px-2.5 py-1 rounded-full uppercase">
              Tenant Security
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Account settings, Row-Level Security parameters, and isolated Developer Mode.
          </p>
        </div>
      </div>

      <SettingsTab profileData={profileData} onRefresh={onRefresh} />
    </div>
  );
}
