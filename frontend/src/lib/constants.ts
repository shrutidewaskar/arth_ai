"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Compass, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Target, 
  LineChart, 
  Brain, 
  Wallet,
  Menu, 
  X, 
  ArrowUpRight, 
  Activity, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  HelpCircle,
  LogOut,
  Settings as SettingsIcon,
  ChevronRight,
  Send,
  User,
  Plus,
  Coins,
  Home,
  PiggyBank,
  Download,
  IndianRupee,
  Star,
  Zap,
  Lock,
  ArrowUp,
  Percent,
  FolderOpen,
  Users,
  BookOpen,
  Bell,
  Sliders,
  DollarSign,
  Heart,
  Eye,
  Trash2,
  FileText,
  LayoutDashboard,
  AlertTriangle,
  Scale
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { apiFetch, apiGet, apiPost, apiDelete } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

// --- Type Declarations & Mock Data ---
interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const MOCK_HOUSEHOLD = {
  name: "Sharma Family",
  assets: [
    { name: "Ancestral Gold", type: "gold", val: 1850000, inst: "Self Custody", color: "#fbbf24" },
    { name: "SBI Fixed Deposit", type: "fixed_deposit", val: 800000, inst: "SBI", color: "#60a5fa" },
    { name: "EPF Rajesh", type: "employee_provident_fund", val: 1200000, inst: "EPFO", color: "#34d399" },
    { name: "Parag Parikh Flexi Cap", type: "mutual_fund", val: 450000, inst: "PPFAS MF", color: "#a78bfa" }
  ],
  liabilities: [
    { name: "HDFC Home Loan", type: "home_loan", outstanding: 3200000, emi: 38500, rate: 8.75 }
  ],
  goals: [
    { name: "Aarav's Higher Education", target: 3500000, year: 2030, priority: "Critical", status: "Under-funded" },
    { name: "Retirement (Rajesh & Sunita)", target: 30000000, year: 2041, priority: "Critical", status: "On Track" }
  ]
};

const PRESETS = [
  {
    q: "Can I buy a ₹15 lakh SUV next year?",
    a: "AI CFO Recommendation: Buying a ₹15 Lakh SUV next year is achievable but will impact Aarav's 2030 education fund by ₹6.4 Lakhs.\n\n* Analysis: Current liquid reserves (SBI FD of ₹8L + ₹4.5L in mutual funds) total ₹12.5L. Withdrawing this triggers tax on FD interest and forfeits mutual fund compounding.\n* Optimized Strategy: Instead of full cash, take a Gold Loan (LTV 70%) against your 250g gold at 7.8% interest. Pay a ₹5L downpayment and clear the balance over 36 months to keep your mutual fund SIPs active.",
    metrics: [
      { label: "Education Corpus Impact", value: "-₹6.4L" },
      { label: "Net Interest Saved", value: "₹1.8 Lakhs" }
    ]
  },
  {
    q: "How should we invest Rajesh's ₹5 Lakh annual bonus?",
    a: "AI CFO Recommendation: We recommend a 50/50 Hybrid allocation split between home loan reduction and mutual funds.\n\n* Action Plan: Prepay ₹2.5L to the HDFC Home Loan (saves ₹4.2L in lifetime interest) and invest ₹2.5L into Equity Mutual Funds.",
    metrics: [
      { label: "Interest Saved", value: "₹4.2 Lakhs" },
      { label: "Months Saved on Loan", value: "14 Months" }
    ]
  },
  {
    q: "Should I prepay my home loan?",
    a: "AI CFO Recommendation: Yes, prepaying HDFC Home Loan yields an 8.75% tax-free equivalent return.\n\n* Action Plan: Prepay ₹2.5L principal using standard liquid savings. This cuts total lifetime interest outflows by ₹4.2L and reduces tenure by 14 months.",
    metrics: [
      { label: "Lifetime Savings", value: "₹4.2 Lakhs" },
      { label: "EMI Tenure Reduced", value: "14 Months" }
    ]
  },
  {
    q: "Can I afford an international vacation?",
    a: "AI CFO Recommendation: Yes, an international vacation costing ₹3.5L is feasible without touching your long-term goal allocations.\n\n* Action Plan: Re-route your monthly cash savings buffer of ₹62,000 for 6 months into a low-risk Liquid Fund. Do not liquidate mutual fund SIPs.",
    metrics: [
      { label: "Emergency Buffer preserved", value: "₹8.0 Lakhs" },
      { label: "Debt levels", value: "No credit cards" }
    ]
  },
  {
    q: "How much emergency fund do I need?",
    a: "AI CFO Recommendation: You require a minimum of ₹4.8 Lakhs representing 6 months of household fixed expenses and loan EMIs.\n\n* Current Status: Your current SBI Fixed Deposit of ₹8.0L is fully sufficient, providing 10 months of emergency runway.",
    metrics: [
      { label: "Runway coverage", value: "10 Months" },
      { label: "Required reserve", value: "₹4.8 Lakhs" }
    ]
  },
  {
    q: "Should I increase my SIP?",
    a: "AI CFO Recommendation: Yes, increasing your mutual fund SIP run rate by 10% annually dramatically boosts your long-term goal completion probabilities.\n\n* Target Impact: Increases Aarav's 2030 higher education corpus completion probability from 84% to 98%.",
    metrics: [
      { label: "Education Corpus Probability", value: "98% Probability" },
      { label: "Additional SIP Outlay", value: "₹2,500/month" }
    ]
  }
];

