"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // If user is already authenticated, redirect to /dashboard
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        router.replace("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected login error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-8 ml-4 sm:ml-0"
        >
          <ArrowLeft className="h-4.5 w-4.5" /> Back to landing
        </Link>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-[#22c55e]">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-black text-dark tracking-tight">Arth<span className="text-primary">AI</span></span>
        </div>
        <h2 className="text-center text-2xl font-display font-black text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs md:text-sm font-semibold text-slate-500 max-w-sm mx-auto">
          Access your personal AI Financial Command Center securely.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/50 rounded-4xl sm:px-10">
          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs font-bold text-rose-700 leading-relaxed">
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="rajesh@sharma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-primary text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                {loading ? "Signing in..." : "Sign In"} <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="border-t border-slate-100 pt-5 text-center">
              <p className="text-xs font-bold text-slate-500">
                Don't have an account yet?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-700/80 bg-emerald-50/50 py-2.5 rounded-xl border border-emerald-100/40">
              <Lock className="h-4 w-4 text-[#22c55e]" /> AES-256 encrypted session state
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
