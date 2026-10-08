"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Send,
  CheckCircle2,
  AlertTriangle,
  Bug,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  Clock,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  FileQuestion
} from "lucide-react";

type InquiryCategory = "bug" | "complaint" | "query" | "feature";
type PriorityLevel = "low" | "medium" | "high" | "critical";

interface FormData {
  fullName: string;
  email: string;
  category: InquiryCategory;
  priority: PriorityLevel;
  module: string;
  subject: string;
  message: string;
  stepsToReproduce: string;
}

const CATEGORIES: {
  id: InquiryCategory;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  badgeColor: string;
}[] = [
  {
    id: "bug",
    label: "Bug Report",
    subtitle: "UI glitches, calculation mismatch, or PDF parsing error",
    icon: Bug,
    badgeColor: "text-rose-600 bg-rose-50 border-rose-200",
  },
  {
    id: "complaint",
    label: "Complaint / Grievance",
    subtitle: "Account issue, data discrepancy, or security concern",
    icon: AlertTriangle,
    badgeColor: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    id: "query",
    label: "General Query",
    subtitle: "Questions on models, methodologies, or partnerships",
    icon: HelpCircle,
    badgeColor: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    id: "feature",
    label: "Feature Request",
    subtitle: "New calculators, asset classes, or workflow suggestions",
    icon: Lightbulb,
    badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
];

const MODULE_OPTIONS = [
  "Financial Home / Pulse",
  "AI CFO Advisory",
  "Evidence Vault / Document Parser",
  "Goals Vault & Planning",
  "Decision & Scenario Simulator",
  "Tax Regime Planner",
  "Gold Asset Tracking",
  "Profile, Security & Settings",
  "Other / General",
];

const FAQS = [
  {
    q: "How quickly does the ArthAI team respond?",
    a: "We review submissions Monday through Saturday. Critical bugs and security reports receive responses within 12 hours. General queries and feature requests are addressed within 24–48 business hours.",
  },
  {
    q: "What should I include when reporting a calculation discrepancy?",
    a: "Please specify the exact formula or page (e.g. DTI, Emergency Runway, Goal Contribution), your expected result vs. what ArthAI displayed, and relevant asset/liability details.",
  },
  {
    q: "How do I report a security vulnerability?",
    a: "For sensitive security disclosures, you may reach out directly to security@arthai.in with encrypted details or use this form with the 'Critical' priority tag.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    category: "bug",
    priority: "medium",
    module: "Financial Home / Pulse",
    subject: "",
    message: "",
    stepsToReproduce: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [ticketId, setTicketId] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    // Simulate submission delay and ticket generation
    setTimeout(() => {
      const randomTicketNum = Math.floor(10000 + Math.random() * 90000);
      setTicketId(`ARTH-${new Date().getFullYear()}-${randomTicketNum}`);
      setStatus("success");
    }, 900);
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      category: "bug",
      priority: "medium",
      module: "Financial Home / Pulse",
      subject: "",
      message: "",
      stepsToReproduce: "",
    });
    setStatus("idle");
    setTicketId("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background ambient mesh */}
      <div className="absolute top-0 left-1/4 h-120 w-120 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-80 right-1/4 h-120 w-120 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="h-10 w-10 rounded-2xl bg-[#0B5D4B] flex items-center justify-center shadow-md">
              <Layers className="text-white h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-black tracking-tight text-[#0B5D4B]">
                Arth<span className="text-[#18B27A]">AI</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">
                Help & Grievance Desk
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/learn"
              className="text-xs md:text-sm font-bold text-slate-600 hover:text-[#0B5D4B] transition px-3 py-2"
            >
              Learn & Architecture
            </Link>
            <Link
              href="/login"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-bold px-4 py-2 rounded-full transition uppercase tracking-wider"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs md:text-sm font-bold px-5 py-2 rounded-full transition shadow-md uppercase tracking-wider"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 relative z-10 w-full">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#0B5D4B] shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#18B27A]" />
            Official Support & Grievance Redressal
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Report a bug, submit an account grievance, propose a new feature, or ask a general question. Every ticket is reviewed directly by our engineering and financial logic team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card (Col 7 / 12) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            {status === "success" ? (
              /* Success Screen */
              <div className="text-center py-8 space-y-5">
                <div className="h-16 w-16 bg-emerald-100 text-[#0B5D4B] rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#0B5D4B] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Ticket Created: {ticketId}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-slate-900">
                    Thank you for reaching out!
                  </h3>
                  <p className="text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                    Your submission regarding <strong>"{formData.subject}"</strong> has been logged into our support queue. A confirmation has been noted for <strong>{formData.email}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs text-slate-600 space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">Category:</span>
                    <span className="capitalize font-semibold">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">Priority:</span>
                    <span className="capitalize font-semibold">{formData.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">Module:</span>
                    <span className="font-semibold">{formData.module}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">Estimated Response SLA:</span>
                    <span className="font-bold text-[#0B5D4B]">Within 24 business hours</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Submit Another Request
                  </button>
                  <Link
                    href="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs font-bold transition shadow-md"
                  >
                    Back to Home
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Contact Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Category Selection */}
                <div className="space-y-2.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    1. Select Inquiry Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.category === cat.id;
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                            isSelected
                              ? "bg-emerald-50/70 border-[#0B5D4B] ring-2 ring-[#0B5D4B]/20 shadow-xs"
                              : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isSelected ? "bg-[#0B5D4B] text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{cat.label}</h4>
                            <p className="text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
                              {cat.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. User Info (Name & Email) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-xs font-bold text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]/30 focus:border-[#0B5D4B] transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-slate-700">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]/30 focus:border-[#0B5D4B] transition"
                    />
                  </div>
                </div>

                {/* 3. Module & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="module" className="text-xs font-bold text-slate-700">
                      Affected Feature / Module
                    </label>
                    <select
                      id="module"
                      value={formData.module}
                      onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]/30 focus:border-[#0B5D4B] transition"
                    >
                      {MODULE_OPTIONS.map((mod) => (
                        <option key={mod} value={mod}>
                          {mod}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="priority" className="text-xs font-bold text-slate-700">
                      Severity / Priority
                    </label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as PriorityLevel })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]/30 focus:border-[#0B5D4B] transition"
                    >
                      <option value="low">Low — General feedback or minor UI cosmetic</option>
                      <option value="medium">Medium — Normal inquiry or non-blocking issue</option>
                      <option value="high">High — Calculation issue or broken workflow</option>
                      <option value="critical">Critical — Data discrepancy or security blocker</option>
                    </select>
                  </div>
                </div>

                {/* 4. Subject */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-xs font-bold text-slate-700">
                    Subject / Summary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    placeholder={
                      formData.category === "bug"
                        ? "e.g. DTI ratio formula returns unexpected percentage when EMI is modified"
                        : formData.category === "complaint"
                        ? "e.g. Discrepancy noticed in uploaded salary slip extraction"
                        : formData.category === "feature"
                        ? "e.g. Requesting support for Sovereign Gold Bonds (SGB) tracking"
                        : "e.g. Inquiring about enterprise / CA advisor integrations"
                    }
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]/30 focus:border-[#0B5D4B] transition"
                  />
                </div>

                {/* 5. Detailed Message */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-bold text-slate-700">
                    Detailed Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder={
                      formData.category === "bug"
                        ? "Please describe what happened, what you expected to happen, and which inputs triggered the issue..."
                        : formData.category === "complaint"
                        ? "Please explain your grievance in detail so our team can investigate promptly..."
                        : "Please provide any relevant details or context..."
                    }
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]/30 focus:border-[#0B5D4B] transition resize-y"
                  />
                </div>

                {/* 6. Optional Steps to Reproduce (Only for Bug Reports) */}
                {formData.category === "bug" && (
                  <div className="space-y-1.5">
                    <label htmlFor="steps" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Steps to Reproduce (Optional)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Helps us fix it faster</span>
                    </label>
                    <textarea
                      id="steps"
                      rows={2}
                      placeholder="1. Go to Decision Center&#10;2. Add New Car Loan of ₹10,00,000&#10;3. Click Simulate"
                      value={formData.stepsToReproduce}
                      onChange={(e) =>
                        setFormData({ ...formData, stepsToReproduce: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]/30 focus:border-[#0B5D4B] transition resize-y font-mono text-[11px]"
                    />
                  </div>
                )}

                {status === "error" && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Please fill in all mandatory fields (Name, Email, Subject, and Description).</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs sm:text-sm font-black transition shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                >
                  {status === "submitting" ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Logging Your Ticket...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit {CATEGORIES.find((c) => c.id === formData.category)?.label}
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  We respect your privacy. Submissions are encrypted and never shared with third parties.
                </p>
              </form>
            )}
          </div>

          {/* Right Info Cards (Col 5 / 12) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Channels Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#0B5D4B]" />
                Direct Email Channels
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900">General Support & Product Feedback</span>
                  <a href="mailto:support@arthai.in" className="text-[#0B5D4B] font-semibold hover:underline">
                    support@arthai.in
                  </a>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900">Grievance Officer & Escalations</span>
                  <a href="mailto:grievance@arthai.in" className="text-[#0B5D4B] font-semibold hover:underline">
                    grievance@arthai.in
                  </a>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900">Responsible Security Disclosures</span>
                  <a href="mailto:security@arthai.in" className="text-[#0B5D4B] font-semibold hover:underline">
                    security@arthai.in
                  </a>
                </div>
              </div>
            </div>

            {/* Operating SLA Card */}
            <div className="bg-[#0B5D4B] text-white p-6 rounded-3xl shadow-lg space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-300" />
                <h4 className="font-bold text-sm">Response SLA & Hours</h4>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                Our support and engineering teams operate <strong>Monday – Saturday, 9:00 AM to 7:00 PM IST</strong>.
              </p>
              <ul className="text-xs space-y-1 text-emerald-100/80 pt-1 font-medium list-disc list-inside">
                <li>Critical bug/security issues: &lt; 12 hours</li>
                <li>General inquiries & feedback: &lt; 24–48 hours</li>
              </ul>
            </div>

            {/* HQ Location */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#0B5D4B]" />
                Registered Headquarters
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                ArthAI Financial Technologies Private Limited<br />
                Outer Ring Road, Bellandur, Bengaluru,<br />
                Karnataka 560103, India
              </p>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-[#0B5D4B]" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                {FAQS.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="border border-slate-200/70 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full p-3 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 transition flex items-center justify-between gap-2"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 pt-1 text-[11.5px] text-slate-600 font-medium leading-relaxed border-t border-slate-100 bg-slate-50/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#084235] text-white py-12 px-6 border-t border-emerald-950 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200 font-semibold">
          <div className="flex items-center gap-2">
            <Layers className="text-[#18B27A] h-4 w-4" />
            <span>ArthAI Financial OS — Transparent, Deterministic Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/learn" className="hover:text-white transition">Learn</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/security" className="hover:text-white transition">Security</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-emerald-900/60 text-center text-xs text-emerald-300/70 font-medium">
          © {new Date().getFullYear()} ArthAI Financial Technologies Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
