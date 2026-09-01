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

export async function apiDelete(endpoint: string, options: ApiOptions = {}) {
  return apiFetch(endpoint, { ...options, method: "DELETE" });
}