export interface HubDefinition {
  id: "home" | "money" | "plan" | "evidence" | "cfo" | "profile";
  label: string;
  icon: any;
  description: string;
  subTabs: { id: string; label: string }[];
}

export const CANONICAL_HUBS: HubDefinition[] = [
  {
    id: "home",
    label: "Home",
    icon: LayoutDashboard,
    description: "Financial command center, health pulse, actionable attention items, and executive briefing.",
    subTabs: [
      { id: "pulse", label: "Overview & Pulse" },
      { id: "attention", label: "Attention Center" },
    ],
  },
  {
    id: "money",
    label: "Money",
    icon: Wallet,
    description: "Canonical ledger and balance sheet workspace for income, expenses, assets, liabilities, and investments.",
    subTabs: [
      { id: "overview", label: "Balance Sheet" },
      { id: "cashflow", label: "Cash Flow" },
      { id: "assets", label: "Assets" },
      { id: "liabilities", label: "Liabilities" },
      { id: "investments", label: "Investments" },
      { id: "insurance", label: "Insurance" },
      { id: "subscriptions", label: "Bills & Subs" },
    ],
  },
  {
    id: "plan",
    label: "Plan",
    icon: Target,
    description: "Goal feasibility tracking, step-by-step action plans, deterministic scenario simulations, and forecasts.",
    subTabs: [
      { id: "goals", label: "Goals Vault" },
      { id: "action_plans", label: "Action Plans" },
      { id: "decision_center", label: "Decision Center" },
      { id: "forecasts", label: "Financial Twin" },
    ],
  },
  {
    id: "evidence",
    label: "Evidence",
    icon: FolderOpen,
    description: "Document vault, PDF processing status, human-in-the-loop review queue, and reconciliation conflicts.",
    subTabs: [
      { id: "vault", label: "Document Vault" },
      { id: "review_queue", label: "Review Queue" },
      { id: "conflicts", label: "Reconciliation Conflicts" },
    ],
  },
  {
    id: "cfo",
    label: "AI CFO",
    icon: Brain,
    description: "Conversational financial reasoning engine grounded in your deterministic balance sheet and evidence.",
    subTabs: [
      { id: "chat", label: "CFO Advisory" },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    icon: SettingsIcon,
    description: "Account configuration, Postgres Row-Level Security status, and isolated Developer & Demo Mode.",
    subTabs: [
      { id: "settings", label: "Security & Settings" },
      { id: "developer", label: "Developer & Demo" },
    ],
  },
];

export const SIDEBAR_ITEMS = CANONICAL_HUBS.map((h) => ({
  id: h.id,
  label: h.label,
  icon: h.icon,
}));

export const WORKSPACE_CARDS: Record<string, {
  title: string;
  description: string;
  gradient: string;
  icon: any;
}> = {
  home: {
    title: "Financial Command Center",
    description: "Consolidated overview of family balance sheet, net worth calculations, and high-priority AI insights.",
    gradient: "from-emerald-50/80 to-teal-50/40",
    icon: LayoutDashboard,
  },
  money: {
    title: "Money Workspace",
    description: "Real-time ledger tracking monthly recurring cash burn, savings buffer margins, assets, and liabilities.",
    gradient: "from-green-50/60 to-emerald-50/40",
    icon: Wallet,
  },
  plan: {
    title: "Planning & Decision Center",
    description: "Goal tracker prioritizing critical milestones with dynamic capital allocation and scenario simulators.",
    gradient: "from-cyan-50/60 to-blue-50/40",
    icon: Target,
  },
  evidence: {
    title: "Financial Evidence Intelligence",
    description: "Secure repository for loan contracts, bank statements, salary slips, candidate review, and conflicts.",
    gradient: "from-slate-50/70 to-zinc-50/50",
    icon: FolderOpen,
  },
  cfo: {
    title: "AI Family CFO Workspace",
    description: "Interact directly with your specialized family financial agent to model taxes, loans, and portfolio queries.",
    gradient: "from-teal-50/60 to-cyan-50/40",
    icon: Brain,
  },
  profile: {
    title: "Settings & Security",
    description: "Postgres Row-Level Security configurations, profile preferences, and isolated Developer/Demo Mode.",
    gradient: "from-zinc-50/70 to-slate-50/50",
    icon: SettingsIcon,
  },
};

export { MOCK_HOUSEHOLD, PRESETS };

