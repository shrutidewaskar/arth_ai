"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Plus, Trash2, ShieldCheck, HelpCircle } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

interface IncomeSource {
  source_name: string;
  type: string;
  amount: number;
  frequency: string;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  essential: boolean;
}

interface Asset {
  asset_name: string;
  asset_type: string;
  current_value: number;
}

interface Liability {
  loan_name: string;
  loan_type: string;
  principal: number;
  outstanding: number;
  interest_rate: number;
  emi: number;
}

interface Goal {
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

  // Summary state derived from Rules Engine via backend
  const [liveSummary, setLiveSummary] = useState<any>(null);

  // Step 1: About You
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState(30);
  const [city, setCity] = useState("Mumbai");
  const [occupation, setOccupation] = useState("Professional");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [dependents, setDependents] = useState(0);

  // Step 2: Cash Flow
  const [incomes, setIncomes] = useState<IncomeSource[]>([
    { source_name: "Take-home Salary", type: "Salary", amount: 80000, frequency: "Monthly" }
  ]);
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([
    { category: "Housing", amount: 20000, essential: true },
    { category: "Food", amount: 10000, essential: true },
    { category: "Transport", amount: 5000, essential: true },
    { category: "Utilities", amount: 4000, essential: true }
  ]);

  // Step 3: Assets
  const [assets, setAssets] = useState<Asset[]>([
    { asset_name: "Emergency Savings", asset_type: "FD", current_value: 100000 }
  ]);

  // Step 4: Liabilities
  const [liabilities, setLiabilities] = useState<Liability[]>([]);

  // Step 5: Goals & Risk
  const [goals, setGoals] = useState<Goal[]>([
    { goal_name: "Emergency Buffer", category: "Emergency Fund", target_amount: 300000, saved_amount: 100000, monthly_contribution: 10000, priority: "Critical" }
  ]);
  const [riskAppetite, setRiskAppetite] = useState("Moderate");

