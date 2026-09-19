'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!password || password.length < 6) {
      setFeedback({
        type: 'error',
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'Passwords do not match.',
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setFeedback({
          type: 'error',
          message: error.message,
        });
      } else {
        setFeedback({
          type: 'success',
          message: 'Password has been updated successfully! Redirecting...',
        });
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred while resetting password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-soft flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-8 ml-4 sm:ml-0"
        >
          <ArrowLeft className="h-4.5 w-4.5" /> Back to sign in
        </Link>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-[#22c55e]">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-black text-dark tracking-tight">
            Arth<span className="text-primary">AI</span>
          </span>
        </div>

        <h2 className="text-center text-2xl font-display font-black text-slate-900">
          Set New Password
        </h2>
        <p className="mt-2 text-center text-xs md:text-sm font-semibold text-slate-500 max-w-sm mx-auto">
          Enter your new secure password to restore access to your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/50 rounded-4xl sm:px-10">
          <form onSubmit={handleUpdatePassword} className="space-y-5">
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

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-primary text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-primary text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-[#074739] text-white py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}{' '}
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-700/80 bg-emerald-50/50 py-2.5 rounded-xl border border-emerald-100/40">
              <Lock className="h-4 w-4 text-[#22c55e]" /> Authenticated & tenant-isolated session
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
