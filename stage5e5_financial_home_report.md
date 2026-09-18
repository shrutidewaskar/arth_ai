# Stage 5E.5: Financial Home — Completion Report

**Date:** September 17, 2026  
**Status:** COMPLETE & VERIFIED  

---

## Executive Summary

Stage 5E.5 elevates **HOME** from a passive dashboard into an authoritative, actionable Financial Command Center. HOME is now built entirely upon ArthAI's deterministic intelligence pipeline:
```text
Financial State → Financial Pulse → Attention Center → Next Best Action → Executive Brief
```
No frontend-only scoring algorithms, arbitrary metrics, or simulated trends were introduced. Missing data is strictly distinguished from ₹0 ("Not enough information yet" vs known values). All action items provide deep-linking into detailed workspaces (MONEY, PLAN, EVIDENCE, AI CFO).

---

## A. Home Data Map

| UI Section | Frontend Component | API Endpoint | Backend Engine / Source | Displayed State / Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Header / Context** | `HomeHub.tsx` | `/api/v1/dashboard/summary` | Authenticated `User.full_name` | "Good day, [Name]" / "Your Financial Overview" |
| **Net Worth** | `Financial Snapshot` | `/api/v1/dashboard/summary` | `BusinessRuleEngine.net_worth` | Real ₹ total assets minus liabilities or "Not enough info" |
| **Monthly Surplus** | `Financial Snapshot` | `/api/v1/dashboard/summary` | Inflow minus Outflows & EMIs | Real ₹ surplus / deficit or "Unknown" (Missing ≠ ₹0) |
| **Emergency Runway**| `Financial Snapshot` | `/api/v1/financial-pulse` | `BusinessRuleEngine.emergency_runway_months` | Real `X.X mo` or "Not designated" (Non-liquid ≠ emergency) |
| **Debt Service (DTI)**| `Financial Snapshot`| `/api/v1/dashboard/summary` | `BusinessRuleEngine.dti_ratio_pct` | Real `%` debt service burden or "Unknown" |
| **Financial Pulse** | `Pulse Card` | `/api/v1/financial-pulse` | `AttentionAggregator` & `BusinessRuleEngine` | Health score `/100`, Health label, Component signals |
| **Pulse Explanation** | `Pulse Card` | `/api/v1/financial-diagnosis`| `FinancialDiagnosisEngine.analyze_financials`| Grounded explanation of cashflow, strengths, and risks |
| **Attention Center** | `Attention Feed` | `/api/v1/attention` | `AttentionAggregator.aggregate()` | Top prioritized items sorted by backend severity |
| **Next Best Action** | `Next Action Card` | `/api/v1/brief` / Action Plans| `ActionPlanningEngine` / `FinancialDiagnosisEngine` | Grounded action, "Why" context, and direct deep-link |
| **Executive Brief** | `Executive Brief` | `/api/v1/brief` | Grounded dynamic rules & diagnosis | True executive summary without hardcoded numbers |

---

## B. Financial Snapshot Metrics & Truth Handling

1. **Net Worth**: Bound to backend calculated net worth (`rules["net_worth"]`). If no assets or liabilities exist, displays **"Not enough info"** rather than deceptive ₹0.
2. **Monthly Surplus**: Inflows minus essential living outflows and loan EMIs. Displays **"Unknown"** when income data has not been provided.
3. **Emergency Runway**: Derived from dedicated liquid emergency funds (`profile["emergency_fund"] / monthly_burn`). Real estate, gold, and locked investments are never falsely counted as liquid reserves. Displays **"Not designated"** when undesignated.
4. **Debt Service (DTI)**: Computed as `(Monthly EMIs / Monthly Income) * 100`. Highlights high leverage (>35% or >45%) with rose warning states.

---

## C. Financial Pulse & Deterministic Explanation

* **Endpoint**: `GET /api/v1/financial-pulse`
* **Response Consumed**: `pulse.health_score`, `pulse.health_label`, `pulse.savings_rate_pct`, `pulse.dti_ratio_pct`, `pulse.emergency_runway_months`, `pulse.emergency_fund_status`.
* **Zero Duplicate Logic**: The frontend contains 0 scoring formulas; it directly reflects the engine outputs.
* **Explanation Source**: Bound to `FinancialDiagnosisEngine` output (`GET /api/v1/financial-diagnosis`), explaining the primary drivers (e.g. liquidity runway deficits, high fixed DTI burdens, or strong savings surpluses).

---

## D. Attention Center Prioritization & Deep-Linking

* **Endpoint**: `GET /api/v1/attention`
* **Ordering**: Multi-key deterministic sort strictly preserved from `AttentionAggregator` (`SEVERITY_RANKS` → `DOMAIN_RANKS`).
* **Deep Links**:
  * Debt & Liability Attention → `MoneyHub (Liabilities)`
  * Cashflow & Surplus Attention → `MoneyHub (Cash Flow)`
  * Goal Underfunding Attention → `PlanHub (Goals / Action Plans)`
  * Liquidity & Statement Attention → `EvidenceHub (Vault)`
  * Data Quality / Onboarding Attention → `ProfileHub`

---

## E. Next Best Action & Executive Briefing

* **Next Best Action**: Evaluates the highest-priority attention item next step, viable action plan from `ActionPlanningEngine`, or diagnosis priority. Answers:
  1. *What to do?* (e.g., "Adopt Action Plan: Expense Reduction & Optimized Contributions")
  2. *Why it matters?* (e.g., "Closes milestone funding gaps while keeping DTI and liquidity runway within safe limits.")
  3. *Action Button*: Direct navigation to the target tool.
* **Executive Brief**: Dynamically generated via `GET /api/v1/brief`, summarizing verified savings rates, runway months, active goal trajectories, top diagnostic recommendations, and risk factors. Hardcoded demo values (e.g., Netflix renewal in 12 days, ₹52,400 static tax) have been completely removed.

---

## F. Loading, Error, and Empty State Handling

* **Loading State**: Clean spinner without flashing temporary `₹0` or false positive metrics.
* **Partial API Failure**: If `/financial-pulse` fails, an inline error banner with a `Retry` action is displayed while the rest of Home remains interactive.
* **Empty Attention State**: When no critical alerts exist, displays a positive `EmptyState` ("You're all caught up").
* **Empty Profile State**: When a new user logs in without financial records, displays a clear prompt explaining that the command center requires initial data or document evidence.

---

## G. Data Truth Audit

* **No Hardcoded Metrics**: Search verified 0 occurrences of fake portfolio CAGRs (14.8%), mock equity allocations (65%), or synthetic confidence ratings (91%).
* **No Native Popups**: Replaced all `window.alert()` / `window.confirm()` calls with accessible modal components.
* **Clean Fallbacks**: Incomplete profiles show "Unknown / Not provided" rather than misleading ₹0 zeroes.

---

## H. Verification & Test Execution

1. **Frontend Build**:
   * Command: `npm run build`
   * Result: **13/13 static routes generated successfully** with 0 TypeScript/compilation errors.
2. **Backend Regression Suites**:
   * `test_stage5d_ingestion.py` & `test_stage5d2_reconciliation.py`: **22/22 passed**.
   * `test_financial_pulse.py`: **Passed**.
3. **Architecture Validation**:
   * Verified separation of concerns: HOME as command center, MONEY as detailed ledger, PLAN as goal simulator, EVIDENCE as ingestion review layer.