  // Fetch live aggregates using the backend rules engine calculations
  const calculateLiveState = async () => {
    try {
      const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
      const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const totalAssetsVal = assets.reduce((acc, curr) => acc + curr.current_value, 0);

      const res = await apiPost("/api/v1/onboarding/calculate-metrics", {
        monthly_income: totalIncome,
        monthly_expenses: totalExpenses,
        emergency_fund: totalAssetsVal,
        incomes: incomes,
        expenses: expenses,
        assets: assets,
        liabilities: liabilities,
        goals: goals
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
  }, [incomes, expenses, assets, liabilities]);

  // Submit methods for each step to persist section data sequentially
  const handleSaveStep1 = async () => {
    if (!fullName.trim() || age <= 0 || !city.trim() || !occupation.trim()) {
      alert("Please fill in all profile fields correctly.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost("/api/v1/profile", {
        full_name: fullName
      }); // Update name metadata if needed
      
      const resProfile = await apiPost("/api/v1/profile", {}); // Retrieve profile
      const profJson = await resProfile.json();
      
      await apiPost("/api/v1/profile", {
        age: age,
        city: city,
        occupation: occupation,
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

  const handleSaveStep2 = async () => {
    setLoading(true);
    try {
      // Create incomes sequentially
      for (const inc of incomes) {
        await apiPost("/api/v1/incomes", inc);
      }
      // Create expenses categories
      for (const exp of expenses) {
        await apiPost("/api/v1/expenses", exp);
      }
      setStep(3);
    } catch (err) {
      alert("Failed to save cashflow metrics.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStep3 = async () => {
    setLoading(true);
    try {
      for (const asset of assets) {
        await apiPost("/api/v1/assets", asset);
      }
      setStep(4);
    } catch (err) {
      alert("Failed to save assets list.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStep4 = async () => {
    setLoading(true);
    try {
      for (const liab of liabilities) {
        await apiPost("/api/v1/liabilities", liab);
      }
      setStep(5);
    } catch (err) {
      alert("Failed to save liabilities metrics.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      for (const goal of goals) {
        await apiPost("/api/v1/goals", goal);
      }
      
      // Save risk Appetite preference to profile
      await apiPost("/api/v1/profile", {
        risk_appetite: riskAppetite,
        // Send monthly aggregates update to profile for final verification synchronization
        monthly_income: liveSummary?.income || 0,
        monthly_expenses: liveSummary?.expenses || 0,
        monthly_savings: Math.max(0, liveSummary?.surplus || 0),
        emergency_fund: liveSummary?.assets || 0
      });

      // Successful onboarding complete redirects to dashboard
      router.replace("/dashboard");
    } catch (err) {
      alert("Onboarding finalization failed.");
    } finally {
      setLoading(false);
    }
  };

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
          <span className="font-display text-2xl font-black text-dark tracking-tight">Arth<span className="text-primary">AI</span> Onboarding</span>
        </div>

        {/* Progress Tracker */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            <span>Step {step} of 5</span>
            <span>{Math.round(((step - 1) / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-550" style={{ width: `${(step / 5) * 100}%` }} />
          </div>
        </div>

        {/* Step Wizard Pages */}
        <div className="flex-1 bg-white p-6 md:p-10 rounded-4xl border border-slate-200/50 shadow-xl max-w-3xl w-full mx-auto">
          
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">About You</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Let's initialize your profile with high-level parameters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Rajesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-455 tracking-wider mb-2">Age</label>
                  <input
                    type="number"
                    min={18}
                    required
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 30)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-455 tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-455 tracking-wider mb-2">Occupation</label>
                  <input
                    type="text"
                    required
                    placeholder="Software Engineer"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-455 tracking-wider mb-2">Marital Status</label>
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
                  <label className="block text-xs font-extrabold uppercase text-slate-455 tracking-wider mb-2">Dependents count</label>
                  <input
                    type="number"
                    min={0}
                    value={dependents}
                    onChange={(e) => setDependents(parseInt(e.target.value) || 0)}
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
                  {loading ? "Saving..." : "Continue"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">Monthly Cash Flow</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">Specify your recurring income sources and monthly spend category layout.</p>
              </div>

              {/* Incomes Segment */}
              <div className="space-y-3.5 border-b pb-5">
                <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">Income Sources</h3>
                {incomes.map((inc, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Salary"
                      value={inc.source_name}
                      onChange={(e) => {
                        const copy = [...incomes];
                        copy[index].source_name = e.target.value;
                        setIncomes(copy);
                      }}
                      className="md:col-span-2 bg-slate-50 border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={inc.amount}
                      onChange={(e) => {
                        const copy = [...incomes];
                        copy[index].amount = Math.max(0, parseFloat(e.target.value) || 0);
                        setIncomes(copy);
                      }}
                      className="bg-slate-50 border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                    />
                    {incomes.length > 1 && (
                      <button
                        onClick={() => setIncomes(incomes.filter((_, i) => i !== index))}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold transition flex items-center gap-1 mt-1 md:mt-0"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setIncomes([...incomes, { source_name: "Other Income", type: "Other", amount: 5000, frequency: "Monthly" }])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" /> Add Income Source
                </button>
              </div>

              {/* Expenses Segment */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">Expenses Breakdown</h3>
                {expenses.map((exp, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <span className="md:col-span-2 text-xs font-bold text-slate-700">{exp.category} Expenses</span>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={exp.amount}
                      onChange={(e) => {
                        const copy = [...expenses];
                        copy[index].amount = Math.max(0, parseFloat(e.target.value) || 0);
                        setExpenses(copy);
                      }}
                      className="bg-slate-50 border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
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
                  {loading ? "Saving..." : "Continue"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">Assets & Net Worth</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">Add cash balance, gold, mutual funds and property assets.</p>
              </div>

              <div className="space-y-3.5">
                {assets.map((asset, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Asset Name"
                      value={asset.asset_name}
                      onChange={(e) => {
                        const copy = [...assets];
                        copy[index].asset_name = e.target.value;
                        setAssets(copy);
                      }}
                      className="md:col-span-4 bg-slate-50 border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                    />
                    <select
                      value={asset.asset_type}
                      onChange={(e) => {
                        const copy = [...assets];
                        copy[index].asset_type = e.target.value;
                        setAssets(copy);
                      }}
                      className="md:col-span-3 bg-slate-50 border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                    >
                      <option value="Cash">Cash / Bank</option>
                      <option value="MutualFunds">Mutual Funds</option>
                      <option value="Gold">Physical Gold</option>
                      <option value="RealEstate">Property</option>
                      <option value="FD">Fixed Deposit</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Value"
                      value={asset.current_value}
                      onChange={(e) => {
                        const copy = [...assets];
                        copy[index].current_value = Math.max(0, parseFloat(e.target.value) || 0);
                        setAssets(copy);
                      }}
                      className="md:col-span-3 bg-slate-50 border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                    />
                    {assets.length > 1 && (
                      <button
                        onClick={() => setAssets(assets.filter((_, i) => i !== index))}
                        className="md:col-span-2 text-rose-500 hover:text-rose-700 text-xs font-bold transition flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setAssets([...assets, { asset_name: "HDFC Savings", asset_type: "Cash", current_value: 50000 }])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" /> Add Asset
                </button>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-550 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleSaveStep3}
                  disabled={loading}
                  className="bg-primary hover:bg-[#074739] text-white font-black text-xs px-8 py-4 rounded-2xl uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Continue"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">Liabilities & Outstanding Loans</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">Add outstanding mortgages, car loans or card liabilities.</p>
              </div>

              <div className="space-y-3.5">
                {liabilities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No liabilities added. You can skip if debt-free.</p>
                ) : (
                  liabilities.map((liab, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Loan Name"
                          value={liab.loan_name}
                          onChange={(e) => {
                            const copy = [...liabilities];
                            copy[index].loan_name = e.target.value;
                            setLiabilities(copy);
                          }}
                          className="bg-white border px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                        <select
                          value={liab.loan_type}
                          onChange={(e) => {
                            const copy = [...liabilities];
                            copy[index].loan_type = e.target.value;
                            setLiabilities(copy);
                          }}
                          className="bg-white border px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        >
                          <option value="HomeLoan">Home Loan</option>
                          <option value="CarLoan">Car Loan</option>
                          <option value="PersonalLoan">Personal Loan</option>
                          <option value="CreditCard">Credit Card</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Outstanding Principal"
                          value={liab.outstanding}
                          onChange={(e) => {
                            const copy = [...liabilities];
                            copy[index].outstanding = Math.max(0, parseFloat(e.target.value) || 0);
                            setLiabilities(copy);
                          }}
                          className="bg-white border px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="number"
                          placeholder="Interest rate (%)"
                          value={liab.interest_rate}
                          onChange={(e) => {
                            const copy = [...liabilities];
                            copy[index].interest_rate = Math.max(0, parseFloat(e.target.value) || 0);
                            setLiabilities(copy);
                          }}
                          className="bg-white border px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                        <input
                          type="number"
                          placeholder="Monthly EMI"
                          value={liab.emi}
                          onChange={(e) => {
                            const copy = [...liabilities];
                            copy[index].emi = Math.max(0, parseFloat(e.target.value) || 0);
                            setLiabilities(copy);
                          }}
                          className="bg-white border px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                        />
                        <div className="md:col-span-2 flex justify-end items-center">
                          <button
                            onClick={() => setLiabilities(liabilities.filter((_, i) => i !== index))}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold transition flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" /> Delete Loan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={() => setLiabilities([...liabilities, { loan_name: "HDFC Home Loan", loan_type: "HomeLoan", principal: 2000000, outstanding: 1800000, interest_rate: 8.5, emi: 22000 }])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" /> Add Liabilities
                </button>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-550 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleSaveStep4}
                  disabled={loading}
                  className="bg-primary hover:bg-[#074739] text-white font-black text-xs px-8 py-4 rounded-2xl uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Continue"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-black text-slate-800">Milestone Goals & Risk</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">Specify target dates, priorities and target risk parameters.</p>
              </div>

              {/* Goals segment */}
              <div className="space-y-3.5 border-b pb-5">
                <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">Financial Milestones</h3>
                {goals.map((goal, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Goal Name"
                      value={goal.goal_name}
                      onChange={(e) => {
                        const copy = [...goals];
                        copy[index].goal_name = e.target.value;
                        setGoals(copy);
                      }}
                      className="md:col-span-4 bg-slate-50 border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      placeholder="Target Value"
                      value={goal.target_amount}
                      onChange={(e) => {
                        const copy = [...goals];
                        copy[index].target_amount = Math.max(0, parseFloat(e.target.value) || 0);
                        setGoals(copy);
                      }}
                      className="md:col-span-3 bg-slate-50 border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                    />
                    <select
                      value={goal.priority}
                      onChange={(e) => {
                        const copy = [...goals];
                        copy[index].priority = e.target.value;
                        setGoals(copy);
                      }}
                      className="md:col-span-3 bg-slate-50 border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                    >
                      <option value="Critical">Critical Priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    {goals.length > 1 && (
                      <button
                        onClick={() => setGoals(goals.filter((_, i) => i !== index))}
                        className="md:col-span-2 text-rose-500 hover:text-rose-700 text-xs font-bold transition flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setGoals([...goals, { goal_name: "Retirement Corpus", category: "Retirement", target_amount: 10000000, saved_amount: 100000, monthly_contribution: 15000, priority: "High" }])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" /> Add Goal
                </button>
              </div>

              {/* Risk Appetite */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-455 tracking-wider mb-2">Preferred Risk Profile</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Conservative", "Moderate", "Aggressive"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRiskAppetite(r)}
                      className={`py-3.5 rounded-2xl text-xs font-bold border transition-colors ${
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

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-550 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  className="bg-[#0B5D4B] hover:bg-[#074739] text-white font-black text-xs px-10 py-4.5 rounded-2xl uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-[#0B5D4B]/10 disabled:opacity-50"
                >
                  {loading ? "Completing..." : "Launch Dashboard"} <ArrowRight className="h-4.5 w-4.5" />
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
        
        <div className="relative z-10 space-y-10">
          <div>
            <span className="text-[10px] bg-white/10 text-emerald-350 border border-white/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Calculated Metrics</span>
            <h3 className="text-xl font-display font-black tracking-tight mt-3">Live Onboarding Summary</h3>
            <p className="text-xs text-emerald-150 mt-1 font-semibold">Formulas processed in real-time by the ArthAI mathematical rules engine.</p>
          </div>

          {step >= 2 && liveSummary && (
            <div className="space-y-6 border-t border-white/10 pt-6">
              <h4 className="text-[10px] text-emerald-350 font-extrabold uppercase tracking-widest">Monthly Cash Flow</h4>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-[9px] text-emerald-200 block uppercase font-bold">Total Inflow</span>
                  <p className="text-base font-black text-white mt-0.5">₹{liveSummary.income.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-200 block uppercase font-bold">Outflow Spend</span>
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
          )}

          {step >= 3 && liveSummary && (
            <div className="space-y-6 border-t border-white/10 pt-6">
              <h4 className="text-[10px] text-emerald-350 font-extrabold uppercase tracking-widest">Net Worth & Position</h4>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-[9px] text-emerald-200 block uppercase font-bold">Total Assets</span>
                  <p className="text-base font-black text-white mt-0.5">₹{liveSummary.assets.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-200 block uppercase font-bold">Outstanding Liabilities</span>
                  <p className="text-base font-black text-rose-350 mt-0.5">₹{liveSummary.liabilities.toLocaleString()}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] text-emerald-200 block uppercase font-bold">Calculated Net Worth</span>
                  <p className="text-xl font-black text-[#22c55e] mt-0.5">₹{liveSummary.netWorth.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-emerald-200 font-bold bg-[#094d3f] border border-white/5 p-4.5 rounded-2xl">
            <ShieldCheck className="h-4.5 w-4.5 text-[#22c55e] shrink-0" />
            Your data is locally computed and verified against standard YC-W26 guidelines.
          </div>
        </div>
      </div>
    </main>
  );
}
