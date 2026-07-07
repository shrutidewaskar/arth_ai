from typing import Dict, Any, List
from decimal import Decimal
from app.agents.specialists import (
    ProfileAgent, CashFlowAgent, InvestmentAgent,
    InsuranceAgent, GoalAgent, DecisionAgent,
    MemoryAgent, InsightAgent, RecommendationAgent
)
from app.utils.financial_formulas import (
    calculate_savings_ratio, calculate_debt_to_income_ratio,
    calculate_emergency_fund_coverage, calculate_financial_health_score
)

class ReasoningOrchestrator:
    def __init__(self):
        self.profile_agent = ProfileAgent()
        self.cash_flow_agent = CashFlowAgent()
        self.investment_agent = InvestmentAgent()
        self.insurance_agent = InsuranceAgent()
        self.goal_agent = GoalAgent()
        self.decision_agent = DecisionAgent()
        self.memory_agent = MemoryAgent()
        self.insight_agent = InsightAgent()
        self.recommendation_agent = RecommendationAgent()

    async def execute_reasoning_flow(
        self,
        user_query: str,
        profile_data: Dict[str, Any],
        goals_data: List[Dict[str, Any]],
        investments_data: List[Dict[str, Any]],
        insurance_data: List[Dict[str, Any]],
        liabilities_data: List[Dict[str, Any]],
        memories_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Executes the main ArthAI reasoning pipeline:
        Intent Detection -> Agent Collaboration -> Rules Engine -> Recommendation Generation.
        """
        
        # 1. Intent Detection (Simple classification)
        query_lower = user_query.lower()
        intent = "general_query"
        if "buy" in query_lower or "afford" in query_lower or "macbook" in query_lower or "car" in query_lower or "suv" in query_lower:
            intent = "purchase_decision"
        elif "prepay" in query_lower or "loan" in query_lower:
            intent = "debt_repayment"
        elif "invest" in query_lower or "sip" in query_lower or "bonus" in query_lower:
            intent = "investment_allocation"
        elif "insurance" in query_lower or "coverage" in query_lower:
            intent = "insurance_analysis"
            
        # 2. Extract values for formulas
        income = Decimal(str(profile_data.get("monthly_income", 204000)))
        expenses = Decimal(str(profile_data.get("monthly_expenses", 142000)))
        savings = Decimal(str(profile_data.get("monthly_savings", 62000)))
        emergency_fund = Decimal(str(profile_data.get("emergency_fund", 800000)))
        
        total_emis = sum(Decimal(str(l.get("emi", 0))) for l in liabilities_data)
        
        # 3. Calculate Core Business Rules Heuristics
        savings_ratio = calculate_savings_ratio(savings, income)
        dti_ratio = calculate_debt_to_income_ratio(total_emis, income)
        emergency_runway = calculate_emergency_fund_coverage(emergency_fund, expenses)
        
        total_insurance_coverage = sum(Decimal(str(ins.get("coverage", 0))) for ins in insurance_data)
        target_insurance_coverage = income * 120 # 10x annual income
        insurance_pct = (total_insurance_coverage / target_insurance_coverage * 100) if target_insurance_coverage > 0 else 100.0
        
        health_score = calculate_financial_health_score(
            savings_ratio=savings_ratio,
            dti_ratio=dti_ratio,
            emergency_runway_months=emergency_runway,
            insurance_coverage_ratio=float(insurance_pct)
        )
        
        # 4. Trigger Specific Specialist Agents depending on Intent
        agent_findings = {}
        if intent == "purchase_decision":
            # Extract simulated price
            price = Decimal("1500000") # default to SUV price
            if "macbook" in query_lower:
                price = Decimal("90000")
            elif "vacation" in query_lower:
                price = Decimal("350000")
                
            agent_findings["decision"] = await self.decision_agent.simulate_purchase(
                price=price,
                monthly_income=income,
                savings=savings,
                goals=goals_data
            )
        
        # Always run profile & cashflow assessments
        agent_findings["profile"] = await self.profile_agent.get_summary(profile_data)
        agent_findings["cash_flow"] = await self.cash_flow_agent.analyze_and_project(income, expenses, savings)
        agent_findings["insurance_shield"] = await self.insurance_agent.detect_gaps(insurance_data, expenses)
        agent_findings["goal_timeline"] = await self.goal_agent.project_completion_dates(goals_data, savings)
        
        # 5. Compile Recommendation Object
        recommendations = await self.recommendation_agent.generate_actions(
            health_score=health_score,
            gaps=agent_findings["insurance_shield"]
        )
        
        # 6. Generate Structural LLM Context Object
        context = {
            "intent": intent,
            "health_score": health_score,
            "savings_ratio": savings_ratio,
            "dti_ratio": dti_ratio,
            "emergency_runway_months": emergency_runway,
            "findings": agent_findings,
            "recommendations": recommendations,
            "memories_retrieved": memories_data
        }
        
        # 7. LLM Response Generator (Mocking response layer structure)
        # In Sprint 3, this will pass context directly to OpenAI GPT-5.5 endpoint.
        ai_response_text = f"💡 **AI CFO Recommendation:** Your overall financial health score is **{health_score}/100**. "
        if intent == "purchase_decision":
            ai_response_text += f"Buying this asset represents a {agent_findings['decision']['cash_impact_pct']:.1f}% hit to cash reserves. {agent_findings['decision']['affordability_result']}. Suggestion: {agent_findings['decision']['alternative_suggestion']}"
        else:
            ai_response_text += f"I suggest: {recommendations['priority_action']}"
            
        return {
            "response": ai_response_text,
            "context": context
        }
