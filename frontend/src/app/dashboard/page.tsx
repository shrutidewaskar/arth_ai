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
import { SIDEBAR_ITEMS, WORKSPACE_CARDS } from "@/lib/constants";

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
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
  const [summaryData, setSummaryData] = useState<any>(null);
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [insurance, setInsurance] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [feasibilityData, setFeasibilityData] = useState<any>(null);
  const [actionPlansData, setActionPlansData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // AI CFO Conversations state
  const [cfoMessages, setCfoMessages] = useState<Message[]>([
    { sender: "ai", text: "Good Evening Rajesh. I am your family's AI CFO. Let's optimize your balance sheet. Ask me any question, e.g., 'Should we invest our upcoming bonus or prepay our Home Loan?'", timestamp: "18:45" }
  ]);
  const [cfoInput, setCfoInput] = useState("");
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    "Simulate this decision", "Explain the calculations", "Create a savings plan"
  ]);

  // Decision Center States
  const [decisionInput, setDecisionInput] = useState("");
  const [decisionResult, setDecisionResult] = useState<any>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  // Scenario Simulator States
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [simulatedData, setSimulatedData] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simType, setSimType] = useState<string>("NEW_LIABILITY");
  const [simIncomeType, setSimIncomeType] = useState<string>("percentage");
  const [simIncomeVal, setSimIncomeVal] = useState<number>(10);
  const [simExpenseType, setSimExpenseType] = useState<string>("absolute");
  const [simExpenseVal, setSimExpenseVal] = useState<number>(15000);
  const [simLoanPrincipal, setSimLoanPrincipal] = useState<number>(1500000);
  const [simLoanInterest, setSimLoanInterest] = useState<number>(8.5);
  const [simLoanTenure, setSimLoanTenure] = useState<number>(5);
  const [simLoanAssetVal, setSimLoanAssetVal] = useState<number>(1500000);
  const [simInvestVal, setSimInvestVal] = useState<number>(10000);

  // Scenario Comparison States
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [optAType, setOptAType] = useState<string>("NEW_LIABILITY");
  const [optAIncomeType, setOptAIncomeType] = useState<string>("percentage");
  const [optAIncomeVal, setOptAIncomeVal] = useState<number>(10);
  const [optAExpenseType, setOptAExpenseType] = useState<string>("absolute");
  const [optAExpenseVal, setOptAExpenseVal] = useState<number>(15000);
  const [optALoanPrincipal, setOptALoanPrincipal] = useState<number>(1500000);
  const [optALoanInterest, setOptALoanInterest] = useState<number>(8.5);
  const [optALoanTenure, setOptALoanTenure] = useState<number>(5);
  const [optALoanAssetVal, setOptALoanAssetVal] = useState<number>(1500000);
  const [optAInvestVal, setOptAInvestVal] = useState<number>(10000);

  const [optBType, setOptBType] = useState<string>("INVESTMENT_CONTRIBUTION");
  const [optBIncomeType, setOptBIncomeType] = useState<string>("percentage");
  const [optBIncomeVal, setOptBIncomeVal] = useState<number>(15);
  const [optBExpenseType, setOptBExpenseType] = useState<string>("absolute");
  const [optBExpenseVal, setOptBExpenseVal] = useState<number>(5000);
  const [optBLoanPrincipal, setOptBLoanPrincipal] = useState<number>(500000);
  const [optBLoanInterest, setOptBLoanInterest] = useState<number>(9.0);
  const [optBLoanTenure, setOptBLoanTenure] = useState<number>(3);
  const [optBLoanAssetVal, setOptBLoanAssetVal] = useState<number>(500000);
  const [optBInvestVal, setOptBInvestVal] = useState<number>(20000);

  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // Secure Vault States
  const [vaultDocuments, setVaultDocuments] = useState<any[]>([]);
  const [vaultMessages, setVaultMessages] = useState<Message[]>([
    { sender: "ai", text: "Vault System Active. I have processed your Salary Slips, Aadhaar, and HDFC Home Loan contract. Ask me metadata questions (e.g., 'When does my home loan lock-in end?')", timestamp: "18:45" }
  ]);
  const [vaultInput, setVaultInput] = useState("");

  const [demoQuery, setDemoQuery] = useState<number | null>(null);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cfoMessages]);

  const fetchBackendData = async () => {
    try {
      setLoading(true);
      
      // Fetch documents list from backend
      try {
        const docRes = await apiGet("/api/v1/documents");
        if (docRes.ok) {
          const docJson = await docRes.json();
          setVaultDocuments(docJson);
        }
      } catch (err) {
        console.error("Error loading documents:", err);
      }
      
      // 1. Fetch Onboarding Status
      const statusRes = await apiGet("/api/v1/onboarding/status");
      if (statusRes.ok) {
        const statusJson = await statusRes.json();
        if (!statusJson.complete) {
          router.replace("/onboarding");
          return;
        }
      }
      
      // 2. Fetch authoritative dashboard summary snapshot
      const summaryRes = await apiGet("/api/v1/dashboard/summary");
      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        setSummaryData(summaryJson);
        
        // Backwards compatibility bindings
        setProfileData({
          marital_status: "Personalized",
          emergency_fund: summaryJson.net_worth.total_assets
        });
        setGoals(summaryJson.goals);
      } else {
        console.error("Dashboard summary API fetch failed with status code:", summaryRes.status);
      }

      // Fetch Financial Diagnosis report
      try {
        const diagRes = await apiGet("/api/v1/financial-diagnosis");
        if (diagRes.ok) {
          const diagJson = await diagRes.json();
          setDiagnosisData(diagJson);
        }
      } catch (diagErr) {
        console.error("Error fetching financial diagnosis details:", diagErr);
      }

      // Fetch Goals Feasibility report
      try {
        const feasibilityRes = await apiGet("/api/v1/goals/feasibility");
        if (feasibilityRes.ok) {
          const feasibilityJson = await feasibilityRes.json();
          setFeasibilityData(feasibilityJson);
        }
      } catch (feasibilityErr) {
        console.error("Error fetching goals feasibility data:", feasibilityErr);
      }

      // Fetch Action Plans
      try {
        const actionPlansRes = await apiPost("/api/v1/action-plans", {});
        if (actionPlansRes.ok) {
          const actionPlansJson = await actionPlansRes.json();
          setActionPlansData(actionPlansJson);
        }
      } catch (actionPlansErr) {
        console.error("Error fetching action plans:", actionPlansErr);
      }
      
      // 3. Fetch Brief
      const briefRes = await apiGet("/api/v1/brief");
      if (briefRes.ok) {
        const briefJson = await briefRes.json();
        setBriefData(briefJson);
        setShowBriefModal(true);
      }

      // 4. Fetch Insights
      const insightsRes = await apiGet("/api/v1/insights");
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
      await apiPost("/api/v1/demo/seed", {});
      await fetchBackendData();
      setShowBriefModal(true);
    } catch (err) {
      alert("Error seeding demo data. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
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
      const response = await apiPost("/api/v1/cfo/query", { query: userText });

      if (!response.ok) throw new Error("API error");

      const json = await response.json();
      let richText = json.answer || "";
      
      if (json.assessment) {
        richText += `\n\n**Assessment**: \`${json.assessment.label}\` (Severity: ${json.assessment.severity})`;
      }
      if (json.key_facts && json.key_facts.length > 0) {
        richText += `\n\n**Key Metrics Considered**:`;
        json.key_facts.forEach((f: any) => {
          richText += `\n- **${f.label}**: ${f.value.toLocaleString()} ${f.unit || ""}`;
        });
      }
      if (json.recommendation) {
        richText += `\n\n**CFO Action Step**: ${json.recommendation}`;
      }
      if (json.reasons && json.reasons.length > 0) {
        richText += `\n\n**Reasons**:`;
        json.reasons.forEach((r: string) => {
          richText += `\n- ${r}`;
        });
      }
      if (json.tradeoffs && json.tradeoffs.length > 0) {
        richText += `\n\n**Tradeoffs**:`;
        json.tradeoffs.forEach((t: string) => {
          richText += `\n- ⚖️ ${t}`;
        });
      }
      if (json.evidence_used && json.evidence_used.length > 0) {
        richText += `\n\n_Grounded via deterministic engines: ${json.evidence_used.join(", ")}_`;
      }

      setCfoMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { sender: "ai", text: richText, timestamp: "Just now" };
        return next;
      });
      
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
        next[next.length - 1] = { sender: "ai", text: "⚠️ I encountered an error communicating with the financial engines. Please verify backend connectivity.", timestamp: "Just now" };
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
      const response = await apiPost("/api/v1/decision", { query: decisionInput });
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
      const response = await apiPost("/api/v1/simulate", { scenario: scenario });
      if (response.ok) {
        const json = await response.json();
        setSimulatedData(json);
      }
    } catch (err) {
      console.error("Error executing legacy simulation request:", err);
    } finally {
      setSimLoading(false);
    }
  };

  const runScenarioSimulation = async () => {
    setSimLoading(true);
    setSimulatedData(null);

    let parameters: any = {};
    if (simType === "INCOME_CHANGE") {
      parameters = {
        change_type: simIncomeType,
        value: simIncomeVal
      };
    } else if (simType === "EXPENSE_CHANGE") {
      parameters = {
        change_type: simExpenseType,
        value: simExpenseVal
      };
    } else if (simType === "NEW_LIABILITY") {
      parameters = {
        principal: simLoanPrincipal,
        interest_rate: simLoanInterest,
        tenure_years: simLoanTenure,
        asset_purchase_value: simLoanAssetVal
      };
    } else if (simType === "INVESTMENT_CONTRIBUTION") {
      parameters = {
        monthly_change: simInvestVal
      };
    }

    try {
      const response = await apiPost("/api/v1/simulate", {
        type: simType,
        parameters: parameters
      });
      if (response.ok) {
        const json = await response.json();
        setSimulatedData(json);
      } else {
        alert("Failed to calculate simulation scenario parameters.");
      }
    } catch (err) {
      console.error("Error calculating simulation:", err);
      alert("Simulation engine request failed. Please check your parameter inputs.");
    } finally {
      setSimLoading(false);
    }
  };

  const runDecisionComparison = async () => {
    setSimLoading(true);
    setComparisonResult(null);

    const getParams = (t: string, incType: string, incVal: number, expType: string, expVal: number, loanP: number, loanI: number, loanTenure: number, loanA: number, investVal: number) => {
      if (t === "INCOME_CHANGE") {
        return { change_type: incType, value: incVal };
      } else if (t === "EXPENSE_CHANGE") {
        return { change_type: expType, value: expVal };
      } else if (t === "NEW_LIABILITY") {
        return { principal: loanP, interest_rate: loanI, tenure_years: loanTenure, asset_purchase_value: loanA };
      } else {
        return { monthly_change: investVal };
      }
    };

    const optAParams = getParams(optAType, optAIncomeType, optAIncomeVal, optAExpenseType, optAExpenseVal, optALoanPrincipal, optALoanInterest, optALoanTenure, optALoanAssetVal, optAInvestVal);
    const optBParams = getParams(optBType, optBIncomeType, optBIncomeVal, optBExpenseType, optBExpenseVal, optBLoanPrincipal, optBLoanInterest, optBLoanTenure, optBLoanAssetVal, optBInvestVal);

    try {
      const response = await apiPost("/api/v1/simulate/compare", {
        options: [
          { id: "option_a", label: "Option A", type: optAType, parameters: optAParams },
          { id: "option_b", label: "Option B", type: optBType, parameters: optBParams }
        ]
      });
      if (response.ok) {
        const json = await response.json();
        setComparisonResult(json);
      } else {
        alert("Failed to compare scenarios.");
      }
    } catch (err) {
      console.error("Comparison error:", err);
      alert("Scenario Comparison Engine request failed.");
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

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert(`Sign out error: ${error.message}`);
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      alert(`Logout failed: ${err.message}`);
    }
  };

  // Compute live aggregates from backend summaryData response
  const totalAssets = summaryData ? summaryData.net_worth.total_assets : 0;
  const totalLiabilities = summaryData ? summaryData.net_worth.total_liabilities : 0;
  const netWorth = summaryData ? summaryData.net_worth.net_worth : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-emerald-150 relative overflow-x-hidden p-6">
      
      {/* Decors */}
      <div className="absolute top-0 left-1/4 h-[700px] w-[700px] mesh-glow-1 pointer-events-none rounded-full" />
      <div className="absolute top-[800px] right-1/4 h-[900px] w-[900px] mesh-glow-2 pointer-events-none rounded-full" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/50 pb-5 mb-8 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#0B5D4B] flex items-center justify-center shadow-lg shadow-[#0B5D4B]/15">
            <Layers className="text-white h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-black tracking-tight text-primary">
            Arth<span className="text-accent font-extrabold">AI</span> Dashboard
          </span>
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

          <button 
            onClick={triggerSeedDemo} 
            className="bg-accent hover:bg-emerald-500 text-slate-950 hover:text-white text-xs md:text-sm font-black px-5 py-3 rounded-full transition shadow-xl uppercase tracking-widest"
          >
            Load Demo Data
          </button>

          <button 
            onClick={handleLogout} 
            className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 p-3 rounded-full relative transition flex items-center justify-center border border-slate-200/40"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white border border-slate-200/60 p-8 rounded-4xl shadow-xl relative z-10">
        
        {/* Sidebar */}
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
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs md:text-sm font-bold transition uppercase tracking-wider text-left text-rose-600 hover:bg-rose-50 mt-4 border-t border-slate-200/50 pt-4"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Panels */}
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
                <div className="absolute top-6 right-6 inline-flex items-center gap-1.5 bg-white/90 border border-slate-200/40 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                  <span className="text-primary font-bold text-[10px] uppercase">AI Status: {WORKSPACE_CARDS[activeTab]?.aiStatus}</span>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200/50 flex items-center justify-center text-primary shadow-sm">
                      {React.createElement(WORKSPACE_CARDS[activeTab]?.icon || LayoutDashboard, { className: "h-7 w-7" })}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-black text-dark tracking-tight">{WORKSPACE_CARDS[activeTab]?.title}</h3>
                      <span className="text-[10px] text-slate-450 font-bold tracking-wider uppercase">{WORKSPACE_CARDS[activeTab]?.lastUpdated}</span>
                    </div>
                  </div>

                  <p className="text-sm md:text-base text-slate-655 font-semibold leading-relaxed max-w-xl">
                    {WORKSPACE_CARDS[activeTab]?.description}
                  </p>

                  {showQuickSummary === activeTab && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      className="p-4 bg-white/80 border border-slate-150 rounded-2xl text-xs font-semibold text-slate-600 leading-relaxed shadow-inner"
                    >
                      {WORKSPACE_CARDS[activeTab]?.quickSummary}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/30">
                    {WORKSPACE_CARDS[activeTab]?.stats.map((s, idx) => (
                      <div key={idx} className="bg-white/80 border border-slate-150/60 p-4 rounded-2xl shadow-sm">
                        <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">{s.label}</span>
                        <p className="text-sm md:text-base font-black text-primary mt-1">{s.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

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
                          {summaryData ? `${summaryData.profile.risk_appetite} Risk Appetite Profile` : "Family balance sheet summary"}
                        </p>
                      </div>
                      <span className="bg-emerald-50 text-primary border border-emerald-100 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold">
                        {summaryData ? summaryData.financial_health.score : 50}/100 Health Score
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Financial Health Snapshot card */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                        <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider mb-3">Financial Health</p>
                        <div className="space-y-2 text-xs font-semibold text-slate-655">
                          <div className="flex justify-between">
                            <span>Health Score</span>
                            <span className="font-black text-slate-800">{summaryData ? summaryData.financial_health.score : 50}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Savings Rate</span>
                            <span className="font-black text-[#0B5D4B]">{summaryData ? summaryData.financial_health.savings_rate_pct.toFixed(1) : 0.0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Debt-to-Income</span>
                            <span className="font-black text-rose-600">{summaryData ? summaryData.financial_health.dti_ratio_pct.toFixed(1) : 0.0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Runway Runway</span>
                            <span className="font-black text-slate-800">{summaryData ? summaryData.financial_health.emergency_runway_months.toFixed(1) : 0.0} mo</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Executive Briefing */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                        <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">AI Executive Briefing</p>
                        <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-semibold mt-3">
                          {briefData ? briefData.briefing : "Your financial command center is initialized. Query your personal AI CFO to unlock custom calculations."}
                        </p>
                      </div>

                      {/* Balance Sheet Summary card */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">Balance Sheet Summary</p>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block">Aggregated Assets</span>
                              <p className="text-base font-black text-emerald-700 mt-1">₹{totalAssets.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block">Active Debts</span>
                              <p className="text-base font-black text-rose-600 mt-1">₹{totalLiabilities.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-slate-200/50 pt-3 mt-4 flex justify-between items-center text-xs font-bold text-slate-700">
                          <span>Calculated Net Worth</span>
                          <span className="text-primary font-black text-sm">₹{netWorth.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Workspace Rows */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Asset Breakdown list */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-150">
                        <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider mb-3">Asset Distribution</p>
                        {(!summaryData || !summaryData.net_worth.asset_breakdown || summaryData.net_worth.asset_breakdown.length === 0) ? (
                          <p className="text-xs text-slate-450 text-center py-4">No assets recorded yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {summaryData.net_worth.asset_breakdown.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-700 border-b pb-1.5">
                                <span>{item.label}</span>
                                <span className="font-black text-emerald-700">₹{item.value.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Liability Breakdown list */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-150">
                        <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider mb-3">Liabilities & Debts</p>
                        {(!summaryData || !summaryData.net_worth.liability_breakdown || summaryData.net_worth.liability_breakdown.length === 0) ? (
                          <p className="text-xs text-slate-450 text-center py-4">No liabilities recorded.</p>
                        ) : (
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {summaryData.net_worth.liability_breakdown.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-750 border-b pb-1.5">
                                <div>
                                  <span className="font-bold text-slate-800 block">{item.loan_name}</span>
                                  <span className="text-[9px] text-slate-400 font-bold">{item.loan_type} | {item.interest_rate}% APR</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-rose-600 block">₹{item.outstanding.toLocaleString()}</span>
                                  <span className="text-[9px] text-slate-450 font-bold">EMI: ₹{item.emi.toLocaleString()}/mo</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financial Diagnosis Results Section */}
                    {diagnosisData && (
                      <div className="mt-8 border-t pt-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display text-lg font-black text-dark flex items-center gap-1.5">
                            <Sparkles className="h-5 w-5 text-emerald-700 animate-pulse" />
                            ArthAI Financial Diagnosis
                          </h4>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                            {diagnosisData.overall_state.label}
                          </span>
                        </div>

                        <p className="text-xs md:text-sm text-slate-655 leading-relaxed font-semibold">
                          {diagnosisData.overall_state.summary}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column: Strengths & Risks */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider mb-2.5">Key Strengths</p>
                              {diagnosisData.strengths.length === 0 ? (
                                <p className="text-xs text-slate-400">No major strengths identified yet.</p>
                              ) : (
                                <div className="space-y-2">
                                  {diagnosisData.strengths.map((str: any) => (
                                    <div key={str.id} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs">
                                      <p className="font-black text-emerald-900">{str.title}</p>
                                      <p className="text-emerald-705 mt-0.5 font-medium">{str.description}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-[10px] text-rose-800 font-extrabold uppercase tracking-wider mb-2.5">Identified Risks</p>
                              {diagnosisData.risks.length === 0 ? (
                                <p className="text-xs text-slate-455">No immediate risks detected.</p>
                              ) : (
                                <div className="space-y-2">
                                  {diagnosisData.risks.map((risk: any) => (
                                    <div key={risk.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-xs">
                                      <div className="flex justify-between items-center">
                                        <p className="font-black text-rose-900">{risk.title}</p>
                                        <span className="text-[8px] uppercase px-1.5 py-0.2 bg-rose-100 text-rose-800 font-extrabold rounded">{risk.severity}</span>
                                      </div>
                                      <p className="text-rose-705 mt-0.5 font-medium">{risk.description}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column: Ranked Priorities & Recommendations */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider mb-2.5">Ranked Priorities</p>
                              {diagnosisData.priorities.length === 0 ? (
                                <p className="text-xs text-slate-400">All indicators healthy. No prioritized actions.</p>
                              ) : (
                                <div className="space-y-3">
                                  {diagnosisData.priorities.map((prio: any) => (
                                    <div key={prio.id} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs relative">
                                      <span className="absolute top-3.5 right-3.5 text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">Rank #{prio.rank}</span>
                                      <p className="font-black text-slate-800 pr-12">{prio.title}</p>
                                      <p className="text-slate-500 mt-1 font-semibold">{prio.reason}</p>
                                      <div className="mt-2.5 pt-2 border-t text-[10px] text-primary font-bold">
                                        💡 Action: {prio.recommended_action}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}

                {activeTab === "ai_cfo" && (
                  <div className="flex flex-col h-[520px] bg-slate-50 rounded-2xl border border-slate-200/60 overflow-hidden relative">
                    <div className="p-4 bg-white border-b flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-655 flex items-center gap-1.5"><Brain className="h-4.5 w-4.5 text-emerald-700" /> AI Family CFO Advisory Loop</span>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">Models synced</span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                      {cfoMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`p-4 rounded-3xl max-w-md text-xs md:text-sm font-semibold shadow-sm leading-relaxed ${msg.sender === "user" ? "bg-primary text-white" : "bg-white border border-slate-200/60 text-slate-800"}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      
                      {cfoThinking && (
                        <div className="bg-white border border-slate-200/50 p-4 rounded-3xl max-w-sm text-xs font-bold text-slate-500 space-y-2">
                          <p className="flex items-center gap-2 text-primary font-black"><Sparkles className="h-4 w-4 animate-spin" /> Thinking process...</p>
                          <ul className="space-y-1 pl-4 border-l border-slate-200">
                            {cfoThinkingSteps.map((step, idx) => (
                              <li key={idx} className="text-[10px] text-slate-400 flex items-center gap-1">✅ {step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {cfoStreaming && (
                      <div className="px-4 py-2 bg-emerald-50 border-t border-b border-emerald-100 flex items-center gap-2 text-[10px] text-emerald-800 font-bold">
                        <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                        AI CFO is streaming real-time calculations...
                      </div>
                    )}

                    <div className="p-4 bg-white border-t space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {suggestedActions.map((act) => (
                          <button
                            key={act}
                            onClick={() => setCfoInput(act)}
                            className="text-[10px] bg-slate-50 hover:bg-slate-100/80 text-slate-600 px-3 py-1.5 rounded-full font-bold border border-slate-200/50 transition-colors"
                          >
                            {act}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleCfoChat} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ask AI CFO, e.g. 'Can I invest in mutual funds instead of prepaying loan?'"
                          value={cfoInput}
                          onChange={(e) => setCfoInput(e.target.value)}
                          className="flex-1 bg-slate-50 border px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold focus:outline-none focus:border-primary text-slate-800"
                        />
                        <button type="submit" className="bg-primary hover:bg-[#074739] text-white p-3 rounded-2xl transition">
                          <Send className="h-5 w-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === "cash_flow" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-display text-base font-bold text-slate-700">Income & Expense Cashflows</h3>
                      <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">
                        {summaryData ? `${summaryData.financial_health.savings_rate_pct.toFixed(1)}% Savings Rate` : "30% Savings Rate"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                        <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mb-4">Household Monthly Inflow</p>
                        <ul className="space-y-3 text-xs font-semibold text-slate-700">
                          <li className="flex justify-between items-center border-b pb-2">
                            <span>Monthly Take-home Income</span>
                            <span className="text-emerald-700 font-black">₹{summaryData ? summaryData.cash_flow.monthly_income.toLocaleString() : "0"}</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                        <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mb-4">Outflows & Fixed Debts</p>
                        <ul className="space-y-3 text-xs font-semibold text-slate-700">
                          <li className="flex justify-between items-center border-b pb-2">
                            <span>Monthly Living Expenses</span>
                            <span className="text-rose-600 font-black">₹{summaryData ? summaryData.cash_flow.monthly_expenses.toLocaleString() : "0"}</span>
                          </li>
                          <li className="flex justify-between items-center border-b pb-2">
                            <span>Outstanding EMIs</span>
                            <span className="text-rose-600 font-black">₹{summaryData ? summaryData.cash_flow.monthly_emi.toLocaleString() : "0"}</span>
                          </li>
                          <li className="flex justify-between items-center border-b pb-2">
                            <span>Monthly Surplus</span>
                            <span className="text-emerald-700 font-black">₹{summaryData ? summaryData.cash_flow.monthly_surplus.toLocaleString() : "0"}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "goals" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-display text-base font-bold text-slate-700">Life Milestone Goals Vault</h3>
                      <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">
                        {goals.length} Goals Active
                      </span>
                    </div>

                    {/* Contribution Pressure Info Card */}
                    {feasibilityData?.cashflow_capacity && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 mb-6">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Monthly Income Surplus</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5">₹{feasibilityData.cashflow_capacity.monthly_surplus.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Total Planned Contributions</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5">₹{feasibilityData.cashflow_capacity.total_current_goal_contributions.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Available Buffer After Goals</span>
                          <p className={`text-sm font-black mt-0.5 ${feasibilityData.cashflow_capacity.available_after_goal_contributions < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                            ₹{feasibilityData.cashflow_capacity.available_after_goal_contributions.toLocaleString()}
                          </p>
                        </div>
                        {feasibilityData.cashflow_capacity.available_after_goal_contributions < 0 && (
                          <div className="col-span-full text-[10px] bg-rose-50 text-rose-700 p-2.5 rounded-lg border border-rose-100 font-bold mt-1">
                            ⚠️ Attention: Your total planned monthly goal contributions exceed your current available surplus by ₹{Math.abs(feasibilityData.cashflow_capacity.available_after_goal_contributions).toLocaleString()}. Exposing contribution pressure.
                          </div>
                        )}
                      </div>
                    )}

                    {goals.length === 0 ? (
                      <p className="text-xs text-slate-450 text-center py-8">You haven't created a goal yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {goals.map((g, idx) => {
                          const fGoal = feasibilityData?.goals?.find((fg: any) => fg.goal_id === g.id || fg.goal_name === g.goal_name);
                          const statusColors: any = {
                            "ON_TRACK": "bg-emerald-50 text-emerald-700 border-emerald-200",
                            "AT_RISK": "bg-amber-50 text-amber-700 border-amber-200",
                            "UNDERFUNDED": "bg-rose-50 text-rose-700 border-rose-200",
                            "ALREADY_ACHIEVED": "bg-sky-50 text-sky-700 border-sky-200",
                            "OVERDUE": "bg-rose-100 text-rose-800 border-rose-300",
                            "INSUFFICIENT_DATA": "bg-slate-100 text-slate-600 border-slate-200"
                          };

                          return (
                            <div key={g.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                              <div>
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className="text-xs font-black text-slate-800">{g.goal_name}</h4>
                                    <span className="text-[9px] text-slate-400 font-bold">{g.category || "General"}</span>
                                  </div>
                                  <div className="flex gap-1.5 items-center">
                                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${g.priority === "Critical" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{g.priority}</span>
                                    {fGoal && (
                                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${statusColors[fGoal.status] || "bg-slate-50"}`}>
                                        {fGoal.status.replace("_", " ")}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-655 mt-2">
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Target Value</span>
                                    <p className="text-sm font-black text-slate-700 mt-0.5">₹{parseFloat(g.target_amount).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Saved Amount</span>
                                    <p className="text-sm font-black text-slate-700 mt-0.5">₹{parseFloat(g.saved_amount).toLocaleString()}</p>
                                  </div>
                                  {fGoal && (
                                    <>
                                      <div>
                                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Target Date</span>
                                        <p className="text-xs font-black text-slate-700 mt-0.5">{new Date(fGoal.target_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                                      </div>
                                      <div>
                                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Remaining Time</span>
                                        <p className="text-xs font-black text-slate-700 mt-0.5">{fGoal.months_remaining} months</p>
                                      </div>
                                      <div>
                                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Current Monthly Contribution</span>
                                        <p className="text-xs font-black text-slate-700 mt-0.5">₹{fGoal.current_monthly_contribution.toLocaleString()}/mo</p>
                                      </div>
                                      <div>
                                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Required Monthly Contribution</span>
                                        <p className="text-xs font-black text-slate-700 mt-0.5 text-primary">₹{fGoal.required_monthly_contribution.toLocaleString()}/mo</p>
                                      </div>
                                      <div>
                                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Projected Value (Nominal)</span>
                                        <p className="text-xs font-black text-slate-700 mt-0.5">₹{fGoal.projected_amount.toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Projected Funding Gap</span>
                                        <p className={`text-xs font-black mt-0.5 ${fGoal.funding_gap > 0 ? "text-rose-600" : "text-slate-700"}`}>
                                          ₹{fGoal.funding_gap.toLocaleString()}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {fGoal && fGoal.reasons && fGoal.reasons.length > 0 && (
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-600 font-medium space-y-1">
                                  {fGoal.reasons.map((reason: string, rIdx: number) => (
                                    <p key={rIdx} className="leading-relaxed">ℹ️ {reason}</p>
                                  ))}
                                  <p className="text-[8px] text-slate-400 font-bold uppercase pt-1">
                                    * {fGoal.projection_method.replace("_", " ")} | {fGoal.inflation_method.replace("_", " ")}
                                  </p>
                                </div>
                              )}

                              <div className="border-t border-slate-200/50 pt-3 flex items-center justify-between">
                                <span className="text-[10px] text-slate-455 font-extrabold uppercase">Fund Allocation</span>
                                <span className="text-[10px] text-[#0B5D4B] font-bold">Auto-indexed</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Plans Section */}
                    {actionPlansData && actionPlansData.plans && actionPlansData.plans.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-200">
                        <div className="mb-4">
                          <h3 className="font-display text-base font-bold text-slate-700">Deterministic Financial Action Plans</h3>
                          <p className="text-[10px] text-slate-450 mt-1">Hypothetical scenario packages constructed to close active goal funding deficits under safe limits.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          {actionPlansData.plans.map((plan: any, pIdx: number) => {
                            const isRecommended = plan.id === actionPlansData.recommendation.plan_id;
                            const isViable = plan.safety.is_viable;

                            return (
                              <div
                                key={plan.id || pIdx}
                                className={`p-6 rounded-2xl border transition-all duration-200 ${
                                  isRecommended
                                    ? "bg-slate-50/70 border-[#0B5D4B]/40 shadow-sm"
                                    : isViable
                                    ? "bg-white border-slate-200 hover:border-slate-300"
                                    : "bg-rose-50/20 border-rose-200/60"
                                }`}
                              >
                                <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                                  <div>
                                    <h4 className="text-xs font-black text-slate-800">{plan.label}</h4>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">Plan ID: {plan.id}</span>
                                  </div>
                                  <div className="flex gap-1.5">
                                    {isRecommended && (
                                      <span className="text-[9px] bg-[#0B5D4B]/10 text-[#0B5D4B] px-2 py-0.5 rounded font-black uppercase">
                                        Highest-Ranked Plan
                                      </span>
                                    )}
                                    <span
                                      className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${
                                        isViable
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-rose-50 text-rose-700 border-rose-200"
                                      }`}
                                    >
                                      {isViable ? "Viable" : "Unsafe"}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* Actions List */}
                                  <div className="space-y-2">
                                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Recommended Outlay Steps</span>
                                    <div className="space-y-1.5">
                                      {plan.actions.map((act: any, aIdx: number) => (
                                        <div key={aIdx} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                          <span className="h-1.5 w-1.5 rounded-full bg-[#0B5D4B]" />
                                          {act.type === "REDUCE_EXPENSE" && `Reduce expenses by ₹${act.amount.toLocaleString()}/mo`}
                                          {act.type === "INCREASE_GOAL_CONTRIBUTION" && `Increase contribution by ₹${act.amount.toLocaleString()}/mo`}
                                          {act.type === "INCREASE_INCOME" && `Target income adjustment of ₹${act.amount.toLocaleString()}/mo`}
                                          {act.type === "EXTEND_GOAL_TIMELINE" && `Extend target date to ${act.months} months total`}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Projected Ratios */}
                                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-655">
                                    <div>
                                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Projected Surplus</span>
                                      <p className="text-sm font-black text-slate-800 mt-0.5">₹{plan.projected.monthly_surplus.toLocaleString()}/mo</p>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Projected Health Score</span>
                                      <p className="text-sm font-black text-[#0B5D4B] mt-0.5">{plan.projected.financial_health_score}/100</p>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Projected DTI Ratio</span>
                                      <p className="text-xs font-black text-slate-700 mt-0.5">{plan.projected.dti_ratio_pct}%</p>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Projected Runway</span>
                                      <p className="text-xs font-black text-slate-700 mt-0.5">{plan.projected.emergency_runway_months} months</p>
                                    </div>
                                  </div>

                                  {/* Tradeoffs */}
                                  <div className="space-y-1 text-[10px] text-slate-500 font-medium">
                                    <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1">Trade-offs Analysis</span>
                                    {plan.tradeoffs.map((trade: string, tIdx: number) => (
                                      <p key={tIdx} className="leading-relaxed">⚖️ {trade}</p>
                                    ))}
                                  </div>
                                </div>

                                {!isViable && plan.safety.violations && plan.safety.violations.length > 0 && (
                                  <div className="mt-3 p-2.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-100 text-[10px] font-bold">
                                    ⚠️ Safety gates violated: {plan.safety.violations.join(" ")}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {actionPlansData.recommendation.reasons && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 mt-4 text-[10px] text-slate-600 font-medium space-y-1">
                            <span className="text-[9px] text-slate-400 font-black block uppercase mb-1">Model Rationale</span>
                            {actionPlansData.recommendation.reasons.map((reason: string, rIdx: number) => (
                              <p key={rIdx} className="leading-relaxed">💡 {reason}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "investments" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-display text-base font-bold text-slate-700">Portfolio Assets & mutual funds</h3>
                      <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">
                        ₹{summaryData ? summaryData.investments.current_value.toLocaleString() : "0"} Total Value
                      </span>
                    </div>

                    {summaryData && summaryData.investments.total_invested === 0 ? (
                      <p className="text-xs text-slate-450 text-center py-8">No investments added yet.</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-700">
                          <div>
                            <p className="font-black text-slate-800">Aggregate Investments Portfolio</p>
                            <p className="text-[9px] text-slate-450 mt-0.5 uppercase">Mutual Funds / Equity holdings</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-emerald-700">₹{summaryData?.investments.current_value.toLocaleString()}</p>
                            <p className="text-[9px] text-slate-400 font-bold">Cost Basis: ₹{summaryData?.investments.total_invested.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "insurance" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-display text-base font-bold text-slate-700">Insurance Policies & health coverage</h3>
                      <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">
                        {summaryData ? summaryData.insurance.count : 0} Active policies
                      </span>
                    </div>

                    {summaryData && summaryData.insurance.count === 0 ? (
                      <p className="text-xs text-slate-450 text-center py-8">No insurance policies added yet.</p>
                    ) : (
                      <p className="text-xs text-slate-450 py-4 text-center">Insurance details managed inside secure vaults panel.</p>
                    )}
                  </div>
                )}

                {activeTab === "simulator" && (() => {
                  const renderFormFields = (
                    prefix: string,
                    t: string,
                    setT: (v: string) => void,
                    incType: string,
                    setIncType: (v: string) => void,
                    incVal: number,
                    setIncVal: (v: number) => void,
                    expType: string,
                    setExpType: (v: string) => void,
                    expVal: number,
                    setExpVal: (v: number) => void,
                    loanP: number,
                    setLoanP: (v: number) => void,
                    loanI: number,
                    setLoanI: (v: number) => void,
                    loanT: number,
                    setLoanT: (v: number) => void,
                    loanA: number,
                    setLoanA: (v: number) => void,
                    investVal: number,
                    setInvestVal: (v: number) => void
                  ) => {
                    return (
                      <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
                        <div className="flex gap-2">
                          {["NEW_LIABILITY", "INCOME_CHANGE", "EXPENSE_CHANGE", "INVESTMENT_CONTRIBUTION"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                setT(opt);
                                setComparisonResult(null);
                                setSimulatedData(null);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition border ${
                                t === opt 
                                  ? "bg-slate-700 text-white border-slate-700" 
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {opt.replace("_", " ")}
                            </button>
                          ))}
                        </div>

                        <div className="pt-2">
                          {t === "INCOME_CHANGE" && (
                            <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold">
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Adjustment Mode</label>
                                <select
                                  value={incType}
                                  onChange={(e) => setIncType(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-bold"
                                >
                                  <option value="percentage">Percentage Change (%)</option>
                                  <option value="absolute">Absolute Change (₹)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Value Change (+/-)</label>
                                <input
                                  type="number"
                                  value={incVal}
                                  onChange={(e) => setIncVal(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-black"
                                />
                              </div>
                            </div>
                          )}

                          {t === "EXPENSE_CHANGE" && (
                            <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold">
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Adjustment Mode</label>
                                <select
                                  value={expType}
                                  onChange={(e) => setExpType(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-bold"
                                >
                                  <option value="absolute">Absolute Change (₹)</option>
                                  <option value="percentage">Percentage Change (%)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Value Change (+/-)</label>
                                <input
                                  type="number"
                                  value={expVal}
                                  onChange={(e) => setExpVal(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-black"
                                />
                              </div>
                            </div>
                          )}

                          {t === "NEW_LIABILITY" && (
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Principal (₹)</label>
                                <input
                                  type="number"
                                  value={loanP}
                                  onChange={(e) => setLoanP(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-black"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Interest Rate (% APR)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={loanI}
                                  onChange={(e) => setLoanI(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-black"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Tenure (Years)</label>
                                <input
                                  type="number"
                                  value={loanT}
                                  onChange={(e) => setLoanT(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-black"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Asset Value (₹)</label>
                                <input
                                  type="number"
                                  value={loanA}
                                  onChange={(e) => setLoanA(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-black"
                                />
                              </div>
                            </div>
                          )}

                          {t === "INVESTMENT_CONTRIBUTION" && (
                            <div className="text-[11px] font-semibold">
                              <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Monthly Change (+/- ₹)</label>
                              <input
                                type="number"
                                value={investVal}
                                onChange={(e) => setInvestVal(parseFloat(e.target.value) || 0)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-black"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b pb-3">
                        <h3 className="font-display text-base font-bold text-slate-700">Interactive Scenario Simulator</h3>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border">
                          <button
                            onClick={() => {
                              setCompareMode(false);
                              setComparisonResult(null);
                              setSimulatedData(null);
                            }}
                            className={`px-3 py-1 rounded-md text-[10px] font-extrabold ${!compareMode ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
                          >
                            Single Scenario
                          </button>
                          <button
                            onClick={() => {
                              setCompareMode(true);
                              setComparisonResult(null);
                              setSimulatedData(null);
                            }}
                            className={`px-3 py-1 rounded-md text-[10px] font-extrabold ${compareMode ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
                          >
                            Compare Options
                          </button>
                        </div>
                      </div>

                      {!compareMode ? (
                        /* Single Scenario Config Block */
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
                          <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Configure Scenario Type</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { id: "NEW_LIABILITY", label: "New Loan/Liability" },
                              { id: "INCOME_CHANGE", label: "Income Change" },
                              { id: "EXPENSE_CHANGE", label: "Expense Change" },
                              { id: "INVESTMENT_CONTRIBUTION", label: "Investment Contribution" }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  setSimType(opt.id);
                                  setSimulatedData(null);
                                }}
                                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition border text-center ${
                                  simType === opt.id 
                                    ? "bg-primary text-white border-primary" 
                                    : "bg-white text-slate-600 border-slate-200/60 hover:bg-slate-50"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          <div className="pt-3 border-t border-slate-200/40">
                            {simType === "INCOME_CHANGE" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Adjustment Mode</label>
                                  <select
                                    value={simIncomeType}
                                    onChange={(e) => setSimIncomeType(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold"
                                  >
                                    <option value="percentage">Percentage Change (%)</option>
                                    <option value="absolute">Absolute Change (₹)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Value Change (+/-)</label>
                                  <input
                                    type="number"
                                    value={simIncomeVal}
                                    onChange={(e) => setSimIncomeVal(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                                  />
                                </div>
                              </div>
                            )}

                            {simType === "EXPENSE_CHANGE" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Adjustment Mode</label>
                                  <select
                                    value={simExpenseType}
                                    onChange={(e) => setSimExpenseType(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold"
                                  >
                                    <option value="absolute">Absolute Change (₹)</option>
                                    <option value="percentage">Percentage Change (%)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Value Change (+/-)</label>
                                  <input
                                    type="number"
                                    value={simExpenseVal}
                                    onChange={(e) => setSimExpenseVal(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                                  />
                                </div>
                              </div>
                            )}

                            {simType === "NEW_LIABILITY" && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Principal (₹)</label>
                                  <input
                                    type="number"
                                    value={simLoanPrincipal}
                                    onChange={(e) => setSimLoanPrincipal(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Interest Rate (% APR)</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={simLoanInterest}
                                    onChange={(e) => setSimLoanInterest(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Tenure (Years)</label>
                                  <input
                                    type="number"
                                    value={simLoanTenure}
                                    onChange={(e) => setSimLoanTenure(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Asset Value (₹)</label>
                                  <input
                                    type="number"
                                    value={simLoanAssetVal}
                                    onChange={(e) => setSimLoanAssetVal(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                                  />
                                </div>
                              </div>
                            )}

                            {simType === "INVESTMENT_CONTRIBUTION" && (
                              <div className="text-xs font-semibold max-w-md">
                                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Monthly Change (+/- ₹)</label>
                                <input
                                  type="number"
                                  value={simInvestVal}
                                  onChange={(e) => setSimInvestVal(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-black"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end pt-3">
                            <button
                              onClick={runScenarioSimulation}
                              className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-1.5"
                            >
                              Calculate Scenario Impact
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Multiple Options Comparative Setup Block */
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-5">
                          <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Configure Scenario Alternatives</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* OPTION A PANEL */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Option A Parameters</h4>
                              {renderFormFields(
                                "optA", optAType, setOptAType, optAIncomeType, setOptAIncomeType, optAIncomeVal, setOptAIncomeVal,
                                optAExpenseType, setOptAExpenseType, optAExpenseVal, setOptAExpenseVal,
                                optALoanPrincipal, setOptALoanPrincipal, optALoanInterest, setOptALoanInterest, optALoanTenure, setOptALoanTenure, optALoanAssetVal, setOptALoanAssetVal,
                                optAInvestVal, setOptAInvestVal
                              )}
                            </div>

                            {/* OPTION B PANEL */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Option B Parameters</h4>
                              {renderFormFields(
                                "optB", optBType, setOptBType, optBIncomeType, setOptBIncomeType, optBIncomeVal, setOptBIncomeVal,
                                optBExpenseType, setOptBExpenseType, optBExpenseVal, setOptBExpenseVal,
                                optBLoanPrincipal, setOptBLoanPrincipal, optBLoanInterest, setOptBLoanInterest, optBLoanTenure, setOptBLoanTenure, optBLoanAssetVal, setOptBLoanAssetVal,
                                optBInvestVal, setOptBInvestVal
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end pt-3">
                            <button
                              onClick={runDecisionComparison}
                              className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-1.5 animate-shimmer"
                            >
                              Run Decision Comparison
                            </button>
                          </div>
                        </div>
                      )}

                      {simLoading && (
                        <div className="bg-slate-50 p-6 rounded-2xl border text-center text-xs font-bold text-slate-500 animate-pulse">
                          ⌛ Executing rules-engine simulations on modified context...
                        </div>
                      )}

                      {/* Render Single Scenario Outputs */}
                      {simulatedData && !simLoading && !compareMode && (
                        <div className="space-y-6">
                          <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-2xl relative">
                            <span className="absolute top-4 right-4 text-[8px] uppercase tracking-widest font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              SIMULATION — NOT SAVED
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-slate-800">Assessment: {simulatedData.assessment.label}</h4>
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
                                {simulatedData.assessment.severity} Impact
                              </span>
                            </div>
                            
                            <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-2">{simulatedData.assessment.summary}</p>

                            {simulatedData.assessment.warnings.length > 0 && (
                              <div className="mt-3.5 space-y-1.5 pt-3.5 border-t border-amber-200/50">
                                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Warnings Detected</p>
                                {simulatedData.assessment.warnings.map((warn: string, idx: number) => (
                                  <p key={idx} className="text-xs text-rose-750 font-medium">⚠️ {warn}</p>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Comparative Data Grid */}
                          <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b font-bold text-slate-500 text-[10px] uppercase">
                                <tr>
                                  <th className="p-4">Financial Metric</th>
                                  <th className="p-4">Current Baseline</th>
                                  <th className="p-4">Projected Scenario</th>
                                  <th className="p-4">Absolute Delta</th>
                                </tr>
                              </thead>
                              <tbody className="font-semibold text-slate-700 divide-y divide-slate-100">
                                {[
                                  { label: "Net Worth", base: simulatedData.baseline.net_worth, proj: simulatedData.projected.net_worth, delta: simulatedData.impact.net_worth_delta, format: "currency" },
                                  { label: "Monthly Surplus", base: simulatedData.baseline.monthly_surplus, proj: simulatedData.projected.monthly_surplus, delta: simulatedData.impact.monthly_surplus_delta, format: "currency" },
                                  { label: "Savings Rate", base: simulatedData.baseline.savings_rate_pct, proj: simulatedData.projected.savings_rate_pct, delta: simulatedData.impact.savings_rate_delta, format: "percent" },
                                  { label: "Debt-to-Income", base: simulatedData.baseline.dti_ratio_pct, proj: simulatedData.projected.dti_ratio_pct, delta: simulatedData.impact.dti_delta, format: "percent" },
                                  { label: "Emergency Runway", base: simulatedData.baseline.emergency_runway_months, proj: simulatedData.projected.emergency_runway_months, delta: simulatedData.impact.runway_delta, format: "months" },
                                  { label: "Health Score", base: simulatedData.baseline.financial_health_score, proj: simulatedData.projected.financial_health_score, delta: simulatedData.impact.health_score_delta, format: "score" }
                                ].map((row, idx) => {
                                  const isPos = row.delta > 0;
                                  const isNeg = row.delta < 0;
                                  let deltaClass = "text-slate-500 font-bold";
                                  if (row.label === "Debt-to-Income") {
                                    deltaClass = isPos ? "text-rose-600 font-black" : (isNeg ? "text-emerald-700 font-black" : deltaClass);
                                  } else {
                                    deltaClass = isPos ? "text-emerald-700 font-black" : (isNeg ? "text-rose-600 font-black" : deltaClass);
                                  }

                                  const formatVal = (v: number, fmt: string) => {
                                    if (fmt === "currency") return `₹${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                                    if (fmt === "percent") return `${v.toFixed(1)}%`;
                                    if (fmt === "months") return `${v.toFixed(1)} mo`;
                                    return `${v.toFixed(0)}`;
                                  };

                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                      <td className="p-4 font-bold text-slate-800">{row.label}</td>
                                      <td className="p-4">{formatVal(row.base, row.format)}</td>
                                      <td className="p-4">{formatVal(row.proj, row.format)}</td>
                                      <td className={`p-4 ${deltaClass}`}>
                                        {isPos ? "+" : ""}{formatVal(row.delta, row.format)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => setSimulatedData(null)}
                              className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition"
                            >
                              Back to Baseline Position
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Render Multiple Options Comparison Output */}
                      {comparisonResult && !simLoading && compareMode && (() => {
                        const optA = comparisonResult.options.find((o: any) => o.id === "option_a");
                        const optB = comparisonResult.options.find((o: any) => o.id === "option_b");
                        const recOpt = comparisonResult.comparison.recommended_option;
                        
                        const formatVal = (v: number, fmt: string) => {
                          if (v === undefined || v === null) return "-";
                          if (fmt === "currency") return `₹${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                          if (fmt === "percent") return `${v.toFixed(1)}%`;
                          if (fmt === "months") return `${v.toFixed(1)} mo`;
                          return `${v.toFixed(0)}`;
                        };

                        return (
                          <div className="space-y-6">
                            {/* Recommended Box */}
                            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl relative">
                              <span className="absolute top-4 right-4 text-[8px] uppercase tracking-widest font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                DECISION INTELLIGENCE RECOMMENDATION
                              </span>
                              
                              <h4 className="text-sm font-black text-slate-800">
                                Recommended Option: <span className="text-primary font-black uppercase">{recOpt === "option_a" ? "Option A" : (recOpt === "option_b" ? "Option B" : "None (Insufficient Data)")}</span>
                              </h4>
                              
                              <div className="mt-3.5 space-y-2">
                                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Deterministic Decision Logic</p>
                                {comparisonResult.comparison.reasons.map((r: string, idx: number) => (
                                  <p key={idx} className="text-xs text-slate-700 leading-relaxed font-semibold">✅ {r}</p>
                                ))}
                              </div>

                              {comparisonResult.comparison.tradeoffs.length > 0 && (
                                <div className="mt-3.5 space-y-1.5 pt-3.5 border-t border-emerald-100">
                                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Option Tradeoffs</p>
                                  {comparisonResult.comparison.tradeoffs.map((t: string, idx: number) => (
                                    <p key={idx} className="text-xs text-amber-800 font-medium">⚠️ {t}</p>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Options Comparative Table */}
                            <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b font-bold text-slate-500 text-[10px] uppercase">
                                  <tr>
                                    <th className="p-4">Financial Metric</th>
                                    <th className="p-4">Baseline Position</th>
                                    <th className="p-4">Option A projected</th>
                                    <th className="p-4">Option B projected</th>
                                  </tr>
                                </thead>
                                <tbody className="font-semibold text-slate-700 divide-y divide-slate-100">
                                  {[
                                    { label: "Net Worth", key: "net_worth", format: "currency" },
                                    { label: "Monthly Surplus", key: "monthly_surplus", format: "currency" },
                                    { label: "Savings Rate", key: "savings_rate_pct", format: "percent" },
                                    { label: "Debt-to-Income", key: "dti_ratio_pct", format: "percent" },
                                    { label: "Emergency Runway", key: "emergency_runway_months", format: "months" },
                                    { label: "Health Score", key: "financial_health_score", format: "score" }
                                  ].map((row, idx) => {
                                    const baseVal = comparisonResult.baseline ? comparisonResult.baseline[row.key] : 0;
                                    const valA = optA ? optA.projected[row.key] : 0;
                                    const valB = optB ? optB.projected[row.key] : 0;

                                    return (
                                      <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="p-4 font-bold text-slate-800">{row.label}</td>
                                        <td className="p-4 font-bold text-slate-500">{formatVal(baseVal, row.format)}</td>
                                        <td className={`p-4 ${recOpt === "option_a" ? "text-emerald-700 font-extrabold" : ""}`}>{formatVal(valA, row.format)}</td>
                                        <td className={`p-4 ${recOpt === "option_b" ? "text-emerald-700 font-extrabold" : ""}`}>{formatVal(valB, row.format)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className="flex justify-end">
                              <button
                                onClick={() => setComparisonResult(null)}
                                className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition"
                              >
                                Clear Comparison Output
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}

                {activeTab === "calendar" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-display text-base font-bold text-slate-700">Financial Calendar Deadlines</h3>
                      <span className="text-[10px] bg-emerald-50 text-primary px-3 py-1 rounded-full font-bold">Synced</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Equity Mutual Fund SIP Auto-debit", date: "October 05, 2026", amt: "₹41,500", status: "Active" },
                        { label: "ICICI Term Life Premium Due", date: "October 15, 2026", amt: "₹22,500", status: "Pending" }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-700">
                          <div>
                            <p className="font-black text-slate-800">{item.label}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Due: {item.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-slate-700 block">{item.amt}</span>
                            <span className="text-[9px] font-black uppercase text-emerald-750">{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "subscriptions" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-display text-base font-bold text-slate-700">Bills & Active Subscriptions</h3>
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold">2 overlaps found</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: "Netflix Premium plan", cost: "₹649/mo", status: "Active" },
                        { name: "Spotify Premium family", cost: "₹179/mo", status: "Active" },
                        { name: "Amazon Prime shopping", cost: "₹125/mo", status: "Active" }
                      ].map((sub, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-250 flex items-center justify-between text-xs font-semibold text-slate-700">
                          <div>
                            <p className="font-black text-slate-800">{sub.name}</p>
                            <p className="text-[9px] text-[#0B5D4B] font-bold uppercase mt-0.5">{sub.status}</p>
                          </div>
                          <span className="font-black text-slate-700">{sub.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "vault" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-display text-base font-bold text-slate-700">Secure Document Intel Vault</h3>
                      <span className="text-[10px] bg-emerald-50 text-primary px-3 py-1 rounded-full font-bold">AES-256 Storage Active</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl flex flex-col items-center gap-3">
                      <input 
                        type="file" 
                        id="pdf-vault-uploader" 
                        accept=".pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const formData = new FormData();
                          formData.append("file", file);
                          
                          try {
                            alert(`Uploading & Processing ${file.name}...`);
                            const res = await apiPost("/api/v1/documents/upload", formData);
                            if (!res.ok) {
                              const errData = await res.json();
                              throw new Error(errData.detail || "Upload failed");
                            }
                            const data = await res.json();
                            alert(`Successfully processed! Type: ${data.document_type}. Facts: ${data.facts_extracted}. Chunks: ${data.chunks_created}`);
                            fetchBackendData();
                          } catch (err: any) {
                            alert(`Processing Error: ${err.message}`);
                          }
                        }}
                        className="hidden" 
                      />
                      <label htmlFor="pdf-vault-uploader" className="cursor-pointer inline-flex items-center px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition">
                        Upload Secure Financial Document
                      </label>
                      <p className="text-[9px] text-slate-450">PDF files are parsed and associated with your secure database profile.</p>
                    </div>

                    <div className="space-y-3">
                      {vaultDocuments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No documents stored in vault yet.</p>
                      ) : (
                        vaultDocuments.map((doc, idx) => (
                          <div key={doc.id || idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FolderOpen className="h-5 w-5 text-emerald-700" />
                              <div>
                                <p className="text-xs font-black text-slate-800">{doc.file_name}</p>
                                <p className="text-[9px] text-slate-450 font-bold uppercase">{doc.document_type} | {Math.round(doc.file_size / 1024)} KB | {doc.status}</p>
                                <p className="text-[9px] text-emerald-700 font-bold">Extracted Facts Count: {doc.facts_count || 0}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={async () => {
                                  try {
                                    const res = await apiGet(`/api/v1/documents/${doc.id}/url`);
                                    if (res.ok) {
                                      const data = await res.json();
                                      alert(`Mock Signed URL: ${data.url}`);
                                    }
                                  } catch (err) {
                                    alert("Failed to get signed URL");
                                  }
                                }} 
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                              >
                                View
                              </button>
                              <span className="text-slate-300">|</span>
                              <button 
                                onClick={() => {
                                  setActiveTab("overview");
                                  setWorkspaceExpanded(true);
                                  setCfoInput("What is my outstanding loan and can I prepay it?");
                                }}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                              >
                                Ask ArthAI
                              </button>
                              <span className="text-slate-300">|</span>
                              <button 
                                onClick={async () => {
                                  if (confirm("Are you sure you want to delete this document?")) {
                                    try {
                                      const res = await apiDelete(`/api/v1/documents/${doc.id}`);
                                      if (res.ok) {
                                        alert("Document deleted successfully");
                                        fetchBackendData();
                                      }
                                    } catch (err) {
                                      alert("Failed to delete document");
                                    }
                                  }
                                }} 
                                className="text-xs font-bold text-rose-600 hover:text-rose-700 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
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
                        <div key={idx} className="bg-slate-50 border border-slate-155 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">{cp.year} Horizon</span>
                            <h4 className="text-base font-black text-slate-800 mt-1">{cp.nw} Projected Net Worth</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Target Achievement: {cp.goal}</p>
                          </div>
                          <span className="text-xs font-black text-[#0B5D4B] bg-emerald-50 px-3.5 py-1.5 rounded-full">{cp.score} Health</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "decision_center" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-display text-base font-bold text-slate-700">Family Decision Center</h3>
                      <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">Optimize Capital Allocations</span>
                    </div>

                    <form onSubmit={handleDecisionCenter} className="space-y-4">
                      <label className="block text-xs font-extrabold uppercase text-slate-400">Ask strategic allocation questions</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Should I switch to the New Tax Regime or prepay HDFC loan?"
                          value={decisionInput}
                          onChange={(e) => setDecisionInput(e.target.value)}
                          className="flex-1 bg-slate-50 border px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold focus:outline-none focus:border-primary text-slate-800"
                        />
                        <button type="submit" className="bg-[#0B5D4B] hover:bg-[#074739] text-white px-5 rounded-2xl text-xs font-bold">Analyze</button>
                      </div>
                    </form>

                    {decisionLoading && (
                      <div className="bg-slate-50 p-6 rounded-2xl border text-center text-xs font-bold text-slate-500 animate-pulse">
                        ⌛ AI is modeling structural cashflow trade-offs...
                      </div>
                    )}

                    {decisionResult && !decisionLoading && (
                      <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl text-xs font-semibold text-slate-700 space-y-3">
                        <p className="font-black text-rose-700">{decisionResult.impact}</p>
                        <p><strong>Monthly Cashflow Impact:</strong> {decisionResult.cashflow}</p>
                        <p><strong>ArthAI Alternate recommendation:</strong> {decisionResult.alternatives}</p>
                        <span className="text-[9px] uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500">{decisionResult.score}</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "insights" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-display text-base font-bold text-slate-700">AI Proactive Insights</h3>
                      <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">5 critical alerts</span>
                    </div>

                    <div className="space-y-4">
                      {insights.map((ins, idx) => (
                        <div key={ins.id || idx} className="bg-slate-50 border p-5 rounded-2xl">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${ins.severity === "high" ? "bg-rose-50 text-rose-750" : "bg-emerald-50 text-emerald-700"}`}>{ins.severity} Severity</span>
                          <h4 className="text-xs font-black text-slate-800 mt-2">{ins.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">{ins.description}</p>
                          <p className="text-[9px] text-[#0B5D4B] font-extrabold uppercase mt-2">Suggested Correction: {ins.action_suggested}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-display text-base font-bold text-slate-700">Configurations & System Settings</h3>
                      <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] px-3 py-1 rounded-full font-bold">Active</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Your family aggregates and documents are secured using end-to-end AES-256 vault configurations. Synced via Open Sandbox integrations.
                    </p>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </main>
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
                  <span className="block text-2xl font-black text-primary">{briefData ? briefData.health_score : 89}</span>
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
