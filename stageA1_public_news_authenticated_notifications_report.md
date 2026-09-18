# Stage A.1 — Public News & Authenticated Notification Flow

## Objective
Implement a focused, deterministic UX/navigation improvement to the existing ArthAI application:
1. Replace hardcoded "AI Proactive Opportunities" on the public landing page notification bell with a live, server-side **public finance news** feed.
2. Introduce a proper authenticated notification center containing both **Finance News** and **Your ArthAI** (backed by actual backend attention items with deep links into active hubs).
3. Preserve the main landing page after login as the outer product shell rather than abruptly replacing it with the dashboard.
4. Establish "Access Sandbox" as the explicit gateway into the authenticated financial operating system (`/dashboard`).

---

## Existing Flow Before Changes
* **Logged Out**:
  * Landing page displayed a notification popover with hardcoded mock proactive opportunities ("Cancel unused subscription", "Save ₹7,200/year", "Increase SIP contribution", "Renewal upcoming in 17 days").
  * These values were synthetic and visually violated the boundary between public and private financial state.
* **Logged In**:
  * Login page forcibly routed users directly to `/dashboard`.
  * The main landing page had no notification state or news capability.

---

## Public Notification Behavior
* **Trigger**: Notification bell button in navbar.
* **Content**: 
  * Only public, real finance & market news articles fetched via a secure server-side endpoint.
  * Zero private financial metrics, net worth, DTI, or goals are displayed or fetched when logged out.
* **Format**: Article headline, publisher name, publication relative timestamp.
* **Click Behavior**: Clicking any article immediately opens the actual source article in a new tab via safe `rel="noopener noreferrer"` external links.
* **Fallback**: If news is unreachable or offline, shows `"Finance news is temporarily unavailable."` without manufacturing fake placeholder articles.

---

## News Provider
* **Provider**: Google News India Business & Finance RSS Feed (`https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en`).
* **Architecture**: Server-side Next.js route handler at [`/api/news`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/api/news/route.ts).
* **Security**: No API keys or external news requests exposed to client components. The browser queries internal `/api/news`.
* **Caching**: In-memory server caching with a 10-minute (600,000ms) TTL to prevent rate-limiting.

---

## News Data Contract
Normalized schema:
```ts
export interface FinanceNewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string; // ISO 8601 timestamp
  url: string;
  category?: string;
  imageUrl?: string;
}
```

---

