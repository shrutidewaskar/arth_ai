from typing import List, Dict, Any
from decimal import Decimal
from app.agents.specialists import (
    ProfileAgent, CashFlowAgent, InvestmentAgent,
    InsuranceAgent, GoalAgent, DecisionAgent,
    InsightAgent, RecommendationAgent
)

class AgentOrchestrator:
    """
    Manager layer that decides which specialist agents should run based on the classified intents,
    manages their execution, and merges their outputs into standardized Recommendation objects.
    """
    def __init__(self):
        self.profile_agent = ProfileAgent()
        self.cash_flow_agent = CashFlowAgent()
        self.investment_agent = InvestmentAgent()
        self.insurance_agent = InsuranceAgent()
        self.goal_agent = GoalAgent()
        self.decision_agent = DecisionAgent()
        self.insight_agent = InsightAgent()
        self.recommendation_agent = RecommendationAgent()

    async def orchestrate_agents(
        self,
        intents: List[str],
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        recommendations: List[Dict[str, Any]] = []

        # 1. Profile Agent (Always run)
        profile_summary = await self.profile_agent.get_summary(context.get("profile", {}))
        recommendations.append(profile_summary)

        # 2. Cash Flow Agent (Always run)
        income = Decimal(str(context.get("profile", {}).get("monthly_income", 0)))
        expenses = Decimal(str(context.get("profile", {}).get("monthly_expenses", 0)))
        savings = Decimal(str(context.get("profile", {}).get("monthly_savings", 0)))
        
        cashflow_summary = await self.cash_flow_agent.analyze_and_project(income, expenses, savings)
        recommendations.append(cashflow_summary)

        # 3. Conditional Agents Execution based on Intents
        if any(i in intents for i in ["Investment Advice", "Financial Health"]):
            inv_summary = await self.investment_agent.analyze_portfolio(context.get("investments", []))
            recommendations.append(inv_summary)

        if any(i in intents for i in ["Insurance Analysis", "Financial Health"]):
            ins_summary = await self.insurance_agent.detect_gaps(context.get("insurance", []), expenses)
            recommendations.append(ins_summary)

        if any(i in intents for i in ["Goal Planning", "Retirement Planning", "Financial Health"]):
            goals = context.get("goals", [])
            goal_summaries = await self.goal_agent.project_completion_dates(goals, savings)
            recommendations.extend(goal_summaries)

        if "Decision Analysis" in intents:
            # Extract simulated price from query or context
            price = Decimal("1500000") # default
            dec_summary = await self.decision_agent.simulate_purchase(
                price=price,
                monthly_income=income,
                savings=savings,
                goals=context.get("goals", [])
            )
            recommendations.append(dec_summary)

        # 4. Insight Agent (Always run to add anomalies/tax highlights)
        insights = await self.insight_agent.generate_daily_insights(context.get("profile", {}))
        recommendations.extend(insights)

        return recommendations
