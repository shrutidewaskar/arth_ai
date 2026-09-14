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

