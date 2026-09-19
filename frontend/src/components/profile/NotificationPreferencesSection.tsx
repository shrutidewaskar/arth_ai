'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Newspaper, Sparkles, ExternalLink } from 'lucide-react';

export const NotificationPreferencesSection: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-black text-slate-800 tracking-tight">
            Notification Settings
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            Manage your financial attention alerts and market news feeds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-150 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-black text-slate-800">Your ArthAI Attention Items</h4>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Real-time actionable alerts regarding document reconciliation, underfunded goals, and cashflow anomalies.
            </p>
          </div>
          <Link
            href="/notifications"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <span>Open Notification Queue</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-150 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-black text-slate-800">Public Finance News</h4>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Live market updates, taxation news, and RBI policy movements delivered via server-side RSS feeds.
            </p>
          </div>
          <Link
            href="/notifications"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <span>View Markets Feed</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
        <p className="text-xs text-slate-500 font-medium">
          Detailed delivery channel controls (Email digest, WhatsApp summary, SMS alerts) are scheduled for upcoming roadmap releases.
        </p>
      </div>
    </div>
  );
};
