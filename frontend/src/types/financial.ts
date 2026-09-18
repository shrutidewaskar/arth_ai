import { AttentionItem, FinancialPulseResponse } from "@/lib/api";

export interface UserProfile {
  id?: string;
  email?: string;
  full_name?: string;
  name?: string;
  age?: number;
  city?: string;
  occupation?: string;
  marital_status?: string;
  dependents?: number;
  risk_appetite?: string;
  monthly_income?: number;
  monthly_expenses?: number;
  monthly_savings?: number;
  emergency_fund?: number;
}

export interface IncomeSource {
  id?: string;
  source_name: string;
  type: string;
  amount: number;
  frequency: string;
}

export interface ExpenseCategory {
  id?: string;
  category: string;
  amount: number;
  essential?: boolean;
}

export interface Asset {
  id?: string;
  asset_name: string;
  asset_type: string;
  current_value: number;
}

export interface Liability {
  id?: string;
  loan_name: string;
  loan_type: string;
  principal: number;
  outstanding: number;
  interest_rate: number;
  emi: number;
}

export interface Goal {
  id?: string;
  goal_name: string;
  category: string;
  target_amount: number;
  saved_amount: number;
  monthly_contribution: number;
  target_date?: string;
  priority: string;
  status?: string;
  progress_percentage?: number;
}

export interface Investment {
  id?: string;
  investment_type: string;
  platform: string;
  invested_amount: number;
  current_value: number;
  expected_return?: number;
}

export interface InsurancePolicy {
  id?: string;
  policy_name: string;
  provider: string;
  coverage: number;
  premium: number;
  renewal_date?: string;
}

export interface Subscription {
  id?: string;
  service: string;
  amount: number;
  renewal_date?: string;
}

export interface DashboardSummary {
  profile: {
    name: string;
    age: number;
    city: string;
    occupation: string;
    risk_appetite: string;
  };
  financial_health: {
    score: number;
    savings_rate_pct: number;
    dti_ratio_pct: number;
    emergency_runway_months: number;
  };
  net_worth: {
    total_assets: number;
    total_liabilities: number;
    net_worth: number;
    asset_breakdown: { type: string; label: string; value: number }[];
    liability_breakdown: {
      loan_name: string;
      loan_type: string;
      outstanding: number;
      interest_rate: number;
      emi: number;
    }[];
  };
  cash_flow: {
    monthly_income: number;
    monthly_expenses: number;
    monthly_emi: number;
    monthly_investments: number;
    monthly_surplus: number;
  };
  debt: {
    total_outstanding: number;
    monthly_emi: number;
    dti_ratio_pct: number;
  };
  goals: Goal[];
  investments: {
    total_invested: number;
    current_value: number;
  };
  insurance: {
    count: number;
  };
  documents: {
    count: number;
  };
}

export interface CfoKeyFact {
  label: string;
  value: number | string;
  unit?: string;
}

export interface CfoAssessment {
  label: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface CfoStructuredResponse {
  answer: string;
  summary?: string;
  status?: string;
  missing_data?: string[];
  key_facts?: CfoKeyFact[];
  assessment?: CfoAssessment;
  recommendation?: string;
  reasons?: string[];
  tradeoffs?: string[];
  assumptions?: string[];
  evidence_used?: string[];
  active_provider?: string;
  active_model?: string;
  response_source?: string;
}

export interface CfoMessage {
  id?: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  structured?: CfoStructuredResponse;
  deepLink?: {
    label: string;
    hub: "home" | "money" | "plan" | "evidence" | "profile";
    subTab?: string;
  };
}

export interface VaultDocument {
  id: string;
  file_name: string;
  document_type: string;
  status: string;
  file_size?: number;
  uploaded_at?: string;
  facts_count?: number;
  chunks_created?: number;
  extracted_facts?: any[];
}

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

export interface ReconciliationConflict {
  candidate_id: string;
  candidate_type: string;
  field_name: string;
  canonical_entity_id?: string;
  canonical_value: any;
  canonical_source: string;
  suggested_value: any;
  suggested_source: string;
  corroborating_sources: string[];
  explanation: string;
  recommended_action: string;
}

export type PrimaryHub = "home" | "money" | "plan" | "evidence" | "cfo" | "profile";

