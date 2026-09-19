# Stage E — Learn Layer / Explainable Financial Intelligence Report

## 1. Executive Status

**STATUS: PASS**

The public `/learn` explainable financial intelligence layer has been built, verified, and integrated into the ArthAI application. It directly explains the active machine ArthAI is today, grounded in verified backend calculations, deterministic Python domain engines, structured document extraction, and PostgreSQL Row-Level Security.

Key achievements:
- **7 public educational routes created**: `/learn` index directory + 6 deep-dive architectural explainers (`/learn/financial-pulse`, `/learn/decision-simulation`, `/learn/goal-planning`, `/learn/ai-financial-advisor`, `/learn/evidence-intelligence`, `/learn/security-architecture`).
- **3 landing-page architecture cards updated**: Replaced temporary deep links to authenticated dashboards with educational `/learn` destinations answering *"How does this work?"*.
- **Reusable Learn UI architecture established**: Standardized with `LearnPageShell`, `LearnHero`, `FlowDiagram`, `FormulaCard`, `AssumptionCard`, `BoundaryCard`, `SourceOfTruthCard`, and `TryInArthAICta`.
- **100% Truthfulness Guaranteed**: All formulas, scoring heuristics, EMI amortization math, contribution-only goal calculations, and AI reasoning pipelines are verified against active backend code.
- **Zero Backend or Financial Engine Mutations**: No financial calculations, database schemas, RLS policies, or RAG models were altered.
- **Production Build Verified**: Next.js 16 (Turbopack) production build passed with **0 TypeScript errors, 0 build errors** across all 27 static and dynamic routes.

---

## 2. Source-of-Truth Files Inspected

The Learn layer content was derived directly from the following active repository components:

| Topic Area | Source-of-Truth Files Inspected | Key Extracted Concepts & Logic |
| :--- | :--- | :--- |
| **Financial Pulse** | `backend/app/utils/financial_formulas.py`<br>`backend/app/engine/rules_engine.py`<br>`backend/app/engine/financial_diagnosis.py` | Net Worth, DTI, Savings Ratio, Emergency Runway, 6-component Health Score weights (25% savings, 20% debt, 20% runway, 15% investments, 10% insurance, 10% goals). |
| **Decision Simulation** | `backend/app/engine/simulation_engine.py`<br>`frontend/src/components/plan/SimulatorTab.tsx` | Immutable context cloning, `NEW_LIABILITY` standard EMI amortization math, delta metrics (surplus, DTI, runway), 4 supported scenario types. |
| **Goal Planning** | `backend/app/engine/goal_feasibility.py`<br>`frontend/src/components/plan/GoalsTab.tsx` | Contribution-only projection (0% speculative CAGR), required monthly contribution formula, 6 status classifications, 3 safety check thresholds. |
| **AI Financial Advisor** | `backend/app/engine/openai_service.py`<br>`backend/app/engine/intent_classifier.py`<br>`backend/app/agents/orchestrator.py`<br>`backend/app/knowledge/tax_rules.json` | 14 domain intents, deterministic context injection, missing-data detection, read-only boundary, static Indian tax regime rules. |
| **Evidence Intelligence** | `backend/app/documents/parser.py`<br>`backend/app/documents/processor.py`<br>`database/migrations/004_candidate_financial_entities.sql` | `pypdf` page-by-page digital text parsing (no OCR), 7 document classes, `PENDING_REVIEW` candidate staging vs. canonical state, human review & reconciliation. |
| **Security Architecture** | `backend/app/dependencies.py`<br>`database/migrations/001_initial_schema.sql`<br>`database/migrations/004_candidate_financial_entities.sql` | Supabase Auth JWT tokens, PKCE flow, FastAPI `get_current_user` tenant propagation, PostgreSQL RLS (`auth.uid() = user_id`), explicit non-claims. |

---

## 3. Routes Created

| Route | Classification | Purpose |
| :--- | :--- | :--- |
| `/learn` | Public Directory | Compact categorization directory organizing the 6 architecture topics into 4 logical pillars. |
| `/learn/financial-pulse` | Public Explainer | Explains Net Worth, DTI, Runway, and the 6-component Financial Health Score formulas. |
| `/learn/decision-simulation` | Public Explainer | Explains scenario parameterization, EMI amortization math, and comparative delta metrics. |
| `/learn/goal-planning` | Public Explainer | Explains nominal goal feasibility math, required contributions, and the 0% speculative CAGR assumption. |
| `/learn/ai-financial-advisor` | Public Explainer | Explains the 8-stage grounded reasoning pipeline, context injection, and read-only boundaries. |
| `/learn/evidence-intelligence` | Public Explainer | Explains `pypdf` parsing, candidate staging vs. canonical state, and human-in-the-loop review. |
| `/learn/security-architecture` | Public Explainer | Explains PostgreSQL RLS, Supabase token auth, tenant isolation, and explicit non-claims. |

