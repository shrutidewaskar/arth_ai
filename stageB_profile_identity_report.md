# Stage B — Profile & Identity Workspace

## 1. Backend Profile Contract

| Capability | Method | Endpoint | Request/Response | Verified |
| :--- | :--- | :--- | :--- | :---: |
| **Get Financial Profile** | `GET` | `/api/v1/profile` | Returns `FinancialProfileResponse` (`occupation`, `city`, `age`, `marital_status`, `dependents`, `risk_appetite`, `currency`, `monthly_income`, `monthly_expenses`, `emergency_fund`, `credit_score`) | ✅ Yes |
| **Update Financial Profile** | `PUT` | `/api/v1/profile` | Accepts `FinancialProfileUpdate` payload; updates only provided fields; returns updated `FinancialProfileResponse` | ✅ Yes |
| **Onboarding Status** | `GET` | `/api/v1/onboarding/status` | Returns profile completeness checks | ✅ Yes |
| **Demo Household Seeding** | `POST` | `/api/v1/demo/seed` | Seeds isolated test fixture for the authenticated user | ✅ Yes |
| **Password Recovery Request**| N/A | Supabase Auth API | `supabase.auth.resetPasswordForEmail(email)` with redirect to `/auth/callback?next=/auth/reset-password` | ✅ Yes |
| **Password Update** | N/A | Supabase Auth API | `supabase.auth.updateUser({ password })` | ✅ Yes |

---

## 2. Profile Information Architecture
The Profile workspace is structured into 6 modular tabbed sections in [`frontend/src/components/profile/ProfileHub.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/ProfileHub.tsx):
```text
PROFILE
│
├── 1. Personal Information (Occupation, City, Age, Marital Status)
├── 2. Household (Financial Dependents context)
├── 3. Financial Preferences (Investment Risk Appetite: Conservative / Moderate / Aggressive)
├── 4. Notifications (Links to ArthAI Attention Queue & Public Finance News)
├── 5. Security (Active Postgres RLS status, Session identity, Password reset link, Sign out)
└── 6. Developer (Isolated Sharma demo fixture seeding)
```

---

## 3. Personal Information
* **Component**: [`PersonalInformationSection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/PersonalInformationSection.tsx)
* **Supported Fields**: `occupation` (string), `city` (string), `age` (integer, validated 18–120), `marital_status` (`Single` / `Married` / `Divorced` / `Widowed`).
* **Interaction**: Explicit "Edit Information" &rarr; inline form with validation &rarr; `PUT /api/v1/profile` via `updateProfile()` &rarr; toast feedback &rarr; immediate refresh.

---

## 4. Household
* **Component**: [`HouseholdSection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/HouseholdSection.tsx)
* **Supported Fields**: `dependents` (integer, validated 0–20).
* **Context Explanation**: Explicitly explains how dependent count informs the 3–6 month emergency reserve multiplier in the reasoning engine.

---

## 5. Financial Preferences
* **Component**: [`FinancialPreferencesSection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/FinancialPreferencesSection.tsx)
* **Supported Values**: `Conservative`, `Moderate`, `Aggressive` (persisted as backend string `risk_appetite`).
* **Context Explanation**: Informs the Goal Feasibility and AI CFO reasoning engine regarding asset allocation tolerances without creating mock calculations in React.

---

## 6. Notification Settings
* **Component**: [`NotificationPreferencesSection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/NotificationPreferencesSection.tsx)
* **Truthful Capabilities**: Surfaces active deep links to the Stage A.1 `/notifications` page (both Your ArthAI Attention queue and Public Finance News).
* **Zero Fake Toggles**: Explicitly states delivery channel controls (Email/SMS/WhatsApp digests) are planned for future roadmap stages rather than offering dummy toggles.

---

## 7. Security
* **Component**: [`SecuritySection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/SecuritySection.tsx)
* **Verified Claims**: Shows PostgreSQL Row-Level Security (RLS) active status, authenticated user email, last sign-in timestamp, link to password change/reset, and secure sign-out.
* **No Unverified Copy**: Zero mentions of AES-256 or unverified encryption certifications.

---

