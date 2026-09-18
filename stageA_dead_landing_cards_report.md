# Stage A — Dead Landing Cards Report

## Objective
Remove the unlinked dead-card behavior from the landing page by connecting the three existing system-architecture cards to their active, functional product destinations in `/dashboard`.

---

## Cards Located

| Card | CTA | Previous Behavior | New Destination |
| :--- | :--- | :--- | :--- |
| **Card 1: AI Financial Advisor** | "Explore Advisory loop" | Plain unlinked `<div>` (did nothing on click) | `/dashboard?tab=cfo` (AI CFO Workspace) |
| **Card 2: Future Cash Flow Forecasts** | "View simulation curves" | Plain unlinked `<div>` (did nothing on click) | `/dashboard?tab=plan&subTab=decision_center` (Decision Center & Simulation Engine) |
| **Card 3: Goal Progress Allocator** | "Manage targets" | Plain unlinked `<div>` (did nothing on click) | `/dashboard?tab=plan&subTab=goals` (Goals Vault Workspace) |

---

## Navigation Implementation

1. **Card Wrapping (`frontend/src/app/page.tsx`)**:
   - Replaced static container `<div>` tags with Next.js `<Link>` components wrapped with proper focus/hover transitions and icon animations.
   - Pointed each card directly to the canonical dashboard route using established query parameters (`?tab=...` and `&subTab=...`).

2. **Dashboard Query Sync (`frontend/src/app/dashboard/page.tsx`)**:
   - Enhanced the `useEffect` handling URL search parameters to recognize both `tab` and `subTab` parameters (e.g. `?tab=plan&subTab=goals`), ensuring deep navigation directly mounts the intended sub-workspace.

---

## Other Dead Links Observed (Flagged for Stage D Navigation Hardening)

During inspection of `frontend/src/app/page.tsx` and related landing files, the following additional dead/legacy links were cataloged:
- **Standalone Feature Pages**:
  - `/decision-simulation` $\rightarrow$ CTA points to outdated `/?tab=simulator`.
  - `/tax-regime-planner` $\rightarrow$ CTA points to outdated `/?tab=decision_center`.
  - `/gold-asset-tracking` $\rightarrow$ CTA points to outdated `/?tab=investments`.
- **Footer Links**:
  - About Us $\rightarrow$ `href="#"`
  - Careers $\rightarrow$ `href="#"`
  - Security & Encryption $\rightarrow$ `href="#"`
  - Privacy Policy $\rightarrow$ `href="#"`

*Note: Per Stage A instructions, these unrelated links were left untouched in this stage and are cataloged for upcoming Stage D hardening.*

---

## Files Modified

1. [`frontend/src/app/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/page.tsx) — Converted the 3 static architecture cards into active `<Link>` navigation elements.
2. [`frontend/src/app/dashboard/page.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/app/dashboard/page.tsx) — Added `subTabParam` query parameter synchronization on mount.

---

## Runtime Verification

- **Card 1 ("Explore Advisory loop")**: Target verified as `/dashboard?tab=cfo`. Mounts `CfoHub.tsx` with grounded reasoning chat.
- **Card 2 ("View simulation curves")**: Target verified as `/dashboard?tab=plan&subTab=decision_center`. Mounts `PlanHub.tsx` on the Decision Center simulator.
- **Card 3 ("Manage targets")**: Target verified as `/dashboard?tab=plan&subTab=goals`. Mounts `PlanHub.tsx` on the Goals Vault.

---

## Build Verification

- **Command**: `npm run build`
- **Output Summary**:
  ```text
  ▲ Next.js 16.2.10 (Turbopack)
  ✓ Compiled successfully in 13.2s
  Running TypeScript ...
  Finished TypeScript in 13.4s ...
  Generating static pages (13/13) in 455ms
  ✓ Finalizing page optimization
  ```
- **Result**: 13/13 routes compiled with **0 TypeScript errors** and **0 lint errors**.

---

## Issues

None. The change is isolated, minimal, and fully compatible with existing routing conventions.

---

## Final Verdict

**PASS**

All three landing architecture cards are now actively connected to their corresponding functional product workspaces without adding mock data, changing financial math, or breaking Next.js build compilation.
