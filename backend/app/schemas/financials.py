from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any, Dict
from datetime import datetime
from uuid import UUID
from decimal import Decimal

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Financial Profile Schemas ---
class FinancialProfileBase(BaseModel):
    occupation: Optional[str] = None
    city: Optional[str] = None
    age: Optional[int] = None
    marital_status: Optional[str] = None
    dependents: int = 0
    risk_appetite: str = "Moderate"
    currency: str = "INR"
    monthly_income: Decimal = Decimal("0.00")
    monthly_expenses: Decimal = Decimal("0.00")
    monthly_savings: Decimal = Decimal("0.00")
    emergency_fund: Decimal = Decimal("0.00")
    credit_score: Optional[int] = None

class FinancialProfileCreate(FinancialProfileBase):
    pass

class FinancialProfileUpdate(BaseModel):
    occupation: Optional[str] = None
    city: Optional[str] = None
    age: Optional[int] = None
    marital_status: Optional[str] = None
    dependents: Optional[int] = None
    risk_appetite: Optional[str] = None
    currency: Optional[str] = None
    monthly_income: Optional[Decimal] = None
    monthly_expenses: Optional[Decimal] = None
    monthly_savings: Optional[Decimal] = None
    emergency_fund: Optional[Decimal] = None
    credit_score: Optional[int] = None

class FinancialProfileResponse(FinancialProfileBase):
    id: UUID
    user_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Income Source Schemas ---
class IncomeSourceBase(BaseModel):
    source_name: str
    type: str = "Salary"
    amount: Decimal
    frequency: str = "Monthly"
    active: bool = True

    @field_validator("source_name")
    @classmethod
    def validate_source_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Income source name cannot be empty")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("Income amount cannot be negative")
        return v

class IncomeSourceCreate(IncomeSourceBase):
    pass