---

## 4. Financial Pulse Content

### Exposed Mathematical Formulas:
1. **Net Worth**:
   $$\text{Net Worth} = \sum \text{Assets} - \sum \text{Liabilities}$$
   *Source*: `calculate_net_worth()` in `financial_formulas.py:4`

2. **Debt-to-Income (DTI)**:
   $$\text{DTI} = \left(\frac{\text{Total Monthly EMIs}}{\text{Monthly Income}}\right) \times 100$$
   *Source*: `calculate_debt_to_income_ratio()` in `financial_formulas.py:12` (Returns `0.0%` if income $\le 0$).

3. **Emergency Runway**:
   $$\text{Runway (Months)} = \frac{\text{Dedicated Liquid Emergency Fund}}{\text{Monthly Essential Expenses}}$$
   *Source*: `calculate_emergency_fund_coverage()` in `financial_formulas.py:17`

4. **Financial Health Score (6-Component Weighted Model)**:
   $$\text{Score} = \text{Savings (25)} + \text{Debt (20)} + \text{Runway (20)} + \text{Investments (15)} + \text{Insurance (10)} + \text{Goals (10)}$$
   - *Savings Rate*: $\min\left(\frac{\text{savings\_ratio}}{30.0} \times 25.0, 25.0\right)$
   - *Debt / DTI*: $\max\left(20.0 - \frac{\text{dti}}{40.0} \times 20.0, 0.0\right)$
   - *Runway*: $\min\left(\frac{\text{runway}}{6.0} \times 20.0, 20.0\right)$
   - *Investments*: $\min\left(\frac{\text{yield\_ratio}}{100.0} \times 15.0, 15.0\right)$
   - *Insurance*: $\min\left(\frac{\text{coverage\_ratio}}{100.0} \times 10.0, 10.0\right)$
   - *Goals*: $\min\left(\frac{\text{completion\_ratio}}{100.0} \times 10.0, 10.0\right)$
   - *Aggregate Range*: 10 to 100
   *Source*: `calculate_financial_health_score()` in `financial_formulas.py:50`

---

## 5. Decision Simulation Content

### Exposed Mechanics & Formulas:
1. **Loan EMI Amortization Equation**:
   $$\text{EMI} = \frac{P \times r \times (1+r)^n}{(1+r)^n - 1}$$
   Where $P$ is principal borrowing, $r = \frac{\text{Annual Interest Rate}}{12 \times 100}$ (monthly rate), and $n = \text{Tenure in Years} \times 12$ (total months).
   *Source*: `simulation_engine.py:100`

2. **Comparative Delta Outputs**:
   - $\Delta \text{ Monthly Surplus} = \text{Projected Surplus} - \text{Baseline Surplus}$
   - $\Delta \text{ DTI Ratio} = \text{Projected DTI} - \text{Baseline DTI}$
   - $\Delta \text{ Emergency Runway} = \text{Projected Runway} - \text{Baseline Runway}$

3. **Core Distinction**:
   Explicitly clarifies: **Scenario Simulation $\neq$ Market Prediction**. Simulation evaluates sensitivity under explicit mathematical assumptions on an immutable in-memory context copy; it does not speculate on stock market movements.

---

## 6. Goal Planning Content

### Exposed Mechanics & Formulas:
1. **Time Horizon**:
   $$\text{Months Remaining} = \max\left(1, \text{round}\left(\frac{\text{Days to Target Date}}{30.0}\right)\right)$$
   *Source*: `goal_feasibility.py:113`

2. **Required Monthly Contribution**:
   $$\text{Required Contribution} = \frac{\max(\text{Target Amount} - \text{Saved Amount}, 0)}{\text{Months Remaining}}$$
   *Source*: `goal_feasibility.py:117`

3. **Projected Goal Accumulation (Contribution-Only)**:
   $$\text{Projected Amount} = \text{Saved Amount} + (\text{Current Contribution} \times \text{Months Remaining})$$
   *Source*: `goal_feasibility.py:122`

4. **Core Assumption**:
   Uses a **0% speculative CAGR / market return assumption**. The calculation answers whether nominal savings alone reach the target with certainty.