## 8. Password Reset
* **New Route**: [`frontend/src/app/auth/reset-password/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/auth/reset-password/page.tsx)
* **Login Integration**: Added "Forgot password?" trigger in [`frontend/src/app/login/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/login/page.tsx) invoking `supabase.auth.resetPasswordForEmail()` targeting `/auth/callback?next=/auth/reset-password`.
* **Zero Password Leakage**: Handled entirely through Supabase Auth without passing passwords to ArthAI backend endpoints.

---

## 9. Developer / Demo Mode
* **Component**: [`DeveloperSection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/DeveloperSection.tsx)
* **Isolation**: Retains `POST /api/v1/demo/seed` to populate the synthetic Rajesh Sharma household fixture safely isolated to the active testing session.

---

## 10. API Client Changes
* Added strongly typed helpers to [`frontend/src/lib/api.ts`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/lib/api.ts):
  - `getProfile(): Promise<FinancialProfileResponse>`
  - `updateProfile(profileUpdate): Promise<FinancialProfileResponse>`

---

## 11. Authentication & Ownership Verification
* All profile operations require valid Supabase JWT tokens via `apiFetch()` (`Authorization: Bearer <token>`).
* Backend FastAPI routes derive `current_user: User = Depends(get_current_user)` from the verified JWT payload and query `filter(FinancialProfile.user_id == current_user.id)` to enforce multi-tenant isolation. No frontend-provided `user_id` is trusted.

---

## 12. Unknown vs Zero Handling
* Empty or unprovided fields display as `"Not specified"` rather than manufacturing fake zeros or placeholder strings.

---

## 13. Runtime Verification
* Verified Next.js dev server compiling cleanly.
* Verified profile updates dispatch `PUT /api/v1/profile` and persist back to database.
* Verified `/auth/reset-password` renders with validation and password confirmation checks.

---

## 14. Build Verification
Command: `npm run build`
Result:
```text
▲ Next.js 16.2.10 (Turbopack)
- Environments: .env.local
✓ Compiled successfully in 12.4s
✓ Finished TypeScript in 10.1s
✓ Generating static pages using 11 workers (16/16) in 480ms
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/news
├ ƒ /auth/callback
├ ○ /auth/reset-password
├ ○ /auth/verify-error
├ ○ /dashboard
├ ○ /decision-simulation
├ ○ /gold-asset-tracking
├ ○ /login
├ ○ /notifications
├ ○ /onboarding
├ ○ /register
└ ○ /tax-regime-planner
```

---

## 15. Tests
* Production build: **PASS** (16/16 routes compiled, 0 errors).
* Backend test suite coverage: Verified in `test_app_rls_smoke.py` (lines 135–145) and `test_stage5b_journey.py` (line 80).

---

## 16. Files Modified / Created
1. `[NEW]` [`frontend/src/app/auth/reset-password/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/auth/reset-password/page.tsx)
2. `[NEW]` [`frontend/src/components/profile/PersonalInformationSection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/PersonalInformationSection.tsx)
3. `[NEW]` [`frontend/src/components/profile/HouseholdSection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/HouseholdSection.tsx)
4. `[NEW]` [`frontend/src/components/profile/FinancialPreferencesSection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/FinancialPreferencesSection.tsx)
5. `[NEW]` [`frontend/src/components/profile/NotificationPreferencesSection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/NotificationPreferencesSection.tsx)
6. `[NEW]` [`frontend/src/components/profile/SecuritySection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/SecuritySection.tsx)
7. `[NEW]` [`frontend/src/components/profile/DeveloperSection.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/DeveloperSection.tsx)
8. `[MODIFY]` [`frontend/src/components/profile/ProfileHub.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/profile/ProfileHub.tsx)
9. `[MODIFY]` [`frontend/src/lib/api.ts`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/lib/api.ts)
10. `[MODIFY]` [`frontend/src/app/login/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/login/page.tsx)

---

## 17. Issues Found & Fixes Applied
1. **Minimal Profile View**: Reconstructed Profile into 6 dedicated modular sections covering personal information, household context, investment risk preferences, notification settings, RLS security, and developer demo tools.
2. **Missing Password Reset Surface**: Built `/auth/reset-password` connected to Supabase recovery flow and wired "Forgot password?" on the login page.
3. **Centralized API Client**: Added typed `getProfile()` and `updateProfile()` helpers in `api.ts`.

---

## 18. Remaining Gaps
None for Stage B.

---

## 19. Final Verdict
**PASS**
