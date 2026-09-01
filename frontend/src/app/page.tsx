"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { apiFetch, apiGet, apiPost, apiDelete } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { MOCK_HOUSEHOLD, PRESETS, SIDEBAR_ITEMS, WORKSPACE_CARDS } from "@/lib/constants";

// --- Type Declarations & Mock Data ---
interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [workspaceExpanded, setWorkspaceExpanded] = useState<boolean>(false);
  const [showQuickSummary, setShowQuickSummary] = useState<string | null>(null);

  // Sandbox simulation states
  const [showNotifPopover, setShowNotifPopover] = useState<boolean>(false);
  const [demoQuery, setDemoQuery] = useState<number | null>(null);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has active session to show Go to Dashboard button
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
    };
    checkSession();
  }, []);

  const runDemoQuery = (idx: number) => {
    setDemoQuery(idx);
    setDemoLoading(true);
    setTimeout(() => {
      setDemoLoading(false);
    }, 1250);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
                    <p className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider mb-3">AI Proactive Opportunities</p>
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

            {isAuthenticated ? (
              <Link 
                href="/dashboard" 
                className="bg-primary hover:bg-[#074739] text-white text-xs md:text-sm font-bold px-7 py-3 rounded-full transition shadow-xl shadow-primary/10 uppercase tracking-widest flex items-center justify-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-bold px-5 py-3 rounded-full transition uppercase tracking-widest"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-primary hover:bg-[#074739] text-white text-xs md:text-sm font-bold px-7 py-3 rounded-full transition shadow-xl shadow-primary/10 uppercase tracking-widest flex items-center justify-center"
                >
                  Get Started
                </Link>
              </>
            )}
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
                Launch Simulation Sandbox <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-10 pt-8 border-t border-slate-200/60 w-full max-w-xl">
              <div>
                <p className="text-3xl md:text-4xl font-black text-primary">10K+</p>
                <p className="text-xs md:text-sm text-slate-450 font-semibold mt-1.5 uppercase tracking-wider">Active Families</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-primary">₹120Cr+</p>
                <p className="text-xs md:text-sm text-slate-450 font-semibold mt-1.5 uppercase tracking-wider">Money Managed</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-primary">95%</p>
                <p className="text-xs md:text-sm text-slate-450 font-semibold mt-1.5 uppercase tracking-wider">Health Index</p>
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
                alt="ArthAI Advisory Loop" 
                className="w-full h-auto rounded-3xl object-contain drop-shadow-2xl border border-white/10" 
                style={{ borderRadius: "80px 30px 80px 30px" }}
              />
            </motion.div>
          </div>
        </section>

        {/* PIPELINE ARCHITECTURE (How It Works) */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-28 border-t border-slate-200/50 text-center">
          <span className="text-xs md:text-sm font-extrabold text-primary uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full">Pipeline Flow</span>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-dark mt-4 mb-6">How ArthAI processes your request</h2>
          <p className="text-slate-550 font-semibold max-w-xl mx-auto mb-20 text-sm md:text-base">
            From user input to actionable personalized advice, our system utilizes security layers and a mathematical reasoning engine.
          </p>

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
                    
                    <p className="text-[11px] md:text-xs text-slate-550 font-semibold leading-relaxed min-h-[50px] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
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
                            <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">{s.label}</span>
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
                        {WORKSPACE_CARDS[activeTab]?.title} Sandbox Workspace
                      </span>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl text-xs font-semibold text-slate-700 space-y-2">
                      <h4 className="font-black text-amber-800">Sandbox Preview Mode Only</h4>
                      <p>
                        This sandbox is a public preview using synthetic data. If you want to use the live system with actual files, mutual funds, and custom goals, please register a secure account.
                      </p>
                      <div className="pt-2">
                        <Link 
                          href="/register" 
                          className="bg-primary hover:bg-[#074739] text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] transition inline-block"
                        >
                          Unlock Complete Product
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>

          {/* Suggested AI Questions Section */}
          <div className="pt-6 border-t border-slate-200/50">
            <h3 className="font-display text-lg font-bold text-slate-500 uppercase tracking-widest mb-6">Suggested AI Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => { runDemoQuery(idx); scrollToSection("sandbox"); }}
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
              <p className="text-sm md:text-base text-slate-550 font-semibold leading-relaxed mb-8">
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

    </div>
  );
}
