"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  Wallet, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/api";

interface IncomeSource {
  id?: string;
  source_name: string;
  type: string;
  amount: number;
  frequency: string;
}

interface ExpenseCategory {
  id?: string;
  category: string;
  amount: number;
  essential: boolean;
}

interface Asset {
  id?: string;
  asset_name: string;
  asset_type: string;
  current_value: number;
}

interface Liability {
  id?: string;
  loan_name: string;
  loan_type: string;
  principal: number;
  outstanding: number;
  interest_rate: number;
  emi: number;
}

interface Goal {
  id?: string;
  goal_name: string;
  category: string;
  target_amount: number;
  saved_amount: number;
  monthly_contribution: number;
  priority: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(true);

  // Summary state derived deterministically from BusinessRuleEngine via backend API
  const [liveSummary, setLiveSummary] = useState<any>(null);

  // Step 1: About You
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [dependents, setDependents] = useState(0);

  // Step 2: Income
  const [incomes, setIncomes] = useState<IncomeSource[]>([]);

  // Step 3: Expenses
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([]);

  // Step 4: Assets
  const [assets, setAssets] = useState<Asset[]>([]);

  // Step 5: Liabilities
  const [liabilities, setLiabilities] = useState<Liability[]>([]);

  // Step 6: Goals & Risk
  const [goals, setGoals] = useState<Goal[]>([]);
  const [riskAppetite, setRiskAppetite] = useState("Moderate");

  // Track deleted IDs so they can be removed on save
  const [deletedIncomes, setDeletedIncomes] = useState<string[]>([]);
  const [deletedExpenses, setDeletedExpenses] = useState<string[]>([]);
  const [deletedAssets, setDeletedAssets] = useState<string[]>([]);
  const [deletedLiabilities, setDeletedLiabilities] = useState<string[]>([]);
  const [deletedGoals, setDeletedGoals] = useState<string[]>([]);

