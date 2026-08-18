"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Frontend validations
    if (!fullName.trim()) {
      setErrorMsg("Full Name is required.");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const emailRedirectTo = `${appUrl}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected registration error occurred.");
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
          Create your secure dashboard account
        </h2>
        <p className="mt-2 text-center text-xs md:text-sm font-semibold text-slate-500 max-w-sm mx-auto">
          Start building your household balance sheet with institutional-grade security.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/50 rounded-4xl sm:px-10">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Check your email</h3>
              <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                We've sent a verification link to:
                <span className="block font-black text-slate-700 mt-1">{email}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-bold leading-normal pt-2">
                Click the confirmation link inside the email to verify your email and activate your personal dashboard.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs font-bold text-rose-700 leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <div>
                <label htmlFor="full-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  id="full-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-primary text-slate-800 disabled:bg-slate-50"
                />
              </div>

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
                  placeholder="e.g. rajesh@sharma.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-primary text-slate-800 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-primary text-slate-800 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="new-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter password"
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
                  {loading ? "Creating account..." : "Create Account"} <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="border-t border-slate-100 pt-5 text-center">
                <p className="text-xs font-bold text-slate-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Log in
                  </Link>
                </p>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-700/80 bg-emerald-50/50 py-2.5 rounded-xl border border-emerald-100/40">
                <ShieldCheck className="h-4 w-4 text-[#22c55e]" /> Bank-grade AES-256 secure session vault
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
