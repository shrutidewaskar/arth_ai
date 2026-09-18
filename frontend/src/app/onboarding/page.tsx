"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/api";
import { IncomeSource, ExpenseCategory, Asset, Liability, Goal } from "@/types/financial";
import { AboutYouStep } from "@/components/onboarding/AboutYouStep";
import { IncomeStep } from "@/components/onboarding/IncomeStep";
import { ExpenseStep } from "@/components/onboarding/ExpenseStep";
import { AssetsStep } from "@/components/onboarding/AssetsStep";
import { LiabilitiesStep } from "@/components/onboarding/LiabilitiesStep";
import { GoalsStep } from "@/components/onboarding/GoalsStep";
import { EvidenceStep } from "@/components/onboarding/EvidenceStep";
import { ReviewStep } from "@/components/onboarding/ReviewStep";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [liveSummary, setLiveSummary] = useState<any>(null);
  const [approvedFactsCount, setApprovedFactsCount] = useState<number>(0);

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

  const loadExistingData = async () => {
    try {
      const meRes = await apiGet("/api/v1/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.full_name) setFullName(meData.full_name);
      }

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

      const incRes = await apiGet("/api/v1/incomes");
      if (incRes.ok) {
        const incData = await incRes.json();
        if (Array.isArray(incData) && incData.length > 0) {
          setIncomes(
            incData.map((i: any) => ({
              id: i.id,
              source_name: i.source_name,
              type: i.type || "Salary",
              amount: parseFloat(i.amount) || 0,
              frequency: i.frequency || "Monthly",
            }))
          );
        }
      }

      const expRes = await apiGet("/api/v1/expenses");
      if (expRes.ok) {
        const expData = await expRes.json();
        if (Array.isArray(expData) && expData.length > 0) {
          setExpenses(
            expData.map((e: any) => ({
              id: e.id,
              category: e.category,
              amount: parseFloat(e.amount) || 0,
              essential: e.essential ?? true,
            }))
          );
        }
      }

      const assetRes = await apiGet("/api/v1/assets");
      if (assetRes.ok) {
        const assetData = await assetRes.json();
        if (Array.isArray(assetData) && assetData.length > 0) {
          setAssets(
            assetData.map((a: any) => ({
              id: a.id,
              asset_name: a.asset_name,
              asset_type: a.asset_type || "Cash",
              current_value: parseFloat(a.current_value) || 0,
            }))
          );
        }
      }

      const liabRes = await apiGet("/api/v1/liabilities");
      if (liabRes.ok) {
        const liabData = await liabRes.json();
        if (Array.isArray(liabData) && liabData.length > 0) {
          setLiabilities(
            liabData.map((l: any) => ({
              id: l.id,
              loan_name: l.loan_name,
              loan_type: l.loan_type || "PersonalLoan",
              principal: parseFloat(l.principal) || 0,
              outstanding: parseFloat(l.outstanding) || 0,
              interest_rate: parseFloat(l.interest_rate) || 0,
              emi: parseFloat(l.emi) || 0,
            }))
          );
        }
      }

      const goalsRes = await apiGet("/api/v1/goals");
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        if (Array.isArray(goalsData) && goalsData.length > 0) {
          setGoals(
            goalsData.map((g: any) => ({
              id: g.id,
              goal_name: g.goal_name,
              category: g.category || "General",
              target_amount: parseFloat(g.target_amount) || 0,
              saved_amount: parseFloat(g.saved_amount) || 0,
              monthly_contribution: parseFloat(g.monthly_contribution) || 0,
              priority: g.priority || "Medium",
            }))
          );
        }
      }
    } catch (err) {
      console.error("Error initializing onboarding state:", err);
    } finally {
      setInitialDataLoading(false);
    }
  };

  useEffect(() => {
    loadExistingData();
  }, []);

  const handleNext = async () => {
    if (step < 8) {
      if (step === 7) {
        // Refresh canonical items if candidates were approved in Step 7
        await loadExistingData();
      }
      setStep(step + 1);
    } else {
      await handleCompleteOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Save Profile
      await apiPut("/api/v1/profile", {
        occupation,
        city,
        age: age === "" ? 30 : age,
        marital_status: maritalStatus,
        dependents,
        risk_appetite: riskAppetite,
      });

      // 2. Cleanup deleted items
      for (const id of deletedIncomes) await apiDelete(`/api/v1/incomes/${id}`);
      for (const id of deletedExpenses) await apiDelete(`/api/v1/expenses/${id}`);
      for (const id of deletedAssets) await apiDelete(`/api/v1/assets/${id}`);
      for (const id of deletedLiabilities) await apiDelete(`/api/v1/liabilities/${id}`);
      for (const id of deletedGoals) await apiDelete(`/api/v1/goals/${id}`);

      // 3. Save Incomes (if newly added without ID)
      for (const inc of incomes) {
        if (!inc.id) {
          await apiPost("/api/v1/incomes", {
            source_name: inc.source_name,
            type: inc.type,
            amount: inc.amount,
            frequency: inc.frequency,
          });
        }
      }

      // 4. Save Expenses (if newly added without ID)
      for (const exp of expenses) {
        if (!exp.id) {
          await apiPost("/api/v1/expenses", {
            category: exp.category,
            amount: exp.amount,
            essential: exp.essential ?? true,
          });
        }
      }

      // 5. Save Assets (if newly added without ID)
      for (const ast of assets) {
        if (!ast.id) {
          await apiPost("/api/v1/assets", {
            asset_name: ast.asset_name,
            asset_type: ast.asset_type,
            current_value: ast.current_value,
          });
        }
      }

      // 6. Save Liabilities (if newly added without ID)
      for (const liab of liabilities) {
        if (!liab.id) {
          await apiPost("/api/v1/liabilities", {
            loan_name: liab.loan_name,
            loan_type: liab.loan_type,
            principal: liab.principal,
            outstanding: liab.outstanding,
            interest_rate: liab.interest_rate,
            emi: liab.emi,
          });
        }
      }

      // 7. Save Goals (if newly added without ID)
      for (const g of goals) {
        if (!g.id) {
          await apiPost("/api/v1/goals", {
            goal_name: g.goal_name,
            category: g.category,
            target_amount: g.target_amount,
            saved_amount: g.saved_amount,
            monthly_contribution: g.monthly_contribution,
            priority: g.priority,
          });
        }
      }

      router.replace("/dashboard");
    } catch (err: any) {
      console.error("Failed to complete onboarding:", err);
    } finally {
      setLoading(false);
    }
  };

  if (initialDataLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading your profile records...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-[#22c55e]">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-black text-dark tracking-tight">
              Arth<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              Step {step} of 8
            </span>
            <span className="text-xs font-bold text-primary">
              {step === 1 && "About You"}
              {step === 2 && "Income Streams"}
              {step === 3 && "Living Expenses"}
              {step === 4 && "Assets & Savings"}
              {step === 5 && "Liabilities & Loans"}
              {step === 6 && "Goals & Risk"}
              {step === 7 && "Financial Evidence"}
              {step === 8 && "Review & Launch"}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-4xl shadow-xl border border-slate-200/60">
          {step === 1 && (
            <AboutYouStep
              fullName={fullName}
              setFullName={setFullName}
              age={age}
              setAge={setAge}
              city={city}
              setCity={setCity}
              occupation={occupation}
              setOccupation={setOccupation}
              maritalStatus={maritalStatus}
              setMaritalStatus={setMaritalStatus}
              dependents={dependents}
              setDependents={setDependents}
            />
          )}

          {step === 2 && (
            <IncomeStep
              incomes={incomes}
              setIncomes={setIncomes}
              setDeletedIncomes={setDeletedIncomes}
            />
          )}

          {step === 3 && (
            <ExpenseStep
              expenses={expenses}
              setExpenses={setExpenses}
              setDeletedExpenses={setDeletedExpenses}
            />
          )}

          {step === 4 && (
            <AssetsStep
              assets={assets}
              setAssets={setAssets}
              setDeletedAssets={setDeletedAssets}
            />
          )}

          {step === 5 && (
            <LiabilitiesStep
              liabilities={liabilities}
              setLiabilities={setLiabilities}
              setDeletedLiabilities={setDeletedLiabilities}
            />
          )}

          {step === 6 && (
            <GoalsStep
              goals={goals}
              setGoals={setGoals}
              setDeletedGoals={setDeletedGoals}
              riskAppetite={riskAppetite}
              setRiskAppetite={setRiskAppetite}
            />
          )}

          {step === 7 && (
            <EvidenceStep
              onApprovedFactCountChange={(cnt) => setApprovedFactsCount(cnt)}
              onContinue={() => handleNext()}
              onSkip={() => handleNext()}
            />
          )}

          {step === 8 && (
            <ReviewStep
              fullName={fullName}
              age={age}
              city={city}
              occupation={occupation}
              maritalStatus={maritalStatus}
              dependents={dependents}
              riskAppetite={riskAppetite}
              incomes={incomes}
              expenses={expenses}
              assets={assets}
              liabilities={liabilities}
              goals={goals}
              liveSummary={liveSummary}
              approvedFactsCount={approvedFactsCount}
            />
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="bg-primary hover:bg-[#074739] text-white py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-primary/10 flex items-center gap-2 disabled:opacity-50"
            >
              {loading
                ? "Launching Command Center..."
                : step === 8
                ? "Complete & Launch Dashboard"
                : step === 7
                ? "Continue to Summary"
                : "Continue"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
