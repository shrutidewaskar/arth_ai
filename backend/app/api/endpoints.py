from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from decimal import Decimal
import datetime

from app.database import get_db
from app.auth.middleware import get_current_user
from app.models.financials import (
    User, FinancialProfile, IncomeSource, ExpenseCategory,
    Asset, Liability, Goal, Investment, Insurance,
    Subscription, Document, AIMemory, AIInsight, DecisionSimulation
)
from app.schemas.financials import (
    FinancialProfileResponse, FinancialProfileUpdate,
    GoalResponse, GoalCreate, GoalUpdate,
    InvestmentResponse, InvestmentCreate,
    InsuranceResponse, InsuranceCreate,
    AIInsightResponse, DecisionSimulationResponse, DecisionSimulationCreate
)
from app.engine.reasoning import ReasoningOrchestrator

router = APIRouter()
orchestrator = ReasoningOrchestrator()

# --- Authentication Routes ---
@router.post("/auth/login")
async def login():
    return {"status": "authenticated", "session_token": "mock-supabase-session-token"}

@router.post("/auth/logout")
async def logout():
    return {"status": "logged_out"}

@router.get("/auth/me", response_model=Dict[str, Any])
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name
    }

# --- Profile Routes ---
@router.get("/profile", response_model=FinancialProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FinancialProfile).filter(FinancialProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        # Auto-initialize profile
        profile = FinancialProfile(
            user_id=current_user.id,
            occupation="Professional",
            city="Mumbai",
            age=34,
            monthly_income=Decimal("204000.00"),
            monthly_expenses=Decimal("142000.00"),
            monthly_savings=Decimal("62000.00"),
            emergency_fund=Decimal("800000.00"),
            credit_score=780
        )
        db.add(profile)
        await db.flush()
    return profile

@router.put("/profile", response_model=FinancialProfileResponse)
async def update_profile(
    profile_update: FinancialProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FinancialProfile).filter(FinancialProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    update_data = profile_update.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(profile, key, val)
        
    await db.flush()
    return profile

# --- Cash Flow Routes ---
@router.get("/cashflow")
async def get_cashflow(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FinancialProfile).filter(FinancialProfile.user_id == current_user.id))
    profile = result.scalars().first()
    
    inc_result = await db.execute(select(IncomeSource).filter(IncomeSource.user_id == current_user.id))
    sources = inc_result.scalars().all()
    
    exp_result = await db.execute(select(ExpenseCategory).filter(ExpenseCategory.user_id == current_user.id))
    categories = exp_result.scalars().all()
    
    return {
        "income": float(profile.monthly_income) if profile else 204000.00,
        "expenses": float(profile.monthly_expenses) if profile else 142000.00,
        "savings": float(profile.monthly_savings) if profile else 62000.00,
        "sources": sources,
        "categories": categories
    }

@router.get("/cashflow/projection")
async def get_cashflow_projection(current_user: User = Depends(get_current_user)):
    # Simulates 12 months projections
    base_savings = 62000.0
    return {
        "projection_horizon_months": 12,
        "curve": [{"month": m, "accumulated_savings": base_savings * m} for m in range(1, 13)]
    }

# --- Goals Routes ---
@router.get("/goals", response_model=List[GoalResponse])
async def get_goals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Goal).filter(Goal.user_id == current_user.id))
    goals = result.scalars().all()
    if not goals:
        # Seed default goals
        goals = [
            Goal(user_id=current_user.id, goal_name="Aarav's Higher Education", category="Education", target_amount=Decimal("3500000.00"), saved_amount=Decimal("450000.00"), monthly_contribution=Decimal("15000.00"), priority="Critical", status="Under-funded"),
            Goal(user_id=current_user.id, goal_name="Retirement", category="Retirement", target_amount=Decimal("30000000.00"), saved_amount=Decimal("1200000.00"), monthly_contribution=Decimal("23500.00"), priority="Critical", status="On Track")
        ]
        for g in goals:
            db.add(g)
        await db.flush()
    return goals

@router.post("/goals", response_model=GoalResponse)
async def create_goal(
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    goal = Goal(user_id=current_user.id, **goal_in.model_dump())
    db.add(goal)
    await db.flush()
    return goal

@router.put("/goals/{id}", response_model=GoalResponse)
async def update_goal(
    id: str,
    goal_up: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Goal).filter(Goal.id == id, Goal.user_id == current_user.id))
    goal = result.scalars().first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    for key, val in goal_up.model_dump(exclude_unset=True).items():
        setattr(goal, key, val)
        
    await db.flush()
    return goal

@router.delete("/goals/{id}")
async def delete_goal(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Goal).filter(Goal.id == id, Goal.user_id == current_user.id))
    goal = result.scalars().first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    await db.delete(goal)
    await db.flush()
    return {"status": "deleted"}

# --- Investments Routes ---
@router.get("/investments", response_model=List[InvestmentResponse])
async def get_investments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Investment).filter(Investment.user_id == current_user.id))
    investments = result.scalars().all()
    if not investments:
        # Seed default investments
        investments = [
            Investment(user_id=current_user.id, investment_type="Gold", platform="Self Custody", invested_amount=Decimal("1500000.00"), current_value=Decimal("1850000.00"), expected_return=Decimal("8.5"), risk_level="Low"),
            Investment(user_id=current_user.id, investment_type="MutualFunds", platform="PPFAS", invested_amount=Decimal("350000.00"), current_value=Decimal("450000.00"), expected_return=Decimal("14.0"), risk_level="Moderate")
        ]
        for i in investments:
            db.add(i)
        await db.flush()
    return investments

