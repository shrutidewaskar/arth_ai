import { createClient } from "./supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ApiOptions extends RequestInit {
  useAuth?: boolean;
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const { useAuth = true, headers: customHeaders, ...restOptions } = options;
  const headers = new Headers(customHeaders);

  if (useAuth) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Determine if it is a FormData body; if so, let browser set the correct boundary (don't force application/json)
  const isFormData = restOptions.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type") && restOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...restOptions,
    headers,
  });

  return response;
}

export async function apiGet(endpoint: string, options: ApiOptions = {}) {
  return apiFetch(endpoint, { ...options, method: "GET" });
}

export async function apiPost(endpoint: string, body: any, options: ApiOptions = {}) {
  const isFormData = body instanceof FormData;
  return apiFetch(endpoint, {
    ...options,
    method: "POST",
    body: isFormData ? body : JSON.stringify(body),
  });
}

export async function apiPut(endpoint: string, body: any, options: ApiOptions = {}) {
  const isFormData = body instanceof FormData;
  return apiFetch(endpoint, {
    ...options,
    method: "PUT",
    body: isFormData ? body : JSON.stringify(body),
  });
}

export async function apiDelete(endpoint: string, options: ApiOptions = {}) {
  return apiFetch(endpoint, { ...options, method: "DELETE" });
}

export interface AttentionItem {
  id: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low" | "positive";
  title: string;
  description: string;
  what?: string;
  why?: string;
  impact?: string;
  next_step?: string;
  metric_evidence: Record<string, any>;
  action_label: string;
  action_type: string;
  target_route: string;
  dedup_key?: string;
}

export interface AttentionResponse {
  items: AttentionItem[];
  count: number;
  highest_priority: string | null;
}

export interface FinancialPulseData {
  health_score: number;
  health_label: string;
  net_worth: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_surplus: number;
  savings_rate_pct: number;
  dti_ratio_pct: number;
  emergency_runway_months: number;
  emergency_fund_status: string;
  goal_status: Record<string, any>;
  is_complete: boolean;
}


export interface FinancialPulseResponse {
  pulse: FinancialPulseData;
  attention_items: AttentionItem[];
  completeness: {
    is_complete: boolean;
    has_profile: boolean;
    has_income: boolean;
    has_expenses: boolean;
    has_position: boolean;
    has_goals: boolean;
  };
}

export async function getAttention(): Promise<AttentionResponse> {
  const res = await apiGet("/api/v1/attention");
  if (!res.ok) {
    throw new Error(`Failed to fetch attention items (${res.status})`);
  }
  return res.json();
}

export async function getFinancialPulse(): Promise<FinancialPulseResponse> {
  const res = await apiGet("/api/v1/financial-pulse");
  if (!res.ok) {
    throw new Error(`Failed to fetch financial pulse (${res.status})`);
  }
  return res.json();
}

// --- Stage 5D Candidate Entity (Human-in-the-Loop) Interfaces & Helpers ---
export interface CandidateEntity {
  id: string;
  user_id: string;
  document_id?: string;
  candidate_type: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "EDITED";
  confidence: number;
  suggested_data: Record<string, any>;
  provenance: {
    file_name?: string;
    source_page?: number;
    raw_description?: string;
    transaction_date?: string;
    [key: string]: any;
  };
  canonical_entity_id?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface CandidateListResponse {
  candidates: CandidateEntity[];
  total_count: number;
  pending_count: number;
}

export async function getCandidates(statusFilter?: string): Promise<CandidateListResponse> {
  const query = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : "";
  const res = await apiGet(`/api/v1/ingestion/candidates${query}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch candidates (${res.status})`);
  }
  return res.json();
}

export async function approveCandidate(candidateId: string, overrideFields?: Record<string, any>): Promise<CandidateEntity> {
  const res = await apiPost(`/api/v1/ingestion/candidates/${candidateId}/approve`, overrideFields ? { override_fields: overrideFields } : {});
  if (!res.ok) {
    throw new Error(`Failed to approve candidate (${res.status})`);
  }
  return res.json();
}

export async function editCandidate(candidateId: string, editedData: Record<string, any>): Promise<CandidateEntity> {
  const res = await apiPost(`/api/v1/ingestion/candidates/${candidateId}/edit`, { edited_data: editedData });
  if (!res.ok) {
    throw new Error(`Failed to edit candidate (${res.status})`);
  }
  return res.json();
}

export async function rejectCandidate(candidateId: string): Promise<CandidateEntity> {
  const res = await apiPost(`/api/v1/ingestion/candidates/${candidateId}/reject`, {});
  if (!res.ok) {
    throw new Error(`Failed to reject candidate (${res.status})`);
  }
  return res.json();
}

