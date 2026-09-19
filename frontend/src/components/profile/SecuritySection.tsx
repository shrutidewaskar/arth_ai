'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Key, LogOut, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export const SecuritySection: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [lastSignIn, setLastSignIn] = useState<string>('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEmail(session.user.email || '');
        if (session.user.last_sign_in_at) {
          setLastSignIn(new Date(session.user.last_sign_in_at).toLocaleString());
        }
      }
    });
  }, []);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace('/');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to sign out.',
      });
      setLoggingOut(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-black text-slate-800 tracking-tight">
            Security & Authentication
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            PostgreSQL Row-Level Security status, active session, and credentials.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150 space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              Tenant Data Protection
            </span>
          </div>
          <p className="text-xs text-slate-700 font-bold">
            Postgres Row-Level Security (RLS) Active
          </p>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            All balance sheet tables, documents, and cashflow records are strictly isolated to your authenticated tenant ID.
          </p>
        </div>

        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150 space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Key className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              Authenticated Account
            </span>
          </div>
          <p className="text-xs text-slate-800 font-bold truncate">{email || 'Authenticated User'}</p>
          {lastSignIn && (
            <p className="text-[11px] text-slate-400 font-medium">Last active: {lastSignIn}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <Link
          href="/auth/reset-password"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-black rounded-xl transition"
        >
          <Key className="h-3.5 w-3.5" />
          <span>Change / Reset Password</span>
        </Link>

        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl transition disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{loggingOut ? 'Signing Out...' : 'Sign Out of Account'}</span>
        </button>
      </div>
    </div>
  );
};
