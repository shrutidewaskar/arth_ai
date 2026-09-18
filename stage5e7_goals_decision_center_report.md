# Stage 5E.7 — Goals & Decision Center Report

## Executive Summary

Stage 5E.7 delivers a truthful, deterministic **Plan & Decision Center** workspace. The workspace allows users to formulate financial goals, evaluate deterministic feasibility from their canonical cashflow, view safety-verified action roadmaps, test financial decisions through simulations, compare tradeoffs, and inspect forecast requirements.

### Core Architectural Principle
> **MONEY** tells the user what they own, owe, earn, and spend.
> **PLAN** answers what the user wants to achieve and simulates what happens under different financial decisions using deterministic reasoning engines.

---

## A. Backend Capability Matrix

| Endpoint | Method | Purpose | Frontend Hook / Integration |
|---|---|---|---|
| `/api/v1/goals` | `GET` | Lists all user's milestone goals | `getGoals` in `api.ts` -> Goals Vault |
| `/api/v1/goals` | `POST` | Creates or upserts a financial goal | `createGoal` in `api.ts` -> Add Goal Modal |
| `/api/v1/goals/{id}` | `PUT` | Updates existing goal parameters | `updateGoal` in `api.ts` -> Edit Goal Modal |
| `/api/v1/goals/{id}` | `DELETE` | Deletes goal record from database | `deleteGoal` in `api.ts` -> `DeleteConfirmationModal` |
| `/api/v1/goals/feasibility` | `GET` | Deterministic feasibility evaluation (`ON_TRACK`, `AT_RISK`, `UNDERFUNDED`, `ALREADY_ACHIEVED`, `OVERDUE`) and cashflow capacity | `getGoalsFeasibility` in `api.ts` -> Goals Vault banner & badges |
| `/api/v1/action-plans` | `POST` | Deterministic action steps for underfunded goals | `getActionPlans` in `api.ts` -> Action Plans Tab |
| `/api/v1/simulate` | `POST` | Single scenario financial state projection (`INCOME_CHANGE`, `EXPENSE_CHANGE`, `NEW_LIABILITY`, `INVESTMENT_CONTRIBUTION`) | `runScenarioSimulation` -> `SimulatorTab` |
| `/api/v1/simulate/compare` | `POST` | Two-option side-by-side decision comparison with deterministic tradeoffs | `runDecisionComparison` -> `SimulatorTab` |

---

## B. Information Architecture

```text
PLAN
│
├── 1. GOALS VAULT
│   ├── Cashflow Capacity Header (Monthly surplus, planned goal outlays, available buffer)
│   ├── Milestone Cards (Target amount, current saved, progress bar, required monthly outlay, projected value)
│   ├── Feasibility Badges (ON_TRACK, AT_RISK, UNDERFUNDED, ALREADY_ACHIEVED, OVERDUE)
│   ├── Create Goal Modal (Validated target amount, priority, monthly contribution, target date)
│   ├── Edit Goal Modal (In-place parameter updates)
│   └── Safe Deletion with Confirmation Modal
│
├── 2. ACTION PLANS
│   ├── Deterministic Action Recommendations
│   ├── Primary Action & Action Roadmap steps
│   └── Safety Check verification (Surplus impact & viability)
│
├── 3. DECISION CENTER
│   ├── Single-scenario simulation (Income, Expense, New Liability, Investment Contribution)
│   ├── Side-by-side comparison (Option A vs Option B vs Baseline)
│   ├── Tradeoff analysis & Deterministic Decision Intelligence recommendation
│   └── Metric breakdown table (Net Worth, Surplus, Savings Rate, DTI, Runway, Health Score)
│
└── 4. FORECAST (Truthful Forward Projection)
    └── Grounded insufficient-history state (No synthetic 91% accuracy or fake 15-year projections)
```

---

## C. Data Truth & Grounding Audit

1. **No Fake Formulas**: Goal feasibility is never calculated in React; it is populated strictly from `/api/v1/goals/feasibility`.
2. **No Fake Projections**: The old fake Financial Twin (91% accuracy / ₹1.85Cr projected / 15 years) remains completely eradicated. The Forecast tab honestly indicates that at least 3 months of bank statements and liability records are required.
3. **Deterministic Action Plans**: Recommendations, safety checks, and step-by-step roadmaps are sourced exclusively from `/api/v1/action-plans`.
4. **Immediate Consistency**: Any goal creation, edit, or deletion triggers a refresh of parent dashboard context, immediately recalculating feasibility and cashflow buffers.

---

## D. Files Created / Modified

- **Modified**: [`frontend/src/lib/api.ts`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/lib/api.ts) — Added typed `getGoals`, `createGoal`, `updateGoal`, `deleteGoal`, `getGoalsFeasibility`, and `getActionPlans` client helpers.
- **Modified**: [`frontend/src/components/plan/PlanHub.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/plan/PlanHub.tsx) — Implemented Goals Vault with CRUD modals, deterministic feasibility cards, Action Plans tab, Decision Center integration, and Forecast tab.
- **Modified**: [`frontend/src/app/dashboard/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/dashboard/page.tsx) — Wired `onRefreshParent` to `PlanHub` for live balance sheet and feasibility synchronization.
- **Created**: [`stage5e7_goals_decision_center_report.md`](file:///c:/shruti_materials/Projects/ArthAI/stage5e7_goals_decision_center_report.md) — Comprehensive architecture and verification report.

---

## E. Verification & Test Results

1. **Frontend Production Build**:
   ```bash
   npm run build
   ```
   **Result**: `Compiled successfully in 13.0s`. All 13 routes generated with 0 TypeScript/compilation errors.

2. **Backend Engine Integrity**:
   - `BusinessRuleEngine`, `GoalFeasibilityEngine`, `ActionPlanningEngine`, and `SimulationEngine` endpoints verified and mapped cleanly to UI actions.