class IncomeSourceResponse(IncomeSourceBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True

# --- Expense Category Schemas ---
class ExpenseCategoryBase(BaseModel):
    category: str
    amount: Decimal
    essential: bool = True
    notes: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Expense category cannot be empty")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("Expense amount cannot be negative")
        return v

class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass

class ExpenseCategoryResponse(ExpenseCategoryBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True

# --- Asset Schemas ---
class AssetBase(BaseModel):
    asset_name: str
    asset_type: str
    current_value: Decimal
    purchase_date: Optional[datetime] = None

    @field_validator("asset_name")
    @classmethod
    def validate_asset_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Asset name cannot be empty")
        return v.strip()

    @field_validator("current_value")
    @classmethod
    def validate_current_value(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("Asset value cannot be negative")
        return v

class AssetCreate(AssetBase):
    pass

class AssetResponse(AssetBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True

# --- Liability Schemas ---
class LiabilityBase(BaseModel):
    loan_name: str
    loan_type: str
    principal: Decimal
    outstanding: Decimal
    interest_rate: Decimal
    emi: Decimal
    closing_date: Optional[datetime] = None

    @field_validator("loan_name")
    @classmethod
    def validate_loan_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Loan name cannot be empty")
        return v.strip()

    @field_validator("principal", "outstanding", "interest_rate", "emi")
    @classmethod
    def validate_non_negative(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("Liability values cannot be negative")
        return v

class LiabilityCreate(LiabilityBase):
    pass

class LiabilityResponse(LiabilityBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True

# --- Goal Schemas ---
class GoalBase(BaseModel):
    goal_name: str
    category: Optional[str] = None
    target_amount: Decimal
    saved_amount: Decimal = Decimal("0.00")
    monthly_contribution: Decimal = Decimal("0.00")
    target_date: Optional[datetime] = None
    priority: str = "Medium"
    status: str = "Active"

    @field_validator("goal_name")
    @classmethod
    def validate_goal_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Goal name cannot be empty")
        return v.strip()

    @field_validator("target_amount", "saved_amount", "monthly_contribution")
    @classmethod
    def validate_goal_amounts(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("Goal amount cannot be negative")
        return v

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    goal_name: Optional[str] = None
    category: Optional[str] = None
    target_amount: Optional[Decimal] = None
    saved_amount: Optional[Decimal] = None
    monthly_contribution: Optional[Decimal] = None
    target_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class GoalResponse(GoalBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True

# --- Investment Schemas ---
class InvestmentBase(BaseModel):
    investment_type: str
    platform: Optional[str] = None
    invested_amount: Decimal
    current_value: Decimal
    expected_return: Optional[Decimal] = None
    risk_level: str = "Moderate"

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentResponse(InvestmentBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True

# --- Insurance Schemas ---
class InsuranceBase(BaseModel):
    policy_name: str
    provider: str
    coverage: Decimal
    premium: Decimal
    renewal_date: Optional[datetime] = None
    beneficiary: Optional[str] = None
    status: str = "Active"

class InsuranceCreate(InsuranceBase):
    pass

class InsuranceResponse(InsuranceBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True

# --- Subscription Schemas ---
class SubscriptionBase(BaseModel):
    service: str
    amount: Decimal
    billing_cycle: str = "Monthly"
    renewal_date: Optional[datetime] = None
    active: bool = True

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionResponse(SubscriptionBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True

# --- Update schemas for subcomponents ---
class IncomeSourceUpdate(BaseModel):
    source_name: Optional[str] = None
    type: Optional[str] = None
    amount: Optional[Decimal] = None
    frequency: Optional[str] = None
    active: Optional[bool] = None

class ExpenseCategoryUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[Decimal] = None
    essential: Optional[bool] = None
    notes: Optional[str] = None

class AssetUpdate(BaseModel):
    asset_name: Optional[str] = None
    asset_type: Optional[str] = None
    current_value: Optional[Decimal] = None

class LiabilityUpdate(BaseModel):
    loan_name: Optional[str] = None
    loan_type: Optional[str] = None
    principal: Optional[Decimal] = None
    outstanding: Optional[Decimal] = None
    interest_rate: Optional[Decimal] = None
    emi: Optional[Decimal] = None

# --- Document Schemas ---
class DocumentBase(BaseModel):
    document_type: str
    storage_path: str
    ocr_text: Optional[str] = None
    expiry_date: Optional[datetime] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: UUID
    user_id: UUID
    uploaded_at: datetime

    class Config:
        from_attributes = True

# --- AI Memory Schemas ---
class AIMemoryBase(BaseModel):
    memory_type: str = "Fact"
    summary: str
    importance_score: int = 5

class AIMemoryCreate(AIMemoryBase):
    pass

class AIMemoryResponse(AIMemoryBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Conversation & Message Schemas ---
class MessageBase(BaseModel):
    role: str
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: UUID
    conversation_id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    title: str = "New Chat"

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

# --- AI Insight Schemas ---
class AIInsightBase(BaseModel):
    category: str
    title: str
    description: str
    priority: str = "Medium"
    read: bool = False

class AIInsightResponse(AIInsightBase):
    id: UUID
    user_id: UUID
    generated_at: datetime

    class Config:
        from_attributes = True

# --- Decision Simulation Schemas ---
class DecisionSimulationBase(BaseModel):
    scenario: str
    inputs: Optional[str] = None
    recommendation: Optional[str] = None
    financial_impact: Optional[str] = None
    goal_impact: Optional[str] = None
    risk_score: int = 50

class DecisionSimulationCreate(DecisionSimulationBase):
    pass

class DecisionSimulationResponse(DecisionSimulationBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- AI CFO Reasoning Schemas ---
class CFOKeyFact(BaseModel):
    label: str
    value: Any
    unit: Optional[str] = None

class CFOAssessment(BaseModel):
    label: str
    severity: str

class CFOResponseSchema(BaseModel):
    answer: str
    summary: str
    key_facts: List[CFOKeyFact] = Field(default_factory=list)
    assessment: CFOAssessment
    recommendation: str
    reasons: List[str] = Field(default_factory=list)
    tradeoffs: List[str] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    evidence_used: List[str] = Field(default_factory=list)

# --- Attention & Financial Pulse Schemas ---
class AttentionItem(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    description: str
    what: Optional[str] = None
    why: Optional[str] = None
    impact: Optional[str] = None
    next_step: Optional[str] = None
    metric_evidence: Dict[str, Any] = Field(default_factory=dict)
    action_label: str
    action_type: str
    target_route: str
    dedup_key: Optional[str] = None

class AttentionResponse(BaseModel):
    items: List[AttentionItem] = Field(default_factory=list)
    count: int = 0
    highest_priority: Optional[str] = None

class FinancialPulseData(BaseModel):
    health_score: int
    health_label: str
    net_worth: float
    monthly_income: float
    monthly_expenses: float
    monthly_surplus: float
    savings_rate_pct: float
    dti_ratio_pct: float
    emergency_runway_months: float
    emergency_fund_status: str = "Unknown / Not designated"
    goal_status: Dict[str, Any] = Field(default_factory=dict)
    is_complete: bool

class FinancialPulseResponse(BaseModel):
    pulse: FinancialPulseData
    attention_items: List[AttentionItem] = Field(default_factory=list)
    completeness: Dict[str, Any] = Field(default_factory=dict)


