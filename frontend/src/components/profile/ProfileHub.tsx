'use client';

import React, { useState } from 'react';
import { User, Users, TrendingUp, Bell, Shield, Terminal } from 'lucide-react';
import { UserProfile } from '@/types/financial';
import { PersonalInformationSection } from './PersonalInformationSection';
import { HouseholdSection } from './HouseholdSection';
import { FinancialPreferencesSection } from './FinancialPreferencesSection';
import { NotificationPreferencesSection } from './NotificationPreferencesSection';
import { SecuritySection } from './SecuritySection';
import { DeveloperSection } from './DeveloperSection';

interface ProfileHubProps {
  profileData: UserProfile | null;
  onRefresh: () => void;
  initialSubTab?: string;
}

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'household', label: 'Household', icon: Users },
  { id: 'preferences', label: 'Preferences', icon: TrendingUp },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'developer', label: 'Developer', icon: Terminal },
];

export function ProfileHub({ profileData, onRefresh, initialSubTab = 'personal' }: ProfileHubProps) {
  const [activeTab, setActiveTab] = useState<string>(
    TABS.some((t) => t.id === initialSubTab) ? initialSubTab : 'personal'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-black text-slate-800 tracking-tight">
              Profile & Identity
            </h2>
            <span className="text-[10px] bg-emerald-50 text-primary font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200/60">
              Identity & Control
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage your personal background, household context, investment risk profile, and account security.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start md:self-center">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'personal' && (
          <PersonalInformationSection profile={profileData} onRefresh={onRefresh} />
        )}

        {activeTab === 'household' && (
          <HouseholdSection profile={profileData} onRefresh={onRefresh} />
        )}

        {activeTab === 'preferences' && (
          <FinancialPreferencesSection profile={profileData} onRefresh={onRefresh} />
        )}

        {activeTab === 'notifications' && <NotificationPreferencesSection />}

        {activeTab === 'security' && <SecuritySection />}

        {activeTab === 'developer' && <DeveloperSection onRefresh={onRefresh} />}
      </div>
    </div>
  );
}