export interface DocumentDetailResponse {
  id: string;
  file_name: string;
  document_type: string;
  status: string;
  facts_extracted: number;
  chunks_created: number;
  uploaded_at: string;
  processed_at?: string;
  error_message?: string;
  extracted_facts: Array<{
    fact_type: string;
    fact_key: string;
    fact_value: any;
    confidence: number;
    source_page?: number;
  }>;
}

export async function getDocument(documentId: string): Promise<DocumentDetailResponse> {
  const res = await apiGet(`/api/v1/documents/${documentId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch document details (${res.status})`);
  }
  return res.json();
}

export async function deleteDocument(documentId: string): Promise<{ status: string }> {
  const res = await apiDelete(`/api/v1/documents/${documentId}`);
  if (!res.ok) {
    throw new Error(`Failed to delete document (${res.status})`);
  }
  return res.json();
}

export interface ConflictListResponse {
  conflicts: any[];
  total_conflicts: number;
}

export async function getConflicts(): Promise<ConflictListResponse> {
  const res = await apiGet("/api/v1/ingestion/conflicts");
  if (!res.ok) {
    throw new Error(`Failed to fetch reconciliation conflicts (${res.status})`);
  }
  return res.json();
}

export async function resolveConflict(
  candidateId: string,
  decision: "ACCEPT_SUGGESTED" | "KEEP_CANONICAL" | "CUSTOM",
  customValue?: any
): Promise<CandidateEntity> {
  const res = await apiPost(`/api/v1/ingestion/conflicts/${candidateId}/resolve`, {
    decision,
    custom_value: customValue,
  });
  if (!res.ok) {
    throw new Error(`Failed to resolve reconciliation conflict (${res.status})`);
  }
  return res.json();
}

// --- Canonical Financial State CRUD API Functions ---

// 1. Incomes
export async function getIncomes(): Promise<any[]> {
  const res = await apiGet("/api/v1/incomes");
  if (!res.ok) throw new Error(`Failed to fetch incomes (${res.status})`);
  return res.json();
}

export async function createIncome(income: { source_name: string; type?: string; amount: number; frequency?: string }): Promise<any> {
  const res = await apiPost("/api/v1/incomes", income);
  if (!res.ok) throw new Error(`Failed to save income (${res.status})`);
  return res.json();
}

export async function deleteIncome(id: string): Promise<void> {
  const res = await apiDelete(`/api/v1/incomes/${id}`);
  if (!res.ok) throw new Error(`Failed to delete income (${res.status})`);
}

// 2. Expenses
export async function getExpenses(): Promise<any[]> {
  const res = await apiGet("/api/v1/expenses");
  if (!res.ok) throw new Error(`Failed to fetch expenses (${res.status})`);
  return res.json();
}

export async function createExpense(expense: { category: string; amount: number; essential?: boolean; notes?: string }): Promise<any> {
  const res = await apiPost("/api/v1/expenses", expense);
  if (!res.ok) throw new Error(`Failed to save expense (${res.status})`);
  return res.json();
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await apiDelete(`/api/v1/expenses/${id}`);
  if (!res.ok) throw new Error(`Failed to delete expense (${res.status})`);
}

// 3. Assets
export async function getAssets(): Promise<any[]> {
  const res = await apiGet("/api/v1/assets");
  if (!res.ok) throw new Error(`Failed to fetch assets (${res.status})`);
  return res.json();
}

export async function createAsset(asset: { asset_name: string; asset_type: string; current_value: number; purchase_date?: string }): Promise<any> {
  const res = await apiPost("/api/v1/assets", asset);
  if (!res.ok) throw new Error(`Failed to save asset (${res.status})`);
  return res.json();
}

export async function deleteAsset(id: string): Promise<void> {
  const res = await apiDelete(`/api/v1/assets/${id}`);
  if (!res.ok) throw new Error(`Failed to delete asset (${res.status})`);
}

// 4. Liabilities
export async function getLiabilities(): Promise<any[]> {
  const res = await apiGet("/api/v1/liabilities");
  if (!res.ok) throw new Error(`Failed to fetch liabilities (${res.status})`);
  return res.json();
}

export async function createLiability(liability: { loan_name: string; loan_type: string; principal: number; outstanding: number; interest_rate: number; emi: number }): Promise<any> {
  const res = await apiPost("/api/v1/liabilities", liability);
  if (!res.ok) throw new Error(`Failed to save liability (${res.status})`);
  return res.json();
}

export async function deleteLiability(id: string): Promise<void> {
  const res = await apiDelete(`/api/v1/liabilities/${id}`);
  if (!res.ok) throw new Error(`Failed to delete liability (${res.status})`);
}

