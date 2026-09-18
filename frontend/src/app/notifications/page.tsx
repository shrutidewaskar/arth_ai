'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Newspaper, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { FinanceNewsItem } from '@/app/api/news/route';
import { FinanceNewsList } from '@/components/notifications/FinanceNewsList';
import { PersonalNotificationList, AttentionItem } from '@/components/notifications/PersonalNotificationList';
import { createClient } from '@/lib/supabase/client';

export default function NotificationsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'news' | 'personal'>('news');

  // News State
  const [news, setNews] = useState<FinanceNewsItem[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Personal Attention State
  const [personalItems, setPersonalItems] = useState<AttentionItem[]>([]);
  const [isPersonalLoading, setIsPersonalLoading] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);

  // Check auth session on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const loggedIn = !!session?.user;
      setIsAuthenticated(loggedIn);
      setIsLoadingAuth(false);
      if (loggedIn) {
        setActiveTab('personal');
      }
    });
  }, []);

  const fetchNews = async () => {
    setIsNewsLoading(true);
    setNewsError(null);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setNews(data.items);
      } else {
        setNewsError('Finance news is temporarily unavailable.');
      }
    } catch {
      setNewsError('Finance news is temporarily unavailable.');
    } finally {
      setIsNewsLoading(false);
    }
  };

  const fetchPersonal = async () => {
    if (!isAuthenticated) return;
    setIsPersonalLoading(true);
    setPersonalError(null);
    try {
      const res = await fetch('/api/v1/attention');
      if (!res.ok) throw new Error('Failed to load attention items');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPersonalItems(data);
      } else if (data && Array.isArray(data.items)) {
        setPersonalItems(data.items);
      } else {
        setPersonalItems([]);
      }
    } catch {
      setPersonalError('Unable to load personalized attention items.');
    } finally {
      setIsPersonalLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPersonal();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#020b08] text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* Top Header */}
      <header className="border-b border-emerald-500/20 bg-[#031510]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Home</span>
            </Link>
            <div className="h-4 w-px bg-emerald-500/20" />
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h1 className="text-base font-bold text-white tracking-wide">Notifications & News</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => (activeTab === 'personal' ? fetchPersonal() : fetchNews())}
              className="p-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/20 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              title="Refresh feed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#020b08] font-bold text-xs transition-colors"
              >
                Open Sandbox
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4 mb-6">
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'personal'
                  ? 'bg-emerald-500 text-[#020b08] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-emerald-950/40 text-slate-400 hover:text-white border border-emerald-500/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Your ArthAI Alerts</span>
              {personalItems.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'personal'
                      ? 'bg-emerald-950 text-emerald-300 font-bold'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {personalItems.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'news'
                ? 'bg-emerald-500 text-[#020b08] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-emerald-950/40 text-slate-400 hover:text-white border border-emerald-500/10'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Public Finance News</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'personal' && isAuthenticated ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#031812] border border-emerald-500/20">
                  <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Personal Financial Action Queue
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time attention items derived from your linked records, goals, and portfolio health.
                  </p>
                </div>
                <PersonalNotificationList
                  items={personalItems}
                  isLoading={isPersonalLoading}
                  error={personalError}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#031812] border border-emerald-500/20">
                  <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-emerald-400" />
                    Markets, Banking & Macro Economy
                  </h2>
                  <p className="text-xs text-slate-400">
                    Curated live business and financial updates from authoritative sources.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-[#031510]/60 border border-emerald-500/15">
                  <FinanceNewsList
                    items={news}
                    isLoading={isNewsLoading}
                    error={newsError}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info Card */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#031510] border border-emerald-500/20 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                About ArthAI Feed
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ArthAI surfaces public financial news for general market awareness, while preserving absolute data isolation for private wealth intelligence.
              </p>
              {!isAuthenticated && !isLoadingAuth && (
                <div className="pt-3 border-t border-emerald-500/10 space-y-3">
                  <p className="text-xs text-emerald-400 font-medium">
                    Sign in to unlock personalized CFO alerts, portfolio anomaly warnings, and goal action items.
                  </p>
                  <Link
                    href="/login"
                    className="block text-center py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#020b08] font-bold text-xs transition-colors"
                  >
                    Sign In to ArthAI
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
