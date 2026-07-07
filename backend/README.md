# ArthAI Backend Architecture

This is the FastAPI backend for **ArthAI**, the AI-powered Financial Operating System for the Indian Middle Class.

## Key Technical Systems

### 1. Database & Supabase Platform
- **Supabase PostgreSQL:** Stores user financial profiles, income sources, asset allocations, goals, insights, and AI memories.
- **Row-Level Security (RLS):** Fully enabled across all tables. Queries automatically resolve to the authenticated user.
- **Supabase Storage Buckets:**
  - `financial-documents`: Secure file vault for tax reports, salary slips, and policies.
  - `profile-images`: User profiles.
  - `generated-reports`: Formatted PDF advisor exports.

### 2. Specialized Agent Architecture (`app/agents/specialists.py`)
Rather than relying on the LLM to calculate returns and predict outcomes, ArthAI delegates domain tasks to 9 specialized agents:
- **Profile Agent:** Maintains demographic context (marital status, occupation, age, dependents).
- **Cash Flow Agent:** Tracks surplus run-rates, forecasts liquidity, and models burn-rates.
- **Investment Agent:** Gauges expected portfolio returns, net worth additions, and platform risk.
- **Insurance Agent:** Compares current coverage against standard term recommendations (e.g. 10x annual income).
- **Goal Agent:** Tracks goal progress timelines and predicts target completion dates.
- **Decision Agent:** Analyzes the long-term impact of major purchases on outstanding goals.
- **Memory Agent:** Compiles past intents (e.g., loan prepayment plans) and inserts them into prompt flows.
- **Insight Agent:** Generates real-time financial opportunities like Tax Regime switches.
- **Recommendation Agent:** Aggregates health diagnostics into prioritized execution lists.

### 3. Business Calculation Rules Engine (`app/utils/financial_formulas.py`)
All financial logic is written in deterministic python code (free from LLM hallucination risk):
- **Net Worth:** `Total Assets - Total Liabilities`
- **Debt-to-Income (DTI) Ratio:** `Monthly EMIs / Monthly Income` (Target: < 40%)
- **Savings Ratio:** `Monthly Savings / Monthly Income` (Target: > 30%)
- **Emergency Fund Coverage Runway:** `Emergency Balance / Monthly Expenses` (Target: > 6 months)
- **Financial Health Score:** Aggregate rating from 0 to 100 based on standard liquidity, savings, and shielding indicators.

### 4. AI Reasoning Orchestrator Pipeline (`app/engine/reasoning.py`)
```
User Query ➔ Intent Classification ➔ Rules Engine Calculations ➔ Agent Invocation ➔ Structured Context Build ➔ GPT Response Layer
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- PostgreSQL database or Supabase project URL

### Setup Environment
Create a `.env` file in the root backend directory:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/postgres
JWT_SECRET=your-supabase-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-api-key
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Start Development Server
```bash
uvicorn app.main:app --reload
```
The server will run on `http://127.0.0.1:8000`. Swagger API docs will be active at `http://127.0.0.1:8000/docs`.