5. **Financial Safety Limits**:
   Flags financial stress if pursuing the goal results in Emergency Runway $< 3.0$ months, DTI $> 35.0\%$, or remaining monthly surplus $< ₹5,000/\text{mo}$.

---

## 7. AI Financial Advisor Content

### Exposed 8-Stage Reasoning Pipeline:
1. **User Question**: Input submitted via CfoHub.
2. **Intent Classification**: Keyword matching against 14 domain intents (`intent_classifier.py`).
3. **Context Builder**: Gathers structured profile, cash flows, assets, debts, and bills.
4. **Canonical Financial State**: Ingests verified ledger records.
5. **Deterministic Intelligence**: Injects pre-calculated metrics from `BusinessRuleEngine` & `SimulationEngine`.
6. **Evidence Context**: Injects extracted document facts and source page citations.
7. **Missing-Data Detection**: Surfaces missing profile inputs rather than hallucinating estimates.
8. **LLM Gateway**: `OpenAIService` applies strict prompt constraints (no math hallucination, explain trade-offs, ground in Indian tax guidelines) and streams structured Markdown advice.

*Read-Only Boundary*: The AI CFO has 0 write access to database records.

---

## 8. Evidence Intelligence Content

### Exposed Ingestion & Review Workflow:
1. **Page-Aware PDF Parsing**: Extracted page-by-page using `pypdf` with page indices.
2. **Classification & Fact Extraction**: Classifies into 7 document types and extracts candidate facts with confidence scores.
3. **Candidate Staging**: Staged into `candidate_financial_entities` under `PENDING_REVIEW` status.
4. **Candidate vs. Canonical State**: Candidate facts **do not** participate in Financial Pulse or Net Worth calculations until approved.
5. **Human Review & Reconciliation**: User approves, edits, or rejects candidates and resolves conflicts with existing records.
6. **Provenance Tracking**: Approved canonical records retain permanent links to `source_document_id` and `source_page`.
7. **Document Boundaries**: Native text parsing only; no OCR engine for image-only scans.

---

## 9. Security Architecture Content

### Verified Security Layers:
1. **Supabase Authentication**: PKCE authorization flow with cryptographically signed JWT tokens.
2. **Tenant Context Propagation**: FastAPI `Depends(get_current_user)` extracts and binds `current_user.id`.
3. **PostgreSQL Row-Level Security (RLS)**: Database engine enforces `auth.uid() = user_id` across all tables.
4. **Document Provenance**: Tenant-isolated embeddings and document chunk storage.
5. **Read-Only AI Advisory**: Ephemeral session prompt payloads without database write permissions.
6. **Explicit Non-Claims**:
   - ✕ No SOC 2 / ISO 27001 certifications.
   - ✕ No application-level AES-256 payload encryption claims.
   - ✕ No banking or Account Aggregator licenses.
   - ✕ No biometric KYC capture.

---

## 10. Landing Card Migration

| Landing Card Title | Action Label | Old Temporary Route | New Canonical Learn Route |
| :--- | :--- | :--- | :--- |
| **AI Financial Advisor** | `Explore Advisory loop →` | `/dashboard?tab=cfo` | `/learn/ai-financial-advisor` |
| **Future Cash Flow Forecasts** | `View simulation curves →` | `/dashboard?tab=plan&subTab=decision_center` | `/learn/decision-simulation` |
| **Goal Progress Allocator** | `Manage targets →` | `/dashboard?tab=plan&subTab=goals` | `/learn/goal-planning` |

---

## 11. Learn → Product CTA Mapping

Each Learn page provides a context-appropriate secondary CTA into the live product:

| Learn Page | CTA Title | Button Label | Target Destination |
| :--- | :--- | :--- | :--- |
| `/learn/financial-pulse` | View Your Live Financial Pulse | `Open Financial Home` | `/dashboard?tab=home` |
| `/learn/decision-simulation` | Test a Scenario in Decision Center | `Open Decision Center` | `/dashboard?tab=plan&subTab=decision_center` |
| `/learn/goal-planning` | Track Your Milestones in Goals Vault | `Open Goals Vault` | `/dashboard?tab=plan&subTab=goals` |
| `/learn/ai-financial-advisor` | Consult Your AI CFO | `Open AI CFO` | `/dashboard?tab=cfo` |
| `/learn/evidence-intelligence` | Upload Statements to Evidence Vault | `Open Evidence Vault` | `/dashboard?tab=evidence&subTab=vault` |
| `/learn/security-architecture` | Manage Your Profile & Security Settings | `Open Profile & Security` | `/dashboard?tab=profile` |

