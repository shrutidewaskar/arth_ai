from typing import List, Dict, Any, Optional
from decimal import Decimal
import datetime

class ProfileAgent:
    def __init__(self):
        pass

    async def get_summary(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "ready",
            "marital_status": profile.get("marital_status", "Single"),
            "dependents": profile.get("dependents", 0),
            "risk_profile": profile.get("risk_appetite", "Moderate")
        }

class CashFlowAgent:
    async def analyze_and_project(
        self, 
        income: Decimal, 
        expenses: Decimal, 
        savings: Decimal
    ) -> Dict[str, Any]:
        savings_ratio = float((savings / income) * 100) if income > 0 else 0.0
        return {
            "monthly_surplus": float(income - expenses),
            "savings_ratio_pct": savings_ratio,
            "projected_12m_savings": float(savings * 12),
            "burn_rate_status": "stable" if savings_ratio >= 20.0 else "high_burn"
        }

class InvestmentAgent:
    async def analyze_portfolio(self, investments: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not investments:
            return {"status": "no_investments", "diversification": "low", "expected_yield": 0.0}
            
        total_invested = sum(Decimal(str(i["invested_amount"])) for i in investments)
        current_value = sum(Decimal(str(i["current_value"])) for i in investments)
        expected_yield = sum(Decimal(str(i.get("expected_return", 0))) for i in investments) / len(investments) if investments else 0.0
        
        return {
            "total_value": float(current_value),
            "net_gain": float(current_value - total_invested),
            "average_expected_yield_pct": float(expected_yield),
            "diversification_status": "diversified" if len(investments) >= 3 else "needs_reallocation"
        }

class InsuranceAgent:
    async def detect_gaps(
        self, 
        policies: List[Dict[str, Any]], 
        monthly_expenses: Decimal
    ) -> Dict[str, Any]:
        total_coverage = sum(Decimal(str(p["coverage"])) for p in policies)
        
        # Rule: Minimum term coverage should be 10x annual income (or 100x monthly expenses)
        recommended_coverage = monthly_expenses * 120
        gap = max(recommended_coverage - total_coverage, Decimal("0.00"))
        
        coverage_pct = float((total_coverage / recommended_coverage) * 100) if recommended_coverage > 0 else 100.0
        
        return {
            "total_coverage": float(total_coverage),
            "recommended_coverage": float(recommended_coverage),
            "coverage_gap": float(gap),
            "coverage_pct": min(coverage_pct, 100.0),
            "shield_status": "optimal" if coverage_pct >= 80.0 else "underinsured"
        }

class GoalAgent:
    async def project_completion_dates(
        self, 
        goals: List[Dict[str, Any]], 
        monthly_surplus: Decimal
    ) -> List[Dict[str, Any]]:
        projections = []
        for g in goals:
            target = Decimal(str(g["target_amount"]))
            saved = Decimal(str(g["saved_amount"]))
            remaining = max(target - saved, Decimal("0.00"))
            monthly_contrib = Decimal(str(g["monthly_contribution"]))
            
            if monthly_contrib <= 0 and monthly_surplus > 0:
                # Fallback share of family surplus
                monthly_contrib = monthly_surplus / 2
                
            months_to_complete = float(remaining / monthly_contrib) if monthly_contrib > 0 else 999.0
            
            # Estimate completion date
            est_completion = datetime.date.today() + datetime.timedelta(days=int(months_to_complete * 30))
            
            projections.append({
                "goal_id": g.get("id"),
                "goal_name": g["goal_name"],
                "target_amount": float(target),
                "saved_amount": float(saved),
                "months_remaining": months_to_complete,
                "projected_completion": est_completion.isoformat(),
                "status": "on_track" if months_to_complete <= 60 else "delayed"
            })
        return projections

class DecisionAgent:
    async def simulate_purchase(
        self, 
        price: Decimal, 
        monthly_income: Decimal, 
        savings: Decimal, 
        goals: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        # Rule: Calculate impact of purchase on goals
        cash_impact_index = float((price / savings) * 100) if savings > 0 else 100.0
        
        can_afford = "Yes"
        if cash_impact_index > 50.0:
            can_afford = "Prepay or Finance advised"
        if price > savings:
            can_afford = "No - High shortfall danger"
            
        return {
            "purchase_price": float(price),
            "cash_impact_pct": cash_impact_index,
            "affordability_result": can_afford,
            "alternative_suggestion": "Finance via Gold loan at 7.8% instead of liquidating mutual fund compounding."
        }

class MemoryAgent:
    async def summarize_conversation(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "conversation_topic": "Tax planning & home loan prepayment",
            "user_intent": "prepay principal to HDFC",
            "importance_score": 7,
            "summary": "User is planning to prepay HDFC home loan using upcoming October bonus."
        }

class InsightAgent:
    async def generate_daily_insights(self, profile_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [
            {
                "category": "Tax",
                "title": "Switch to New Tax Regime",
                "description": "Switching saves ₹52,400 per year based on standard salary layout.",
                "priority": "High"
            },
            {
                "category": "Debt",
                "title": "HDFC Home Loan prepayment advantage",
                "description": "Prepaying shaves off 14 months of EMIs and saves ₹4.2 Lakhs.",
                "priority": "Medium"
            }
        ]

class RecommendationAgent:
    async def generate_actions(
        self, 
        health_score: int, 
        gaps: Dict[str, Any]
    ) -> Dict[str, Any]:
        return {
            "score": health_score,
            "priority_action": "Switch to New Tax Regime and invest ₹4K/mo standard deductions swap into equity SIPs.",
            "emergency_action": "FD provides 10 months safety buffer, reallocate ₹2.5L to HDFC Loan prepay."
        }