## Article Navigation
* Every article in [`FinanceNewsList.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/notifications/FinanceNewsList.tsx) is rendered as a valid anchor element `<a href={item.url} target="_blank" rel="noopener noreferrer">`.
* No hash links (`#`), no fake internal articles, no scraping of copyrighted bodies.

---

## Authenticated Notification Behavior
* **Navbar Bell**: Switches to authenticated mode when a Supabase session is detected.
* **Tabs**:
  1. **Your ArthAI**: Deterministic attention alerts derived from the user's actual portfolio, documents, and cashflows via `/api/v1/attention`.
  2. **Finance News**: Live public business news stream.
* **Zero Fabrication**: If no attention items exist, renders `"All caught up! No urgent financial attention items or review actions required."` (No fake savings or alerts).

---

## Personal Notification Source
* **Source Endpoint**: Connected to the existing FastAPI Attention API at `/api/v1/attention`.
* **Deep Links**:
  * `goals` &rarr; `/dashboard?tab=plan&subTab=goals`
  * `evidence` &rarr; `/dashboard?tab=evidence`
  * `money` / `cashflow` &rarr; `/dashboard?tab=money`
  * `cfo` &rarr; `/dashboard?tab=cfo`
  * default &rarr; `/dashboard?tab=home`

---

## Authentication Boundary
| User State | Allowed Content | Blocked Content / APIs |
| :--- | :--- | :--- |
| **Logged Out** | Public finance news, landing page marketing, simulator preview | Personal attention items, `/api/v1/*` financial endpoints, net worth, DTI, goals |
| **Logged In** | Public finance news, authenticated workspace, personal attention items | None (full authenticated OS accessible via Access Sandbox) |

---

## Post-Login Landing Flow
* Authenticated users returning to or visiting `/` see the full ArthAI landing page with an updated top navbar CTA: **"Access Sandbox"**.
* Authenticating through `/login` redirects to `/` by default rather than forcibly locking the user into `/dashboard`.

---

## Access Sandbox Flow
* **Logged In**: Clicking **"Access Sandbox"** in the navbar or landing page hero immediately opens `/dashboard` (HOME, MONEY, PLAN, EVIDENCE, AI CFO, PROFILE).
* **Logged Out**: Clicking Sign In / Get Started prompts authentication before accessing private data.

---

## Logout Behavior
* When a user logs out, Supabase session is cleared.
* Landing page navbar resets to "Sign In" and "Get Started".
* Notification bell resets strictly to Public Finance News.
* Zero private endpoints are invoked.

---

## Security / Private API Verification
* Client-side network requests on `/` when logged out only invoke `/api/news`.
* Private endpoints (`/api/v1/attention`, `/api/v1/cfo/*`, etc.) are guarded and only requested when `isAuthenticated === true`.

---

## Dead Links Checked
* [x] Navbar Notification Bell (Toggles popover)
* [x] "View all finance news / alerts" &rarr; opens [`/notifications`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/notifications/page.tsx)
* [x] News article anchors &rarr; opens real publisher URLs in external tab
* [x] Access Sandbox &rarr; `/dashboard`
* [x] Sign In &rarr; `/login`
* [x] Get Started &rarr; `/register`
* [x] Back to Home &rarr; `/`

---

## Files Modified / Created
1. `[NEW]` [`frontend/src/app/api/news/route.ts`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/api/news/route.ts) — Server-side public finance news RSS endpoint with 10-minute cache.
2. `[NEW]` [`frontend/src/components/notifications/FinanceNewsList.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/notifications/FinanceNewsList.tsx) — Reusable public finance news list component with external links and real relative timestamps.
3. `[NEW]` [`frontend/src/components/notifications/PersonalNotificationList.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/notifications/PersonalNotificationList.tsx) — Authenticated personal attention item list with deterministic deep links.
4. `[NEW]` [`frontend/src/components/notifications/NotificationBell.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/notifications/NotificationBell.tsx) — Unified notification popover component handling logged-out vs logged-in state.
5. `[NEW]` [`frontend/src/app/notifications/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/notifications/page.tsx) — Full-page notifications & finance news destination.
6. `[MODIFY]` [`frontend/src/app/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/page.tsx) — Replaced fake proactive opportunity popover with `<NotificationBell />` and wired "Access Sandbox" CTA.
7. `[MODIFY]` [`frontend/src/app/login/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/login/page.tsx) — Preserved landing page post-login redirect flow (`router.replace('/')`).

---

## Runtime Verification
* Verified Next.js dev server compiling cleanly.
* Verified `/api/news` returns `200 OK` with live real-time business and finance news items.
* Verified `/notifications` compiles statically and server-renders dynamically on demand.

---

## Build Verification
Command: `npm run build`
Result:
```text
▲ Next.js 16.2.10 (Turbopack)
✓ Compiled successfully in 14.6s
✓ Finished TypeScript in 10.9s
✓ Generating static pages using 11 workers (15/15) in 580ms
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/news
├ ƒ /auth/callback
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

## Tests
* Next.js production build and TypeScript type checks: **PASS** (0 errors).
* Backend dev server on `127.0.0.1:8000`: **ACTIVE**.

---

## Issues Found & Fixes Applied
1. **Hardcoded Proactive Notifications**: Replaced mock subscriptions & SIP suggestions with live public finance news for visitors and real attention items for authenticated users.
2. **Immediate Dashboard Lockout on Login**: Corrected `LoginPage` redirect to land back on the main product landing page `/`, unlocking the "Access Sandbox" gateway into the financial OS.
3. **News Provider Security**: Placed all news fetching server-side in `/api/news` with memory caching rather than exposing API queries or secrets in client React components.

---

## Remaining Gaps
None for Stage A.1.

---

## Final Verdict
**PASS**
