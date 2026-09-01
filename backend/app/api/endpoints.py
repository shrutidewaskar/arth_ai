from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
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
    AIInsightResponse, DecisionSimulationResponse, DecisionSimulationCreate,
    IncomeSourceCreate, IncomeSourceResponse, IncomeSourceUpdate,
    ExpenseCategoryCreate, ExpenseCategoryResponse, ExpenseCategoryUpdate,
    AssetCreate, AssetResponse, AssetUpdate,
    LiabilityCreate, LiabilityResponse, LiabilityUpdate
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

# --- Onboarding Status Route ---
@router.get("/onboarding/status")
async def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch Profile
    prof_res = await db.execute(select(FinancialProfile).filter(FinancialProfile.user_id == current_user.id))
    profile = prof_res.scalars().first()
    has_profile = profile is not None and profile.age is not None and profile.age > 0 and profile.city is not None and len(profile.city.strip()) > 0

    # Fetch incomes
    inc_res = await db.execute(select(IncomeSource).filter(IncomeSource.user_id == current_user.id))
    has_income = len(inc_res.scalars().all()) > 0

    # Fetch expenses
    exp_res = await db.execute(select(ExpenseCategory).filter(ExpenseCategory.user_id == current_user.id))
    has_expenses = len(exp_res.scalars().all()) > 0

    # Fetch assets / liabilities (financial position)
    asset_res = await db.execute(select(Asset).filter(Asset.user_id == current_user.id))
    liab_res = await db.execute(select(Liability).filter(Liability.user_id == current_user.id))
    has_position = len(asset_res.scalars().all()) > 0 or len(liab_res.scalars().all()) > 0

    # Fetch goals
    goals_res = await db.execute(select(Goal).filter(Goal.user_id == current_user.id))
    has_goals = len(goals_res.scalars().all()) > 0

    is_complete = has_profile and has_income and has_expenses and has_position and has_goals

    return {
        "complete": is_complete,
        "profile": has_profile,
        "income": has_income,
        "expenses": has_expenses,
        "financial_position": has_position,
        "goals": has_goals
    }