---

## 12. Truth Audit

Repository-wide static search for sensitive terms across `frontend/src`:

| Search Term | Matches in `frontend/src` | Context & Verification |
| :--- | :--- | :--- |
| `cashflow/projection` | **0** | Confirmed 0 occurrences. Mock endpoint strictly isolated. |
| `14.8%` | **1** | `FinancialNumbersBackground.tsx` (Ambient background decoration). |
| `1.85Cr` | **0** | 0 occurrences. |
| `91% accuracy` | **0** | 0 occurrences. |
| `Monte Carlo` | **0** | 0 occurrences (Replaced with "Deterministic Sensitivity Engine" in landing page pipeline). |
| `AES-256` | **1** | `security-architecture/page.tsx` (Explicit non-claim: *"✕ No Application-Level AES-256 Claim"*). |
| `SOC 2` | **1** | `security-architecture/page.tsx` (Explicit non-claim: *"✕ No SOC 2 / ISO Certifications"*). |
| `ISO 27001` | **1** | `security-architecture/page.tsx` (Explicit non-claim: *"✕ No SOC 2 / ISO Certifications"*). |
| `OCR` | **2** | `evidence-intelligence/page.tsx` (Explicitly documents *"No OCR Engine"* and *"Does NOT perform OCR"*). |
| `guaranteed` | **0** | 0 occurrences. |
| `bank-grade` | **0** | 0 occurrences. |
| `Financial Twin` | **2** | `lib/constants.ts` (Subtab label) & `PlanHub.tsx` (Truthful empty-history state comment). |

---

## 13. Files Created

1. [`frontend/src/components/learn/LearnPageShell.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/learn/LearnPageShell.tsx)
2. [`frontend/src/components/learn/LearnHero.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/learn/LearnHero.tsx)
3. [`frontend/src/components/learn/FlowDiagram.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/learn/FlowDiagram.tsx)
4. [`frontend/src/components/learn/FormulaCard.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/learn/FormulaCard.tsx)
5. [`frontend/src/components/learn/AssumptionCard.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/learn/AssumptionCard.tsx)
6. [`frontend/src/components/learn/BoundaryCard.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/learn/BoundaryCard.tsx)
7. [`frontend/src/components/learn/SourceOfTruthCard.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/learn/SourceOfTruthCard.tsx)
8. [`frontend/src/components/learn/TryInArthAICta.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/learn/TryInArthAICta.tsx)
9. [`frontend/src/app/learn/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/learn/page.tsx)
10. [`frontend/src/app/learn/financial-pulse/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/learn/financial-pulse/page.tsx)
11. [`frontend/src/app/learn/decision-simulation/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/learn/decision-simulation/page.tsx)
12. [`frontend/src/app/learn/goal-planning/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/learn/goal-planning/page.tsx)
13. [`frontend/src/app/learn/ai-financial-advisor/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/learn/ai-financial-advisor/page.tsx)
14. [`frontend/src/app/learn/evidence-intelligence/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/learn/evidence-intelligence/page.tsx)
15. [`frontend/src/app/learn/security-architecture/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/learn/security-architecture/page.tsx)
16. [`stageE_learn_layer.md`](file:///c:/shruti_materials/Projects/ArthAI/stageE_learn_layer.md)

---

## 14. Files Modified

1. [`frontend/src/app/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/page.tsx)
   - Updated the 3 architecture cards to point to `/learn/ai-financial-advisor`, `/learn/decision-simulation`, and `/learn/goal-planning`.
   - Added `/learn` link to navbar and footer.
   - Updated pipeline step 4 subtitle from "Monte Carlo Engine" to "Deterministic Sensitivity Engine".
2. [`frontend/src/app/careers/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/careers/page.tsx)
   - User styling adjustment for token classes (`text-primary`, `bg-bg-soft`, `text-dark`).

---

## 15. Build Validation

- Command: `npm run build` in `frontend/`
- Result: **0 TypeScript errors, 0 build errors**.
- All 27 static and dynamic routes compiled and generated in 7.6s.

---

## 16. Remaining Gaps

- None within the scope of Stage E. The `/learn` layer is fully established, accessible, responsive, and completely truthful.

---

## 17. Recommendation

Stage E is fully complete and verified. **The application has fulfilled all Learn Layer objectives and is ready to close Stage E.**
