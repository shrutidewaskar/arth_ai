# Stage C — Forecast / Financial Twin Investigation

## 1. Executive Finding

**BLOCKED BY INSUFFICIENT HISTORY / UNSAFE LEGACY ENDPOINT**

### Direct Forensic Summary:
1. **Legacy Endpoint Finding**: The backend route [`GET /api/v1/cashflow/projection`](file:///c:/shruti_materials/Projects/ArthAI/backend/app/api/endpoints.py#L773) is a **hardcoded legacy mock stub** (`base_savings = 62000.0`, returning `62000 * month` for any user, even an empty user with ₹0 income).
2. **Frontend Isolation**: The frontend does **NOT** consume or render `/api/v1/cashflow/projection`. The Forecast tab in [`frontend/src/components/plan/PlanHub.tsx:587`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/plan/PlanHub.tsx#L587) correctly displays a truthful `EmptyState` explaining that a grounded multi-year forecast requires sufficient verified financial history (at least 3–6 months of bank statements and liability schedules).
3. **Deterministic Systems Active**: Deterministic goal completion curves (`goal_feasibility.py`) and decision simulations (`simulation_engine.py`) are active and grounded in canonical state, but a true multi-year historical time-series forecasting engine / Financial Twin does not exist yet.

---

## 2. Endpoint

| Item | Finding |
| :--- | :--- |
| **Route** | `GET /api/v1/cashflow/projection` |
| **Method** | `GET` |
| **Handler** | `get_cashflow_projection` in [`backend/app/api/endpoints.py:773`](file:///c:/shruti_materials/Projects/ArthAI/backend/app/api/endpoints.py#L773) |
| **Request** | Header `Authorization: Bearer <token>` (no request body) |
| **Response** | `{"projection_horizon_months": 12, "curve": [{"month": m, "accumulated_savings": 62000.0 * m}, ...]}` |

---

## 3. End-to-End Data Flow

```text
Client Request: GET /api/v1/cashflow/projection
      ↓
endpoints.py: get_cashflow_projection(current_user: User = Depends(get_current_user))
      ↓
[DISCONNECTED FROM CONTEXT BUILDER & DATABASE]
      ↓
Static Variable: base_savings = 62000.0
      ↓
Output List Comprehension: [{"month": m, "accumulated_savings": 62000.0 * m} for m in range(1, 13)]
      ↓
JSON Response
```

---

## 4. Data Sources

| Data | Used in `/cashflow/projection`? | Source | Used in Active Engines (`simulation_engine`, `goal_feasibility`)? |
| :--- | :---: | :--- | :---: |
| **Incomes** | ❌ No | Ignored | ✅ Yes (Sum of active sources) |
| **Expenses** | ❌ No | Ignored | ✅ Yes (Sum of active categories) |
| **Assets** | ❌ No | Ignored | ✅ Yes (Liquid / Fixed split) |
| **Liabilities** | ❌ No | Ignored | ✅ Yes (Amortized EMIs) |
| **Investments** | ❌ No | Ignored | ✅ Yes (Asset allocation) |
| **Goals** | ❌ No | Ignored | ✅ Yes (Target vs saved) |
| **Bank Statements / History** | ❌ No | Ignored | ❌ No historical time-series table |
| **Financial Profile** | ❌ No | Ignored | ✅ Yes (Canonical pulse metrics) |

---

## 5. Historical Data Requirements

| Requirement | Required in Code? | Evidence |
| :--- | :---: | :--- |
| **Transaction History** | ❌ No | Not tracked or queried |
| **Bank Statement History** | ❌ No | `pypdf` extracts facts into candidate ledger; does not build historical time series |
| **Monthly Income History** | ❌ No | Only snapshot canonical monthly income exists |
| **Monthly Expense History**| ❌ No | Only snapshot canonical monthly expenses exist |
| **Enforced Window in Code** | ❌ No | `/cashflow/projection` returns mock numbers instantly without checking history |

---

## 6. Minimum History

* **Enforced Minimum**: **No explicit minimum history requirement found in backend code**.
* **Frontend Truthful Gate**: `PlanHub.tsx` explicitly guards the UI with: *"Upload at least 3 months of bank statements and catalog all active liabilities in Evidence to generate deterministic 5-15 year net worth projections without synthetic assumptions."*

---

## 7. Missing Data Behavior

* In `/api/v1/cashflow/projection`:
  - Empty user with no income or expenses receives `accumulated_savings = ₹7,44,000` at month 12.
  - **Verdict**: **FABRICATED / SYNTHETIC DEFAULT**.
* In `SimulationEngine.compare_scenarios` ([`simulation_engine.py:241`](file:///c:/shruti_materials/Projects/ArthAI/backend/app/engine/simulation_engine.py#L241)):
  - When baseline income or expenses are 0, it returns `"confidence": "insufficient_data"`.

---

## 8. Projection Mathematics

1. **In `/api/v1/cashflow/projection`**:
   $$\text{accumulated\_savings}(m) = 62000.0 \times m$$
   (Hardcoded linear arithmetic progression with 0 parameters).
2. **In `BusinessRuleEngine.compute_all_rules` (`rules_engine.py:89`)**:
   $$\text{projected\_savings}(m) = \text{emergency\_fund} + (m \times \text{monthly\_savings})$$
   (Linear cash surplus accumulation based on canonical snapshot).
3. **In `GoalFeasibilityEngine.analyze_goals_feasibility` (`goal_feasibility.py:121`)**:
   $$\text{projected\_amount} = \text{saved\_amount} + (\text{monthly\_contribution} \times \text{months\_remaining})$$
   (Contribution-only formula with 0% market CAGR assumption).

---

## 9. Assumptions

| Assumption | Value | Source | User Configurable? |
| :--- | :--- | :--- | :---: |
| **Legacy Base Monthly Savings** | `₹62,000.00` | Hardcoded in `endpoints.py:776` | ❌ No |
| **Market Return Assumption** | `0.0%` (Contribution-only) | `goal_feasibility.py:9` | ❌ No (Intentionally conservative) |
| **Default Inflation in Goals**| `0.0%` (Nominal Target) | `goal_feasibility.py` | ❌ No |
| **Emergency Safety Threshold** | `3.0 Months` | `rules_engine.py:40` | ❌ No (Standard financial guideline) |
| **Max Safe DTI Ratio** | `35.0%` | `rules_engine.py:48` | ❌ No (Standard banking guideline) |

---

## 10. Tenant Isolation

* The endpoint `/api/v1/cashflow/projection` requires `current_user: User = Depends(get_current_user)`, but does **not** read any tenant data from the database. It returns identical static numbers for all authenticated tokens.

---

## 11. Response Contract

| Response Field | Meaning | Source | Deterministic? | Synthetic? |
| :--- | :--- | :--- | :---: | :---: |
| `projection_horizon_months` | Number of projection periods (12) | Hardcoded literal | ❌ Static | ⚠️ Hardcoded |
| `curve[].month` | Month index ($1 \dots 12$) | Range integer | ✅ Index | ❌ No |
| `curve[].accumulated_savings`| Projected cash savings | $62000 \times \text{month}$ | ❌ No | ⚠️ Hardcoded mock |

---

## 12. Frontend Consumption

* **`/cashflow/projection` API Calls**: **0 occurrences in `frontend/src`**.
* **Display in UI**: Not rendered anywhere in production.
* **Forecast Sub-tab**: In `PlanHub.tsx`, the Forecast tab renders an explicit truth-grounded `EmptyState` explaining that historical bank statements are required.
* **Dead Links**: None.

---

## 13. Financial Twin Status

* **Cashflow Projection**: Exists only as a static 12-month mock endpoint (`endpoints.py:773`) and a simple snapshot arithmetic accumulator in `rules_engine.py`.
* **Scenario Simulation**: Fully active and grounded via `POST /api/v1/simulate` and `POST /api/v1/simulate/compare` in `simulation_engine.py`.
* **Financial Twin (Full Multi-Year Dynamic Engine)**: **NOT CURRENTLY IMPLEMENTED**.

---

## 14. Mock / Fabricated Forecast Audit

* `14.8% CAGR`: Not found in any production calculations (only exists in a low-opacity decorative string array in `FinancialNumbersBackground.tsx`).
* `91% accuracy`: Eradicated from all active hubs.
* `₹1.85Cr projected / 15 years`: Eradicated from all active hubs.

---

## 15. Runtime Evidence

Executed `raw_projection_investigation.py` against live FastAPI backend:

```text
=== TEST 1: GET /api/v1/cashflow/projection FOR EMPTY USER ===
HTTP Status: 200
Response Payload: {'projection_horizon_months': 12, 'curve': [
  {'month': 1, 'accumulated_savings': 62000.0},
  {'month': 2, 'accumulated_savings': 124000.0},
  ...
  {'month': 12, 'accumulated_savings': 744000.0}
]}

=== TEST 2: GET /api/v1/cashflow/projection FOR POPULATED USER ===
HTTP Status: 200
Response Payload: {'projection_horizon_months': 12, 'curve': [
  {'month': 1, 'accumulated_savings': 62000.0},
  {'month': 2, 'accumulated_savings': 124000.0},
  ...
  {'month': 12, 'accumulated_savings': 744000.0}
]}

=== TEST 3: POST /api/v1/simulate FOR POPULATED USER ===
Simulate Status: 200
Simulate Payload Keys: ['scenario', 'baseline', 'projected', 'impact', 'assessment']
```

---

## 16. Tests

* `python tests/raw_projection_investigation.py`: **Executed (Exit Code 0)**.
* Proved that `/api/v1/cashflow/projection` returns static mock output regardless of user data.

---

## 17. Files Inspected
1. [`backend/app/api/endpoints.py`](file:///c:/shruti_materials/Projects/ArthAI/backend/app/api/endpoints.py)
2. [`backend/app/engine/rules_engine.py`](file:///c:/shruti_materials/Projects/ArthAI/backend/app/engine/rules_engine.py)
3. [`backend/app/engine/simulation_engine.py`](file:///c:/shruti_materials/Projects/ArthAI/backend/app/engine/simulation_engine.py)
4. [`backend/app/engine/goal_feasibility.py`](file:///c:/shruti_materials/Projects/ArthAI/backend/app/engine/goal_feasibility.py)
5. [`backend/app/agents/specialists.py`](file:///c:/shruti_materials/Projects/ArthAI/backend/app/agents/specialists.py)
6. [`frontend/src/components/plan/PlanHub.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/plan/PlanHub.tsx)

---

## 18. Files Modified
* **None** (Investigation stage).

---

## 19. Findings & Risks

1. **Risk of Accidental UI Binding**: If a developer connects a frontend chart to `GET /api/v1/cashflow/projection`, it will deceive users with fabricated ₹62,000 monthly savings curve.
2. **Missing Time-Series Schema**: There is currently no database table for monthly historical ledger snapshots (e.g. `monthly_cashflow_snapshots` or `historical_balances`). Projections currently rely on point-in-time profile and income/expense entity sums.
3. **Healthy Frontend Boundary**: The frontend architecture correctly avoids calling this endpoint and displays the truthful insufficient-history gate.

---

## 20. Recommendation for Next Stage

1. **Do NOT build a forward projection / Financial Twin UI in production yet.**
2. **Deprecate or update `/api/v1/cashflow/projection`** in a future backend engine sprint so that it returns `{"status": "insufficient_history", "required_months": 3}` when historical bank statement records are absent, rather than returning hardcoded ₹62K numbers.
3. **Rely on `POST /api/v1/simulate` (Scenario Simulator) for planning features**, as it is fully deterministic, context-grounded, and safety-verified.
