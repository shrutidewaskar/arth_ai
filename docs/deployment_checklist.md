# ArthAI Production Deployment Checklist

This document details the complete deployment checklist for **ArthAI**, the AI-powered Financial Operating System for the Indian Middle Class. Use this checklist to verify that all systems are secure, optimized, and ready for production before launch.

---

## 🏛️ 1. Database & Supabase Platform

Supabase serves as the database, authentication service, and document storage provider.

### Schema & Migrations
- [ ] **Apply Core Schema**: Run [database/schema.sql](file:///c:/shruti_materials/Projects/ArthAI/database/schema.sql) on the production database.
- [ ] **Verify UUID Extension**: Confirm `uuid-ossp` is enabled.
- [ ] **Verify Table Structures**: Check that all 16 tables are created correctly.

### Row-Level Security (RLS) Policies
> [!IMPORTANT]
> Row Level Security is enabled by default in our SQL script. Without explicit policies, all read/write queries will fail for non-admin sessions.

Configure the following policies:
- [ ] **`users`**: Allow select/update only if `id = auth.uid()`.
- [ ] **Household Balance Sheet Tables** (`financial_profiles`, `income_sources`, `expense_categories`, `assets`, `liabilities`, `goals`, `investments`, `insurance`, `subscriptions`): Allow select, insert, update, and delete only if `user_id = auth.uid()`.
- [ ] **Documents** (`documents`): Allow access only if `user_id = auth.uid()`.
- [ ] **AI & Conversations** (`ai_insights`, `ai_memories`, `conversations`, `messages`, `decision_simulations`): Allow read/write only if `user_id = auth.uid()`.

### Supabase Storage Buckets
Create and configure policies for the following three buckets:
1. **`financial-documents`**
   - **Type**: Private
   - **RLS Policy**: Allow upload and download only if `auth.uid() = owner`.
2. **`profile-images`**
   - **Type**: Public
   - **RLS Policy**: Allow public read, restrict write to `auth.uid() = owner`.
3. **`generated-reports`**
   - **Type**: Private
   - **RLS Policy**: Allow access only if the requesting user matches the report's owner metadata.

---

## ⚡ 2. Backend (FastAPI) Deployment

The backend runs FastAPI and orchestrates the multi-agent reasoning loop.

### Environment Variables
Configure the following production variables:
- [ ] `DATABASE_URL`: Production PostgreSQL connection string (use pgBouncer pooler connection string if using serverless).
- [ ] `JWT_SECRET`: The JWT Secret corresponding to the production Supabase Auth instance.
- [ ] `SUPABASE_URL`: Production Supabase project URL.
- [ ] `SUPABASE_ANON_KEY`: Production Supabase client anonymous key.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secure, only for admin actions).
- [ ] `OPENAI_API_KEY`: Production OpenAI API key (ensure usage limits and billing are set up).

### CORS & Security Settings
- [ ] Update `BACKEND_CORS_ORIGINS` in [backend/app/config.py](file:///c:/shruti_materials/Projects/ArthAI/backend/app/config.py) to contain only the production frontend domains.
- [ ] Disable Swagger UI (`/docs`) in production, or restrict access via HTTP basic auth.

### Infrastructure & Server Configuration
- [ ] **Gunicorn/Uvicorn configuration**: Run behind a reverse proxy (e.g., Nginx, AWS ALB).
  - Use `uvicorn.workers.UvicornWorker` with Gunicorn.
  - Set workers to `2 * CPU cores + 1`.
- [ ] Configure health check endpoint (`/health`) monitoring.

---

## 🎨 3. Frontend (Next.js 15) Deployment

The frontend dashboard uses Next.js 15 (App Router), TailwindCSS, and Framer Motion.

### Build Verification
- [ ] Run `npm run build` locally or in CI/CD to verify no TypeScript compilation errors or linter issues.
- [ ] Verify Server-Side Rendering (SSR) configs and ensure correct route caching behavior.

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL`: Frontend-facing Supabase URL.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Frontend-facing Supabase Anon Key.
- [ ] `NEXT_PUBLIC_API_URL`: Base URL of the deployed FastAPI backend (used for client-side fetches and server-side redirects).

### Optimization & UX
- [ ] Optimize static images (logos, avatars) inside `/public`.
- [ ] Verify smooth animations and transitions on mobile and desktop viewports.
- [ ] Verify SEO elements (metadata titles, responsive tags, and OpenGraph parameters).

---

## 🤖 4. AI & Reasoning Engine Validation

Verify the intelligence loop runs successfully under production load.

- [ ] **Model Selection & Rate Limits**: Confirm that the target OpenAI model (e.g., GPT-4o) has enough rate limits (RPM and TPM) for the projected user load.
- [ ] **Deterministic Rules Engine Check**: Verify mathematical calculations (DTI, Savings rate, Net Worth) do not rely on LLM context windows and are computed exactly using [backend/app/utils/financial_formulas.py](file:///c:/shruti_materials/Projects/ArthAI/backend/app/utils/financial_formulas.py).
- [ ] **Prompt Audits**: Check that all agents in [backend/app/agents/specialists.py](file:///c:/shruti_materials/Projects/ArthAI/backend/app/agents/specialists.py) have their system prompts locked and tested against Indian market quirks (New vs. Old Tax Regime).

---

## 🛡️ 5. Monitoring, Logging & Backups

- [ ] **Error Tracking**: Install Sentry or a similar APM tool in both backend and frontend.
- [ ] **Database Backups**: Enable daily automated backups on the Supabase PostgreSQL database.
- [ ] **SSL/TLS Certificates**: Ensure end-to-end encryption (HTTPS/WSS) is active on both the API and the web application.