  // Load existing user data on mount so onboarding reloads saved records seamlessly
  useEffect(() => {
    const loadExistingData = async () => {
      setInitialDataLoading(true);
      try {
        // Fetch user auth details
        const meRes = await apiGet("/api/v1/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.full_name) setFullName(meData.full_name);
        }

        // Fetch Profile
        const profRes = await apiGet("/api/v1/profile");
        if (profRes.ok) {
          const prof = await profRes.json();
          if (prof.age && prof.age > 0) setAge(prof.age);
          if (prof.city) setCity(prof.city);
          if (prof.occupation) setOccupation(prof.occupation);
          if (prof.marital_status) setMaritalStatus(prof.marital_status);
          if (prof.dependents !== undefined) setDependents(prof.dependents);
          if (prof.risk_appetite) setRiskAppetite(prof.risk_appetite);
        }

        // Fetch Incomes
        const incRes = await apiGet("/api/v1/incomes");
        if (incRes.ok) {
          const incData = await incRes.json();
          if (Array.isArray(incData) && incData.length > 0) {
            setIncomes(incData.map((i: any) => ({
              id: i.id,
              source_name: i.source_name,
              type: i.type || "Salary",
              amount: parseFloat(i.amount) || 0,
              frequency: i.frequency || "Monthly"
            })));
          }
        }

        // Fetch Expenses
        const expRes = await apiGet("/api/v1/expenses");
        if (expRes.ok) {
          const expData = await expRes.json();
          if (Array.isArray(expData) && expData.length > 0) {
            setExpenses(expData.map((e: any) => ({
              id: e.id,
              category: e.category,
              amount: parseFloat(e.amount) || 0,
              essential: e.essential ?? true
            })));
          }
        }

        // Fetch Assets
        const assetRes = await apiGet("/api/v1/assets");
        if (assetRes.ok) {
          const assetData = await assetRes.json();
          if (Array.isArray(assetData) && assetData.length > 0) {
            setAssets(assetData.map((a: any) => ({
              id: a.id,
              asset_name: a.asset_name,
              asset_type: a.asset_type || "Cash",
              current_value: parseFloat(a.current_value) || 0
            })));
          }
        }

        // Fetch Liabilities
        const liabRes = await apiGet("/api/v1/liabilities");
        if (liabRes.ok) {
          const liabData = await liabRes.json();
          if (Array.isArray(liabData) && liabData.length > 0) {
            setLiabilities(liabData.map((l: any) => ({
              id: l.id,
              loan_name: l.loan_name,
              loan_type: l.loan_type || "PersonalLoan",
              principal: parseFloat(l.principal) || 0,
              outstanding: parseFloat(l.outstanding) || 0,
              interest_rate: parseFloat(l.interest_rate) || 0,
              emi: parseFloat(l.emi) || 0
            })));
          }
        }

        // Fetch Goals
        const goalsRes = await apiGet("/api/v1/goals");
        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          if (Array.isArray(goalsData) && goalsData.length > 0) {
            setGoals(goalsData.map((g: any) => ({
              id: g.id,
              goal_name: g.goal_name,
              category: g.category || "General",
              target_amount: parseFloat(g.target_amount) || 0,
              saved_amount: parseFloat(g.saved_amount) || 0,
              monthly_contribution: parseFloat(g.monthly_contribution) || 0,
              priority: g.priority || "Medium"
            })));
          }
        }
      } catch (err) {
        console.error("Failed to load existing financial profile data", err);
      } finally {
        setInitialDataLoading(false);
      }
    };

    loadExistingData();
  }, []);

  // Fetch authoritative live calculations from backend BusinessRuleEngine
  const calculateLiveState = async () => {
    try {
      const validIncomes = incomes.filter(i => i.source_name.trim() !== "");
      const validExpenses = expenses.filter(e => e.category.trim() !== "");
      const validAssets = assets.filter(a => a.asset_name.trim() !== "");
      const validLiabilities = liabilities.filter(l => l.loan_name.trim() !== "");
      const validGoals = goals.filter(g => g.goal_name.trim() !== "");

      const totalIncome = validIncomes.reduce((acc, curr) => acc + curr.amount, 0);
      const totalExpenses = validExpenses.reduce((acc, curr) => acc + curr.amount, 0);
      const totalAssetsVal = validAssets.reduce((acc, curr) => acc + curr.current_value, 0);

      const res = await apiPost("/api/v1/onboarding/calculate-metrics", {
        monthly_income: totalIncome,
        monthly_expenses: totalExpenses,
        emergency_fund: totalAssetsVal,
        incomes: validIncomes,
        expenses: validExpenses,
        assets: validAssets,
        liabilities: validLiabilities,
        goals: validGoals
      });

      if (res.ok) {
        const data = await res.json();
        setLiveSummary(data);
      }
    } catch (err) {
      console.error("Rules simulation calculation failed", err);
    }
  };

  useEffect(() => {
    calculateLiveState();
  }, [incomes, expenses, assets, liabilities, goals]);

  // Step 1: Save Profile
  const handleSaveStep1 = async () => {
    const numAge = typeof age === "number" ? age : parseInt(age as string, 10);
    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (isNaN(numAge) || numAge < 18 || numAge > 120) {
      alert("Please enter a valid age (18 or older).");
      return;
    }
    if (!city.trim()) {
      alert("Please enter your city.");
      return;
    }
    if (!occupation.trim()) {
      alert("Please enter your occupation.");
      return;
    }

    setLoading(true);
    try {
      await apiPut("/api/v1/profile", {
        age: numAge,
        city: city.trim(),
        occupation: occupation.trim(),
        marital_status: maritalStatus,
        dependents: dependents
      });
      setStep(2);
    } catch (err) {
      alert("Failed to save profile. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Save Income
  const handleSaveStep2 = async () => {
    for (const inc of incomes) {
      if (!inc.source_name.trim()) {
        alert("Please enter a name for all income sources or remove empty rows.");
        return;
      }
      if (isNaN(inc.amount) || inc.amount < 0) {
        alert("Income amount cannot be negative or empty.");
        return;
      }
    }

    setLoading(true);
    try {
      // Process deletions
      for (const delId of deletedIncomes) {
        await apiDelete(`/api/v1/incomes/${delId}`);
      }
      setDeletedIncomes([]);

      // Create / update incomes
      for (const inc of incomes) {
        if (inc.source_name.trim()) {
          await apiPost("/api/v1/incomes", {
            source_name: inc.source_name.trim(),
            type: inc.type,
            amount: inc.amount,
            frequency: inc.frequency,
            active: true
          });
        }
      }
      setStep(3);
    } catch (err) {
      alert("Failed to save income sources.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save Expenses
  const handleSaveStep3 = async () => {
    for (const exp of expenses) {
      if (!exp.category.trim()) {
        alert("Please enter a category name for all expenses or remove empty rows.");
        return;
      }
      if (isNaN(exp.amount) || exp.amount < 0) {
        alert("Expense amount cannot be negative or empty.");
        return;
      }
    }

    setLoading(true);
    try {
      for (const delId of deletedExpenses) {
        await apiDelete(`/api/v1/expenses/${delId}`);
      }
      setDeletedExpenses([]);

      for (const exp of expenses) {
        if (exp.category.trim()) {
          await apiPost("/api/v1/expenses", {
            category: exp.category.trim(),
            amount: exp.amount,
            essential: exp.essential
          });
        }
      }
      setStep(4);
    } catch (err) {
      alert("Failed to save expenses.");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Save Assets
  const handleSaveStep4 = async () => {
    for (const asset of assets) {
      if (!asset.asset_name.trim()) {
        alert("Please enter a name for all assets or remove empty rows.");
        return;
      }
      if (isNaN(asset.current_value) || asset.current_value < 0) {
        alert("Asset value cannot be negative.");
        return;
      }
    }

    setLoading(true);
    try {
      for (const delId of deletedAssets) {
        await apiDelete(`/api/v1/assets/${delId}`);
      }
      setDeletedAssets([]);

      for (const asset of assets) {
        if (asset.asset_name.trim()) {
          await apiPost("/api/v1/assets", {
            asset_name: asset.asset_name.trim(),
            asset_type: asset.asset_type,
            current_value: asset.current_value
          });
        }
      }
      setStep(5);
    } catch (err) {
      alert("Failed to save assets.");
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Save Liabilities
  const handleSaveStep5 = async () => {
    for (const liab of liabilities) {
      if (!liab.loan_name.trim()) {
        alert("Please enter a name for all loans or remove empty rows.");
        return;
      }
      if (isNaN(liab.outstanding) || liab.outstanding < 0) {
        alert("Outstanding loan balance cannot be negative.");
        return;
      }
      if (isNaN(liab.emi) || liab.emi < 0) {
        alert("Monthly EMI cannot be negative.");
        return;
      }
      if (isNaN(liab.interest_rate) || liab.interest_rate < 0 || liab.interest_rate > 100) {
        alert("Interest rate must be between 0% and 100%.");
        return;
      }
    }

    setLoading(true);
    try {
      for (const delId of deletedLiabilities) {
        await apiDelete(`/api/v1/liabilities/${delId}`);
      }
      setDeletedLiabilities([]);

      for (const liab of liabilities) {
        if (liab.loan_name.trim()) {
          await apiPost("/api/v1/liabilities", {
            loan_name: liab.loan_name.trim(),
            loan_type: liab.loan_type,
            principal: liab.principal || liab.outstanding,
            outstanding: liab.outstanding,
            interest_rate: liab.interest_rate,
            emi: liab.emi
          });
        }
      }
      setStep(6);
    } catch (err) {
      alert("Failed to save liabilities.");
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Save Goals & Risk Appetite, then finalize onboarding to Dashboard
  const handleCompleteOnboarding = async () => {
    for (const goal of goals) {
      if (!goal.goal_name.trim()) {
        alert("Please enter a name for all goals or remove empty rows.");
        return;
      }
      if (isNaN(goal.target_amount) || goal.target_amount < 0) {
        alert("Target amount cannot be negative.");
        return;
      }
      if (isNaN(goal.saved_amount) || goal.saved_amount < 0) {
        alert("Saved amount cannot be negative.");
        return;
      }
    }

    setLoading(true);
    try {
      for (const delId of deletedGoals) {
        await apiDelete(`/api/v1/goals/${delId}`);
      }
      setDeletedGoals([]);

      for (const goal of goals) {
        if (goal.goal_name.trim()) {
          await apiPost("/api/v1/goals", {
            goal_name: goal.goal_name.trim(),
            category: goal.category,
            target_amount: goal.target_amount,
            saved_amount: goal.saved_amount,
            monthly_contribution: goal.monthly_contribution,
            priority: goal.priority,
            status: "Active"
          });
        }
      }

      // Sync summary aggregates directly to profile for deterministic consistency
      await apiPut("/api/v1/profile", {
        risk_appetite: riskAppetite,
        monthly_income: liveSummary?.income || 0,
        monthly_expenses: liveSummary?.expenses || 0,
        monthly_savings: Math.max(0, liveSummary?.surplus || 0),
        emergency_fund: liveSummary?.assets || 0
      });

      router.replace("/dashboard");
    } catch (err) {
      alert("Onboarding finalization failed. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  if (initialDataLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#0B5D4B] animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading your financial profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col lg:grid lg:grid-cols-12 relative overflow-hidden">
      {/* Mesh gradients background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Main onboarding form column (Col-8) */}
      <div className="lg:col-span-8 p-6 md:p-12 flex flex-col justify-between relative z-10">
        
        {/* Header branding */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-[#22c55e]">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-black text-dark tracking-tight">Arth<span className="text-primary">AI</span> Financial Onboarding</span>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            <span>Step {step} of 6 — {
              step === 1 ? "About You" :
              step === 2 ? "Income" :
              step === 3 ? "Expenses" :
              step === 4 ? "Assets" :
              step === 5 ? "Liabilities" :
              "Review & Pulse"
            }</span>
            <span>{Math.round(((step - 1) / 5) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-500" style={{ width: `${(step / 6) * 100}%` }} />
          </div>
        </div>

        {/* Step Wizard Pages */}
        <div className="flex-1 bg-white p-6 md:p-10 rounded-4xl border border-slate-200/50 shadow-xl max-w-3xl w-full mx-auto">
          
          {/* STEP 1: ABOUT YOU */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">About You</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">
                  ArthAI uses your demographic context to personalize benchmark savings rates, retirement timelines, and emergency runway sizing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shruti Dewaskar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">Age</label>
                  <input
                    type="number"
                    min={18}
                    max={120}
                    required
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru, Mumbai, Delhi NCR"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">Occupation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer, Doctor, Consultant"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">Dependents Count</label>
                  <input
                    type="number"
                    min={0}
                    value={dependents}
                    onChange={(e) => setDependents(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveStep1}
                  disabled={loading}
                  className="bg-primary hover:bg-[#074739] text-white font-black text-xs px-8 py-4 rounded-2xl uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Continue to Income"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: INCOME */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">Income</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">
                  Tell us what comes in every month. ArthAI uses your recurring income to calculate your savings capacity and debt serviceability.
                </p>
              </div>

              <div className="space-y-3.5">
                {incomes.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    <Wallet className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No income added yet.</p>
                    <p className="text-[11px] text-slate-450 mt-1">Add your salary, freelance earnings, business profit, rental income, or dividends.</p>
                  </div>
                ) : (
                  incomes.map((inc, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                      <div className="md:col-span-5">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Source Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Primary Job Salary"
                          value={inc.source_name}
                          onChange={(e) => {
                            const copy = [...incomes];
                            copy[index].source_name = e.target.value;
                            setIncomes(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Type</label>
                        <select
                          value={inc.type}
                          onChange={(e) => {
                            const copy = [...incomes];
                            copy[index].type = e.target.value;
                            setIncomes(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        >
                          <option value="Salary">Salary</option>
                          <option value="Business">Business</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Rental">Rental</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Amount (₹/mo)</label>
                        <input
                          type="number"
                          placeholder="e.g. 80000"
                          value={inc.amount === 0 ? "" : inc.amount}
                          onChange={(e) => {
                            const copy = [...incomes];
                            copy[index].amount = Math.max(0, parseFloat(e.target.value) || 0);
                            setIncomes(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center justify-center pt-4">
                        <button
                          onClick={() => {
                            if (inc.id) setDeletedIncomes([...deletedIncomes, inc.id]);
                            setIncomes(incomes.filter((_, i) => i !== index));
                          }}
                          className="text-rose-500 hover:text-rose-700 transition p-1.5 rounded-lg hover:bg-rose-50"
                          title="Delete income"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <button
                  onClick={() => setIncomes([...incomes, { source_name: "", type: "Salary", amount: 0, frequency: "Monthly" }])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-2"
                >
                  <Plus className="h-4 w-4" /> Add Income Source
                </button>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleSaveStep2}
                  disabled={loading}
                  className="bg-primary hover:bg-[#074739] text-white font-black text-xs px-8 py-4 rounded-2xl uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Continue to Expenses"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: EXPENSES */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">Expenses</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">
                  Where does your money go? ArthAI categorizes essential vs non-essential spending to calculate your true discretionary cash surplus.
                </p>
              </div>

              <div className="space-y-3.5">
                {expenses.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    <TrendingUp className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No expenses added yet.</p>
                    <p className="text-[11px] text-slate-450 mt-1">Add your housing, food, transportation, utilities, entertainment, and health expenses.</p>
                  </div>
                ) : (
                  expenses.map((exp, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                      <div className="md:col-span-6">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Category</label>
                        <input
                          type="text"
                          placeholder="e.g. Housing, Food, Utilities"
                          value={exp.category}
                          onChange={(e) => {
                            const copy = [...expenses];
                            copy[index].category = e.target.value;
                            setExpenses(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Amount (₹/mo)</label>
                        <input
                          type="number"
                          placeholder="e.g. 20000"
                          value={exp.amount === 0 ? "" : exp.amount}
                          onChange={(e) => {
                            const copy = [...expenses];
                            copy[index].amount = Math.max(0, parseFloat(e.target.value) || 0);
                            setExpenses(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id={`essential-${index}`}
                          checked={exp.essential}
                          onChange={(e) => {
                            const copy = [...expenses];
                            copy[index].essential = e.target.checked;
                            setExpenses(copy);
                          }}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                        <label htmlFor={`essential-${index}`} className="text-xs font-bold text-slate-600 cursor-pointer">Essential</label>
                      </div>
                      <div className="md:col-span-1 flex items-center justify-center pt-4">
                        <button
                          onClick={() => {
                            if (exp.id) setDeletedExpenses([...deletedExpenses, exp.id]);
                            setExpenses(expenses.filter((_, i) => i !== index));
                          }}
                          className="text-rose-500 hover:text-rose-700 transition p-1.5 rounded-lg hover:bg-rose-50"
                          title="Delete expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setExpenses([...expenses, { category: "", amount: 0, essential: true }])}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <Plus className="h-4 w-4" /> Add Custom Expense
                  </button>
                  {expenses.length === 0 && (
                    <button
                      onClick={() => setExpenses([
                        { category: "Housing", amount: 0, essential: true },
                        { category: "Food & Groceries", amount: 0, essential: true },
                        { category: "Transport", amount: 0, essential: true },
                        { category: "Utilities", amount: 0, essential: true }
                      ])}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 transition underline"
                    >
                      Add Common Categories
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleSaveStep3}
                  disabled={loading}
                  className="bg-primary hover:bg-[#074739] text-white font-black text-xs px-8 py-4 rounded-2xl uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Continue to Assets"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ASSETS */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">Assets</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">
                  What do you currently own or have invested? We compute your liquid emergency runway and total asset valuation.
                </p>
              </div>

              <div className="space-y-3.5">
                {assets.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    <ShieldCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No assets added yet.</p>
                    <p className="text-[11px] text-slate-450 mt-1">Add your bank savings, mutual funds, gold, fixed deposits, or real estate assets.</p>
                  </div>
                ) : (
                  assets.map((asset, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                      <div className="md:col-span-5">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Asset Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Bank Savings, Index Fund"
                          value={asset.asset_name}
                          onChange={(e) => {
                            const copy = [...assets];
                            copy[index].asset_name = e.target.value;
                            setAssets(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Asset Type</label>
                        <select
                          value={asset.asset_type}
                          onChange={(e) => {
                            const copy = [...assets];
                            copy[index].asset_type = e.target.value;
                            setAssets(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        >
                          <option value="Cash">Cash / Bank</option>
                          <option value="MutualFunds">Mutual Funds</option>
                          <option value="Gold">Physical Gold</option>
                          <option value="FD">Fixed Deposit</option>
                          <option value="RealEstate">Real Estate</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Current Value (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 100000"
                          value={asset.current_value === 0 ? "" : asset.current_value}
                          onChange={(e) => {
                            const copy = [...assets];
                            copy[index].current_value = Math.max(0, parseFloat(e.target.value) || 0);
                            setAssets(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center justify-center pt-4">
                        <button
                          onClick={() => {
                            if (asset.id) setDeletedAssets([...deletedAssets, asset.id]);
                            setAssets(assets.filter((_, i) => i !== index));
                          }}
                          className="text-rose-500 hover:text-rose-700 transition p-1.5 rounded-lg hover:bg-rose-50"
                          title="Delete asset"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <button
                  onClick={() => setAssets([...assets, { asset_name: "", asset_type: "Cash", current_value: 0 }])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-2"
                >
                  <Plus className="h-4 w-4" /> Add Asset
                </button>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleSaveStep4}
                  disabled={loading}
                  className="bg-primary hover:bg-[#074739] text-white font-black text-xs px-8 py-4 rounded-2xl uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Continue to Liabilities"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: LIABILITIES */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">Liabilities</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">
                  What do you currently owe? Debt-to-income (DTI) and interest obligations directly determine your financial leverage risk.
                </p>
              </div>

              <div className="space-y-3.5">
                {liabilities.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No liabilities added.</p>
                    <p className="text-[11px] text-slate-450 mt-1">If you are completely debt-free, you can proceed directly. Otherwise, add your active loans or credit balances.</p>
                  </div>
                ) : (
                  liabilities.map((liab, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Loan / Card Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Home Loan, Education Loan"
                            value={liab.loan_name}
                            onChange={(e) => {
                              const copy = [...liabilities];
                              copy[index].loan_name = e.target.value;
                              setLiabilities(copy);
                            }}
                            className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Loan Type</label>
                          <select
                            value={liab.loan_type}
                            onChange={(e) => {
                              const copy = [...liabilities];
                              copy[index].loan_type = e.target.value;
                              setLiabilities(copy);
                            }}
                            className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                          >
                            <option value="HomeLoan">Home Loan</option>
                            <option value="CarLoan">Car Loan</option>
                            <option value="PersonalLoan">Personal Loan</option>
                            <option value="EducationLoan">Education Loan</option>
                            <option value="CreditCard">Credit Card</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Outstanding Balance (₹)</label>
                          <input
                            type="number"
                            placeholder="e.g. 500000"
                            value={liab.outstanding === 0 ? "" : liab.outstanding}
                            onChange={(e) => {
                              const copy = [...liabilities];
                              copy[index].outstanding = Math.max(0, parseFloat(e.target.value) || 0);
                              setLiabilities(copy);
                            }}
                            className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Interest Rate (%)</label>
                          <input
                            type="number"
                            placeholder="e.g. 8.5"
                            value={liab.interest_rate === 0 ? "" : liab.interest_rate}
                            onChange={(e) => {
                              const copy = [...liabilities];
                              copy[index].interest_rate = Math.max(0, parseFloat(e.target.value) || 0);
                              setLiabilities(copy);
                            }}
                            className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Monthly EMI (₹)</label>
                          <input
                            type="number"
                            placeholder="e.g. 15000"
                            value={liab.emi === 0 ? "" : liab.emi}
                            onChange={(e) => {
                              const copy = [...liabilities];
                              copy[index].emi = Math.max(0, parseFloat(e.target.value) || 0);
                              setLiabilities(copy);
                            }}
                            className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="flex justify-end items-center pt-4">
                          <button
                            onClick={() => {
                              if (liab.id) setDeletedLiabilities([...deletedLiabilities, liab.id]);
                              setLiabilities(liabilities.filter((_, i) => i !== index));
                            }}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold transition flex items-center gap-1 p-2 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" /> Remove Loan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <button
                  onClick={() => setLiabilities([...liabilities, { loan_name: "", loan_type: "PersonalLoan", principal: 0, outstanding: 0, interest_rate: 0, emi: 0 }])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-2"
                >
                  <Plus className="h-4 w-4" /> Add Liability
                </button>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleSaveStep5}
                  disabled={loading}
                  className="bg-primary hover:bg-[#074739] text-white font-black text-xs px-8 py-4 rounded-2xl uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Continue to Goals & Review"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: GOALS, RISK & FINAL REVIEW */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">Goals & Final Review</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">
                  What are you trying to achieve with your money? Review your financial snapshot computed deterministically by the ArthAI Rule Engine.
                </p>
              </div>

              {/* Goals segment */}
              <div className="space-y-3.5 border-b pb-5">
                <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">Financial Goals</h3>
                {goals.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 text-center">
                    <p className="text-xs font-bold text-slate-700">No goals added yet.</p>
                    <p className="text-[11px] text-slate-450 mt-1">Add goals like emergency fund, home downpayment, retirement, or vacation.</p>
                  </div>
                ) : (
                  goals.map((goal, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Goal Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Home Downpayment"
                          value={goal.goal_name}
                          onChange={(e) => {
                            const copy = [...goals];
                            copy[index].goal_name = e.target.value;
                            setGoals(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Target Amount (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 1000000"
                          value={goal.target_amount === 0 ? "" : goal.target_amount}
                          onChange={(e) => {
                            const copy = [...goals];
                            copy[index].target_amount = Math.max(0, parseFloat(e.target.value) || 0);
                            setGoals(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Saved (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 100000"
                          value={goal.saved_amount === 0 ? "" : goal.saved_amount}
                          onChange={(e) => {
                            const copy = [...goals];
                            copy[index].saved_amount = Math.max(0, parseFloat(e.target.value) || 0);
                            setGoals(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Priority</label>
                        <select
                          value={goal.priority}
                          onChange={(e) => {
                            const copy = [...goals];
                            copy[index].priority = e.target.value;
                            setGoals(copy);
                          }}
                          className="w-full bg-white border px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      <div className="md:col-span-1 flex items-center justify-center pt-4">
                        <button
                          onClick={() => {
                            if (goal.id) setDeletedGoals([...deletedGoals, goal.id]);
                            setGoals(goals.filter((_, i) => i !== index));
                          }}
                          className="text-rose-500 hover:text-rose-700 transition p-1.5 rounded-lg hover:bg-rose-50"
                          title="Delete goal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={() => setGoals([...goals, { goal_name: "", category: "General", target_amount: 0, saved_amount: 0, monthly_contribution: 0, priority: "High" }])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-2"
                >
                  <Plus className="h-4 w-4" /> Add Goal
                </button>
              </div>

              {/* Risk Appetite */}
              <div className="border-b pb-5">
                <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">Preferred Risk Profile</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Conservative", "Moderate", "Aggressive"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRiskAppetite(r)}
                      className={`py-3 rounded-2xl text-xs font-bold border transition-colors ${
                        riskAppetite === r 
                          ? "bg-primary border-primary text-white font-black" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review & Financial Pulse Summary */}
              {liveSummary && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Verified Financial Baseline
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Monthly Inflow</span>
                      <p className="text-sm font-black text-slate-800 mt-0.5">₹{liveSummary.income.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Monthly Outflow</span>
                      <p className="text-sm font-black text-slate-800 mt-0.5">₹{liveSummary.expenses.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Monthly Surplus</span>
                      <p className={`text-sm font-black mt-0.5 ${liveSummary.surplus >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        ₹{liveSummary.surplus.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Calculated Net Worth</span>
                      <p className={`text-sm font-black mt-0.5 ${liveSummary.netWorth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        ₹{liveSummary.netWorth.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  className="bg-[#0B5D4B] hover:bg-[#074739] text-white font-black text-xs px-10 py-4.5 rounded-2xl uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-[#0B5D4B]/20 disabled:opacity-50"
                >
                  {loading ? "Launching Pulse..." : "Launch Financial Pulse"} <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Real-time calculated live summary column (Col-4) */}
      <div className="lg:col-span-4 bg-primary text-white p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Background glow overlay */}
        <div className="absolute inset-0 bg-[#083d31] opacity-60 mix-blend-multiply" />
        <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-8">
          <div>
            <span className="text-[10px] bg-white/10 text-emerald-350 border border-white/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Engine Calculation</span>
            <h3 className="text-xl font-display font-black tracking-tight mt-3">Live Balance Sheet</h3>
            <p className="text-xs text-emerald-150 mt-1 font-semibold">Processed in real-time by the ArthAI mathematical rules engine.</p>
          </div>

          {liveSummary ? (
            <div className="space-y-6">
              {/* Cash flow segment */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <h4 className="text-[10px] text-emerald-350 font-extrabold uppercase tracking-widest">Monthly Cash Flow</h4>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-[9px] text-emerald-200 block uppercase font-bold">Total Inflow</span>
                    <p className="text-base font-black text-white mt-0.5">₹{liveSummary.income.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-200 block uppercase font-bold">Total Spend</span>
                    <p className="text-base font-black text-white mt-0.5">₹{liveSummary.expenses.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-200 block uppercase font-bold">Surplus Margin</span>
                    <p className="text-base font-black text-emerald-400 mt-0.5">₹{liveSummary.surplus.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-200 block uppercase font-bold">Savings Rate</span>
                    <p className="text-base font-black text-emerald-400 mt-0.5">{liveSummary.savingsRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Net worth segment */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <h4 className="text-[10px] text-emerald-350 font-extrabold uppercase tracking-widest">Position & Net Worth</h4>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-[9px] text-emerald-200 block uppercase font-bold">Total Assets</span>
                    <p className="text-base font-black text-white mt-0.5">₹{liveSummary.assets.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-200 block uppercase font-bold">Total Liabilities</span>
                    <p className="text-base font-black text-rose-350 mt-0.5">₹{liveSummary.liabilities.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-emerald-200 block uppercase font-bold">Calculated Net Worth</span>
                    <p className="text-xl font-black text-[#22c55e] mt-0.5">₹{liveSummary.netWorth.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-200/80 border-t border-white/10 pt-4">
              Enter your income, expenses, assets, and liabilities to see your live calculated balance sheet.
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-emerald-200 font-bold bg-[#094d3f] border border-white/5 p-4 rounded-2xl">
            <ShieldCheck className="h-4.5 w-4.5 text-[#22c55e] shrink-0" />
            Your data is locally isolated and secured with PostgreSQL row-level security.
          </div>
        </div>
      </div>
    </main>
  );
}
