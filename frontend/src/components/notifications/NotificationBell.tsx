'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Newspaper, Sparkles, X, ExternalLink } from 'lucide-react';
import { FinanceNewsItem } from '@/app/api/news/route';
import { FinanceNewsList } from './FinanceNewsList';
import { PersonalNotificationList, AttentionItem } from './PersonalNotificationList';

interface NotificationBellProps {
  isAuthenticated: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'personal'>(isAuthenticated ? 'personal' : 'news');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Public News State
  const [news, setNews] = useState<FinanceNewsItem[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Personal Notifications State
  const [personalItems, setPersonalItems] = useState<AttentionItem[]>([]);
  const [isPersonalLoading, setIsPersonalLoading] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Adjust active tab when authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveTab('news');
      setPersonalItems([]);
    }
  }, [isAuthenticated]);

  // Fetch Public News when opened
  useEffect(() => {
    if (isOpen && news.length === 0 && !isNewsLoading) {
      setIsNewsLoading(true);
      setNewsError(null);
      fetch('/api/news')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch finance news');
          return res.json();
        })
        .then((data) => {
          if (data.success && Array.isArray(data.items)) {
            setNews(data.items);
          } else {
            setNewsError('Finance news is temporarily unavailable.');
          }
        })
        .catch((err) => {
          console.error(err);
          setNewsError('Finance news is temporarily unavailable.');
        })
        .finally(() => {
          setIsNewsLoading(false);
        });
    }
  }, [isOpen, news.length, isNewsLoading]);

  // Fetch Personal Notifications only if Authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated && personalItems.length === 0 && !isPersonalLoading) {
      setIsPersonalLoading(true);
      setPersonalError(null);
      fetch('/api/v1/attention')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load attention items');
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setPersonalItems(data);
          } else if (data && Array.isArray(data.items)) {
            setPersonalItems(data.items);
          } else {
            setPersonalItems([]);
          }
        })
        .catch((err) => {
          console.error(err);
          setPersonalError('Unable to load personalized attention items.');
        })
        .finally(() => {
          setIsPersonalLoading(false);
        });
    }
  }, [isOpen, isAuthenticated, personalItems.length, isPersonalLoading]);

  const hasUnread = isAuthenticated ? personalItems.length > 0 : true;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/20 hover:border-emerald-500/40 transition-all relative"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#031510]/95 backdrop-blur-xl border border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-emerald-500/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                {isAuthenticated ? 'Notifications' : 'Finance News'}
              </h3>
              {!isAuthenticated && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Public Feed
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-emerald-950/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Authenticated Tabs */}
          {isAuthenticated && (
            <div className="grid grid-cols-2 p-1.5 bg-[#020d0a] border-b border-emerald-500/15 text-xs font-medium">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'personal'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your ArthAI</span>
                {personalItems.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/30 text-emerald-300">
                    {personalItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'news'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>Finance News</span>
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-emerald-500/20">
            {isAuthenticated && activeTab === 'personal' ? (
              <PersonalNotificationList
                items={personalItems}
                isLoading={isPersonalLoading}
                error={personalError}
                limit={4}
              />
            ) : (
              <FinanceNewsList
                items={news}
                isLoading={isNewsLoading}
                error={newsError}
                limit={5}
              />
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3 bg-[#020d0a]/80 border-t border-emerald-500/15 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>View all {isAuthenticated && activeTab === 'personal' ? 'alerts' : 'finance news'}</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
