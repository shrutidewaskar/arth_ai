from typing import Dict, Any, List, AsyncGenerator
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession

from app.engine.intent_classifier import IntentClassifier
from app.engine.context_builder import ContextBuilder
from app.engine.memory_engine import MemoryEngine
from app.engine.rules_engine import BusinessRuleEngine
from app.engine.simulation_engine import SimulationEngine
from app.engine.openai_service import OpenAIService
from app.engine.knowledge_engine import KnowledgeEngine
from app.agents.orchestrator import AgentOrchestrator

class ReasoningOrchestrator:
    """
    The Central AI Orchestrator coordinating intent classification, context building,
    memory retrieval, specialist agents execution (via AgentOrchestrator), business rules math,
    scenario simulations, static guidelines, and LLM streaming delivery.
    """
    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.context_builder = ContextBuilder()
        self.memory_engine = MemoryEngine()
        self.rules_engine = BusinessRuleEngine()
        self.simulation_engine = SimulationEngine()
        self.openai_service = OpenAIService()
        self.knowledge_engine = KnowledgeEngine()
        self.agent_orchestrator = AgentOrchestrator()

    async def execute_reasoning_stream(
        self,
        user_query: str,
        user_id: Any,
        db: AsyncSession
    ) -> AsyncGenerator[str, None]:
        """
        Executes the modular ArthAI reasoning pipeline and streams the generated advice.
        """
        # 1. Intent Classification
        intents = await self.intent_classifier.classify(user_query)
        
        # 2. Context Building (Unified financial profile context)
        context = await self.context_builder.build_context(user_id, db)
        
        # 3. Memory Retrieval
        memories = await self.memory_engine.get_relevant_memories(user_id, user_query, db)
        
        # 4. Compute Core Business Rules (Calculations only, including explainable breakdown)
        rules_output = self.rules_engine.compute_all_rules(
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
        
        # 5. Route to Agent Orchestrator to execute specialists and return standardized recommendations
        agent_recommendations = await self.agent_orchestrator.orchestrate_agents(intents, context)

        # 6. Scenario Simulation if requested
        simulation_output = None
        if "Scenario Simulation" in intents:
            scenario_name = "Vacation"
            income = Decimal(str(context.get("profile", {}).get("monthly_income", 0)))
            inputs = {"cost": 250000}
            query_lower = user_query.lower()
            if "car" in query_lower or "vehicle" in query_lower:
                scenario_name = "Purchase Vehicle"
                inputs = {"price": 1200000, "downpayment": 300000, "loan_interest": 9.2, "loan_tenure_years": 5}
            elif "home" in query_lower or "house" in query_lower:
                scenario_name = "Purchase Home"
                inputs = {"price": 5500000, "downpayment": 1200000, "loan_interest": 8.4, "loan_tenure_years": 20}
            elif "switch" in query_lower or "job" in query_lower or "career" in query_lower:
                scenario_name = "Career Switch"
                inputs = {"new_salary": float(income) * 1.3}
            elif "medical" in query_lower or "emergency" in query_lower or "hospital" in query_lower:
                scenario_name = "Unexpected Medical Expense"
                inputs = {"cost": 400000, "insurance_claim": 250000}

            simulation_raw = self.simulation_engine.simulate_scenario(
                scenario_type=scenario_name,
                inputs=inputs,
                profile=context.get("profile", {}),
                goals=context.get("goals", []),
                liabilities=context.get("liabilities", [])
            )
            
            # Map simulation outcome to standardized Recommendation Schema
            from app.agents.specialists import ScenarioSimulatorAgent
            simulator_agent = ScenarioSimulatorAgent()
            simulation_output = await simulator_agent.run_scenario_wrapper(scenario_name, inputs, simulation_raw)
            agent_recommendations.append(simulation_output)

        # 7. Get static references from the Knowledge Engine
        static_guidelines = self.knowledge_engine.get_all_guidelines()
        
        # 8. Stream response from OpenAI service using structured parameters
        async for token in self.openai_service.generate_response_stream(
            user_query=user_query,
            structured_context=context,
            memories=memories,
            rules_output=rules_output,
            simulation_output=simulation_output,
            recommendations=agent_recommendations,
            guidelines=static_guidelines
        ):
            yield token
            
        # Reconstruct message turn to run memory summarization
        history = [
            {"role": "user", "content": user_query},
            {"role": "assistant", "content": "Delivered advice based on current financial profile."}
        ]
        await self.memory_engine.run_auto_summarization(user_id, history, db)

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
        Legacy synchronous fallback method to keep existing APIs working.
        """
        rules = self.rules_engine.compute_all_rules(
            profile=profile_data,
            income_sources=[],
            expense_categories=[],
            assets=[],
            liabilities=liabilities_data,
            goals=goals_data,
            investments=investments_data,
            insurance=insurance_data,
            subscriptions=[]
        )
        
        return {
            "response": f"💡 **AI CFO Recommendation:** Your overall financial health score is **{rules['financial_health_score']}/100**.",
            "context": rules
        }
