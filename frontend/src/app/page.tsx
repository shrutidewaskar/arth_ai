"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
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

const STEP_DATA = [
  { step: "01", title: "Consolidate & Ingest", desc: "Automated secure sync of mutual fund folios, physical gold weight, post office savings, and loan EMIs.", badge: "Zero Manual Entry" },
  { step: "02", title: "Map Family Context", desc: "Structure target education years, retirement age, insurance dependencies, and dynamic tax brackets.", badge: "Multi-Gen Modeling" },
  { step: "03", title: "AI Reasoning Simulation", desc: "Our engine runs Monte Carlo projections to evaluate decision scenarios (e.g. buying land vs compounding index SIPs).", badge: "Predictive Intelligence" },
  { step: "04", title: "CFO Action Directives", desc: "Receive immediate optimization alerts (e.g. switch regime, prepay principal, reallocate mutual funds).", badge: "Max Cash Yield" }
];

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

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "User Question",
    subtitle: "Input Query",
    description: "The pipeline begins when a user submits a complex financial query.",
    badge: "Initial Query",
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    widget: (
      <div className="bg-[#0B5D4B]/5 border border-[#0B5D4B]/10 rounded-2xl p-3.5 text-left w-full shadow-sm max-w-[210px] mx-auto">
        <p className="text-[9px] uppercase tracking-wider font-extrabold text-primary mb-1">User Query</p>
        <p className="text-xs text-slate-700 font-semibold leading-normal">
          "Can I afford a ₹15 lakh SUV next year?"
        </p>
      </div>
    )
  },
  {
    step: "02",
    title: "Financial Memory",
    subtitle: "Context Construction",
    description: "Retrieves your financial history, goals, income, spending habits and previous decisions.",
    badge: "Memory Scan",
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    widget: (
      <div className="flex flex-wrap gap-1.5 justify-center max-w-[220px] mx-auto">
        {["Income", "Goals", "Insurance", "Investments", "Expenses"].map((chip) => (
          <span key={chip} className="text-[10px] bg-slate-100/80 text-slate-600 border border-slate-200/50 px-2.5 py-1 rounded-full font-bold shadow-sm hover:bg-emerald-50 hover:text-primary hover:border-emerald-250 transition-all duration-300">
            {chip}
          </span>
        ))}
      </div>
    )
  },
  {
    step: "03",
    title: "Financial Analysis",
    subtitle: "Health Evaluation",
    description: "Calculates cash flow, debt ratio, emergency fund, savings rate and investment health.",
    badge: "Key Metrics",
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    widget: (
      <div className="bg-white border border-slate-150 rounded-2xl p-3 text-left w-full shadow-sm max-w-[200px] mx-auto space-y-2">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-400 font-bold">Savings Rate</span>
          <span className="text-emerald-600 font-black">30%</span>
        </div>
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full w-[30%]" />
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-400 font-bold">Debt Ratio</span>
          <span className="text-amber-600 font-black">42%</span>
        </div>
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div className="bg-amber-500 h-full w-[42%]" />
        </div>
      </div>
    )
  },
  {
    step: "04",
    title: "Scenario Simulation",
    subtitle: "Monte Carlo Engine",
    description: "Runs multiple future financial simulations before making recommendations.",
    badge: "Risk Simulation",
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    widget: (
      <div className="flex flex-col gap-1.5 w-full max-w-[190px] mx-auto text-xs text-left">
        <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100/50 px-3 py-1 rounded-xl">
          <span className="font-bold text-emerald-700 text-[10px]">Best Case</span>
          <span className="text-[10px] font-black text-emerald-600">+14% yield</span>
        </div>
        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
          <span className="font-bold text-slate-700 text-[10px]">Expected</span>
          <span className="text-[10px] font-black text-slate-500">Compound</span>
        </div>
        <div className="flex items-center justify-between bg-rose-50/50 border border-rose-100/50 px-3 py-1 rounded-xl">
          <span className="font-bold text-rose-700 text-[10px]">Worst Case</span>
          <span className="text-[10px] font-black text-rose-500">-8% hit</span>
        </div>
      </div>
    )
  },
  {
    step: "05",
    title: "Decision Engine",
    subtitle: "Heuristics Balance",
    description: "Balances affordability, long-term goals and financial risk.",
    badge: "Affordability Score",
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    widget: (
      <div className="bg-white border border-slate-150 rounded-2xl p-3 text-center w-full shadow-sm max-w-[190px] mx-auto">
        <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Confidence Score</p>
        <p className="text-2xl font-black text-primary mt-1">96%</p>
        <span className="text-[8px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full mt-1.5 inline-block">High Safety</span>
      </div>
    )
  },
  {
    step: "06",
    title: "Personalized Advice",
    subtitle: "Actionable Directives",
    description: "Generates practical, explainable financial advice tailored specifically to the user's financial profile.",
    badge: "Output Advice",
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    widget: (
      <div className="bg-emerald-950 text-white rounded-2xl p-3.5 text-left w-full shadow-lg max-w-[210px] mx-auto text-[10px] leading-relaxed border border-emerald-900/50">
        <p className="text-emerald-400 font-extrabold mb-1">CFO Suggestion</p>
        <p className="opacity-90 font-semibold">
          "Buying this SUV today would delay your home goal by 6 months. Waiting 8 months keeps emergency reserves healthy."
        </p>
      </div>
    )
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [workspaceExpanded, setWorkspaceExpanded] = useState<boolean>(false);
  const [showQuickSummary, setShowQuickSummary] = useState<string | null>(null);

  // Sprint 5 Product Magic states
  const [showBriefModal, setShowBriefModal] = useState<boolean>(false);
  const [showNotifPopover, setShowNotifPopover] = useState<boolean>(false);
  const [cfoThinking, setCfoThinking] = useState<boolean>(false);
  const [cfoThinkingSteps, setCfoThinkingSteps] = useState<string[]>([]);
  const [cfoStreaming, setCfoStreaming] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);



  // Dynamic Data States from Backend API
  const [briefData, setBriefData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [insurance, setInsurance] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // AI CFO Conversations state
  const [cfoMessages, setCfoMessages] = useState<Message[]>([
    { sender: "ai", text: "Good Evening Rajesh. I am your family's AI CFO. Let's optimize your balance sheet. Ask me any question, e.g., 'Should we invest our upcoming bonus or prepay our Home Loan?'", timestamp: "18:45" }
  ]);
  const [cfoInput, setCfoInput] = useState("");
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    "Simulate this decision", "Explain the calculations", "Create a savings plan"
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cfoMessages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) {
        setActiveTab(tab);
        setWorkspaceExpanded(true);
        setTimeout(() => {
          const el = document.getElementById("sandbox");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, []);

  // Decision Center States
  const [decisionInput, setDecisionInput] = useState("");
  const [decisionResult, setDecisionResult] = useState<any>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  // Scenario Simulator States
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [simulatedData, setSimulatedData] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Secure Vault States
  const [vaultMessages, setVaultMessages] = useState<Message[]>([
    { sender: "ai", text: "Vault System Active. I have processed your Salary Slips, Aadhaar, and HDFC Home Loan contract. Ask me metadata questions (e.g., 'When does my home loan lock-in end?')", timestamp: "18:45" }
  ]);
  const [vaultInput, setVaultInput] = useState("");

  const [demoQuery, setDemoQuery] = useState<number | null>(null);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);

  const fetchBackendData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Profile
      const profRes = await fetch("http://localhost:8000/api/v1/profile");
      if (profRes.ok) {
        const profJson = await profRes.json();
        setProfileData(profJson);
      }
      
      // 2. Fetch Brief
      const briefRes = await fetch("http://localhost:8000/api/v1/brief");
      if (briefRes.ok) {
        const briefJson = await briefRes.json();
        setBriefData(briefJson);
        setShowBriefModal(true);
      }

      // 3. Fetch Goals
      const goalsRes = await fetch("http://localhost:8000/api/v1/goals");
      if (goalsRes.ok) {
        const goalsJson = await goalsRes.json();
        setGoals(goalsJson);
      }

      // 4. Fetch Investments
      const invRes = await fetch("http://localhost:8000/api/v1/investments");
      if (invRes.ok) {
        const invJson = await invRes.json();
        setInvestments(invJson);
      }

      // 5. Fetch Insurance
      const insRes = await fetch("http://localhost:8000/api/v1/insurance");
      if (insRes.ok) {
        const insJson = await insRes.json();
        setInsurance(insJson);
      }

      // 6. Fetch Insights
      const insightsRes = await fetch("http://localhost:8000/api/v1/insights");
      if (insightsRes.ok) {
        const insightsJson = await insightsRes.json();
        setInsights(insightsJson);
      }
    } catch (err) {
      console.error("Error loading backend APIs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  const triggerSeedDemo = async () => {
    try {
      setLoading(true);
      await fetch("http://localhost:8000/api/v1/demo/seed", { method: "POST" });
      await fetchBackendData();
      setShowBriefModal(true);
    } catch (err) {
      alert("Error seeding demo data. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const runDemoQuery = (idx: number) => {
    setDemoQuery(idx);
    setDemoLoading(true);
    setTimeout(() => {
      setDemoLoading(false);
    }, 1250);
  };

  const handleCfoChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfoInput.trim()) return;

    const userText = cfoInput;
    setCfoMessages(prev => [...prev, { sender: "user", text: userText, timestamp: "Just now" }]);
    setCfoInput("");

    // Start AI CFO thinking animation steps
    setCfoThinking(true);
    setCfoStreaming(true);
    setCfoThinkingSteps([]);
    
    const steps = [
      "Analyzing cash flow...",
      "Reading financial memories...",
      "Running simulations...",
      "Comparing goals...",
      "Generating recommendation..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setCfoThinkingSteps(prev => [...prev, steps[i]]);
    }
    
    setCfoThinking(false);

    // Initialize temporary AI message for streaming
    setCfoMessages(prev => [...prev, { sender: "ai", text: "Compiling financial context...", timestamp: "Just now" }]);
    
    try {
      const response = await fetch("http://localhost:8000/api/v1/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userText })
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";

      if (reader) {
        // Clear initialization message
        setCfoMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { sender: "ai", text: "", timestamp: "Just now" };
          return next;
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          aiResponseText += chunk;
          
          setCfoMessages(prev => {
            const next = [...prev];
            if (next.length > 0) {
              next[next.length - 1] = { 
                ...next[next.length - 1], 
                text: aiResponseText 
              };
            }
            return next;
          });
        }
      }
      
      // Dynamic follow-up generation based on context keywords
      if (userText.toLowerCase().includes("regime") || userText.toLowerCase().includes("tax")) {
        setSuggestedActions(["Explain the tax calculations", "Simulate old vs new regime", "Create a tax saving SIP"]);
      } else if (userText.toLowerCase().includes("loan") || userText.toLowerCase().includes("prepay")) {
        setSuggestedActions(["Calculate interest saved", "Simulate career switch impact", "Review loan tenure delay"]);
      } else {
        setSuggestedActions(["Simulate this decision", "Review my savings plan", "View my financial health score"]);
      }

    } catch (err) {
      console.error(err);
      setCfoMessages(prev => {
        const next = [...prev];
        if (next.length > 0) {
          next[next.length - 1] = { 
            ...next[next.length - 1], 
            text: "💡 **AI CFO Analysis:** Modeling compounding outputs shows that prepaying your home loan yields an 8.75% tax-free savings rate, which matches current debt yields. Let's allocate 50% here."
          };
        }
        return next;
      });
    } finally {
      setCfoStreaming(false);
    }
  };

  const handleDecisionCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionInput.trim()) return;

    setDecisionLoading(true);
    setDecisionResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/v1/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: decisionInput })
      });
      if (response.ok) {
        const json = await response.json();
        setDecisionResult({
          impact: `⚠️ ${json.impact}`,
          cashflow: json.cashflow,
          alternatives: json.alternatives,
          score: "Confidence: 95%"
        });
      } else {
        throw new Error();
      }
    } catch {
      setDecisionResult({
        impact: "⚠️ Delaying Retirement Goal by 4 months",
        cashflow: "-₹8,500/month recurring outlay if financed",
        alternatives: "Wait until October bonus cycle to purchase in full, preserving your equity SIP run rate.",
        score: "Confidence: 94%"
      });
    } finally {
      setDecisionLoading(false);
    }
  };

  const handleScenarioSelect = async (scenario: string) => {
    setSelectedScenario(scenario);
    setSimLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenario })
      });
      if (response.ok) {
        const json = await response.json();
        setSimulatedData({
          title: json.title,
          outcome: json.outcome,
          risk_score: json.risk_score,
          chart: [
            { year: 2026, base: 4300000, sim: 4300000 },
            { year: 2027, base: 5100000, sim: scenario === "buy_car" ? 3900000 : 5350000 },
            { year: 2028, base: 6000000, sim: scenario === "buy_car" ? 4700000 : 6400000 },
            { year: 2029, base: 7000000, sim: scenario === "buy_car" ? 5700000 : 7600000 },
            { year: 2030, base: 8200000, sim: scenario === "buy_car" ? 6700000 : 9000000 }
          ]
        });
      } else {
        throw new Error();
      }
    } catch {
      setSimulatedData({
        title: scenario === "buy_car" ? "Buy ₹15 Lakh Car Scenario" : "Prepay Home Loan Scenario",
        outcome: scenario === "buy_car" 
          ? "⚠️ **Retirement Goal funding drops from 102% to 88%** if cash is liquidated. If structured via gold-loan collateral, cash flow hit is minimized."
          : "✅ **Home Loan tenure reduced by 32 months**, saving ₹8.4 Lakhs in lifetime interest outflows.",
        chart: [
          { year: 2026, base: 4300000, sim: 4300000 },
          { year: 2027, base: 5100000, sim: scenario === "buy_car" ? 3900000 : 5350000 },
          { year: 2028, base: 6000000, sim: scenario === "buy_car" ? 4700000 : 6400000 },
          { year: 2029, base: 7000000, sim: scenario === "buy_car" ? 5700000 : 7600000 },
          { year: 2030, base: 8200000, sim: scenario === "buy_car" ? 6700000 : 9000000 }
        ]
      });
    } finally {
      setSimLoading(false);
    }
  };

  const handleVaultChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultInput.trim()) return;

    const userText = vaultInput;
    setVaultMessages(prev => [...prev, { sender: "user", text: userText, timestamp: "Just now" }]);
    setVaultInput("");

    setTimeout(() => {
      let aiResponse = "🔍 **Vault Document Metadata Indexer:** Found in **HDFC_Loan_Contract.pdf**: Your home loan fixed-rate lock-in expires on **May 14, 2027**. Refinancing penalty drops to zero past this date.";
      if (userText.toLowerCase().includes("insurance")) {
        aiResponse = "🔍 **Vault Document Indexer:** Found in **ICICI_TermLife_Policy.pdf**: Next premium of ₹22,500 is due on **October 15, 2026**.";
      }
      setVaultMessages(prev => [...prev, { sender: "ai", text: aiResponse, timestamp: "Just now" }]);
    }, 900);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Compute live aggregates from database profileData or fallback to MOCK
  const totalAssets = profileData
    ? (investments.reduce((acc, curr) => acc + parseFloat(curr.current_value), 0) + parseFloat(profileData.emergency_fund) + 1850000)
    : MOCK_HOUSEHOLD.assets.reduce((acc, curr) => acc + curr.val, 0);

  const totalLiabilities = profileData
    ? 4200000
    : MOCK_HOUSEHOLD.liabilities.reduce((acc, curr) => acc + curr.outstanding, 0);

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-emerald-150 relative grid-bg-overlay overflow-x-hidden">
      
      {/* Decorative Background meshes */}
      <div className="absolute top-0 left-1/4 h-[700px] w-[700px] mesh-glow-1 pointer-events-none rounded-full" />
      <div className="absolute top-[800px] right-1/4 h-[900px] w-[900px] mesh-glow-2 pointer-events-none rounded-full" />

      {/* ---------------- ANNOUNCEMENT BANNER ---------------- */}
      <div className="bg-[#084235] text-white text-[12px] md:text-[13px] font-semibold py-3.5 px-6 text-center flex items-center justify-center gap-2 border-b border-emerald-950/20 relative z-30">
        <span className="bg-accent text-slate-950 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase animate-pulse">YC W26 Release</span>
        <span>ArthAI Financial OS is live! Sync assets, simulate decisions, and manage family cashflows.</span>
      </div>

      {/* ---------------- NAVBAR ---------------- */}
      <nav className="sticky top-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/50 px-6 py-5 relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => scrollToSection("hero")} className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="h-10 w-10 rounded-2xl bg-[#0B5D4B] flex items-center justify-center shadow-lg shadow-[#0B5D4B]/15">
              <Layers className="text-white h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-black tracking-tight text-primary">
              Arth<span className="text-accent font-extrabold">AI</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8 text-xs md:text-sm font-bold text-slate-550 tracking-wider uppercase">
            <button onClick={() => scrollToSection("features")} className="hover:text-primary transition">Features</button>
            <button onClick={() => scrollToSection("sandbox")} className="hover:text-primary transition text-primary flex items-center gap-1.5 bg-emerald-50 px-3.5 py-1.5 rounded-lg">
              <Sparkles className="h-4 w-4 text-accent animate-pulse" /> Live Simulator Sandbox
            </button>
            <button onClick={() => scrollToSection("how-it-works")} className="hover:text-primary transition">How it works</button>
            <button onClick={() => scrollToSection("demo")} className="hover:text-primary transition">AI Demo</button>
            <button onClick={() => scrollToSection("testimonials")} className="hover:text-primary transition">Reviews</button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowNotifPopover(!showNotifPopover)} 
                className="bg-slate-100 hover:bg-slate-200/80 p-3 rounded-full relative transition flex items-center justify-center"
              >
                <Bell className="h-5 w-5 text-slate-700" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-600 border border-white animate-pulse" />
              </button>
              
              <AnimatePresence>
                {showNotifPopover && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xl z-50 text-left"
                  >
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-3">AI Proactive Opportunities</p>
                    <div className="space-y-3.5">
                      <div className="border-b pb-2.5">
                        <span className="text-[9px] bg-emerald-50 text-primary font-bold px-2 py-0.5 rounded">Unused Subscription</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">Cancel unused subscription</p>
                        <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Save ₹7,200/year immediately</p>
                      </div>
                      <div className="border-b pb-2.5">
                        <span className="text-[9px] bg-emerald-50 text-primary font-bold px-2 py-0.5 rounded">Retirement Boost</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">Increase SIP contribution</p>
                        <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Shaves 1.4 years off retirement goal</p>
                      </div>
                      <div>
                        <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded">Insurance Shield</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">Renewal upcoming</p>
                        <p className="text-[10px] text-rose-700 font-bold mt-0.5">17 days remaining to avoid lapse</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={triggerSeedDemo} 
              className="bg-accent hover:bg-emerald-500 text-slate-950 hover:text-white text-xs md:text-sm font-black px-5 py-3 rounded-full transition shadow-xl uppercase tracking-widest"
            >
              Load Demo
            </button>
            <button 
              onClick={() => scrollToSection("sandbox")} 
              className="bg-primary hover:bg-[#074739] text-white text-xs md:text-sm font-bold px-7 py-3 rounded-full transition shadow-xl shadow-primary/10 uppercase tracking-widest"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ---------------- MAIN WEBSITE LANDING PAGE ---------------- */}
      <div id="hero" className="w-full relative z-10">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 lg:pt-32 lg:pb-40 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100/60 px-4 py-2 rounded-full text-xs md:text-sm font-extrabold text-primary mb-6">
              <Zap className="h-4 w-4 text-accent animate-pulse" />
              ✨ AI Financial Operating System
            </div>
            
            <h1 className="font-display text-6xl lg:text-8xl font-black text-dark tracking-tight leading-[1.15] mb-8">
              Your Family's<br/>
              <span className="designer-gradient-text font-black">AI CFO.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-550 leading-relaxed max-w-lg mb-10 font-semibold">
              We are not building an expense tracker. We are building an AI Financial Operating System that helps families make smarter financial decisions.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-16 w-full sm:w-auto">
              <button 
                onClick={() => scrollToSection("sandbox")} 
                className="bg-primary hover:bg-[#074739] text-white font-bold px-9 py-5 rounded-full transition shadow-2xl shadow-primary/20 flex items-center gap-2.5 text-xs md:text-sm uppercase tracking-widest w-full sm:w-auto justify-center"
              >
                Launch Sandbox Sandbox <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-10 pt-8 border-t border-slate-200/60 w-full max-w-xl">
              <div>
                <p className="text-3xl md:text-4xl font-black text-primary">10K+</p>
                <p className="text-xs md:text-sm text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">Active Families</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-primary">₹120Cr+</p>
                <p className="text-xs md:text-sm text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">Money Managed</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-primary">95%</p>
                <p className="text-xs md:text-sm text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">Health Index</p>
              </div>
            </div>
          </div>

          {/* HERO RIGHT COLUMN - FLOATING DECISION ENGINE */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-emerald-950 rounded-4xl opacity-90 scale-95 overflow-hidden shadow-2xl" style={{ borderRadius: "120px 40px 120px 40px" }} />
            
            <motion.div 
              initial={{ y: 10 }}
              animate={{ y: -10 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 5, ease: "easeInOut" }}
              className="relative z-10 p-6 flex justify-center items-center max-w-[430px]"
            >
              <img 
                src="/indian_user_hero.png" 
                alt="Indian user using ArthAI"
                className="rounded-3xl shadow-2xl border border-white/20 object-cover aspect-[4/5] bg-slate-900"
              />

              <div className="absolute -top-4 -left-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-150 max-w-[190px] text-left float-slower">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Family Net Worth</p>
                <p className="text-lg font-black text-primary mt-0.5">₹11.0 Lakhs</p>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="h-3.5 w-3.5" /> +12.4% this year
                </span>
              </div>

              <div className="absolute -bottom-4 -right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-150 max-w-[220px] text-left float-faster">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-primary">AI CFO Insight</p>
                </div>
                <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                  "Switch to New Regime to reallocate ₹52,400 tax into equity mutual funds."
                </p>
              </div>
            </motion.div>
          </div>
        </section>



        {/* HOW ARTHAI THINKS SECTION */}
        <section id="how-it-works" className="bg-slate-50/20 border-y border-slate-200/50 py-28 px-6 relative overflow-hidden dot-grid-bg">
          {/* Subtle radial glows */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_1000px_at_center,rgba(24,178,122,0.06),transparent)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-20 relative z-10">
            {/* Header */}
            <div className="space-y-4 text-center max-w-5xl">
              <span className="text-xs font-bold text-accent uppercase tracking-widest bg-emerald-50 border border-emerald-100/60 px-4 py-1.5 rounded-full inline-block">
                AI REASONING ENGINE
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-black text-dark tracking-tight leading-tight lg:whitespace-nowrap">
                How ArthAI Thinks Before Giving Financial Advice
              </h2>
              <p className="text-slate-550 font-semibold text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Unlike traditional finance apps, ArthAI builds context, understands your financial profile, evaluates multiple possibilities, simulates outcomes and only then generates recommendations.
              </p>
            </div>

            {/* Pipeline Visualization */}
            <div className="relative w-full max-w-6xl py-4">
              
              {/* Connecting Line (Desktop) */}
              <div className="absolute top-[56px] left-[5%] right-[5%] h-0.5 bg-slate-200/50 hidden lg:block overflow-hidden pointer-events-none">
                <div className="h-full bg-gradient-to-r from-accent via-emerald-500 to-transparent w-[30%] absolute animate-pulse-line-h" />
              </div>

              {/* Connecting Line (Mobile) */}
              <div className="absolute left-1/2 -translate-x-1/2 top-8 bottom-8 w-0.5 bg-slate-200/50 block lg:hidden overflow-hidden pointer-events-none">
                <div className="w-full bg-gradient-to-b from-accent via-emerald-500 to-transparent h-[30%] absolute animate-pulse-line-v" />
              </div>

              {/* Steps Layout */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-4 w-full"
              >
                {PIPELINE_STEPS.map((step, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ y: -6, scale: 1.015 }}
                    className="flex flex-col items-center text-center lg:w-[15.5%] relative group cursor-default bg-white/90 backdrop-blur-md border border-emerald-500/15 rounded-3xl p-6 shadow-[0_10px_35px_rgba(11,93,75,0.03)] hover:border-accent hover:shadow-[0_20px_45px_rgba(24,178,122,0.09)] transition-all duration-300"
                  >
                    {/* Node Circle */}
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center relative z-10 transition-all duration-500 group-hover:border-accent group-hover:shadow-[0_0_25px_rgba(24,178,122,0.3)] transform group-hover:scale-110">
                      <div className="absolute -inset-1 rounded-full bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none" />
                      {step.icon}
                    </div>

                    {/* Content */}
                    <div className="mt-4 space-y-2 px-1 max-w-[280px] lg:max-w-none">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-accent tracking-widest uppercase block">
                          Step {step.step}
                        </span>
                        <h4 className="font-extrabold text-dark text-sm md:text-base tracking-tight group-hover:text-primary transition-colors duration-300">
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-extrabold tracking-wide uppercase">
                          {step.subtitle}
                        </p>
                      </div>
                      
                      <p className="text-[11px] md:text-xs text-slate-500 font-semibold leading-relaxed min-h-[50px] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                        {step.description}
                      </p>
                    </div>

                    {/* Node Interactive Widget */}
                    <div className="mt-4 w-full min-h-[90px] flex items-center justify-center transform group-hover:translate-y-1 transition-transform duration-300">
                      {step.widget}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Bottom Statement */}
            <div className="border-t border-slate-200/50 pt-10 w-full max-w-6xl text-center">
              <p className="text-lg md:text-xl lg:text-2xl text-slate-500 font-medium leading-relaxed lg:whitespace-nowrap">
                Built on trusted technologies so we can focus on <span className="text-primary font-black tracking-tight underline decoration-accent/30 decoration-2 underline-offset-6">helping families make better financial decisions.</span>
              </p>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-28 text-center">
          <span className="text-xs md:text-sm font-extrabold text-primary uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full">System Architecture</span>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-dark mt-4 mb-6">Designed to reason, not just track</h2>
          <p className="text-slate-550 font-semibold max-w-xl mx-auto mb-20 text-base md:text-lg">
            Every component maps into the family context database, letting the AI reason over long-term projections.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="premium-card p-10 text-left flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-primary mb-8 shadow-sm shadow-emerald-250">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-dark font-display mb-4">AI Financial Advisor</h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-semibold">
                  Ask strategic questions (e.g. Regime shifts, home purchases) and let the model parse your balance sheet.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-xs md:text-sm font-bold text-primary flex items-center gap-1.5">
                Explore Advisory loop <ArrowUpRight className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="premium-card p-10 text-left flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-primary mb-8 shadow-sm shadow-emerald-250">
                  <LineChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-dark font-display mb-4">Future Cash Flow Forecasts</h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-semibold">
                  Predictive wealth curve modeling that integrates gold returns, mutual fund yield, and loan prepayments.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-xs md:text-sm font-bold text-primary flex items-center gap-1.5">
                View simulation curves <ArrowUpRight className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="premium-card p-10 text-left flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-primary mb-8 shadow-sm shadow-emerald-250">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-dark font-display mb-4">Goal Progress Allocator</h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-semibold">
                  Allocate liquid assets to dedicated life targets and project precise funding ratios.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-xs md:text-sm font-bold text-primary flex items-center gap-1.5">
                Manage targets <ArrowUpRight className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- INTERACTIVE LIVE SIMULATOR SANDBOX ---------------- */}
        <section id="sandbox" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-200/50 scroll-mt-24">
          <div className="text-center mb-12">
            <span className="text-xs md:text-sm font-extrabold text-primary uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full">Interactive Sandbox</span>
            <h2 className="font-display text-4xl lg:text-5xl font-black text-dark mt-4 mb-4">Launch Live Command Sandbox</h2>
            <p className="text-slate-550 font-semibold max-w-xl mx-auto text-sm md:text-base">
              Directly explore the financial operating system panels below. Switch sidebar tabs to test cashflows, scenarios, document vault questions, or family metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white border border-slate-200/60 p-8 rounded-4xl shadow-xl">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 flex flex-col gap-3">
              <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-3xl flex flex-col gap-2 max-h-[520px] overflow-y-auto">
                {SIDEBAR_ITEMS.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setWorkspaceExpanded(false); }} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs md:text-sm font-bold transition uppercase tracking-wider text-left ${
                      activeTab === item.id ? "bg-[#0B5D4B] text-white font-black shadow-md" : "text-slate-655 hover:bg-slate-100/60"
                    }`}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Interactive Workspace Panels */}
            <main className="lg:col-span-9 min-h-[480px] p-8 bg-white border border-slate-100 rounded-3xl shadow-inner relative overflow-hidden flex flex-col justify-center">
              <AnimatePresence mode="wait">
                
                {!workspaceExpanded ? (
                  <motion.div
                    key={`hub-${activeTab}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className={`p-8 rounded-3xl bg-gradient-to-br ${WORKSPACE_CARDS[activeTab]?.gradient || "from-slate-50 to-zinc-50"} border border-slate-200/60 shadow-lg relative flex flex-col justify-between min-h-[400px] w-full`}
                  >
                    {/* Floating AI badge */}
                    <div className="absolute top-6 right-6 inline-flex items-center gap-1.5 bg-white/90 border border-slate-200/40 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                      <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                      <span className="text-primary font-bold text-[10px] uppercase">AI Status: {WORKSPACE_CARDS[activeTab]?.aiStatus}</span>
                    </div>

                    <div className="space-y-6">
                      {/* Title block */}
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200/50 flex items-center justify-center text-primary shadow-sm">
                          {React.createElement(WORKSPACE_CARDS[activeTab]?.icon || LayoutDashboard, { className: "h-7 w-7" })}
                        </div>
                        <div>
                          <h3 className="font-display text-2xl font-black text-dark tracking-tight">{WORKSPACE_CARDS[activeTab]?.title}</h3>
                          <span className="text-[10px] text-slate-450 font-bold tracking-wider uppercase">{WORKSPACE_CARDS[activeTab]?.lastUpdated}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm md:text-base text-slate-655 font-semibold leading-relaxed max-w-xl">
                        {WORKSPACE_CARDS[activeTab]?.description}
                      </p>

                      {/* Quick Summary Section */}
                      {showQuickSummary === activeTab && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: "auto" }} 
                          className="p-4 bg-white/80 border border-slate-150 rounded-2xl text-xs font-semibold text-slate-600 leading-relaxed shadow-inner"
                        >
                          {WORKSPACE_CARDS[activeTab]?.quickSummary}
                        </motion.div>
                      )}

                      {/* Statistics Grid */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/30">
                        {WORKSPACE_CARDS[activeTab]?.stats.map((s, idx) => (
                          <div key={idx} className="bg-white/80 border border-slate-150/60 p-4 rounded-2xl shadow-sm">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</span>
                            <p className="text-sm md:text-base font-black text-primary mt-1">{s.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex items-center gap-3 mt-8 pt-4 border-t border-slate-200/30">
                      <button
                        onClick={() => setWorkspaceExpanded(true)}
                        className="bg-primary hover:bg-[#074739] text-white text-xs md:text-sm font-bold px-7 py-3.5 rounded-full transition shadow-lg shadow-primary/10 uppercase tracking-widest flex items-center gap-1.5"
                      >
                        {WORKSPACE_CARDS[activeTab]?.primaryCta || "Explore Workspace"} &rarr;
                      </button>
                      <button
                        onClick={() => setShowQuickSummary(showQuickSummary === activeTab ? null : activeTab)}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs md:text-sm font-bold px-6 py-3.5 rounded-full transition uppercase tracking-widest"
                      >
                        {showQuickSummary === activeTab ? "Hide Summary" : "Quick Summary"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`workspace-${activeTab}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="w-full space-y-6"
                  >
                    {/* Header with back navigation */}
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                      <button
                        onClick={() => setWorkspaceExpanded(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 transition text-xs font-bold text-slate-655"
                      >
                        &larr; Back to Hub
                      </button>
                      <span className="text-slate-350">|</span>
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                        {WORKSPACE_CARDS[activeTab]?.title} Active Workspace
                      </span>
                    </div>

                    {/* Render active workspace details */}
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div>
                            <h3 className="font-display text-xl font-black text-dark">Financial Command Center</h3>
                            <p className="text-sm text-slate-400 font-semibold mt-0.5">
                              {profileData ? `${profileData.marital_status} Profile` : "Sharma Family balance sheet summary"}
                            </p>
                          </div>
                          <span className="bg-emerald-50 text-primary border border-emerald-100 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold">
                            {briefData ? briefData.health_score : 84}/100 Health Score
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">AI Executive Briefing</p>
                            <div className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold mt-2.5 space-y-2">
                              {briefData ? (
                                <ul className="list-disc pl-4 space-y-1">
                                  {briefData.summary.map((item: string, i: number) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                  <li className="text-emerald-700 font-bold">Top recommendation: {briefData.top_recommendation}</li>
                                  <li className="text-red-700 font-bold">Biggest Risk: {briefData.biggest_risk}</li>
                                </ul>
                              ) : (
                                <p>Your HDFC home loan interest (8.75%) exceeds local debt returns. We recommend transferring ₹2.5L from your FD to pay down principal.</p>
                              )}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 flex flex-col justify-between">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Consolidated Balance (₹ Lakhs)</p>
                            <div className="h-32 mt-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                  { name: "Assets", val: Math.round(totalAssets / 100000) },
                                  { name: "Debts", val: Math.round(totalLiabilities / 100000) }
                                ]}>
                                  <XAxis dataKey="name" fontSize={10} />
                                  <YAxis fontSize={10} tickFormatter={(v) => `${v}L`} />
                                  <Bar dataKey="val" fill="#0B5D4B" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>

                        {/* Sprint 5: Weekly AI Report & Memory Timeline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          {/* Weekly AI Report Card */}
                          <div className="bg-emerald-50/30 border border-emerald-100 p-6 rounded-2xl relative overflow-hidden">
                            <span className="text-[10px] text-primary font-extrabold uppercase tracking-wider block mb-4">Weekly AI Report</span>
                            <div className="grid grid-cols-3 gap-4 mb-4 font-bold text-xs">
                              <div>
                                <span className="text-slate-400 block">Income</span>
                                <span className="text-emerald-700 text-sm">₹2.05L (↑)</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Expenses</span>
                                <span className="text-emerald-700 text-sm">₹1.42L (↓)</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Savings</span>
                                <span className="text-emerald-700 text-sm">₹63K (↑)</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Investments</span>
                                <span className="text-emerald-700 text-sm">₹2.2L (↑)</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Health Score</span>
                                <span className="text-emerald-700 text-sm">89 (+4 pts)</span>
                              </div>
                            </div>
                            <div className="bg-emerald-600 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl text-center uppercase tracking-widest mt-6">
                              Overall: Excellent Week
                            </div>
                          </div>

                          {/* AI Memory Timeline Card */}
                          <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-4">AI Memory Timeline</span>
                            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                              {[
                                { month: "March", desc: "Planned ₹15L SUV purchase." },
                                { month: "April", desc: "Started ₹12,000 equity mutual fund SIP." },
                                { month: "May", desc: "Emergency fund runway reached 4 months." },
                                { month: "June", desc: "Postponed Europe family vacation." },
                                { month: "July", desc: "Swapped to New Tax Regime (saving ₹52,400/yr)." }
                              ].map((mem, mIdx) => (
                                <div key={mIdx} className="flex gap-4 relative pl-5 text-xs font-semibold text-slate-655">
                                  <div className="absolute left-1 top-1.5 h-2 w-2 rounded-full bg-emerald-600" />
                                  <div>
                                    <span className="font-extrabold text-[10px] text-primary uppercase block">{mem.month}</span>
                                    <span className="text-slate-500">{mem.desc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "ai_cfo" && (
                      <div className="flex flex-col h-[420px] justify-between">
                        <div className="bg-emerald-50/40 border border-emerald-100/30 rounded-2xl px-4 py-2.5 mb-4 flex items-center gap-3">
                          <Brain className="h-5 w-5 text-[#0B5D4B] shrink-0 animate-pulse" />
                          <div className="text-[11px] text-left">
                            <span className="font-extrabold text-[#0B5D4B] block">Powered by ArthAI Reasoning Engine</span>
                            <span className="text-slate-500 font-bold block text-[10px] mt-0.5">Business Rules + Simulations + Memory + AI</span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                          {cfoMessages.map((m, idx) => (
                            <div key={idx} className={`flex gap-4 max-w-xl ${m.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                                m.sender === "user" ? "bg-slate-200 text-slate-700" : "bg-emerald-50 text-primary"
                              }`}>
                                {m.sender === "user" ? <User className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
                              </div>
                              <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed font-semibold border ${
                                m.sender === "user" ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-white border-slate-150 text-slate-700"
                              }`}>
                                <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                                
                                {m.sender === "ai" && (
                                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase">
                                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">Confidence: 96%</span>
                                      <span>42 signals | 6 simulations | 3 memories</span>
                                    </div>
                                    <details className="text-[11px] text-slate-550 mt-1 cursor-pointer">
                                      <summary className="font-bold text-primary hover:underline">Explain Why (CFO Reason)</summary>
                                      <div className="mt-2 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-150/60 font-semibold text-slate-655">
                                        <div>🛡️ Emergency: Unaffected</div>
                                        <div>📊 Cash Flow: positive delta</div>
                                        <div>🎯 Goal Timeline: +2m ahead</div>
                                        <div>⚠️ Risk Index: Low risk</div>
                                      </div>
                                    </details>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {cfoThinking && (
                            <div className="flex gap-4 max-w-xl">
                              <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-primary">
                                <Brain className="h-5 w-5 animate-pulse" />
                              </div>
                              <div className="p-4 rounded-2xl bg-white border border-slate-150 text-xs md:text-sm font-semibold text-slate-700 w-full space-y-2">
                                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider animate-pulse">AI CFO Pipeline Routing</p>
                                <div className="space-y-1.5 mt-2">
                                  {cfoThinkingSteps.map((step, sIdx) => (
                                    <div key={sIdx} className="flex items-center gap-2 text-emerald-700">
                                      <span className="text-xs">✓</span>
                                      <span className="font-semibold">{step}</span>
                                    </div>
                                  ))}
                                  {cfoThinkingSteps.length < 5 && (
                                    <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-ping" />
                                      <span className="font-bold">Next pipeline stage...</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Suggested Follow-up Actions */}
                        <div className="flex gap-2 flex-wrap px-1 mb-2 pt-2">
                          {suggestedActions.map((act, idx) => (
                            <button
                              key={idx}
                              type="button"
                              disabled={cfoThinking || cfoStreaming}
                              onClick={() => {
                                setCfoInput(act);
                              }}
                              className={`text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full transition ${
                                (cfoThinking || cfoStreaming)
                                  ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-655"
                              }`}
                            >
                              {act}
                            </button>
                          ))}
                        </div>

                        <form onSubmit={handleCfoChat} className="p-3 border-t border-slate-100 flex gap-2 mt-2 bg-slate-50/50 rounded-2xl">
                          <input 
                            type="text" 
                            disabled={cfoThinking || cfoStreaming}
                            placeholder={(cfoThinking || cfoStreaming) ? "AI CFO is thinking..." : "Ask your AI CFO about tax regime swaps or goal shortfalls..."}
                            value={cfoInput}
                            onChange={(e) => setCfoInput(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-primary text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                          <button 
                            type="submit" 
                            disabled={cfoThinking || cfoStreaming || !cfoInput.trim()}
                            className="bg-primary hover:bg-[#074739] text-white p-3.5 rounded-2xl transition disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </form>
                      </div>
                    )}

                    {activeTab === "cash_flow" && (
                      <div className="space-y-6">
                        <h3 className="font-display text-base font-bold text-slate-700">Cash Flow Projections</h3>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Income Streams</span>
                            <p className="text-lg md:text-xl font-black text-primary mt-1.5">
                              ₹{profileData ? parseFloat(profileData.monthly_income).toLocaleString("en-IN") : "2,05,000"}/mo
                            </p>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Burn Rate</span>
                            <p className="text-lg md:text-xl font-black text-red-655 mt-1.5">
                              ₹{profileData ? parseFloat(profileData.monthly_expenses).toLocaleString("en-IN") : "1,42,000"}/mo
                            </p>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Savings Buffer</span>
                            <p className="text-lg md:text-xl font-black text-accent mt-1.5">
                              ₹{profileData ? parseFloat(profileData.monthly_savings).toLocaleString("en-IN") : "63,000"}/mo
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "goals" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="font-display text-base font-bold text-slate-700">Live Goal Tracker</h3>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">Updated from balance sheet</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {(goals.length > 0 ? goals : MOCK_HOUSEHOLD.goals).map((g: any, idx) => (
                            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h4 className="text-sm font-black text-slate-800">{g.goal_name || g.name}</h4>
                                <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider bg-slate-105 px-2.5 py-0.5 rounded-full inline-block mt-1">
                                  {g.status || "Active"} | Priority: {g.priority || "Medium"}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm md:text-base font-black text-primary">
                                  ₹{((g.saved_amount || 0) / 100000).toFixed(1)}L / {((g.target_amount || g.target) / 100000).toFixed(1)}L
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Contribution: ₹{(g.monthly_contribution || 0).toLocaleString("en-IN")}/mo</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "investments" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="font-display text-base font-bold text-slate-700">Portfolio allocations</h3>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">Dynamic yield tracking</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(investments.length > 0 ? investments : MOCK_HOUSEHOLD.assets).map((a: any, idx) => (
                            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-150 relative overflow-hidden">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{a.investment_type || a.type}</span>
                              <p className="text-lg font-black text-slate-800 mt-1">₹{parseFloat(a.current_value || a.val).toLocaleString("en-IN")}</p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-2">
                                <span>Platform: {a.platform || a.inst}</span>
                                <span className="text-emerald-600">+{a.expected_return || 12}% return</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "insurance" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="font-display text-base font-bold text-slate-700">Insurance Shield</h3>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">10x Income Protection recommended</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {(insurance.length > 0 ? insurance : [
                            { policy_name: "Star Health Optima", provider: "Star Health", coverage: 1000000, premium: 20000 },
                            { policy_name: "ICICI Lombard Car Shield", provider: "ICICI Lombard", coverage: 1500000, premium: 18000 }
                          ]).map((ins: any, idx) => (
                            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex justify-between items-center">
                              <div>
                                <h4 className="text-sm font-black text-slate-800">{ins.policy_name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Provider: {ins.provider}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-primary">₹{(parseFloat(ins.coverage) / 100000).toFixed(1)}L Cover</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Premium: ₹{parseFloat(ins.premium).toLocaleString("en-IN")}/yr</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "health" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="font-display text-base font-bold text-slate-700">Explainable Financial Health Score</h3>
                          <span className="text-2xl font-black text-primary">
                            {briefData ? briefData.health_score : 84}/100
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {briefData?.health_score_breakdown ? (
                            Object.entries(briefData.health_score_breakdown).map(([k, v]: [string, any]) => (
                              <div key={k} className="bg-slate-50 p-4.5 rounded-2xl border border-slate-150">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k} Score</span>
                                <p className="text-lg font-black text-primary mt-1">{v} pts</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500 font-semibold">Seed the demo account to view explainable components.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "simulator" && (
                      <div className="space-y-6">
                        <h3 className="font-display text-base font-bold text-slate-700">Scenario Simulator Sandbox</h3>
                        
                        {/* Financial Timeline Roadmap */}
                        <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl mb-4 overflow-x-auto">
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-4">Financial Timeline Roadmap</p>
                          <div className="flex gap-4 min-w-[600px] py-2 relative before:absolute before:left-4 before:right-4 before:top-[20px] before:h-0.5 before:bg-slate-200">
                            {[
                              { label: "Today", val: "₹11.0L NW", color: "bg-emerald-600" },
                              { label: "Salary", val: "₹2.05L/mo", color: "bg-emerald-500" },
                              { label: "Home EMI", val: "₹42K/mo", color: "bg-red-500" },
                              { label: "Bonus Cycle", val: "Oct 2026", color: "bg-emerald-500" },
                              { label: "SUV Goal", val: "₹15L (2027)", color: "bg-amber-500" },
                              { label: "Home Paid", val: "Prepaid (2029)", color: "bg-primary" },
                              { label: "Retirement", val: "₹1.85Cr (2045)", color: "bg-primary" }
                            ].map((step, idx) => (
                              <div key={idx} className="flex-1 flex flex-col items-center text-center relative z-10">
                                <div className={`h-8 w-8 rounded-full ${step.color} text-white flex items-center justify-center font-bold text-xs shadow`}>
                                  {idx + 1}
                                </div>
                                <span className="text-[10px] font-extrabold text-slate-800 mt-2 block leading-none">{step.label}</span>
                                <span className="text-[9px] text-slate-450 font-bold block mt-1">{step.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { id: "buy_car", label: "Purchase SUV" },
                            { id: "buy_home", label: "Purchase House" },
                            { id: "career_switch", label: "Career Switch" },
                            { id: "medical", label: "Medical Emergency" }
                          ].map((scen) => (
                            <button
                              key={scen.id}
                              onClick={() => handleScenarioSelect(scen.id)}
                              className={`p-4 rounded-2xl border text-xs font-bold transition text-center ${
                                selectedScenario === scen.id
                                  ? "bg-primary border-primary text-white shadow-md"
                                  : "bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100"
                              }`}
                            >
                              {scen.label}
                            </button>
                          ))}
                        </div>

                        {simLoading && (
                          <div className="text-center py-6">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-[10px] text-slate-400 font-bold">Simulating compound balances...</p>
                          </div>
                        )}

                        {simulatedData && !simLoading && (
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-4">
                            <h4 className="text-sm font-black text-slate-800">{simulatedData.title}</h4>
                            <p className="text-xs md:text-sm text-slate-655 leading-relaxed font-semibold">
                              {simulatedData.outcome}
                            </p>
                            <div className="h-32 mt-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={simulatedData.chart}>
                                  <XAxis dataKey="year" fontSize={9} />
                                  <YAxis fontSize={9} />
                                  <Tooltip />
                                  <Bar dataKey="base" name="Baseline NW" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="sim" name="Simulated NW" fill="#0B5D4B" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "vault" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="font-display text-base font-bold text-slate-700">Secure Document Vault</h3>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">Supabase Storage Active</span>
                        </div>
                        <div className="space-y-3">
                          {[
                            { name: "HDFC_Home_Loan_Agreement.pdf", type: "Contract", size: "2.4 MB" },
                            { name: "Star_Health_Policy_Oct2025.pdf", type: "Insurance", size: "1.8 MB" },
                            { name: "SalarySlip_June2026.pdf", type: "Income", size: "850 KB" }
                          ].map((doc, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FolderOpen className="h-5 w-5 text-emerald-700" />
                                <div>
                                  <p className="text-xs font-black text-slate-800">{doc.name}</p>
                                  <p className="text-[9px] text-slate-450 font-bold uppercase">{doc.type} | {doc.size}</p>
                                </div>
                              </div>
                              <button onClick={() => alert("Signed URL generated for document download!")} className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition">
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "twin" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="font-display text-base font-bold text-slate-700">AI Financial Twin Projections</h3>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">10-Year Projections Active</span>
                        </div>
                        
                        <div className="space-y-4">
                          {[
                            { year: "2027 (1 Year)", nw: "₹24.5 Lakhs", goal: "SUV fund completed", score: "89/100" },
                            { year: "2030 (3 Years)", nw: "₹68.2 Lakhs", goal: "Home loan fully prepaid", score: "93/100" },
                            { year: "2035 (8 Years)", nw: "₹1.85 Crores", goal: "Retirement goal on track (94% prob)", score: "97/100" }
                          ].map((cp, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                              <div className="flex items-center gap-4">
                                <span className="bg-emerald-600 text-white font-extrabold px-3 py-1 rounded-xl text-xs">{cp.year}</span>
                                <div>
                                  <p className="text-sm font-black text-slate-800">{cp.nw} Projected Net Worth</p>
                                  <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">{cp.goal}</p>
                                </div>
                              </div>
                              <span className="text-xs font-black text-primary bg-emerald-50 border border-emerald-100 px-3.5 py-1 rounded-full">
                                {cp.score} Health
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs font-semibold text-emerald-800 leading-relaxed">
                          "If current family savings behavior continues, your Home Goal is projected to be fully funded by March 2029, shaving 8 months off initial estimates."
                        </div>
                      </div>
                    )}

                    {activeTab === "decision_center" && (
                      <div className="space-y-6">
                        <h3 className="font-display text-base font-bold text-slate-700">Decision Center</h3>
                        <form onSubmit={handleDecisionCenter} className="space-y-3">
                          <input
                            type="text"
                            placeholder="Can I buy a ₹15 Lakh SUV next year?"
                            value={decisionInput}
                            onChange={(e) => setDecisionInput(e.target.value)}
                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-primary text-slate-800"
                          />
                          <button type="submit" className="w-full bg-primary hover:bg-[#074739] text-white py-3 rounded-2xl transition font-black text-xs uppercase tracking-wider">
                            Evaluate Purchase Affordability &rarr;
                          </button>
                        </form>

                        {decisionLoading && (
                          <div className="text-center py-6">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-[10px] text-slate-400 font-bold">Simulating target asset liquidation...</p>
                          </div>
                        )}

                        {decisionResult && !decisionLoading && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-2xl shadow-sm">
                              <span className="text-[9px] text-rose-700 font-extrabold uppercase">Impact Metrics</span>
                              <p className="text-xs font-bold text-rose-800 mt-2">{decisionResult.impact}</p>
                              <p className="text-xs font-semibold text-rose-655 mt-1">{decisionResult.cashflow}</p>
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
                              <span className="text-[9px] text-emerald-700 font-extrabold uppercase">CFO Alternatives</span>
                              <p className="text-xs font-semibold text-emerald-800 mt-2 leading-relaxed">{decisionResult.alternatives}</p>
                              <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full inline-block mt-2 font-bold">{decisionResult.score}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "insights" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="font-display text-base font-bold text-slate-700">Chronological AI Insights Feed</h3>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">3 active insights</span>
                        </div>
                        <div className="space-y-3">
                          {(insights.length > 0 ? insights : [
                            { category: "Tax", title: "Switch to New Tax Regime", description: "Switching saves ₹52,400 in direct taxes based on standard salary parameters.", priority: "High" },
                            { category: "Debt", title: "HDFC Home Loan Prepayment Advantage", description: "An extra EMI payment shaves off 32 months of tenure and saves ₹8.4 Lakhs in interest.", priority: "Medium" }
                          ]).map((ins: any, idx) => (
                            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex flex-col justify-between relative">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">{ins.category}</span>
                                  <h4 className="text-sm font-black text-slate-800 mt-2">{ins.title}</h4>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  ins.priority === "High" ? "bg-red-50 text-red-700 border border-red-100" : "bg-slate-100 text-slate-655"
                                }`}>
                                  {ins.priority} Priority
                                </span>
                              </div>
                              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold mt-3">{ins.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </main>
          </div>
        </section>



        {/* AI DEMO INTERACTIVE */}
        <section id="demo" className="max-w-5xl mx-auto px-6 py-28 border-t border-slate-200/50">
          <div className="text-center mb-12">
            <span className="text-xs md:text-sm font-extrabold text-primary uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full">Live Simulation</span>
            <h2 className="font-display text-4xl lg:text-5xl font-black text-dark mt-4">Ask your AI CFO</h2>
            <p className="text-slate-550 font-semibold mt-3 max-w-xl mx-auto text-sm md:text-base">
              Ask real financial questions and watch ArthAI simulate the impact before you make a decision.
            </p>
          </div>

          {/* Two Columns: Left (Illustration), Right (Simulation Card) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch mb-16">
            
            {/* Left Column: Family Illustration */}
            <div className="flex items-center justify-center relative overflow-hidden rounded-4xl bg-slate-50 border border-slate-200/60 p-4 shadow-sm">
              <img 
                src="/family_planning_cfo.png" 
                alt="Happy Indian family planning finances" 
                className="w-full h-full object-cover rounded-3xl shadow-md aspect-[4/3] max-h-[380px] lg:max-h-full"
              />
            </div>

            {/* Right Column: Simulation Card */}
            <div className="bg-white rounded-4xl border border-slate-200/60 p-8 min-h-[320px] flex flex-col justify-center shadow-xl relative overflow-hidden">
              {/* Background image overlay */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <img 
                  src="/family_finance_cfo.png" 
                  alt="" 
                  className="w-full h-full object-cover opacity-[0.06] filter grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/90 to-transparent" />
              </div>
              
              <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-50 rounded-full blur-3xl pointer-events-none z-0" />
              
              <AnimatePresence mode="wait">
                {demoLoading ? (
                  <motion.div key="loading" className="text-center py-8 relative z-10">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-xs text-slate-450 font-bold">Modeling compound returns...</p>
                  </motion.div>
                ) : demoQuery !== null ? (
                  <motion.div key="ans" className="space-y-6 text-xs md:text-sm font-semibold text-slate-655 relative z-10">
                    <div dangerouslySetInnerHTML={{ __html: PRESETS[demoQuery].a.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      {PRESETS[demoQuery].metrics.map((m, mIdx) => (
                        <div key={mIdx} className="bg-slate-50 border border-slate-150/40 p-4 rounded-2xl">
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase">{m.label}</p>
                          <p className="text-base font-black text-primary mt-1">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-left space-y-6 relative z-10">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Active Simulation Session</span>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    
                    <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed">
                      ArthAI actively optimizes your household balance sheet by calculating structural differences between income streams and investments. Select a preset query below to see live calculations.
                    </p>
                    
                    {/* High fidelity comparison mockup block */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/90 border border-slate-150 p-4.5 rounded-2xl relative overflow-hidden backdrop-blur-sm">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase">Old Regime Path</span>
                        <p className="text-base font-black text-slate-700 mt-1">₹2,48,500</p>
                      </div>
                      <div className="bg-emerald-50/90 border border-emerald-100 p-4.5 rounded-2xl relative overflow-hidden backdrop-blur-sm">
                        <span className="text-[9px] text-primary font-extrabold uppercase">New Regime</span>
                        <p className="text-base font-black text-primary mt-1">₹1,96,100</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/90 border border-slate-150/60 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-655 backdrop-blur-sm">
                      <span className="flex items-center gap-1.5"><Zap className="h-4.5 w-4.5 text-accent animate-pulse" /> +₹9.6L wealth delta simulated over 10 years</span>
                      <ChevronRight className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Suggested AI Questions Section */}
          <div className="pt-6 border-t border-slate-200/50">
            <h3 className="font-display text-lg font-bold text-slate-500 uppercase tracking-widest mb-6">Suggested AI Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => { runDemoQuery(idx); scrollToSection("demo"); }}
                  className={`text-left p-6 rounded-3xl border text-xs md:text-sm font-bold transition flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg ${
                    demoQuery === idx
                      ? "bg-primary border-primary text-white shadow-xl shadow-primary/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-accent hover:shadow-emerald-100/50"
                  }`}
                >
                  <span className="pr-4 leading-snug">{preset.q}</span>
                  <ChevronRight className="h-5 w-5 shrink-0 opacity-70 group-hover:translate-x-1 transition" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="max-w-5xl mx-auto px-6 py-28 border-t border-slate-200/50 text-center">
          <span className="text-xs md:text-sm font-extrabold text-primary uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full">Testimonials</span>
          <h2 className="font-display text-4xl font-black text-dark mt-4 mb-16">Trusted by Indian households</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            <div className="premium-card p-10 flex flex-col justify-between">
              <p className="text-sm md:text-base text-slate-555 font-semibold leading-relaxed mb-8">
                "ArthAI helped us realize switching to the New Tax Regime and channeling the ₹4,000 monthly tax savings directly into equity mutual funds would add over ₹9 Lakhs to Aarav's education fund."
              </p>
              <div className="flex items-center gap-3">
                <img src="/avatar_1.png" alt="Aishwarya Nair" className="h-11 w-11 rounded-full border border-slate-200 bg-slate-150" />
                <div>
                  <h4 className="text-sm font-bold text-dark">Aishwarya Nair</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Software Dev, Bangalore</p>
                </div>
              </div>
            </div>

            <div className="premium-card p-10 flex flex-col justify-between">
              <p className="text-sm md:text-base text-slate-555 font-semibold leading-relaxed mb-8">
                "Instead of taking a high-interest car loan, ArthAI recommended utilizing a Gold Loan against our ancestral gold. That single recommendation saved us ₹1.8 Lakhs in interest outflows."
              </p>
              <div className="flex items-center gap-3">
                <img src="/avatar_2.png" alt="Rajesh Sharma" className="h-11 w-11 rounded-full border border-slate-200 bg-slate-150" />
                <div>
                  <h4 className="text-sm font-bold text-dark">Rajesh Sharma</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Business Owner, Pune</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#084235] text-white py-20 px-6 border-t border-emerald-950 relative z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Layers className="text-accent h-4.5 w-4.5" />
                </div>
                <span className="font-display text-xl font-bold">ArthAI</span>
              </div>
              <p className="text-xs md:text-sm text-emerald-150 font-semibold leading-relaxed">
                AI-powered Financial Operating System for the Indian Middle Class.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-6">Features</h4>
              <ul className="space-y-3 text-xs md:text-sm text-emerald-100 font-semibold">
                <li><a href="/tax-regime-planner" className="hover:text-white">Tax Regime Planner</a></li>
                <li><a href="/gold-asset-tracking" className="hover:text-white">Gold Asset Tracking</a></li>
                <li><a href="/decision-simulation" className="hover:text-white">Decision Simulation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-6">Company</h4>
              <ul className="space-y-3 text-xs md:text-sm text-emerald-100 font-semibold">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-6">Legal</h4>
              <ul className="space-y-3 text-xs md:text-sm text-emerald-100 font-semibold">
                <li><a href="#" className="hover:text-white">Security & Encryption</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-8 border-t border-emerald-900 text-center text-xs md:text-sm text-emerald-300/80 font-bold">
            © {new Date().getFullYear()} ArthAI Financial Technologies Private Limited. All rights reserved.
          </div>
        </footer>

      </div>

      {/* Morning Brief Modal Overlay */}
      <AnimatePresence>
        {showBriefModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl border border-slate-200/80 max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="font-display text-2xl font-black text-dark">Good Evening, Rajesh.</h3>
                  <p className="text-xs text-slate-450 font-semibold mt-1">While you were away, I analyzed your financial activity.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl text-center">
                  <span className="block text-2xl font-black text-primary">89</span>
                  <span className="text-[9px] text-emerald-700 font-extrabold uppercase">+4 this month</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-emerald-50/40 border border-emerald-100/60 p-5 rounded-2xl">
                  <h4 className="text-[10px] text-emerald-750 font-extrabold uppercase tracking-wider mb-3">Wins</h4>
                  <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-2 text-emerald-800">
                      <span>✔</span> Savings increased by ₹12,000
                    </li>
                    <li className="flex items-center gap-2 text-emerald-800">
                      <span>✔</span> Dining expenses reduced by 14%
                    </li>
                    <li className="flex items-center gap-2 text-emerald-800">
                      <span>✔</span> Home goal moved ahead by 2 months
                    </li>
                  </ul>
                </div>

                <div className="bg-rose-50/40 border border-rose-100/60 p-5 rounded-2xl">
                  <h4 className="text-[10px] text-rose-750 font-extrabold uppercase tracking-wider mb-3">Attention Required</h4>
                  <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-2 text-rose-800">
                      <span>⚠️</span> Insurance renewal in 18 days
                    </li>
                    <li className="flex items-center gap-2 text-rose-800">
                      <span>⚠️</span> Electricity spending increased
                    </li>
                    <li className="flex items-center gap-2 text-rose-800">
                      <span>⚠️</span> One subscription appears unused
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl mb-8 flex justify-between items-center">
                <div>
                  <h5 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Suggested Next Action</h5>
                  <p className="text-xs font-black text-slate-800 mt-1">Increase your equity SIP outlay by ₹3,000/mo.</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-primary font-bold uppercase block">Retirement Improvement</span>
                  <span className="text-sm font-black text-primary">+1.4 years</span>
                </div>
              </div>

              <button 
                onClick={() => setShowBriefModal(false)}
                className="w-full bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs font-bold py-4 rounded-2xl transition uppercase tracking-widest animate-pulse"
              >
                Access Command Center
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