// 5. Investments
export async function getInvestments(): Promise<any[]> {
  const res = await apiGet("/api/v1/investments");
  if (!res.ok) throw new Error(`Failed to fetch investments (${res.status})`);
  return res.json();
}

export async function createInvestment(investment: { investment_type: string; platform?: string; invested_amount: number; current_value: number; expected_return?: number; risk_level?: string }): Promise<any> {
  const res = await apiPost("/api/v1/investments", investment);
  if (!res.ok) throw new Error(`Failed to save investment (${res.status})`);
  return res.json();
}

// 6. Insurance
export async function getInsurancePolicies(): Promise<any[]> {
  const res = await apiGet("/api/v1/insurance");
  if (!res.ok) throw new Error(`Failed to fetch insurance policies (${res.status})`);
  return res.json();
}

export async function createInsurancePolicy(policy: { policy_name: string; provider: string; coverage: number; premium: number; renewal_date?: string; beneficiary?: string; status?: string }): Promise<any> {
  const res = await apiPost("/api/v1/insurance", policy);
  if (!res.ok) throw new Error(`Failed to save insurance policy (${res.status})`);
  return res.json();
}

// 7. Subscriptions
export async function getSubscriptions(): Promise<any[]> {
  const res = await apiGet("/api/v1/subscriptions");
  if (!res.ok) throw new Error(`Failed to fetch subscriptions (${res.status})`);
  return res.json();
}

export async function createSubscription(subscription: { service: string; amount: number; billing_cycle?: string; renewal_date?: string; active?: boolean }): Promise<any> {
  const res = await apiPost("/api/v1/subscriptions", subscription);
  if (!res.ok) throw new Error(`Failed to save subscription (${res.status})`);
  return res.json();
}

export async function deleteSubscription(id: string): Promise<void> {
  const res = await apiDelete(`/api/v1/subscriptions/${id}`);
  if (!res.ok) throw new Error(`Failed to delete subscription (${res.status})`);
}

// 8. Goals CRUD & Feasibility
export async function getGoals(): Promise<any[]> {
  const res = await apiGet("/api/v1/goals");
  if (!res.ok) throw new Error(`Failed to fetch goals (${res.status})`);
  return res.json();
}

export async function createGoal(goal: {
  goal_name: string;
  category?: string;
  target_amount: number;
  saved_amount?: number;
  monthly_contribution?: number;
  target_date?: string;
  priority?: string;
  status?: string;
}): Promise<any> {
  const res = await apiPost("/api/v1/goals", goal);
  if (!res.ok) throw new Error(`Failed to save goal (${res.status})`);
  return res.json();
}

export async function updateGoal(
  id: string,
  goal: {
    goal_name?: string;
    category?: string;
    target_amount?: number;
    saved_amount?: number;
    monthly_contribution?: number;
    target_date?: string;
    priority?: string;
    status?: string;
  }
): Promise<any> {
  const res = await apiPut(`/api/v1/goals/${id}`, goal);
  if (!res.ok) throw new Error(`Failed to update goal (${res.status})`);
  return res.json();
}

export async function deleteGoal(id: string): Promise<void> {
  const res = await apiDelete(`/api/v1/goals/${id}`);
  if (!res.ok) throw new Error(`Failed to delete goal (${res.status})`);
}

export async function getGoalsFeasibility(): Promise<any> {
  const res = await apiGet("/api/v1/goals/feasibility");
  if (!res.ok) throw new Error(`Failed to fetch goal feasibility (${res.status})`);
  return res.json();
}

export async function getActionPlans(): Promise<any> {
  const res = await apiPost("/api/v1/action-plans", {});
  if (!res.ok) throw new Error(`Failed to fetch action plans (${res.status})`);
  return res.json();
}

// 9. AI CFO Query
export async function queryCfo(query: string): Promise<any> {
  const res = await apiPost("/api/v1/cfo/query", { query });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `AI CFO request failed (${res.status})`);
  }
  return res.json();
}

// 10. Financial Profile
export async function getProfile(): Promise<any> {
  const res = await apiGet("/api/v1/profile");
  if (!res.ok) throw new Error(`Failed to fetch profile (${res.status})`);
  return res.json();
}

export async function updateProfile(profileUpdate: {
  occupation?: string;
  city?: string;
  age?: number;
  marital_status?: string;
  dependents?: number;
  risk_appetite?: string;
  currency?: string;
  monthly_income?: number;
  monthly_expenses?: number;
  monthly_savings?: number;
  emergency_fund?: number;
  credit_score?: number;
}): Promise<any> {
  const res = await apiPut("/api/v1/profile", profileUpdate);
  if (!res.ok) throw new Error(`Failed to update profile (${res.status})`);
  return res.json();
}







