# Stage 5E.6 — Evidence Center Report

## Executive Summary

Stage 5E.6 delivers the **Evidence Center**, transforming `EVIDENCE` into an inspectable, human-in-the-loop financial evidence workspace.

### Core Architectural Principle
> **MONEY** tells the user what ArthAI believes.
> **EVIDENCE** lets the user inspect why ArthAI believes it.

Pending candidate entities extracted from financial documents are explicitly sequestered in the review queue until the user approves or edits them, preserving the strict human-in-the-loop boundary before anything enters the canonical financial state.

---

## A. Backend Capability Matrix

| Endpoint | Method | Purpose | Frontend Hook / Integration |
|---|---|---|---|
| `/api/v1/documents/upload` | `POST` | Deterministic document parsing & fact extraction | `handleFileUpload` in `EvidenceHub` |
| `/api/v1/documents` | `GET` | Lists user's stored documents with fact & chunk counts | `fetchBackendData` in `dashboard/page.tsx` |
| `/api/v1/documents/{id}` | `GET` | Retrieves full document metadata and extracted facts list | `getDocument` in `api.ts` -> Document Drawer |
| `/api/v1/documents/{id}` | `DELETE` | Deletes document and storage directory | `deleteDocument` in `api.ts` -> `DeleteConfirmationModal` |
| `/api/v1/ingestion/candidates` | `GET` | Lists candidate financial entities (filter by status) | `getCandidates` in `api.ts` -> Review Queue |
| `/api/v1/ingestion/candidates/{id}/approve` | `POST` | Merges candidate into canonical ledger | `approveCandidate` in `api.ts` -> Action button |
| `/api/v1/ingestion/candidates/{id}/edit` | `POST` | Updates candidate values and commits to ledger | `editCandidate` in `api.ts` -> Edit Modal |
| `/api/v1/ingestion/candidates/{id}/reject` | `POST` | Marks candidate rejected without touching canonical ledger | `rejectCandidate` in `api.ts` -> Reject button |
| `/api/v1/ingestion/conflicts` | `GET` | Detects multi-source reconciliation discrepancies | `getConflicts` in `api.ts` -> Conflicts tab |
| `/api/v1/ingestion/conflicts/{id}/resolve` | `POST` | Reconciles conflict (`ACCEPT_SUGGESTED`, `KEEP_CANONICAL`, `CUSTOM`) | `resolveConflict` in `api.ts` -> Conflict Resolver |

---

## B. Information Architecture

```text
EVIDENCE
│
├── 1. DOCUMENTS (Vault)
│   ├── Ingestion & Parser Dropzone (Bank statements, Salary slips, Loans, CAS, Insurance)
│   ├── Search by Filename & Filter by Document Type
│   ├── Live Status: PROCESSED | PROCESSING | FAILED
│   ├── Inspect Drawer (Metadata, Text Chunks, Extracted Facts list with page numbers & confidence)
│   └── Safe Deletion with Confirmation Modal
│
├── 2. REVIEW QUEUE (Human-in-the-Loop Boundary)
│   ├── Status Filter Pills: Pending Review | Approved | Edited | Rejected | All
│   ├── Provenance Card: Candidate type, extraction confidence, suggested data grid, source file, page number, raw snippet
│   ├── Approve Flow: Commits to canonical ledger and refreshes balance sheet
│   ├── Edit Flow: In-place field modification modal before committing
│   └── Reject Flow: Excludes candidate while keeping canonical state untouched
│
└── 3. CONFLICTS (Reconciliation Engine)
    ├── Discrepancy explanation
    ├── Side-by-side comparison: Canonical Source vs Suggested Evidence
    ├── Custom reconciled value input
    └── Resolution actions: Keep Canonical | Accept Suggested | Set Custom
```

---

## C. Provenance & Explainability Chain

Every candidate entity carries deterministic provenance extracted directly from the parsed document:
```text
Canonical Financial Record
        ↑ (Human Approval / Conflict Resolution)
Candidate Entity
        ↑ (Extraction Engine)
Page-Level Extracted Fact (source_page, confidence, fact_key, fact_value)
        ↑ (Chunking & Parsing)
Source Document (filename, file_size, upload date)
```

No LLM-fabricated provenance or synthetic confidence scores are used. All values map 1-to-1 to backend database rows.

---

## D. Files Created / Modified

- **Modified**: [`frontend/src/lib/api.ts`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/lib/api.ts) — Added `getDocument`, `deleteDocument`, and `DocumentDetailResponse` types.
- **Modified**: [`frontend/src/components/evidence/EvidenceHub.tsx`](file:///c:/shruti_materials/Projects/ArthAI/frontend/src/components/evidence/EvidenceHub.tsx) — Full Evidence Center implementation with Document Details drawer, Review Queue status filters, candidate edit modal, safe delete modal, and reconciliation resolver.
- **Created**: [`stage5e6_evidence_center_report.md`](file:///c:/shruti_materials/Projects/ArthAI/stage5e6_evidence_center_report.md) — Comprehensive architecture and verification report.

---

## E. Verification & Test Results

1. **Frontend Production Build**:
   ```bash
   npm run build
   ```
   **Result**: `Compiled successfully in 7.7s`. All 13 routes generated with 0 type errors.

2. **Backend Ingestion & Reconciliation Test Suite**:
   ```bash
   python -m pytest tests/test_stage5d_ingestion.py tests/test_stage5d2_reconciliation.py -q
   ```
   **Result**: `22 passed in 306.22s (100% pass rate)`.
   - `test_deterministic_parsing_and_candidate_creation` — Passed
   - `test_candidate_approval_merges_to_canonical_balance_sheet` — Passed
   - `test_candidate_edit_and_approve` — Passed
   - `test_candidate_rejection_leaves_canonical_untouched` — Passed
   - `test_multi_source_conflict_detection` — Passed
   - `test_conflict_resolution_decisions` — Passed
