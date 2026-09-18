'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { FinanceNewsItem } from '@/app/api/news/route';

interface FinanceNewsListProps {
  items: FinanceNewsItem[];
  isLoading: boolean;
  error?: string | null;
  limit?: number;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export const FinanceNewsList: React.FC<FinanceNewsListProps> = ({
  items,
  isLoading,
  error,
  limit,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="animate-pulse space-y-1.5 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/10">
            <div className="h-3.5 bg-emerald-500/20 rounded w-5/6"></div>
            <div className="h-2.5 bg-emerald-500/10 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="py-6 px-3 text-center">
        <p className="text-xs text-slate-400">
          {error || 'Finance news is temporarily unavailable.'}
        </p>
      </div>
    );
  }

  const displayItems = limit ? items.slice(0, limit) : items;

  return (
    <div className="divide-y divide-emerald-500/10">
      {displayItems.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-3 hover:bg-emerald-950/30 transition-colors rounded-lg my-1"
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs font-medium text-slate-200 group-hover:text-emerald-400 line-clamp-2 leading-snug transition-colors">
              {item.title}
            </h4>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
            <span className="font-semibold text-emerald-500/90 truncate max-w-[140px]">{item.source}</span>
            <span>•</span>
            <span>{formatRelativeTime(item.publishedAt)}</span>
          </div>
        </a>
      ))}
    </div>
  );
};
