from decimal import Decimal
from typing import List, Dict, Any

def calculate_net_worth(assets_val: Decimal, liabilities_val: Decimal) -> Decimal:
    return assets_val - liabilities_val

def calculate_savings_ratio(savings: Decimal, income: Decimal) -> float:
    if income <= 0:
        return 0.0
    return float((savings / income) * 100)

def calculate_debt_to_income_ratio(monthly_emis: Decimal, monthly_income: Decimal) -> float:
    if monthly_income <= 0:
        return 0.0
    return float((monthly_emis / monthly_income) * 100)

def calculate_emergency_fund_coverage(emergency_fund: Decimal, monthly_expenses: Decimal) -> float:
    if monthly_expenses <= 0:
        return 12.0 # Assume full runway coverage
    return float(emergency_fund / monthly_expenses)

def calculate_goal_completion(saved: Decimal, target: Decimal) -> float:
    if target <= 0:
        return 100.0
    return min(float((saved / target) * 100), 100.0)

def calculate_insurance_coverage(current_coverage: Decimal, target_coverage: Decimal) -> float:
    if target_coverage <= 0:
        return 100.0
    return min(float((current_coverage / target_coverage) * 100), 100.0)

def calculate_portfolio_diversification(assets: List[Dict[str, Any]]) -> float:
    """
    Calculates portfolio diversification using Herfindahl-Hirschman Index (HHI) concept.
    Returns score between 0 and 100. Higher is more diversified.
    """
    if not assets:
        return 0.0
    total_val = sum(Decimal(str(a["val"])) for a in assets)
    if total_val <= 0:
        return 0.0
        
    shares = [float(Decimal(str(a["val"])) / total_val) for a in assets]
    hhi = sum(s ** 2 for s in shares) # ranges from 1/N to 1.0
    
    # Map 1.0 (least diversified) to 30%, and low HHI to 100%
    diversity_score = 100 - (hhi * 70)
    return max(min(diversity_score, 100.0), 10.0)

def calculate_financial_health_score(
    savings_ratio: float,
    dti_ratio: float,
    emergency_runway_months: float,
    insurance_coverage_ratio: float,
    investment_yield_ratio: float = 100.0,
    goals_completion_ratio: float = 100.0
) -> Dict[str, Any]:
    """
    Calculates overall score from 0 to 100 with weighted component scores:
    - Savings Rate (25%)
    - Debt/DTI (20%)
    - Cash Flow/Emergency runway (20%)
    - Investments (15%)
    - Insurance (10%)
    - Goals (10%)
    """
    # 1. Savings Rate component (max 25 pts) - target is 30% savings rate
    savings_score = min((savings_ratio / 30.0) * 25.0, 25.0)
    
    # 2. Debt-to-income component (max 20 pts) - target is below 40% DTI
    debt_score = max(20.0 - (dti_ratio / 40.0) * 20.0, 0.0)
    
    # 3. Cash Flow / Emergency Runway component (max 20 pts) - target is 6 months
    cash_flow_score = min((emergency_runway_months / 6.0) * 20.0, 20.0)
    
    # 4. Investments performance component (max 15 pts)
    investments_score = min((investment_yield_ratio / 100.0) * 15.0, 15.0)
    
    # 5. Insurance coverage component (max 10 pts)
    insurance_score = min((insurance_coverage_ratio / 100.0) * 10.0, 10.0)
    
    # 6. Goals completion component (max 10 pts)
    goals_score = min((goals_completion_ratio / 100.0) * 10.0, 10.0)
    
    total_score = int(savings_score + debt_score + cash_flow_score + investments_score + insurance_score + goals_score)
    aggregate_score = max(min(total_score, 100), 10)
    
    return {
        "aggregate_score": aggregate_score,
        "breakdown": {
            "savings": float(round(savings_score, 2)),
            "debt": float(round(debt_score, 2)),
            "cash_flow": float(round(cash_flow_score, 2)),
            "investments": float(round(investments_score, 2)),
            "insurance": float(round(insurance_score, 2)),
            "goals": float(round(goals_score, 2))
        }
    }
