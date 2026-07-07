import uuid
from sqlalchemy import Column, String, Numeric, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    profile = relationship("FinancialProfile", back_populates="user", uselist=False)
    income_sources = relationship("IncomeSource", back_populates="user")
    expense_categories = relationship("ExpenseCategory", back_populates="user")
    assets = relationship("Asset", back_populates="user")
    liabilities = relationship("Liability", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    investments = relationship("Investment", back_populates="user")
    insurance = relationship("Insurance", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")
    documents = relationship("Document", back_populates="user")
    ai_memories = relationship("AIMemory", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")
    insights = relationship("AIInsight", back_populates="user")
    simulations = relationship("DecisionSimulation", back_populates="user")

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    occupation = Column(String(255), nullable=True)
    city = Column(String(255), nullable=True)
    age = Column(Integer, nullable=True)
    marital_status = Column(String(100), nullable=True)
    dependents = Column(Integer, default=0)
    risk_appetite = Column(String(100), default="Moderate")
    currency = Column(String(10), default="INR")
    monthly_income = Column(Numeric(15, 2), default=0.00)
    monthly_expenses = Column(Numeric(15, 2), default=0.00)
    monthly_savings = Column(Numeric(15, 2), default=0.00)
    emergency_fund = Column(Numeric(15, 2), default=0.00)
    credit_score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    user = relationship("User", back_populates="profile")

class IncomeSource(Base):
    __tablename__ = "income_sources"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source_name = Column(String(255), nullable=False)
    type = Column(String(100), default="Salary") # Salary, Business, Rental, Dividends
    amount = Column(Numeric(15, 2), nullable=False)
    frequency = Column(String(100), default="Monthly")
    active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="income_sources")

class ExpenseCategory(Base):
    __tablename__ = "expense_categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(255), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    essential = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="expense_categories")

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(String(100), nullable=False) # RealEstate, Gold, MutualFunds, FD
    current_value = Column(Numeric(15, 2), nullable=False)
    purchase_date = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="assets")

class Liability(Base):
    __tablename__ = "liabilities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    loan_name = Column(String(255), nullable=False)
    loan_type = Column(String(100), nullable=False) # HomeLoan, PersonalLoan, GoldLoan
    principal = Column(Numeric(15, 2), nullable=False)
    outstanding = Column(Numeric(15, 2), nullable=False)
    interest_rate = Column(Numeric(5, 2), nullable=False)
    emi = Column(Numeric(15, 2), nullable=False)
    closing_date = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="liabilities")

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True) # Education, Retirement, Vacation, Vehicle
    target_amount = Column(Numeric(15, 2), nullable=False)
    saved_amount = Column(Numeric(15, 2), default=0.00)
    monthly_contribution = Column(Numeric(15, 2), default=0.00)
    target_date = Column(DateTime(timezone=True), nullable=True)
    priority = Column(String(100), default="Medium")
    status = Column(String(100), default="Active")
    
    user = relationship("User", back_populates="goals")

class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    investment_type = Column(String(100), nullable=False) # MutualFunds, PPF, EPF, Gold
    platform = Column(String(255), nullable=True)
    invested_amount = Column(Numeric(15, 2), nullable=False)
    current_value = Column(Numeric(15, 2), nullable=False)
    expected_return = Column(Numeric(5, 2), nullable=True)
    risk_level = Column(String(100), default="Moderate")
    
    user = relationship("User", back_populates="investments")

class Insurance(Base):
    __tablename__ = "insurance"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    policy_name = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=False)
    coverage = Column(Numeric(15, 2), nullable=False)
    premium = Column(Numeric(15, 2), nullable=False)
    renewal_date = Column(DateTime(timezone=True), nullable=True)
    beneficiary = Column(String(255), nullable=True)
    status = Column(String(100), default="Active")
    
    user = relationship("User", back_populates="insurance")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    service = Column(String(255), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    billing_cycle = Column(String(100), default="Monthly")
    renewal_date = Column(DateTime(timezone=True), nullable=True)
    active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="subscriptions")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(100), nullable=False) # SalarySlip, InsurancePDF, TaxReturn
    storage_path = Column(String(512), nullable=False)
    ocr_text = Column(Text, nullable=True)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="documents")

class AIMemory(Base):
    __tablename__ = "ai_memories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    memory_type = Column(String(100), default="Fact") # Fact, Plan, Preference
    summary = Column(Text, nullable=False)
    importance_score = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="ai_memories")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="New Chat")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(100), nullable=False) # user or assistant
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    conversation = relationship("Conversation", back_populates="messages")

class AIInsight(Base):
    __tablename__ = "ai_insights"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False) # Tax, Debt, Savings
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="Medium")
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    read = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="insights")

class DecisionSimulation(Base):
    __tablename__ = "decision_simulations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scenario = Column(String(255), nullable=False) # BuyCar, PrepayLoan, TaxSwitch
    inputs = Column(Text, nullable=True) # JSON representation
    recommendation = Column(Text, nullable=True)
    financial_impact = Column(Text, nullable=True)
    goal_impact = Column(Text, nullable=True)
    risk_score = Column(Integer, default=50)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="simulations")
