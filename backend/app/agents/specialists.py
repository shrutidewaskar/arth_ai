from typing import List, Dict, Any
from decimal import Decimal
import datetime

class ProfileAgent:
    async def get_summary(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        # Count non-empty values to calculate profile completeness
        total_fields = 6
        filled_fields = sum(1 for k in ["age", "occupation", "marital_status", "dependents", "risk_appetite", "credit_score"] if profile.get(k) is not None)
        completeness = filled_fields / total_fields
        
        return {
            "priority": "LOW",
            "category": "Profile Details",
            "confidence": round(completeness, 2),
            "financialImpact": 0.0,
            "recommendation": "Complete all household profile information to increase planning accuracy." if completeness < 1.0 else "Profile information is fully complete.",
            "reasoning": f"Profile completeness is at {completeness * 100:.0f}%. Complete records allow more specific tax and goal projections.",
            "supportingCalculations": [
                {"name": "Profile Completeness", "value": completeness}
            ]
        }

class CashFlowAgent:
    async def analyze_and_project(
        self, 
        income: Decimal, 
        expenses: Decimal, 
        savings: Decimal
    ) -> Dict[str, Any]:
        savings_ratio = float((savings / income) * 100) if income > 0 else 0.0
        priority = "HIGH" if savings_ratio < 20.0 else "MEDIUM"
        confidence = 0.95 if income > 0 and expenses > 0 else 0.50
        
        return {
            "priority": priority,
            "category": "Cash Flow",
            "confidence": confidence,
            "financialImpact": float(savings),
            "recommendation": "Increase savings rate to at least 20% by cutting discretionary spending." if savings_ratio < 20.0 else "Maintain current positive savings surplus.",
            "reasoning": f"Savings rate is currently at {savings_ratio:.1f}%. Recommended benchmark is 20-30%.",
            "supportingCalculations": [
                {"name": "Savings Ratio", "value": savings_ratio},
                {"name": "Monthly Surplus", "value": float(income - expenses)}
            ]
        }

class InvestmentAgent:
    async def analyze_portfolio(self, investments: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not investments:
            return {
                "priority": "HIGH",
                "category": "Investments",
                "confidence": 0.90,
                "financialImpact": 0.0,
                "recommendation": "Establish a diversified Mutual Fund portfolio and set up monthly SIPs.",
                "reasoning": "No active investments were found in the database context.",
                "supportingCalculations": []
            }
            
        total_invested = sum(Decimal(str(i.get("invested_amount", 0))) for i in investments)
        current_value = sum(Decimal(str(i.get("current_value", 0))) for i in investments)
        expected_yield = sum(Decimal(str(i.get("expected_return", 0))) for i in investments) / len(investments) if investments else 0.0
        
        confidence = 0.95 if len(investments) >= 2 else 0.75
        diversification = "diversified" if len(investments) >= 3 else "needs_reallocation"
        priority = "MEDIUM" if diversification == "needs_reallocation" else "LOW"
        
        return {
            "priority": priority,
            "category": "Investments",
            "confidence": confidence,
            "financialImpact": float(current_value - total_invested),
            "recommendation": "Reallocate holdings to include index mutual funds or equity SIPs for diversification." if diversification == "needs_reallocation" else "Maintain existing asset allocation.",
            "reasoning": f"Average yield is {expected_yield:.1f}% across {len(investments)} investment holdings.",
            "supportingCalculations": [
                {"name": "Total Current Value", "value": float(current_value)},
                {"name": "Net Gain", "value": float(current_value - total_invested)},
                {"name": "Expected Yield", "value": float(expected_yield)}
            ]
        }

class InsuranceAgent:
    async def detect_gaps(
        self, 
        policies: List[Dict[str, Any]], 
        monthly_expenses: Decimal
    ) -> Dict[str, Any]:
        total_coverage = sum(Decimal(str(p.get("coverage", 0))) for p in policies)
        recommended_coverage = monthly_expenses * 120  # 10x Annual Expenses
        gap = max(recommended_coverage - total_coverage, Decimal("0.00"))
        coverage_pct = float((total_coverage / recommended_coverage) * 100) if recommended_coverage > 0 else 0.0
        
        priority = "HIGH" if coverage_pct < 50.0 else "MEDIUM" if coverage_pct < 80.0 else "LOW"
        confidence = 0.95 if policies else 0.80
        
        return {
            "priority": priority,
            "category": "Insurance",
            "confidence": confidence,
            "financialImpact": float(gap),
            "recommendation": f"Purchase an additional term life policy of at least ₹{float(gap):,.0f}." if gap > 0 else "Insurance shielding is at optimal level.",
            "reasoning": f"Current life & health coverage is at {coverage_pct:.1f}% of recommended parameters.",
            "supportingCalculations": [
                {"name": "Total Coverage", "value": float(total_coverage)},
                {"name": "Recommended Coverage", "value": float(recommended_coverage)},
                {"name": "Coverage Gap", "value": float(gap)}
            ]
        }

class GoalAgent:
    async def project_completion_dates(
        self, 
        goals: List[Dict[str, Any]], 
        monthly_surplus: Decimal
    ) -> List[Dict[str, Any]]:
        # Returns standard list of goal recommendation objects
        projections = []
        for g in goals:
            target = Decimal(str(g.get("target_amount", 0)))
            saved = Decimal(str(g.get("saved_amount", 0)))
            remaining = max(target - saved, Decimal("0.00"))
            monthly_contrib = Decimal(str(g.get("monthly_contribution", 0)))
            
            if monthly_contrib <= 0 and monthly_surplus > 0:
                monthly_contrib = monthly_surplus / 2
                
            months_to_complete = float(remaining / monthly_contrib) if monthly_contrib > 0 else 999.0
            est_completion = datetime.date.today() + datetime.timedelta(days=int(months_to_complete * 30))
            
            status = "on_track" if months_to_complete <= 60 else "delayed"
            priority = "HIGH" if status == "delayed" else "LOW"
            
            projections.append({
                "priority": priority,
                "category": f"Goal: {g.get('goal_name')}",
                "confidence": 0.90 if monthly_contrib > 0 else 0.60,
                "financialImpact": float(remaining),
                "recommendation": f"Increase contribution to ₹{float(monthly_contrib * Decimal('1.2')):.0f}/mo to speed up timeline." if status == "delayed" else "Keep SIPs active.",
                "reasoning": f"Estimated completion date is {est_completion.isoformat()}. Remaining funding is ₹{float(remaining):,}.",
                "supportingCalculations": [
                    {"name": "Target Amount", "value": float(target)},
                    {"name": "Saved Amount", "value": float(saved)},
                    {"name": "Months Remaining", "value": months_to_complete}
                ]
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
        cash_impact_index = float((price / savings) * 100) if savings > 0 else 100.0
        
        can_afford = "Yes"
        confidence = 0.95
        decision_score = 100.0 - cash_impact_index
        priority = "LOW"
        
        if cash_impact_index > 50.0:
            can_afford = "Finance Advised"
            decision_score = 55.0
            priority = "MEDIUM"
        if price > savings:
            can_afford = "No - Danger of Shortfall"
            decision_score = 20.0
            priority = "HIGH"
            
        return {
            "priority": priority,
            "category": "Decision Center",
            "confidence": confidence,
            "financialImpact": float(price),
            "recommendation": f"Affordability status: {can_afford}. Alternative: Finance via collateral or wait for October bonus.",
            "reasoning": f"This purchase takes {cash_impact_index:.1f}% of current liquid savings reserves.",
            "supportingCalculations": [
                {"name": "Price", "value": float(price)},
                {"name": "Liquid Reserves", "value": float(savings)},
                {"name": "Decision Score", "value": decision_score}
            ]
        }

class ScenarioSimulatorAgent:
    async def run_scenario_wrapper(
        self,
        scenario_type: str,
        inputs: Dict[str, Any],
        engine_output: Dict[str, Any]
    ) -> Dict[str, Any]:
        return {
            "priority": "MEDIUM",
            "category": f"Simulation: {scenario_type}",
            "confidence": float(engine_output.get("confidence", 0.90)),
            "financialImpact": float(engine_output.get("net_worth_difference", 0.0)),
            "recommendation": engine_output.get("recommendation", ""),
            "reasoning": f"Risk level assessed as {engine_output.get('risk_level')}. Cash flow change is ₹{engine_output.get('cash_flow_difference'):,}.",
            "supportingCalculations": [
                {"name": "Cash Flow Diff", "value": engine_output.get("cash_flow_difference")},
                {"name": "Goal Delay Months", "value": engine_output.get("goal_delay_months")}
            ]
        }

class InsightAgent:
    async def generate_daily_insights(self, profile_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [
            {
                "priority": "HIGH",
                "category": "Insights",
                "confidence": 0.95,
                "financialImpact": 52400.0,
                "recommendation": "Switch to New Tax Regime to optimize structural deductions.",
                "reasoning": "Standard tax projections show New regime is optimal for standard salary layout.",
                "supportingCalculations": []
            }
        ]

class RecommendationAgent:
    async def generate_actions(
        self, 
        health_score: int, 
        gaps: Dict[str, Any]
    ) -> Dict[str, Any]:
        return {
            "priority": "HIGH",
            "category": "Summary Advice",
            "confidence": 0.90,
            "financialImpact": 0.0,
            "recommendation": "Prepay loan using structural savings and switch to New Tax regime.",
            "reasoning": f"Financial health score is currently at {health_score}/100.",
            "supportingCalculations": [
                {"name": "Health Score", "value": health_score}
            ]
        }
