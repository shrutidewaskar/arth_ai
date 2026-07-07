from pydantic import BaseModel, Field
from typing import Optional, List
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
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Income Source Schemas ---
class IncomeSourceBase(BaseModel):
    source_name: str
    type: str = "Salary"
    amount: Decimal
    frequency: str = "Monthly"
    active: bool = True

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
