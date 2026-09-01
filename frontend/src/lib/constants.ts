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

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Command Center", icon: LayoutDashboard },
  { id: "ai_cfo", label: "AI CFO Workspace", icon: Brain },
  { id: "cash_flow", label: "Cash Flow Story", icon: Wallet },
  { id: "goals", label: "Goals Vault", icon: Target },
  { id: "investments", label: "Investments Portfolio", icon: LineChart },
  { id: "insurance", label: "Insurance Shield", icon: ShieldCheck },
  { id: "health", label: "Health Score", icon: Activity },
  { id: "simulator", label: "Scenario Simulator", icon: Compass },
  { id: "calendar", label: "Financial Calendar", icon: CalendarIcon },
  { id: "subscriptions", label: "Bills & Subs", icon: Coins },
  { id: "vault", label: "Secure Vault", icon: FolderOpen },
  { id: "family", label: "Family Dashboard", icon: Users },
  { id: "twin", label: "AI Financial Twin", icon: Cpu },
  { id: "decision_center", label: "Decision Center", icon: Scale },
  { id: "insights", label: "Insights Feed", icon: Bell },
  { id: "settings", label: "Settings", icon: SettingsIcon }
];

const WORKSPACE_CARDS: Record<string, {
  title: string;
  description: string;
  aiStatus: string;
  stats: { label: string; val: string }[];
  lastUpdated: string;
  primaryCta: string;
  gradient: string;
  icon: any;
  quickSummary: string;
}> = {
  overview: {
    title: "Command Center",
    description: "Consolidated overview of family balance sheet, net worth calculations, and high-priority AI insights.",
    aiStatus: "Balance sheet compiled, 1 high-priority action recommended.",
    stats: [
      { label: "Net Worth", val: "₹11.0 Lakhs" },
      { label: "Assets", val: "₹43.0 Lakhs" },
      { label: "Debts", val: "₹32.0 Lakhs" }
    ],
    lastUpdated: "Updated 10m ago",
    primaryCta: "Explore Workspace",
    gradient: "from-emerald-50/80 to-teal-50/40",
    icon: LayoutDashboard,
    quickSummary: "Centralized hub compiling physical gold, fixed deposits, EPF balances, and home loans into one family ledger."
  },
  ai_cfo: {
    title: "AI CFO Workspace",
    description: "Interact directly with your specialized family financial agent to model taxes, loans, and portfolio queries.",
    aiStatus: "Advisory model active & fully trained on your contracts.",
    stats: [
      { label: "Prompts Run", val: "18 Active" },
      { label: "Regime Status", val: "New Regime Swap" },
      { label: "Tax Saved", val: "₹52,400" }
    ],
    lastUpdated: "Updated 1h ago",
    primaryCta: "Launch CFO Workspace",
    gradient: "from-teal-50/60 to-cyan-50/40",
    icon: Brain,
    quickSummary: "Chat-based advisory using deep mathematical reasoning over interest compounding, tax structures, and loan amortizations."
  },
  cash_flow: {
    title: "Cash Flow Story",
    description: "Understand where your money comes from, where it goes, and how your future cash flow is projected.",
    aiStatus: "Cash flow is stable this month.",
    stats: [
      { label: "Income", val: "₹2,04,000" },
      { label: "Expenses", val: "₹1,42,000" },
      { label: "Savings Rate", val: "30%" }
    ],
    lastUpdated: "Updated 2h ago",
    primaryCta: "Explore Workspace",
    gradient: "from-green-50/60 to-emerald-50/40",
    icon: Wallet,
    quickSummary: "Real-time dashboard charting monthly recurring cash burn, savings buffer margins, and future compound projections."
  },
  goals: {
    title: "Goals Vault",
    description: "Track every financial goal and let ArthAI continuously optimize the timeline.",
    aiStatus: "Your Home Goal is ahead by 3 months.",
    stats: [
      { label: "Active Goals", val: "2 Goals" },
      { label: "Completion", val: "64%" },
      { label: "Monthly", val: "₹38,500" }
    ],
    lastUpdated: "Updated yesterday",
    primaryCta: "Open Goals",
    gradient: "from-cyan-50/60 to-blue-50/40",
    icon: Target,
    quickSummary: "Goal tracker prioritizing critical milestones (Higher Education, Retirement) with dynamic capital allocation models."
  },
  investments: {
    title: "Investments Portfolio",
    description: "Monitor investments, portfolio allocation, returns and AI recommendations.",
    aiStatus: "Portfolio is diversified.",
    stats: [
      { label: "Return", val: "14.8% CAGR" },
      { label: "Risk Profile", val: "Moderate" },
      { label: "Equity Allocation", val: "65%" }
    ],
    lastUpdated: "Updated 15m ago",
    primaryCta: "Explore Portfolio",
    gradient: "from-amber-50/60 to-yellow-50/40",
    icon: LineChart,
    quickSummary: "Tracks mutual fund folios, physical gold holdings, and fixed deposits with real-time return and risk calculations."
  },
  insurance: {
    title: "Insurance Shield",
    description: "Protect your family's future with AI-powered insurance analysis.",
    aiStatus: "Coverage is 82%.",
    stats: [
      { label: "Policies", val: "3 Active" },
      { label: "Renewals", val: "0 Pending" },
      { label: "Coverage Gap", val: "18%" }
    ],
    lastUpdated: "Updated 2 days ago",
    primaryCta: "Open Insurance",
    gradient: "from-blue-50/60 to-indigo-50/40",
    icon: ShieldCheck,
    quickSummary: "Evaluates term life policies, health coverage gaps, and schedules premium payment alerts."
  },
  health: {
    title: "Health Score",
    description: "Your overall financial wellness score generated using AI.",
    aiStatus: "Financial health improved this week.",
    stats: [
      { label: "Wellness Score", val: "84/100" },
      { label: "Savings Health", val: "Healthy" },
      { label: "Liquidity", val: "Stable" }
    ],
    lastUpdated: "Updated today",
    primaryCta: "View Report",
    gradient: "from-rose-50/60 to-pink-50/40",
    icon: Activity,
    quickSummary: "Composite health index scoring debt-to-income ratios, emergency cash runways, and diversification metrics."
  },
  simulator: {
    title: "Scenario Simulator",
    description: "Test important financial decisions before making them.",
    aiStatus: "Ready for simulation.",
    stats: [
      { label: "Simulations Run", val: "2 Scenarios" },
      { label: "Confidence", val: "94%" },
      { label: "Projection Horizon", val: "5 Years" }
    ],
    lastUpdated: "Updated 4h ago",
    primaryCta: "Launch Simulator",
    gradient: "from-purple-50/60 to-fuchsia-50/40",
    icon: Compass,
    quickSummary: "Simulates major purchases (e.g. ₹15L SUV, land acquisition) against existing retirement targets and education corpuses."
  },
  calendar: {
    title: "Financial Calendar",
    description: "Never miss credit card cycles, tax deadlines, or insurance renewals.",
    aiStatus: "No critical actions due in the next 7 days.",
    stats: [
      { label: "Scheduled Bills", val: "4 Items" },
      { label: "Next Due", val: "Oct 15 (₹22K)" },
      { label: "Reminders Set", val: "Auto-sync" }
    ],
    lastUpdated: "Updated 3h ago",
    primaryCta: "Open Calendar",
    gradient: "from-emerald-50/60 to-green-50/40",
    icon: CalendarIcon,
    quickSummary: "Interactive calendar charting tax cycles, SIP outlays, and policy renewal schedules."
  },
  subscriptions: {
    title: "Bills & Subs",
    description: "Track household subscriptions and recurring outlays.",
    aiStatus: "2 overlapping subscriptions detected.",
    stats: [
      { label: "Monthly Outflow", val: "₹4,200/mo" },
      { label: "Active Items", val: "6 Subs" },
      { label: "Suggested Cuts", val: "₹1,200/mo" }
    ],
    lastUpdated: "Updated today",
    primaryCta: "Manage Bills",
    gradient: "from-violet-50/60 to-purple-50/40",
    icon: Coins,
    quickSummary: "Categorizes and monitors streaming platforms, SaaS tools, and monthly utility bills."
  },
  vault: {
    title: "Secure Vault",
    description: "A centralized secure repository for loan contracts, tax filings, and insurance policies.",
    aiStatus: "3 documents parsed and securely indexed.",
    stats: [
      { label: "Documents", val: "3 Files" },
      { label: "Encryption", val: "AES-256" },
      { label: "Access Logs", val: "Secure" }
    ],
    lastUpdated: "Updated yesterday",
    primaryCta: "Open Vault Workspace",
    gradient: "from-slate-50/70 to-zinc-50/50",
    icon: FolderOpen,
    quickSummary: "Allows secure storage of HDFC contracts, Aadhaar documents, and pay slips, using AI to extract key metadata."
  },
  family: {
    title: "Family Dashboard",
    description: "Combined household finances and shared financial planning.",
    aiStatus: "Household goals progressing normally.",
    stats: [
      { label: "Active Members", val: "3 Members" },
      { label: "Shared Assets", val: "₹30.5 Lakhs" },
      { label: "Goal Alignment", val: "Aligned" }
    ],
    lastUpdated: "Updated 1d ago",
    primaryCta: "View Family Dashboard",
    gradient: "from-teal-50/60 to-emerald-50/40",
    icon: Users,
    quickSummary: "Bridges multi-generational balances to project overall household wealth, and shared higher-education plans."
  },
  twin: {
    title: "AI Financial Twin",
    description: "AI continuously predicts your future financial position based on current behaviour.",
    aiStatus: "Forecast updated today.",
    stats: [
      { label: "Forecast Horizon", val: "15 Years" },
      { label: "Behavior Impact", val: "Positive" },
      { label: "Accuracy Score", val: "91%" }
    ],
    lastUpdated: "Updated 1h ago",
    primaryCta: "Meet Your Twin",
    gradient: "from-orange-50/60 to-amber-50/40",
    icon: Cpu,
    quickSummary: "Dynamic financial avatar simulating compounding metrics based on day-to-day spending patterns."
  },
  decision_center: {
    title: "Decision Center",
    description: "Consult ArthAI before making any major financial decision.",
    aiStatus: "3 pending recommendations.",
    stats: [
      { label: "Recent Decisions", val: "4 analyzed" },
      { label: "Approval Rate", val: "91%" },
      { label: "Confidence", val: "94%" }
    ],
    lastUpdated: "Updated today",
    primaryCta: "Start Decision Analysis",
    gradient: "from-yellow-50/60 to-orange-50/40",
    icon: Scale,
    quickSummary: "A playground to simulate major asset transfers, prepayment choices, or large purchases."
  },
  insights: {
    title: "Insights Feed",
    description: "Daily financial intelligence generated automatically.",
    aiStatus: "5 new insights available.",
    stats: [
      { label: "Total Feed", val: "24 Items" },
      { label: "Unread", val: "5 Alerts" },
      { label: "Savings Opportunity", val: "₹52K/yr" }
    ],
    lastUpdated: "Updated 12m ago",
    primaryCta: "Read Insights",
    gradient: "from-sky-50/60 to-blue-50/40",
    icon: Bell,
    quickSummary: "Feeds customized reports on tax regimes, mutual fund overlaps, and gold loan advantages."
  },
  settings: {
    title: "Settings",
    description: "Configure APIs, sync bank accounts via aggregator, and customize multi-generational settings.",
    aiStatus: "Configurations updated.",
    stats: [
      { label: "Aggregator Sync", val: "Active" },
      { label: "API Provider", val: "OpenAI v4" },
      { label: "Secured Nodes", val: "2 Verified" }
    ],
    lastUpdated: "Updated 5 days ago",
    primaryCta: "Manage Settings",
    gradient: "from-zinc-50/70 to-slate-50/50",
    icon: SettingsIcon,
    quickSummary: "Allows customization of simulation metrics, account connections, and profile configurations."
  }
};

export { MOCK_HOUSEHOLD, PRESETS, SIDEBAR_ITEMS, WORKSPACE_CARDS };
