'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, Info } from 'lucide-react';

export interface AttentionItem {
  id: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  summary: string;
  source_page?: string;
  impact_amount?: number;
  currency?: string;
  created_at?: string;
}

interface PersonalNotificationListProps {
  items: AttentionItem[];
  isLoading: boolean;
  error?: string | null;
  limit?: number;
}

export const PersonalNotificationList: React.FC<PersonalNotificationListProps> = ({
  items,
  isLoading,
  error,
  limit,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2].map((n) => (
          <div key={n} className="animate-pulse p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/10 space-y-2">
            <div className="h-3 bg-emerald-500/20 rounded w-1/4"></div>
            <div className="h-3.5 bg-emerald-500/20 rounded w-4/5"></div>
            <div className="h-2.5 bg-emerald-500/10 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 px-3 text-center">
        <p className="text-xs text-rose-400/90">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-6 px-4 text-center space-y-2">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium text-slate-300">All caught up!</p>
        <p className="text-[11px] text-slate-500">
          No urgent financial attention items or review actions required.
        </p>
      </div>
    );
  }

  const displayItems = limit ? items.slice(0, limit) : items;

  const getDestination = (item: AttentionItem) => {
    switch (item.source_page?.toLowerCase()) {
      case 'goals':
        return '/dashboard?tab=plan&subTab=goals';
      case 'evidence':
        return '/dashboard?tab=evidence';
      case 'money':
      case 'cashflow':
        return '/dashboard?tab=money';
      case 'cfo':
        return '/dashboard?tab=cfo';
      default:
        return '/dashboard?tab=home';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Urgent
          </span>
        );
      case 'medium':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Action Needed
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Opportunity
          </span>
        );
    }
  };

  return (
    <div className="space-y-2.5">
      {displayItems.map((item) => (
        <Link
          key={item.id}
          href={getDestination(item)}
          className="group block p-3 rounded-lg bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/15 hover:border-emerald-500/30 transition-all"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              {item.severity === 'high' ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Info className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {item.category}
              </span>
            </div>
            {getSeverityBadge(item.severity)}
          </div>

          <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
            {item.title}
          </h4>

          {item.summary && (
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/10 text-[10px] text-emerald-400">
            <span className="font-medium">View in Workspace</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      ))}
    </div>
  );
};