# --- Dashboard Summary Route ---
@router.get("/dashboard/summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.engine.context_builder import ContextBuilder
    from app.engine.rules_engine import BusinessRuleEngine

    cb = ContextBuilder()
    re = BusinessRuleEngine()

    # 1. Build unified context via ContextBuilder
    context = await cb.build_context(current_user.id, db)

    # 2. Compute financial rules from BusinessRuleEngine
    rules = re.compute_all_rules(
        profile=context.get("profile", {}),
        income_sources=context.get("incomes", []),
        expense_categories=context.get("expenses", []),
        assets=context.get("assets", []),
        liabilities=context.get("liabilities", []),
        goals=context.get("goals", []),
        investments=context.get("investments", []),
        insurance=context.get("insurance", []),
        subscriptions=context.get("subscriptions", [])
    )

    # Compile structured dashboard response parameters
    profile_data = context.get("profile", {})
    incomes = context.get("incomes", [])
    expenses = context.get("expenses", [])
    assets = context.get("assets", [])
    liabilities = context.get("liabilities", [])
    goals_list = context.get("goals", [])
    investments_list = context.get("investments", [])
    insurance_list = context.get("insurance", [])
    documents_list = context.get("documents", [])

    total_income = sum(float(i.get("amount", 0)) for i in incomes)
    total_expenses = sum(float(e.get("amount", 0)) for e in expenses)
    total_emi = sum(float(l.get("emi", 0)) for l in liabilities)

    total_invested = sum(float(inv.get("invested_amount", 0)) for inv in investments_list)
    current_invested_value = sum(float(inv.get("current_value", 0)) for inv in investments_list)

    # Safely compute progress metrics for each goal
    goals_formatted = []
    for g in goals_list:
        target = float(g.get("target_amount", 0))
        saved = float(g.get("saved_amount", 0))
        progress = (saved / target * 100) if target > 0 else 0.0
        goals_formatted.append({
            "id": g.get("id"),
            "goal_name": g.get("goal_name"),
            "category": g.get("category"),
            "target_amount": target,
            "saved_amount": saved,
            "monthly_contribution": float(g.get("monthly_contribution", 0)),
            "target_date": g.get("target_date"),
            "priority": g.get("priority"),
            "progress_percentage": min(100.0, max(0.0, progress))
        })

    # Compile asset breakdown types
    asset_types_found = {}
    for a in assets:
        atype = a.get("asset_type", "Other")
        val = float(a.get("current_value", 0))
        asset_types_found[atype] = asset_types_found.get(atype, 0.0) + val

    asset_breakdown = [{"type": k, "label": k, "value": v} for k, v in asset_types_found.items()]

    # Compile liability breakdown details
    liability_breakdown = []
    for l in liabilities:
        liability_breakdown.append({
            "loan_name": l.get("loan_name"),
            "loan_type": l.get("loan_type"),
            "outstanding": float(l.get("outstanding", 0)),
            "interest_rate": float(l.get("interest_rate", 0)),
            "emi": float(l.get("emi", 0))
        })

    return {
        "profile": {
            "name": current_user.full_name or "User",
            "age": profile_data.get("age", 0),
            "city": profile_data.get("city", ""),
            "occupation": profile_data.get("occupation", ""),
            "risk_appetite": profile_data.get("risk_appetite", "Moderate")
        },
        "financial_health": {
            "score": rules.get("financial_health_score", 50),
            "savings_rate_pct": rules.get("savings_rate_pct", 0.0),
            "dti_ratio_pct": rules.get("dti_ratio_pct_gpu", rules.get("dti_ratio_pct", 0.0)),
            "emergency_runway_months": rules.get("emergency_runway_months", 0.0)
        },
        "net_worth": {
            "total_assets": rules.get("total_assets", 0.0),
            "total_liabilities": rules.get("total_liabilities", 0.0),
            "net_worth": rules.get("net_worth", 0.0),
            "asset_breakdown": asset_breakdown,
            "liability_breakdown": liability_breakdown
        },
        "cash_flow": {
            "monthly_income": total_income,
            "monthly_expenses": total_expenses,
            "monthly_emi": total_emi,
            "monthly_investments": sum(float(i.get("current_value", 0)) for i in investments_list),
            "monthly_surplus": total_income - total_expenses - total_emi
        },
        "debt": {
            "total_outstanding": rules.get("total_liabilities", 0.0),
            "monthly_emi": total_emi,
            "dti_ratio_pct": rules.get("dti_ratio_pct", 0.0)
        },
        "goals": goals_formatted,
        "investments": {
            "total_invested": total_invested,
            "current_value": current_invested_value
        },
        "insurance": {
            "count": len(insurance_list)
        },
        "documents": {
            "count": len(documents_list)
        }
    }

# --- Financial Diagnosis Route ---
@router.get("/financial-diagnosis")
async def get_financial_diagnosis(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.engine.context_builder import ContextBuilder
    from app.engine.rules_engine import BusinessRuleEngine
    from app.engine.financial_diagnosis import FinancialDiagnosisEngine

    cb = ContextBuilder()
    re = BusinessRuleEngine()
    de = FinancialDiagnosisEngine()

    # 1. Fetch user scoped context
    context = await cb.build_context(current_user.id, db)

    # 2. Compute financial rules
    rules = re.compute_all_rules(
        profile=context.get("profile", {}),
        income_sources=context.get("incomes", []),
        expense_categories=context.get("expenses", []),
        assets=context.get("assets", []),
        liabilities=context.get("liabilities", []),
        goals=context.get("goals", []),
        investments=context.get("investments", []),
        insurance=context.get("insurance", []),
        subscriptions=context.get("subscriptions", [])
    )

    # 3. Generate diagnosis report
    diagnosis = de.analyze_financials(rules, context)
    return diagnosis

# --- Onboarding Calculations Route ---
@router.post("/onboarding/calculate-metrics")
async def calculate_onboarding_metrics(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    # Formulate temporary model inputs using business rule parameters
    profile = {
        "monthly_income": payload.get("monthly_income", 0),
        "monthly_expenses": payload.get("monthly_expenses", 0),
        "monthly_savings": payload.get("monthly_savings", 0),
        "emergency_fund": payload.get("emergency_fund", 0)
    }
    
    from app.engine.rules_engine import BusinessRuleEngine
    re = BusinessRuleEngine()
    
    metrics = re.compute_all_rules(
        profile=profile,
        income_sources=payload.get("incomes", []),
        expense_categories=payload.get("expenses", []),
        assets=payload.get("assets", []),
        liabilities=payload.get("liabilities", []),
        goals=payload.get("goals", []),
        investments=[],
        insurance=[],
        subscriptions=[]
    )
    
    # Calculate simple DTI & surplus ratios strictly matching standard rules output format
    monthly_income = payload.get("monthly_income", 0)
    monthly_expenses = payload.get("monthly_expenses", 0)
    total_assets = sum(float(a.get("current_value", 0)) for a in payload.get("assets", []))
    total_liabilities = sum(float(l.get("outstanding", 0)) for l in payload.get("liabilities", []))
    total_emis = sum(float(l.get("emi", 0)) for l in payload.get("liabilities", []))
    
    surplus = monthly_income - monthly_expenses - total_emis
    savings_rate = (surplus / monthly_income * 100) if monthly_income > 0 else 0
    dti_ratio = (total_emis / monthly_income * 100) if monthly_income > 0 else 0
    
    return {
        "income": monthly_income,
        "expenses": monthly_expenses + total_emis,
        "surplus": surplus,
        "savingsRate": max(0.0, savings_rate),
        "assets": total_assets,
        "liabilities": total_liabilities,
        "netWorth": total_assets - total_liabilities,
        "dti": max(0.0, dti_ratio),
        "emergency_runway_months": metrics.get("emergency_runway_months", 0.0),
        "financial_health_score": metrics.get("financial_health_score", 50)
    }

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

# --- Demo & AI Brief Routes ---
@router.post("/demo/seed")
async def seed_demo_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Seed/Update Financial Profile
    profile_res = await db.execute(select(FinancialProfile).filter(FinancialProfile.user_id == current_user.id))
    profile = profile_res.scalars().first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.occupation = "Lead Engineer"
    profile.city = "Delhi NCR"
    profile.age = 36
    profile.marital_status = "Married"
    profile.dependents = 2
    profile.risk_appetite = "Moderate"
    profile.monthly_income = Decimal("205000.00")
    profile.monthly_expenses = Decimal("142000.00")
    profile.monthly_savings = Decimal("63000.00")
    profile.emergency_fund = Decimal("500000.00")
    profile.credit_score = 790
    
    # 2. Clear & Seed Goals
    await db.execute(text(f"DELETE FROM goals WHERE user_id = '{current_user.id}'"))
    goals = [
        Goal(user_id=current_user.id, goal_name="Home Downpayment", category="Home", target_amount=Decimal("4000000.00"), saved_amount=Decimal("800000.00"), monthly_contribution=Decimal("30000.00"), priority="Critical", status="Active"),
        Goal(user_id=current_user.id, goal_name="SUV Purchase", category="Vehicle", target_amount=Decimal("1500000.00"), saved_amount=Decimal("200000.00"), monthly_contribution=Decimal("15000.00"), priority="Medium", status="Active"),
        Goal(user_id=current_user.id, goal_name="Retirement Corpus", category="Retirement", target_amount=Decimal("25000000.00"), saved_amount=Decimal("1200000.00"), monthly_contribution=Decimal("18000.00"), priority="High", status="Active")
    ]
    for g in goals:
        db.add(g)

    # 3. Clear & Seed Liabilities
    await db.execute(text(f"DELETE FROM liabilities WHERE user_id = '{current_user.id}'"))
    liabilities = [
        Liability(user_id=current_user.id, loan_name="HDFC Home Loan", loan_type="HomeLoan", principal=Decimal("4500000.00"), outstanding=Decimal("4200000.00"), interest_rate=Decimal("8.50"), emi=Decimal("38000.00"))
    ]
    for l in liabilities:
        db.add(l)

    # 4. Clear & Seed Investments
    await db.execute(text(f"DELETE FROM investments WHERE user_id = '{current_user.id}'"))
    investments = [
        Investment(user_id=current_user.id, investment_type="MutualFunds", platform="PPFAS / Groww", invested_amount=Decimal("720000.00"), current_value=Decimal("850000.00"), expected_return=Decimal("14.50")),
        Investment(user_id=current_user.id, investment_type="FixedDeposit", platform="SBI Bank", invested_amount=Decimal("300000.00"), current_value=Decimal("320000.00"), expected_return=Decimal("7.10"))
    ]
    for i in investments:
        db.add(i)

    # 5. Clear & Seed Insurance
    await db.execute(text(f"DELETE FROM insurance WHERE user_id = '{current_user.id}'"))
    insurances = [
        Insurance(user_id=current_user.id, policy_name="Star Health Optima", provider="Star Health", coverage=Decimal("1000000.00"), premium=Decimal("20000.00"), renewal_date=datetime.datetime.utcnow() + datetime.timedelta(days=45)),
        Insurance(user_id=current_user.id, policy_name="ICICI Lombard Car Shield", provider="ICICI Lombard", coverage=Decimal("1500000.00"), premium=Decimal("18000.00"), renewal_date=datetime.datetime.utcnow() + datetime.timedelta(days=90))
    ]
    for ins in insurances:
        db.add(ins)

    # 6. Clear & Seed Subscriptions
    await db.execute(text(f"DELETE FROM subscriptions WHERE user_id = '{current_user.id}'"))
    subscriptions = [
        Subscription(user_id=current_user.id, service="Netflix Premium", amount=Decimal("649.00"), renewal_date=datetime.datetime.utcnow() + datetime.timedelta(days=12)),
        Subscription(user_id=current_user.id, service="Amazon Prime", amount=Decimal("1499.00"), renewal_date=datetime.datetime.utcnow() + datetime.timedelta(days=28))
    ]
    for s in subscriptions:
        db.add(s)

    # 7. Seed Insights
    await db.execute(text(f"DELETE FROM ai_insights WHERE user_id = '{current_user.id}'"))
    insights = [
        AIInsight(user_id=current_user.id, category="Tax", title="Switch to New Tax Regime", description="Based on your standard salary structure, switching to the New Tax Regime will save you ₹52,400 in direct taxes this year.", priority="High"),
        AIInsight(user_id=current_user.id, category="Debt", title="Home Loan Prepayment Opportunity", description="Prepaying an additional 1 EMI (₹38,000) annually will reduce your loan tenure by 32 months and save ₹8.4 Lakhs in lifetime interest.", priority="Medium"),
        AIInsight(user_id=current_user.id, category="Savings", title="Subscription Leaks Detected", description="You have 3 overlapping OTT memberships totaling ₹1,490/month. Streamlining will free up capital for mutual fund SIPs.", priority="Low")
    ]
    for ins in insights:
        db.add(ins)

    # 8. Seed Memories
    await db.execute(text(f"DELETE FROM ai_memories WHERE user_id = '{current_user.id}'"))
    memories = [
        AIMemory(user_id=current_user.id, memory_type="Goal", summary="User wants to prioritize paying off home loan early.", importance_score=8),
        AIMemory(user_id=current_user.id, memory_type="Risk", summary="User risk appetite is moderate; prefers allocation heavily towards index mutual funds rather than direct smallcap stocks.", importance_score=7)
    ]
    for m in memories:
        db.add(m)

    try:
        await db.commit()
        return {
            "status": "seeded",
            "message": "Demo mode initialized for Rajesh Sharma."
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/brief")
async def get_daily_brief(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile_res = await db.execute(select(FinancialProfile).filter(FinancialProfile.user_id == current_user.id))
    profile = profile_res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please seed demo first.")

    # Fetch context to compile rules
    from app.engine.context_builder import ContextBuilder
    from app.engine.rules_engine import BusinessRuleEngine
    cb = ContextBuilder()
    re = BusinessRuleEngine()
    
    context = await cb.build_context(current_user.id, db)
    rules = re.compute_all_rules(
        profile=context.get("profile", {}),
        income_sources=context.get("incomes", []),
        expense_categories=context.get("expenses", []),
        assets=context.get("assets", []),
        liabilities=context.get("liabilities", []),
        goals=context.get("goals", []),
        investments=context.get("investments", []),
        insurance=context.get("insurance", []),
        subscriptions=context.get("subscriptions", [])
    )

    first_name = current_user.full_name.split(" ")[0] if current_user.full_name else "Rajesh"

    return {
        "greeting": f"Good Evening, {first_name}",
        "health_score": rules["financial_health_score"],
        "health_score_breakdown": rules["financial_health_score_breakdown"],
        "summary": [
            f"Your savings rate is at {rules['savings_rate_pct']:.1f}% (target: 30%).",
            f"Emergency fund covers {rules['emergency_runway_months']:.1f} months of expenses.",
            "Home Downpayment goal is currently on track."
        ],
        "top_recommendation": "Switch to New Tax Regime to unlock ₹52,400 in annual direct tax savings.",
        "biggest_risk": "Underinsured gap of ₹12.5 Lakhs based on current multi-generational liabilities.",
        "largest_opportunity": "Prepay ₹38,000 on home loan principal to shave 32 months off tenure.",
        "upcoming_event": "Netflix Premium renewing in 12 days (₹649.00).",
        "suggested_action": "Increase PPFAS Mutual Fund SIP by ₹2,000 monthly.",
        "confidence": 0.94
    }

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

# --- Income Sources Routes ---
@router.get("/incomes", response_model=List[IncomeSourceResponse])
async def get_incomes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(IncomeSource).filter(IncomeSource.user_id == current_user.id))
    return res.scalars().all()

@router.post("/incomes", response_model=IncomeSourceResponse)
async def create_income(
    income_in: IncomeSourceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Idempotent check: query by matching source name
    res = await db.execute(select(IncomeSource).filter(IncomeSource.user_id == current_user.id, IncomeSource.source_name == income_in.source_name))
    income = res.scalars().first()
    if income:
        update_data = income_in.model_dump()
        for k, v in update_data.items():
            setattr(income, k, v)
    else:
        income = IncomeSource(user_id=current_user.id, **income_in.model_dump())
        db.add(income)
    await db.flush()
    return income

@router.delete("/incomes/{id}")
async def delete_income(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(IncomeSource).filter(IncomeSource.id == id, IncomeSource.user_id == current_user.id))
    income = res.scalars().first()
    if not income:
        raise HTTPException(status_code=404, detail="Income source not found")
    await db.delete(income)
    await db.flush()
    return {"status": "deleted"}

# --- Expense Categories Routes ---
@router.get("/expenses", response_model=List[ExpenseCategoryResponse])
async def get_expenses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(ExpenseCategory).filter(ExpenseCategory.user_id == current_user.id))
    return res.scalars().all()

@router.post("/expenses", response_model=ExpenseCategoryResponse)
async def create_expense(
    expense_in: ExpenseCategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Idempotent check: query by category
    res = await db.execute(select(ExpenseCategory).filter(ExpenseCategory.user_id == current_user.id, ExpenseCategory.category == expense_in.category))
    expense = res.scalars().first()
    if expense:
        update_data = expense_in.model_dump()
        for k, v in update_data.items():
            setattr(expense, k, v)
    else:
        expense = ExpenseCategory(user_id=current_user.id, **expense_in.model_dump())
        db.add(expense)
    await db.flush()
    return expense

@router.delete("/expenses/{id}")
async def delete_expense(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(ExpenseCategory).filter(ExpenseCategory.id == id, ExpenseCategory.user_id == current_user.id))
    expense = res.scalars().first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense category not found")
    await db.delete(expense)
    await db.flush()
    return {"status": "deleted"}

# --- Assets Routes ---
@router.get("/assets", response_model=List[AssetResponse])
async def get_assets_list(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Asset).filter(Asset.user_id == current_user.id))
    return res.scalars().all()

@router.post("/assets", response_model=AssetResponse)
async def create_asset_item(
    asset_in: AssetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Idempotent check: query by asset name
    res = await db.execute(select(Asset).filter(Asset.user_id == current_user.id, Asset.asset_name == asset_in.asset_name))
    asset = res.scalars().first()
    if asset:
        update_data = asset_in.model_dump()
        for k, v in update_data.items():
            setattr(asset, k, v)
    else:
        asset = Asset(user_id=current_user.id, **asset_in.model_dump())
        db.add(asset)
    await db.flush()
    return asset

@router.delete("/assets/{id}")
async def delete_asset(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Asset).filter(Asset.id == id, Asset.user_id == current_user.id))
    asset = res.scalars().first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    await db.delete(asset)
    await db.flush()
    return {"status": "deleted"}

# --- Liabilities Routes ---
@router.get("/liabilities")
async def get_liabilities_list(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Liability).filter(Liability.user_id == current_user.id))
    return res.scalars().all()

@router.post("/liabilities", response_model=LiabilityResponse)
async def create_liability_item(
    liab_in: LiabilityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Idempotent check: query by loan name
    res = await db.execute(select(Liability).filter(Liability.user_id == current_user.id, Liability.loan_name == liab_in.loan_name))
    liability = res.scalars().first()
    if liability:
        update_data = liab_in.model_dump()
        for k, v in update_data.items():
            setattr(liability, k, v)
    else:
        liability = Liability(user_id=current_user.id, **liab_in.model_dump())
        db.add(liability)
    await db.flush()
    return liability

@router.delete("/liabilities/{id}")
async def delete_liability(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Liability).filter(Liability.id == id, Liability.user_id == current_user.id))
    liab = res.scalars().first()
    if not liab:
        raise HTTPException(status_code=404, detail="Liability not found")
    await db.delete(liab)
    await db.flush()
    return {"status": "deleted"}

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
    # Idempotent check: query by goal name
    res = await db.execute(select(Goal).filter(Goal.user_id == current_user.id, Goal.goal_name == goal_in.goal_name))
    goal = res.scalars().first()
    if goal:
        update_data = goal_in.model_dump()
        for k, v in update_data.items():
            setattr(goal, k, v)
    else:
        goal = Goal(user_id=current_user.id, **goal_in.model_dump())
        db.add(goal)
    await db.flush()
    return goal

@router.get("/goals/feasibility")
async def get_goals_feasibility(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.engine.context_builder import ContextBuilder
    from app.engine.goal_feasibility import GoalFeasibilityEngine

    cb = ContextBuilder()
    gfe = GoalFeasibilityEngine()

    context = await cb.build_context(current_user.id, db)
    goals = context.get("goals", [])
    result = gfe.analyze_goals_feasibility(goals, context)
    return result

@router.post("/action-plans")
async def get_action_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.engine.context_builder import ContextBuilder
    from app.engine.action_planning import ActionPlanningEngine

    cb = ContextBuilder()
    ape = ActionPlanningEngine()

    context = await cb.build_context(current_user.id, db)
    goals = context.get("goals", [])
    result = ape.generate_action_plans(goals, context)
    return result

@router.post("/cfo/query")
async def process_cfo_query(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.engine.cfo_orchestrator import CFOOrchestrator
    orchestrator = CFOOrchestrator()
    query = payload.get("query", "")
    result = await orchestrator.process_query(query, current_user.id, db)
    return result

@router.get("/goals/{goal_id}/feasibility")
async def get_single_goal_feasibility(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.engine.context_builder import ContextBuilder
    from app.engine.goal_feasibility import GoalFeasibilityEngine

    cb = ContextBuilder()
    gfe = GoalFeasibilityEngine()

    context = await cb.build_context(current_user.id, db)
    goals = context.get("goals", [])
    
    target_goal = [g for g in goals if str(g.get("id")) == goal_id]
    if not target_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    result = gfe.analyze_goals_feasibility(target_goal, context)
    if result["goals"]:
        return result["goals"][0]
    raise HTTPException(status_code=404, detail="Goal analysis failed")

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
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.engine.context_builder import ContextBuilder
    from app.engine.simulation_engine import SimulationEngine

    scenario_type = payload.get("type")
    inputs = payload.get("parameters", {})

    # Compatibility mode for legacy select calls
    legacy_sel = payload.get("scenario")
    if legacy_sel:
        if legacy_sel == "buy_car":
            scenario_type = "NEW_LIABILITY"
            inputs = {
                "principal": 1500000.0,
                "interest_rate": 9.5,
                "tenure_years": 5.0,
                "asset_purchase_value": 1500000.0
            }
        elif legacy_sel == "prepay_loan":
            scenario_type = "EXPENSE_CHANGE"
            inputs = {
                "change_type": "absolute",
                "value": -5000.0
            }

    if not scenario_type:
        scenario_type = "INCOME_CHANGE"

    cb = ContextBuilder()
    se = SimulationEngine()

    context = await cb.build_context(current_user.id, db)
    result = se.simulate_scenario(scenario_type, inputs, context)
    return result

# --- Scenario Comparison Route ---
@router.post("/simulate/compare")
async def compare_scenarios(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.engine.context_builder import ContextBuilder
    from app.engine.simulation_engine import SimulationEngine

    options = payload.get("options", [])
    cb = ContextBuilder()
    se = SimulationEngine()

    context = await cb.build_context(current_user.id, db)
    result = se.compare_scenarios(options, context)
    return result

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

@router.post("/chat/stream")
async def chat_stream(
    query_in: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = query_in.get("query", "")
    conversation_id = query_in.get("conversation_id")
    
    # Track conversation if ID is provided
    if conversation_id:
        # Create user message in DB
        from app.models.financials import Message
        user_msg = Message(conversation_id=conversation_id, role="user", content=query)
        db.add(user_msg)
        await db.flush()
        
    async def response_generator():
        try:
            full_response = []
            async for token in orchestrator.execute_reasoning_stream(query, current_user.id, db):
                full_response.append(token)
                yield token
                
            # If conversation exists, persist final response
            if conversation_id:
                from app.models.financials import Message
                ai_msg = Message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content="".join(full_response)
                )
                db.add(ai_msg)
                await db.commit()
        except Exception as e:
            yield f"\n[Error streaming response: {str(e)}]"

    return StreamingResponse(response_generator(), media_type="text/event-stream")

# --- Conversation Sessions Routes ---
@router.post("/chat/sessions")
async def create_session(
    session_in: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.financials import Conversation
    title = session_in.get("title", "New Conversation")
    conv = Conversation(user_id=current_user.id, title=title)
    db.add(conv)
    await db.flush()
    return {"id": str(conv.id), "title": conv.title, "created_at": conv.created_at}

@router.get("/chat/sessions")
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.financials import Conversation
    res = await db.execute(
        select(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.created_at.desc())
    )
    sessions = res.scalars().all()
    return [{"id": str(c.id), "title": c.title, "created_at": c.created_at} for c in sessions]

@router.get("/chat/sessions/{id}/messages")
async def get_session_messages(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.financials import Conversation, Message
    # Verify ownership
    c_res = await db.execute(select(Conversation).filter(Conversation.id == id, Conversation.user_id == current_user.id))
    conv = c_res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    m_res = await db.execute(select(Message).filter(Message.conversation_id == id).order_by(Message.timestamp.asc()))
    messages = m_res.scalars().all()
    return [{"id": str(m.id), "role": m.role, "content": m.content, "timestamp": m.timestamp} for m in messages]

# --- Memories Routes ---
@router.get("/memories")
async def get_memories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.financials import AIMemory
    res = await db.execute(select(AIMemory).filter(AIMemory.user_id == current_user.id).order_by(AIMemory.created_at.desc()))
    memories = res.scalars().all()
    return [{
        "id": str(m.id),
        "memory_type": m.memory_type,
        "summary": m.summary,
        "importance_score": m.importance_score,
        "created_at": m.created_at
    } for m in memories]

@router.post("/memories")
async def add_memory(
    memory_in: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.financials import AIMemory
    mem = AIMemory(
        user_id=current_user.id,
        memory_type=memory_in.get("memory_type", "Fact"),
        summary=memory_in.get("summary", ""),
        importance_score=memory_in.get("importance_score", 5)
    )
    db.add(mem)
    await db.flush()
    return {
        "id": str(mem.id),
        "memory_type": mem.memory_type,
        "summary": mem.summary,
        "importance_score": mem.importance_score
    }

@router.delete("/memories/{id}")
async def delete_memory(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.financials import AIMemory
    res = await db.execute(select(AIMemory).filter(AIMemory.id == id, AIMemory.user_id == current_user.id))
    mem = res.scalars().first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    await db.delete(mem)
    await db.flush()
    return {"status": "deleted"}

# --- Documents Upload & Intelligence Operations ---
@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    import uuid
    import shutil
    import os
    from app.models.financials import Document
    from app.documents.processor import DocumentProcessor

    # 1. Validate PDF restriction
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for Sprint 6 MVP.")
        
    doc_id = uuid.uuid4()
    
    # Secure Vault path structure: {user_id}/{document_id}/{filename}
    secure_dir = os.path.abspath(f"./storage/financial-documents/{current_user.id}/{doc_id}")
    os.makedirs(secure_dir, exist_ok=True)
    temp_file_path = os.path.join(secure_dir, file.filename)
    
    # Save file content locally (Mocking Supabase Storage secure upload fallback)
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(temp_file_path)
    
    # 2. Record initial metadata
    doc = Document(
        id=doc_id,
        user_id=current_user.id,
        document_type="OTHER",
        storage_path=f"{current_user.id}/{doc_id}/{file.filename}",
        file_name=file.filename,
        mime_type=file.content_type or "application/pdf",
        file_size=file_size,
        status="UPLOADED"
    )
    db.add(doc)
    await db.flush()
    
    # 3. Synchronous processing slice
    processor = DocumentProcessor()
    processed_doc = await processor.process_document(db, doc_id, temp_file_path, current_user.id)
    
    # Load chunks count
    from app.models.financials import DocumentChunk, DocumentFinancialFact
    chunks_res = await db.execute(select(DocumentChunk).filter(DocumentChunk.document_id == processed_doc.id))
    chunks_count = len(chunks_res.scalars().all())
    
    facts_res = await db.execute(select(DocumentFinancialFact).filter(DocumentFinancialFact.document_id == processed_doc.id))
    facts_count = len(facts_res.scalars().all())
    
    return {
        "document_id": str(processed_doc.id),
        "status": processed_doc.status, # Keep uppercase return (e.g. PROCESSED)
        "document_type": processed_doc.document_type,
        "facts_extracted": facts_count,
        "chunks_created": chunks_count
    }

@router.get("/documents")
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.financials import Document
    res = await db.execute(
        select(Document).filter(Document.user_id == current_user.id).order_by(Document.uploaded_at.desc())
    )
    docs = res.scalars().all()
    out = []
    for d in docs:
        # Count facts
        from app.models.financials import DocumentFinancialFact
        fact_res = await db.execute(select(DocumentFinancialFact).filter(DocumentFinancialFact.document_id == d.id))
        facts_count = len(fact_res.scalars().all())
        
        out.append({
            "id": str(d.id),
            "file_name": d.file_name,
            "document_type": d.document_type,
            "status": d.status,
            "file_size": d.file_size,
            "uploaded_at": d.uploaded_at,
            "facts_count": facts_count
        })
    return out

@router.get("/documents/search")
async def search_documents(
    q: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.documents.retriever import DocumentRetriever
    retriever = DocumentRetriever()
    results = await retriever.retrieve_relevant_chunks(db, current_user.id, q)
    return results

@router.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    import uuid
    from app.models.financials import Document, DocumentFinancialFact
    
    doc_uuid = uuid.UUID(document_id)
    res = await db.execute(select(Document).filter(Document.id == doc_uuid, Document.user_id == current_user.id))
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
        
    facts_res = await db.execute(select(DocumentFinancialFact).filter(DocumentFinancialFact.document_id == doc.id))
    facts = facts_res.scalars().all()
    
    # Load chunks count
    from app.models.financials import DocumentChunk
    chunks_res = await db.execute(select(DocumentChunk).filter(DocumentChunk.document_id == doc.id))
    chunks_count = len(chunks_res.scalars().all())

    facts_list = [{
        "fact_type": f.fact_type,
        "fact_key": f.fact_key,
        "fact_value": f.fact_value,
        "confidence": float(f.confidence),
        "source_page": f.source_page
    } for f in facts]
    
    return {
        "id": str(doc.id),
        "file_name": doc.file_name,
        "document_type": doc.document_type,
        "status": doc.status,
        "facts_extracted": len(facts),
        "chunks_created": chunks_count,
        "uploaded_at": doc.uploaded_at,
        "processed_at": doc.processed_at,
        "error_message": doc.error_message,
        "extracted_facts": facts_list
    }

@router.get("/documents/{document_id}/url")
async def get_document_url(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    import uuid
    from app.models.financials import Document
    doc_uuid = uuid.UUID(document_id)
    res = await db.execute(select(Document).filter(Document.id == doc_uuid, Document.user_id == current_user.id))
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Return mock signed URL pointing to local temp secure route
    return {
        "url": f"/api/v1/documents/view/{doc.id}?token=mock-signed-security-token-60m",
        "expires_in": 3600
    }

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    import uuid
    import os
    import shutil
    from app.models.financials import Document
    
    doc_uuid = uuid.UUID(document_id)
    res = await db.execute(select(Document).filter(Document.id == doc_uuid, Document.user_id == current_user.id))
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Delete local file
    secure_dir = os.path.abspath(f"./storage/financial-documents/{current_user.id}/{doc.id}")
    if os.path.exists(secure_dir):
        shutil.rmtree(secure_dir)
        
    await db.delete(doc)
    await db.flush()
    return {"status": "deleted"}
