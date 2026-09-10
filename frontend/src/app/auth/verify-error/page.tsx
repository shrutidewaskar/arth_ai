"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Mail, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function VerifyErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const isExpired = errorCode === "otp_expired" || error === "access_denied";

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setResendError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setResendError(null);

    try {
      const supabase = createClient();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
      const emailRedirectTo = `${appUrl}/auth/callback`;

      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo,
        },
      });

      if (resendErr) {
        setResendError(resendErr.message);
      } else {
        setResendSuccess(true);
      }
    } catch (err: any) {
      setResendError(err.message || "Failed to resend verification link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/50 rounded-4xl sm:px-10">
      <div className="text-center py-4 space-y-4">
        <div className="h-14 w-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        
        <h3 className="text-xl font-black text-slate-800">
          {isExpired ? "Verification Link Expired or Used" : "Email Verification Failed"}
        </h3>
        
        <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed max-w-sm mx-auto">
          {isExpired
            ? "This verification link has already been used or has expired. Supabase one-time links can only be clicked once."
            : errorDescription || "We couldn't verify your email address with the provided link."}
        </p>

        {resendSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs font-bold text-emerald-800 space-y-2 mt-4"
          >
            <div className="flex items-center justify-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>Fresh verification link sent!</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              Please check your inbox at <span className="font-bold">{email}</span> and click the latest link.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleResend} className="mt-6 space-y-4 text-left">
            {resendError && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-xs font-bold text-rose-700">
                {resendError}
              </div>
            )}

            <div>
              <label htmlFor="resend-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Enter your registered email to resend
              </label>
              <input
                id="resend-email"
                type="email"
                required
                placeholder="rajesh@sharma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-primary text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-[#074739] text-white py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Sending link...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" /> Resend Verification Email
                </>
              )}
            </button>
          </form>
        )}

        <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-between text-xs font-bold">
          <Link href="/register" className="text-slate-500 hover:text-slate-800">
            Create new account
          </Link>
          <Link href="/login" className="text-primary hover:underline flex items-center gap-1">
            Back to Sign In <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyErrorPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-8 ml-4 sm:ml-0"
        >
          <ArrowLeft className="h-4.5 w-4.5" /> Back to landing
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <Suspense fallback={<div className="bg-white p-8 rounded-4xl text-center text-xs font-bold text-slate-400">Loading...</div>}>
          <VerifyErrorContent />
        </Suspense>
      </div>
    </main>
  );
}
