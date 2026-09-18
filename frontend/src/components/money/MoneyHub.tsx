import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Coins,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Building,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { DashboardSummary } from "@/types/financial";
import { EmptyState, LoadingState } from "@/components/shared/UIStates";
import {
  getIncomes,
  getExpenses,
  getAssets,
  getLiabilities,
  getInvestments,
  getInsurancePolicies,
  getSubscriptions,
} from "@/lib/api";
import { CashFlowSection } from "./CashFlowSection";
import { AssetsSection } from "./AssetsSection";
import { LiabilitiesSection } from "./LiabilitiesSection";
import { InvestmentsSection } from "./InvestmentsSection";
import { InsuranceSection } from "./InsuranceSection";
import { SubscriptionsSection } from "./SubscriptionsSection";

interface MoneyHubProps {
  summaryData: DashboardSummary | null;
  initialSubTab?: string;
  onNavigateEvidence: () => void;
  onRefreshParent?: () => void;
}

export function MoneyHub({
  summaryData,
  initialSubTab = "overview",
  onNavigateEvidence,
  onRefreshParent,
}: MoneyHubProps) {
  const [subTab, setSubTab] = useState<string>(initialSubTab);

  // Canonical Domain Entities
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [insurance, setInsurance] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sync subTab if initialSubTab prop changes via deep-link
  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const loadCanonicalMoneyData = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const [
        incomesRes,
        expensesRes,
        assetsRes,
        liabilitiesRes,
        investmentsRes,
        insuranceRes,
        subscriptionsRes,
      ] = await Promise.all([
        getIncomes().catch(() => []),
        getExpenses().catch(() => []),
        getAssets().catch(() => []),
        getLiabilities().catch(() => []),
        getInvestments().catch(() => []),
        getInsurancePolicies().catch(() => []),
        getSubscriptions().catch(() => []),
      ]);

      setIncomes(incomesRes);
      setExpenses(expensesRes);
      setAssets(assetsRes);
      setLiabilities(liabilitiesRes);
      setInvestments(investmentsRes);
      setInsurance(insuranceRes);
      setSubscriptions(subscriptionsRes);
    } catch (err: any) {
      console.error("Failed loading canonical money data:", err);
      setFetchError("Unable to retrieve canonical balance sheet state from backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCanonicalMoneyData();
  }, [loadCanonicalMoneyData]);

  const handleRefresh = () => {
    loadCanonicalMoneyData();
    if (onRefreshParent) onRefreshParent();
  };

  // Derive aggregates from actual canonical entities
  const totalAssetsVal = assets.reduce((acc, a) => acc + (Number(a.current_value) || 0), 0);
  const totalLiabilitiesVal = liabilities.reduce((acc, l) => acc + (Number(l.outstanding) || 0), 0);
  const totalInvestmentsVal = investments.reduce((acc, i) => acc + (Number(i.current_value) || 0), 0);

  // Distinguish known net worth from empty/unknown
  const hasBalanceSheetData = assets.length > 0 || liabilities.length > 0 || investments.length > 0;
  const netWorthVal = (totalAssetsVal + totalInvestmentsVal) - totalLiabilitiesVal;

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-black text-slate-800 tracking-tight">
              Money & Balance Sheet Workspace
            </h2>
            <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Canonical Financial Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Real household balance sheet, cash flows, and asset-liability positions.
          </p>
        </div>

        {/* Sub-Tabs Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: "overview", label: "Balance Sheet" },
            { id: "cashflow", label: "Cash Flow" },
            { id: "assets", label: `Assets (${assets.length})` },
            { id: "liabilities", label: `Liabilities (${liabilities.length})` },
            { id: "investments", label: `Investments (${investments.length})` },
            { id: "insurance", label: `Insurance (${insurance.length})` },
            { id: "subscriptions", label: `Bills & Subs (${subscriptions.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                subTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold">
          {fetchError}
        </div>
      )}

      {loading ? (
        <LoadingState message="Syncing canonical financial state..." />
      ) : (
        <>
          {/* SubTab: Balance Sheet Overview */}
          {subTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                    Net Worth Position
                  </span>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {hasBalanceSheetData ? `₹${netWorthVal.toLocaleString()}` : "Not computed yet"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {hasBalanceSheetData
                      ? "Assets + Investments minus outstanding liabilities"
                      : "Add assets and liabilities or upload evidence"}
                  </p>
                </div>

                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-150">
                  <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider block">
                    Aggregated Assets
                  </span>
                  <p className="text-2xl font-black text-emerald-800 mt-1">
                    {assets.length > 0 || investments.length > 0
                      ? `₹${(totalAssetsVal + totalInvestmentsVal).toLocaleString()}`
                      : "No assets cataloged"}
                  </p>
                  <p className="text-[11px] text-emerald-600/90 font-medium mt-1">
                    {assets.length + investments.length} total asset & investment records
                  </p>
                </div>

                <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-150">
                  <span className="text-[10px] text-rose-800 font-black uppercase tracking-wider block">
                    Active Debt Principal
                  </span>
                  <p className="text-2xl font-black text-rose-800 mt-1">
                    {liabilities.length > 0 ? `₹${totalLiabilitiesVal.toLocaleString()}` : "No debt recorded"}
                  </p>
                  <p className="text-[11px] text-rose-600/90 font-medium mt-1">
                    {liabilities.length} active liability contract{liabilities.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assets Summary Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-black text-slate-800">Assets & Holdings</h4>
                    <button
                      onClick={() => setSubTab("assets")}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Manage Assets &rarr;
                    </button>
                  </div>
                  {assets.length === 0 ? (
                    <EmptyState
                      icon={Building}
                      title="No assets recorded"
                      description="Add bank accounts, FDs, gold, or properties to catalog your net worth."
                      actionLabel="Add Asset"
                      onAction={() => setSubTab("assets")}
                    />
                  ) : (
                    <ul className="space-y-2.5">
                      {assets.slice(0, 5).map((item, idx) => (
                        <li
                          key={item.id || idx}
                          className="flex justify-between items-center text-xs font-semibold py-2 border-b border-slate-100 last:border-b-0"
                        >
                          <div>
                            <span className="text-slate-800 font-bold block">{item.asset_name}</span>
                            <span className="text-[10px] text-slate-400 uppercase">{item.asset_type}</span>
                          </div>
                          <span className="font-black text-emerald-700">
                            ₹{Number(item.current_value).toLocaleString()}
                          </span>
                        </li>
                      ))}
                      {assets.length > 5 && (
                        <p className="text-[11px] text-slate-400 text-center pt-1 font-semibold">
                          + {assets.length - 5} more assets in Assets tab
                        </p>
                      )}
                    </ul>
                  )}
                </div>

                {/* Liabilities Summary Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-black text-slate-800">Liabilities & EMIs</h4>
                    <button
                      onClick={() => setSubTab("liabilities")}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Manage Liabilities &rarr;
                    </button>
                  </div>
                  {liabilities.length === 0 ? (
                    <EmptyState
                      icon={CreditCard}
                      title="No liabilities recorded"
                      description="No home loans, personal loans, or credit card debts currently tracked."
                      actionLabel="Add Liability"
                      onAction={() => setSubTab("liabilities")}
                    />
                  ) : (
                    <ul className="space-y-2.5">
                      {liabilities.slice(0, 5).map((loan, idx) => (
                        <li
                          key={loan.id || idx}
                          className="flex justify-between items-center text-xs font-semibold py-2 border-b border-slate-100 last:border-b-0"
                        >
                          <div>
                            <span className="text-slate-800 font-bold block">{loan.loan_name}</span>
                            <span className="text-[10px] text-slate-400">
                              {loan.loan_type} • EMI ₹{Number(loan.emi).toLocaleString()}/mo
                            </span>
                          </div>
                          <span className="font-black text-rose-600">
                            ₹{Number(loan.outstanding).toLocaleString()}
                          </span>
                        </li>
                      ))}
                      {liabilities.length > 5 && (
                        <p className="text-[11px] text-slate-400 text-center pt-1 font-semibold">
                          + {liabilities.length - 5} more loans in Liabilities tab
                        </p>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SubTab: Cash Flow */}
          {subTab === "cashflow" && (
            <CashFlowSection
              incomes={incomes}
              expenses={expenses}
              liabilities={liabilities}
              onRefresh={handleRefresh}
              onNavigateEvidence={onNavigateEvidence}
            />
          )}

          {/* SubTab: Assets */}
          {subTab === "assets" && (
            <AssetsSection
              assets={assets}
              onRefresh={handleRefresh}
              onNavigateEvidence={onNavigateEvidence}
            />
          )}

          {/* SubTab: Liabilities */}
          {subTab === "liabilities" && (
            <LiabilitiesSection
              liabilities={liabilities}
              onRefresh={handleRefresh}
              onNavigateEvidence={onNavigateEvidence}
            />
          )}

          {/* SubTab: Investments */}
          {subTab === "investments" && (
            <InvestmentsSection
              investments={investments}
              onRefresh={handleRefresh}
              onNavigateEvidence={onNavigateEvidence}
            />
          )}

          {/* SubTab: Insurance */}
          {subTab === "insurance" && (
            <InsuranceSection
              insurancePolicies={insurance}
              onRefresh={handleRefresh}
              onNavigateEvidence={onNavigateEvidence}
            />
          )}

          {/* SubTab: Subscriptions & Bills */}
          {subTab === "subscriptions" && (
            <SubscriptionsSection
              subscriptions={subscriptions}
              onRefresh={handleRefresh}
              onNavigateEvidence={onNavigateEvidence}
            />
          )}
        </>
      )}
    </div>
  );
}