@router.post("/investments", response_model=InvestmentResponse)
async def create_investment(
    inv_in: InvestmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    investment = Investment(user_id=current_user.id, **inv_in.model_dump())
    db.add(investment)
    await db.flush()
    return investment

# --- Insurance Routes ---
@router.get("/insurance", response_model=List[InsuranceResponse])
async def get_insurance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Insurance).filter(Insurance.user_id == current_user.id))
    policies = result.scalars().all()
    return policies

@router.post("/insurance", response_model=InsuranceResponse)
async def create_insurance(
    ins_in: InsuranceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    policy = Insurance(user_id=current_user.id, **ins_in.model_dump())
    db.add(policy)
    await db.flush()
    return policy

# --- Insights Routes ---
@router.get("/insights", response_model=List[AIInsightResponse])
async def get_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AIInsight).filter(AIInsight.user_id == current_user.id))
    insights = result.scalars().all()
    if not insights:
        insights = [
            AIInsight(user_id=current_user.id, category="Tax", title="Switch to New Tax Regime", description="Switching saves ₹52,400 per year based on standard salary layout.", priority="High"),
            AIInsight(user_id=current_user.id, category="Debt", title="HDFC Home Loan prepayment advantage", description="Prepaying shaves off 14 months of EMIs and saves ₹4.2 Lakhs.", priority="Medium")
        ]
        for ins in insights:
            db.add(ins)
        await db.flush()
    return insights

# --- Financial Health Route ---
@router.get("/financial-health")
async def get_financial_health(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Triggers the orchestration reasoning engine to calculate health parameters
    profile_res = await db.execute(select(FinancialProfile).filter(FinancialProfile.user_id == current_user.id))
    profile = profile_res.scalars().first()
    
    goals_res = await db.execute(select(Goal).filter(Goal.user_id == current_user.id))
    goals = goals_res.scalars().all()
    
    inv_res = await db.execute(select(Investment).filter(Investment.user_id == current_user.id))
    investments = inv_res.scalars().all()
    
    ins_res = await db.execute(select(Insurance).filter(Insurance.user_id == current_user.id))
    policies = ins_res.scalars().all()
    
    liabilities_res = await db.execute(select(Liability).filter(Liability.user_id == current_user.id))
    liabilities = liabilities_res.scalars().all()
    
    output = await orchestrator.execute_reasoning_flow(
        user_query="How is my overall financial health score calculated?",
        profile_data=profile.__dict__ if profile else {},
        goals_data=[g.__dict__ for g in goals],
        investments_data=[i.__dict__ for i in investments],
        insurance_data=[ins.__dict__ for ins in policies],
        liabilities_data=[l.__dict__ for l in liabilities],
        memories_data=[]
    )
    return output["context"]

# --- Scenario Simulator Route ---
@router.post("/simulate")
async def simulate(
    scenario: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    selected = scenario.get("scenario", "buy_car")
    if selected == "buy_car":
        return {
            "title": "Buy ₹15 Lakh Car Scenario",
            "outcome": "Retirement Goal funding drops from 102% to 88% if cash is liquidated. Structured gold-loan collateral is recommended.",
            "risk_score": 68
        }
    return {
        "title": "Prepay Home Loan Scenario",
        "outcome": "Home Loan tenure reduced by 32 months, saving ₹8.4 Lakhs in lifetime interest.",
        "risk_score": 30
    }

# --- Decision Center Route ---
@router.post("/decision")
async def run_decision(
    decision: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    query = decision.get("query", "")
    return {
        "query": query,
        "impact": "Delaying Retirement Goal by 4 months if cash spent",
        "cashflow": "-₹8,500/month recurring outlay if financed",
        "alternatives": "Wait until October bonus cycle to purchase in full, preserving your equity SIP run rate."
    }

# --- AI Reasoning Chat Route ---
@router.post("/ask-ai")
async def ask_ai(
    query_in: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = query_in.get("query", "Prepay my home loan?")
    
    profile_res = await db.execute(select(FinancialProfile).filter(FinancialProfile.user_id == current_user.id))
    profile = profile_res.scalars().first()
    
    goals_res = await db.execute(select(Goal).filter(Goal.user_id == current_user.id))
    goals = goals_res.scalars().all()
    
    inv_res = await db.execute(select(Investment).filter(Investment.user_id == current_user.id))
    investments = inv_res.scalars().all()
    
    ins_res = await db.execute(select(Insurance).filter(Insurance.user_id == current_user.id))
    policies = ins_res.scalars().all()
    
    liabilities_res = await db.execute(select(Liability).filter(Liability.user_id == current_user.id))
    liabilities = liabilities_res.scalars().all()
    
    output = await orchestrator.execute_reasoning_flow(
        user_query=query,
        profile_data=profile.__dict__ if profile else {},
        goals_data=[g.__dict__ for g in goals],
        investments_data=[i.__dict__ for i in investments],
        insurance_data=[ins.__dict__ for ins in policies],
        liabilities_data=[l.__dict__ for l in liabilities],
        memories_data=[]
    )
    return {
        "reply": output["response"],
        "reasoning_steps": output["context"]
    }

# --- Documents Upload & Analyze ---
@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    return {
        "filename": file.filename,
        "status": "uploaded",
        "storage_path": f"financial-documents/{current_user.id}/{file.filename}"
    }

@router.post("/documents/analyze")
async def analyze_document(
    doc_in: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    doc_type = doc_in.get("document_type", "SalarySlip")
    if doc_type == "SalarySlip":
        return {
            "status": "parsed",
            "extracted_income": 204000.00,
            "deductions": 18000.00,
            "alerts": "Standard deductions matched."
        }
    return {
        "status": "parsed",
        "renewal_date": (datetime.date.today() + datetime.timedelta(days=120)).isoformat(),
        "provider": "ICICI Prudential",
        "premium": 22500.00
    }
