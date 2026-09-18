"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiGet,
  apiPost,
  getFinancialPulse,
  AttentionItem,
  FinancialPulseResponse,
  getCandidates,
  queryCfo,
} from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import {
  DashboardSummary,
  VaultDocument,
  CfoMessage,
  PrimaryHub,
} from "@/types/financial";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { HomeHub } from "@/components/home/HomeHub";
import { MoneyHub } from "@/components/money/MoneyHub";
import { PlanHub } from "@/components/plan/PlanHub";
import { EvidenceHub } from "@/components/evidence/EvidenceHub";
import { CfoHub } from "@/components/cfo/CfoHub";
import { ProfileHub } from "@/components/profile/ProfileHub";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();


  // Canonical Hub & Sub-Tab State
  const [activeHub, setActiveHub] = useState<PrimaryHub>("home");
  const [activeSubTab, setActiveSubTab] = useState<string | undefined>(undefined);

  const [showNotifPopover, setShowNotifPopover] = useState<boolean>(false);
  const [cfoThinking, setCfoThinking] = useState<boolean>(false);
  const [cfoThinkingSteps, setCfoThinkingSteps] = useState<string[]>([]);
  const [cfoStreaming, setCfoStreaming] = useState<boolean>(false);

  // Dynamic Backend Data States
  const [briefData, setBriefData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [pulseData, setPulseData] = useState<FinancialPulseResponse | null>(null);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [pulseError, setPulseError] = useState<string | null>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [feasibilityData, setFeasibilityData] = useState<any>(null);
  const [actionPlansData, setActionPlansData] = useState<any>(null);
  const [vaultDocuments, setVaultDocuments] = useState<VaultDocument[]>([]);
  const [pendingCandidatesCount, setPendingCandidatesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // AI CFO state
  const [cfoMessages, setCfoMessages] = useState<CfoMessage[]>([
    {
      sender: "ai",
      text: "Hello! I am your AI CFO. Let's analyze and optimize your balance sheet. Ask me any question regarding your cash flow, loans, investments, or goal planning.",
      timestamp: "Just now",
    },
  ]);
  const [cfoInput, setCfoInput] = useState("");
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    "Simulate this decision",
    "Explain the calculations",
    "Create a savings plan",
  ]);

  // Simulator state
  const [compareMode, setCompareMode] = useState<boolean>(false);
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
  const [simulatedData, setSimulatedData] = useState<any>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

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

  // Handle URL deep linking (e.g. ?tab=simulator, ?tab=investments, ?tab=plan&subTab=goals)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const subTabParam = searchParams.get("subTab");
    if (tabParam) {
      if (tabParam === "overview" || tabParam === "home") {
        setActiveHub("home");
      } else if (
        tabParam === "cash_flow" ||
        tabParam === "cashflow" ||
        tabParam === "investments" ||
        tabParam === "insurance" ||
        tabParam === "subscriptions" ||
        tabParam === "money"
      ) {
        setActiveHub("money");
        if (tabParam !== "money") setActiveSubTab(tabParam === "cash_flow" ? "cashflow" : tabParam);
      } else if (
        tabParam === "goals" ||
        tabParam === "simulator" ||
        tabParam === "decision_center" ||
        tabParam === "plan"
      ) {
        setActiveHub("plan");
        if (tabParam === "simulator" || tabParam === "decision_center") {
          setActiveSubTab("decision_center");
        } else if (tabParam === "goals") {
          setActiveSubTab("goals");
        }
      } else if (tabParam === "vault" || tabParam === "evidence") {
        setActiveHub("evidence");
        setActiveSubTab("vault");
      } else if (tabParam === "ai_cfo" || tabParam === "cfo") {
        setActiveHub("cfo");
      } else if (tabParam === "settings" || tabParam === "profile") {
        setActiveHub("profile");
      }
    }
    if (subTabParam) {
      setActiveSubTab(subTabParam);
    }
  }, [searchParams]);

  const fetchBackendData = async () => {
    try {
      setLoading(true);

      // Documents
      try {
        const docRes = await apiGet("/api/v1/documents");
        if (docRes.ok) {
          const docJson = await docRes.json();
          setVaultDocuments(docJson);
        }
      } catch (err) {
        console.error("Error loading documents:", err);
      }

      // Stage 5D Candidate entities pending review count
      try {
        const candRes = await getCandidates("PENDING_REVIEW");
        setPendingCandidatesCount(candRes.pending_count || 0);
      } catch (err) {
        console.error("Error loading candidate counts:", err);
      }

      // Onboarding Status check
      const statusRes = await apiGet("/api/v1/onboarding/status");
      if (statusRes.ok) {
        const statusJson = await statusRes.json();
        if (!statusJson.complete) {
          router.replace("/onboarding");
          return;
        }
      }

      // Dashboard Summary
      const summaryRes = await apiGet("/api/v1/dashboard/summary");
      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        setSummaryData(summaryJson);
        setProfileData(summaryJson.profile);
        setGoals(summaryJson.goals || []);
      }

      // Financial Pulse & Attention Items
      try {
        const pulseRes = await getFinancialPulse();
        setPulseData(pulseRes);
        setAttentionItems(pulseRes.attention_items || []);
        setPulseError(null);
      } catch (pulseErr: any) {
        console.error("Financial Pulse loading error:", pulseErr);
        setPulseError("Financial Pulse couldn't be loaded.");
        setPulseData(null);
        setAttentionItems([]);
      }

      // Financial Diagnosis
      try {
        const diagRes = await apiGet("/api/v1/financial-diagnosis");
        if (diagRes.ok) {
          const diagJson = await diagRes.json();
          setDiagnosisData(diagJson);
        }
      } catch (diagErr) {
        console.error("Error fetching financial diagnosis details:", diagErr);
      }

      // Goals Feasibility
      try {
        const feasibilityRes = await apiGet("/api/v1/goals/feasibility");
        if (feasibilityRes.ok) {
          const feasibilityJson = await feasibilityRes.json();
          setFeasibilityData(feasibilityJson);
        }
      } catch (feasibilityErr) {
        console.error("Error fetching goals feasibility:", feasibilityErr);
      }

      // Action Plans
      try {
        const actionPlansRes = await apiPost("/api/v1/action-plans", {});
        if (actionPlansRes.ok) {
          const actionPlansJson = await actionPlansRes.json();
          setActionPlansData(actionPlansJson);
        }
      } catch (actionPlansErr) {
        console.error("Error fetching action plans:", actionPlansErr);
      }

      // Brief
      try {
        const briefRes = await apiGet("/api/v1/brief");
        if (briefRes.ok) {
          const briefJson = await briefRes.json();
          setBriefData(briefJson);
        }
      } catch (briefErr) {
        console.error("Error loading brief:", briefErr);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/");
    } catch (err: any) {
      console.error("Sign out error:", err);
    }
  };

  const handleSelectAttentionItem = (item: AttentionItem) => {
    setShowNotifPopover(false);
    if (item.action_type === "navigate") {
      router.push(item.target_route);
    } else {
      if (item.target_route?.includes("goals")) {
        setActiveHub("plan");
        setActiveSubTab("goals");
      } else if (item.target_route?.includes("cash_flow")) {
        setActiveHub("money");
        setActiveSubTab("cashflow");
      } else if (item.target_route?.includes("investments")) {
        setActiveHub("money");
        setActiveSubTab("investments");
      } else if (item.target_route?.includes("simulator")) {
        setActiveHub("plan");
        setActiveSubTab("decision_center");
      } else if (item.target_route?.includes("vault")) {
        setActiveHub("evidence");
        setActiveSubTab("vault");
      } else {
        setActiveHub("home");
      }
    }
  };

  const handleNavigateHub = (hub: PrimaryHub, subTab?: string) => {
    setActiveHub(hub);
    if (subTab) setActiveSubTab(subTab);
  };

  const handleCfoChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfoInput.trim()) return;

    const userText = cfoInput;
    const userMsg: CfoMessage = { sender: "user", text: userText, timestamp: "Just now" };
    setCfoMessages((prev) => [...prev, userMsg]);
    setCfoInput("");
    setCfoThinking(true);

    try {
      const json = await queryCfo(userText);

      let deepLink: CfoMessage["deepLink"] = undefined;
      const lower = userText.toLowerCase();
      if (lower.includes("goal") || lower.includes("plan") || lower.includes("downpayment") || lower.includes("education")) {
        deepLink = { label: "Inspect Goals in Plan Hub", hub: "plan", subTab: "goals" };
      } else if (lower.includes("loan") || lower.includes("car") || lower.includes("simulate") || lower.includes("decision")) {
        deepLink = { label: "Run Decision Simulation in Plan", hub: "plan", subTab: "decision_center" };
      } else if (lower.includes("evidence") || lower.includes("document") || lower.includes("statement") || lower.includes("fact")) {
        deepLink = { label: "View Verified Evidence in Vault", hub: "evidence", subTab: "vault" };
      } else if (lower.includes("liability") || lower.includes("debt") || lower.includes("expense") || lower.includes("surplus") || lower.includes("income")) {
        deepLink = { label: "Review Balance Sheet in Money", hub: "money", subTab: "overview" };
      }

      const aiMsg: CfoMessage = {
        sender: "ai",
        text: json.answer || "Financial calculations complete.",
        timestamp: "Just now",
        structured: json,
        deepLink,
      };

      setCfoMessages((prev) => [...prev, aiMsg]);

      if (lower.includes("regime") || lower.includes("tax")) {
        setSuggestedActions(["Explain the tax calculations", "Simulate old vs new regime", "Create a tax saving SIP"]);
      } else if (lower.includes("loan") || lower.includes("prepay")) {
        setSuggestedActions(["Calculate interest saved", "Simulate career switch impact", "Review loan tenure delay"]);
      } else {
        setSuggestedActions(["Simulate this decision", "Review my savings plan", "View my financial health score"]);
      }
    } catch (err: any) {
      console.error("CFO query error:", err);
      setCfoMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: err.message || "I encountered an error communicating with the financial reasoning engines. Please check backend connectivity.",
          timestamp: "Just now",
          structured: {
            answer: err.message || "I encountered an error communicating with the financial reasoning engines. Please check backend connectivity.",
            summary: "Reasoning Engine Error",
            assessment: { label: "Needs Attention", severity: "high" },
            reasons: ["The financial reasoning engine could not process the query."],
          },
        },
      ]);
    } finally {
      setCfoThinking(false);
    }
  };

  const runScenarioSimulation = async () => {
    setSimLoading(true);
    setSimulatedData(null);

    let parameters: any = {};
    if (simType === "INCOME_CHANGE") {
      parameters = { change_type: simIncomeType, value: simIncomeVal };
    } else if (simType === "EXPENSE_CHANGE") {
      parameters = { change_type: simExpenseType, value: simExpenseVal };
    } else if (simType === "NEW_LIABILITY") {
      parameters = {
        principal: simLoanPrincipal,
        interest_rate: simLoanInterest,
        tenure_years: simLoanTenure,
        asset_purchase_value: simLoanAssetVal,
      };
    } else if (simType === "INVESTMENT_CONTRIBUTION") {
      parameters = { monthly_change: simInvestVal };
    }

    try {
      const response = await apiPost("/api/v1/simulate", {
        type: simType,
        parameters,
      });
      if (response.ok) {
        const json = await response.json();
        setSimulatedData(json);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimLoading(false);
    }
  };

  const runDecisionComparison = async () => {
    setSimLoading(true);
    setComparisonResult(null);

    const getParams = (
      t: string,
      incType: string,
      incVal: number,
      expType: string,
      expVal: number,
      loanP: number,
      loanI: number,
      loanTenure: number,
      loanA: number,
      investVal: number
    ) => {
      if (t === "INCOME_CHANGE") return { change_type: incType, value: incVal };
      if (t === "EXPENSE_CHANGE") return { change_type: expType, value: expVal };
      if (t === "NEW_LIABILITY")
        return {
          principal: loanP,
          interest_rate: loanI,
          tenure_years: loanTenure,
          asset_purchase_value: loanA,
        };
      return { monthly_change: investVal };
    };

    const optAParams = getParams(
      optAType,
      optAIncomeType,
      optAIncomeVal,
      optAExpenseType,
      optAExpenseVal,
      optALoanPrincipal,
      optALoanInterest,
      optALoanTenure,
      optALoanAssetVal,
      optAInvestVal
    );
    const optBParams = getParams(
      optBType,
      optBIncomeType,
      optBIncomeVal,
      optBExpenseType,
      optBExpenseVal,
      optBLoanPrincipal,
      optBLoanInterest,
      optBLoanTenure,
      optBLoanAssetVal,
      optBInvestVal
    );

    try {
      const response = await apiPost("/api/v1/simulate/compare", {
        options: [
          { id: "option_a", label: "Option A", type: optAType, parameters: optAParams },
          { id: "option_b", label: "Option B", type: optBType, parameters: optBParams },
        ],
      });
      if (response.ok) {
        const json = await response.json();
        setComparisonResult(json);
      }
    } catch (err) {
      console.error("Comparison error:", err);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-emerald-150 relative overflow-x-hidden p-6">
      <DashboardHeader
        attentionItems={attentionItems}
        showNotifPopover={showNotifPopover}
        setShowNotifPopover={setShowNotifPopover}
        pulseError={pulseError}
        onLogout={handleLogout}
        onSelectAttentionItem={handleSelectAttentionItem}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white border border-slate-200/60 p-8 rounded-4xl shadow-xl relative z-10">
        <DashboardSidebar
          activeHub={activeHub}
          setActiveHub={(hub) => {
            setActiveHub(hub);
            setActiveSubTab(undefined);
          }}
          pendingReviewCount={pendingCandidatesCount}
          attentionCount={attentionItems.length}
          onLogout={handleLogout}
        />

        <main className="lg:col-span-9 min-h-[520px] p-8 bg-white border border-slate-100 rounded-3xl shadow-inner relative overflow-hidden flex flex-col justify-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={`hub-${activeHub}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeHub === "home" && (
                <HomeHub
                  summaryData={summaryData}
                  pulseData={pulseData}
                  pulseError={pulseError}
                  attentionItems={attentionItems}
                  briefData={briefData}
                  diagnosisData={diagnosisData}
                  actionPlansData={actionPlansData}
                  onNavigateHub={handleNavigateHub}
                  onRetryPulse={fetchBackendData}
                  onRetryAttention={fetchBackendData}
                />
              )}

              {activeHub === "money" && (
                <MoneyHub
                  summaryData={summaryData}
                  initialSubTab={activeSubTab}
                  onNavigateEvidence={() => handleNavigateHub("evidence", "vault")}
                  onRefreshParent={fetchBackendData}
                />
              )}

              {activeHub === "plan" && (
                <PlanHub
                  goals={goals}
                  feasibilityData={feasibilityData}
                  actionPlansData={actionPlansData}
                  initialSubTab={activeSubTab}
                  onRefreshParent={fetchBackendData}
                  compareMode={compareMode}
                  setCompareMode={setCompareMode}
                  simType={simType}
                  setSimType={setSimType}
                  simIncomeType={simIncomeType}
                  setSimIncomeType={setSimIncomeType}
                  simIncomeVal={simIncomeVal}
                  setSimIncomeVal={setSimIncomeVal}
                  simExpenseType={simExpenseType}
                  setSimExpenseType={setSimExpenseType}
                  simExpenseVal={simExpenseVal}
                  setSimExpenseVal={setSimExpenseVal}
                  simLoanPrincipal={simLoanPrincipal}
                  setSimLoanPrincipal={setSimLoanPrincipal}
                  simLoanInterest={simLoanInterest}
                  setSimLoanInterest={setSimLoanInterest}
                  simLoanTenure={simLoanTenure}
                  setSimLoanTenure={setSimLoanTenure}
                  simLoanAssetVal={simLoanAssetVal}
                  setSimLoanAssetVal={setSimLoanAssetVal}
                  simInvestVal={simInvestVal}
                  setSimInvestVal={setSimInvestVal}
                  simulatedData={simulatedData}
                  setSimulatedData={setSimulatedData}
                  simLoading={simLoading}
                  runScenarioSimulation={runScenarioSimulation}
                  comparisonResult={comparisonResult}
                  setComparisonResult={setComparisonResult}
                  runDecisionComparison={runDecisionComparison}
                  optAType={optAType}
                  setOptAType={setOptAType}
                  optAIncomeType={optAIncomeType}
                  setOptAIncomeType={setOptAIncomeType}
                  optAIncomeVal={optAIncomeVal}
                  setOptAIncomeVal={setOptAIncomeVal}
                  optAExpenseType={optAExpenseType}
                  setOptAExpenseType={setOptAExpenseType}
                  optAExpenseVal={optAExpenseVal}
                  setOptAExpenseVal={setOptAExpenseVal}
                  optALoanPrincipal={optALoanPrincipal}
                  setOptALoanPrincipal={setOptALoanPrincipal}
                  optALoanInterest={optALoanInterest}
                  setOptALoanInterest={setOptALoanInterest}
                  optALoanTenure={optALoanTenure}
                  setOptALoanTenure={setOptALoanTenure}
                  optALoanAssetVal={optALoanAssetVal}
                  setOptALoanAssetVal={setOptALoanAssetVal}
                  optAInvestVal={optAInvestVal}
                  setOptAInvestVal={setOptAInvestVal}
                  optBType={optBType}
                  setOptBType={setOptBType}
                  optBIncomeType={optBIncomeType}
                  setOptBIncomeType={setOptBIncomeType}
                  optBIncomeVal={optBIncomeVal}
                  setOptBIncomeVal={setOptBIncomeVal}
                  optBExpenseType={optBExpenseType}
                  setOptBExpenseType={setOptBExpenseType}
                  optBExpenseVal={optBExpenseVal}
                  setOptBExpenseVal={setOptBExpenseVal}
                  optBLoanPrincipal={optBLoanPrincipal}
                  setOptBLoanPrincipal={setOptBLoanPrincipal}
                  optBLoanInterest={optBLoanInterest}
                  setOptBLoanInterest={setOptBLoanInterest}
                  optBLoanTenure={optBLoanTenure}
                  setOptBLoanTenure={setOptBLoanTenure}
                  optBLoanAssetVal={optBLoanAssetVal}
                  setOptBLoanAssetVal={setOptBLoanAssetVal}
                  optBInvestVal={optBInvestVal}
                  setOptBInvestVal={setOptBInvestVal}
                />
              )}

              {activeHub === "evidence" && (
                <EvidenceHub
                  vaultDocuments={vaultDocuments}
                  onRefresh={fetchBackendData}
                  initialSubTab={activeSubTab}
                />
              )}

              {activeHub === "cfo" && (
                <CfoHub
                  cfoMessages={cfoMessages}
                  cfoInput={cfoInput}
                  setCfoInput={setCfoInput}
                  cfoThinking={cfoThinking}
                  suggestedActions={suggestedActions}
                  handleCfoChat={handleCfoChat}
                  onNavigateHub={handleNavigateHub}
                />
              )}

              {activeHub === "profile" && (
                <ProfileHub
                  profileData={profileData}
                  onRefresh={fetchBackendData}
                  initialSubTab={activeSubTab}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

