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
    insurance_coverage_ratio: float
) -> int:
    """
    Calculates overall score from 0 to 100.
    """
    # 1. Savings Ratio component (max 25 pts)
    # Target savings ratio is 30%
    savings_score = min((savings_ratio / 30.0) * 25.0, 25.0)
    
    # 2. Debt-to-income component (max 25 pts)
    # Target DTI is below 40%
    dti_score = max(25.0 - (dti_ratio / 40.0) * 25.0, 0.0)
    
    # 3. Emergency Runway component (max 25 pts)
    # Target runway is 6 months
    runway_score = min((emergency_runway_months / 6.0) * 25.0, 25.0)
    
    # 4. Insurance coverage component (max 25 pts)
    insurance_score = min((insurance_coverage_ratio / 100.0) * 25.0, 25.0)
    
    total_score = int(savings_score + dti_score + runway_score + insurance_score)
    return max(min(total_score, 100), 10)
