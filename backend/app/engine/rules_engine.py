from decimal import Decimal
from typing import List, Dict, Any
from app.utils.financial_formulas import (
    calculate_net_worth,
    calculate_savings_ratio,
    calculate_debt_to_income_ratio,
    calculate_emergency_fund_coverage,
    calculate_goal_completion,
    calculate_insurance_coverage,
    calculate_financial_health_score
)

class BusinessRuleEngine:
    """
    Executes standard mathematical rules and metrics without LLM involvement.
    Ensures precise numerical validation for financial profiles.
    """

    def compute_all_rules(
        self,
        profile: Dict[str, Any],
        income_sources: List[Dict[str, Any]],
        expense_categories: List[Dict[str, Any]],
        assets: List[Dict[str, Any]],
        liabilities: List[Dict[str, Any]],
        goals: List[Dict[str, Any]],
        investments: List[Dict[str, Any]],
        insurance: List[Dict[str, Any]],
        subscriptions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        
        monthly_income = Decimal(str(profile.get("monthly_income", 0)))
        monthly_expenses = Decimal(str(profile.get("monthly_expenses", 0)))
        monthly_savings = Decimal(str(profile.get("monthly_savings", 0)))
        emergency_fund = Decimal(str(profile.get("emergency_fund", 0)))
        
        # 1. Net Worth
        total_assets = sum(Decimal(str(a.get("current_value", 0))) for a in assets)
        total_liabilities = sum(Decimal(str(l.get("outstanding", 0))) for l in liabilities)
        net_worth = calculate_net_worth(total_assets, total_liabilities)
        
        # 2. Savings Rate & Burn Rate
        savings_rate = calculate_savings_ratio(monthly_savings, monthly_income)
        monthly_burn_rate = float(monthly_expenses)
        
        # 3. Debt to Income Ratio (DTI)
        total_emis = sum(Decimal(str(l.get("emi", 0))) for l in liabilities)
        dti_ratio = calculate_debt_to_income_ratio(total_emis, monthly_income)
        
        # 4. Emergency Fund Runway Coverage (months)
        emergency_runway = calculate_emergency_fund_coverage(emergency_fund, monthly_expenses)
        
        # 5. Goal Completion Percentage
        goal_stats = []
        for g in goals:
            target = Decimal(str(g.get("target_amount", 1)))
            saved = Decimal(str(g.get("saved_amount", 0)))
            goal_stats.append({
                "goal_name": g.get("goal_name"),
                "completion_pct": calculate_goal_completion(saved, target),
                "target": float(target),
                "saved": float(saved)
            })
            
        # 6. Investment Allocation
        total_investments = sum(Decimal(str(i.get("current_value", 0))) for i in investments)
        allocation = {}
        for i in investments:
            itype = i.get("investment_type", "Other")
            val = Decimal(str(i.get("current_value", 0)))
            pct = float((val / total_investments) * 100) if total_investments > 0 else 0.0
            allocation[itype] = allocation.get(itype, 0.0) + pct
            
        # 7. Insurance Coverage
        total_insurance = sum(Decimal(str(ins.get("coverage", 0))) for ins in insurance)
        recommended_insurance = monthly_income * 120  # 10x Annual Income
        insurance_ratio = calculate_insurance_coverage(total_insurance, recommended_insurance)
        
        # 8. Cash Flow Projection (12-month linear)
        projection_curve = []
        accumulated = float(emergency_fund)
        for month in range(1, 13):
            accumulated += float(monthly_savings)
            projection_curve.append({
                "month": month,
                "projected_savings": accumulated
            })
            
        # 9. Overall Health Score (Weighted)
        avg_goal_completion = 100.0
        if goal_stats:
            avg_goal_completion = sum(g["completion_pct"] for g in goal_stats) / len(goal_stats)
            
        avg_yield = 12.0 # benchmark
        total_inv_yield = 0.0
        if investments:
            valid_returns = [float(i.get("expected_return", 0)) for i in investments if i.get("expected_return") is not None]
            if valid_returns:
                total_inv_yield = sum(valid_returns) / len(valid_returns)
        inv_ratio = min((total_inv_yield / avg_yield) * 100, 100.0) if total_inv_yield > 0 else 50.0

        health_score_details = calculate_financial_health_score(
            savings_ratio=savings_rate,
            dti_ratio=dti_ratio,
            emergency_runway_months=emergency_runway,
            insurance_coverage_ratio=insurance_ratio,
            investment_yield_ratio=inv_ratio,
            goals_completion_ratio=avg_goal_completion
        )
        
        # 10. Retirement Readiness
        retirement_goals = [g for g in goals if "retirement" in g.get("goal_name", "").lower() or g.get("category") == "Retirement"]
        readiness_score = 0.0
        if retirement_goals:
            readiness_score = sum(calculate_goal_completion(Decimal(str(rg.get("saved_amount", 0))), Decimal(str(rg.get("target_amount", 1)))) for rg in retirement_goals) / len(retirement_goals)
        else:
            # Estimate readiness based on net worth / income metric (ideal: 10x annual income at age 60)
            target_retire = monthly_income * 120
            readiness_score = calculate_goal_completion(net_worth, target_retire) if target_retire > 0 else 100.0

        return {
            "net_worth": float(net_worth),
            "total_assets": float(total_assets),
            "total_liabilities": float(total_liabilities),
            "savings_rate_pct": savings_rate,
            "monthly_burn_rate": monthly_burn_rate,
            "dti_ratio_pct": dti_ratio,
            "emergency_runway_months": emergency_runway,
            "goal_completion_stats": goal_stats,
            "investment_allocation_pct": allocation,
            "total_insurance_coverage": float(total_insurance),
            "insurance_coverage_ratio_pct": insurance_ratio,
            "cash_flow_projection_12m": projection_curve,
            "financial_health_score": health_score_details["aggregate_score"],
            "financial_health_score_breakdown": health_score_details["breakdown"],
            "retirement_readiness_pct": readiness_score
        }
