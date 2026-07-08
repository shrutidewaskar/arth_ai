import json
from typing import AsyncGenerator, Dict, Any, List
import openai
from app.config import settings

class OpenAIService:
    """
    Interfaces directly with OpenAI API.
    Streams back replies and applies strict system-prompt constraints.
    """

    def __init__(self):
        self.model_name = getattr(settings, "OPENAI_MODEL_NAME", "gpt-4o")
        self.api_key = settings.OPENAI_API_KEY
        
    def _get_client(self) -> openai.AsyncOpenAI:
        return openai.AsyncOpenAI(api_key=self.api_key)

    async def generate_response_stream(
        self,
        user_query: str,
        structured_context: Dict[str, Any],
        memories: List[Dict[str, Any]],
        rules_output: Dict[str, Any],
        simulation_output: Any = None,
        recommendations: List[Dict[str, Any]] = None,
        guidelines: Dict[str, Any] = None
    ) -> AsyncGenerator[str, None]:
        
        system_prompt = (
            "You are ArthAI, an elite AI Chief Financial Officer for the Indian Middle Class. "
            "Your objective is to provide strict, practical, explainable, and numbers-backed financial advice. "
            "You never provide generic advice. You reason directly from the user's financial profile. "
            "Explain trade-offs clearly, and remain fully transparent. Recommend direct, clear actions. "
            "If key data is missing, explicitly state what additional information is required. "
            "NEVER hallucinate, invent values, or fabricate financial calculations. Use the exact outputs "
            "from the Business Rules Engine, agent recommendations, and Simulation Engine provided to you. "
            "Ground your advice in the provided Knowledge Engine static guidelines (e.g. tax regimes, insurance thresholds).\n\n"
            "Format your advice using Markdown (bold keys, bullet points, clean tables, code blocks where appropriate)."
        )

        context_payload = {
            "user_query": user_query,
            "financial_profile": structured_context.get("profile", {}),
            "incomes": structured_context.get("incomes", []),
            "expenses": structured_context.get("expenses", []),
            "assets": structured_context.get("assets", []),
            "liabilities": structured_context.get("liabilities", []),
            "goals": structured_context.get("goals", []),
            "insurance": structured_context.get("insurance", []),
            "subscriptions": structured_context.get("subscriptions", []),
            "upcoming_bills": structured_context.get("upcoming_bills", []),
            "retrieved_memories": memories,
            "business_rules_metrics": rules_output,
            "agent_recommendations": recommendations or [],
            "static_knowledge_guidelines": guidelines or {},
            "simulated_scenario_outcome": simulation_output
        }

        user_content = (
            f"Context: {json.dumps(context_payload, default=str)}\n\n"
            f"User Question: {user_query}"
        )

        if self.api_key == "sk-dummy-key":
            # Fallback mock streaming generator for sandbox testing without real API key
            breakdown = rules_output.get("financial_health_score_breakdown", {})
            fallback_text = (
                f"### 📊 ArthAI Financial Analysis\n\n"
                f"### 🛡️ Financial Health Score: **{rules_output.get('financial_health_score', 75)}/100**\n"
                f"* **Savings (25%)**: {breakdown.get('savings', 0.0)}/25\n"
                f"* **Debt (20%)**: {breakdown.get('debt', 0.0)}/20\n"
                f"* **Cash Flow (20%)**: {breakdown.get('cash_flow', 0.0)}/20\n"
                f"* **Investments (15%)**: {breakdown.get('investments', 0.0)}/15\n"
                f"* **Insurance (10%)**: {breakdown.get('insurance', 0.0)}/10\n"
                f"* **Goals (10%)**: {breakdown.get('goals', 0.0)}/10\n\n"
                f"### 📋 Standardized Recommendations:\n"
            )
            for rec in (recommendations or []):
                fallback_text += (
                    f"- **[{rec.get('priority')}] {rec.get('category')}** (Confidence: {int(rec.get('confidence', 0)*100)}%)\n"
                    f"  * *Recommendation*: {rec.get('recommendation')}\n"
                    f"  * *Reasoning*: {rec.get('reasoning')}\n"
                )
            
            if simulation_output:
                outcome = simulation_output.get("simulated_outcome", {})
                fallback_text += (
                    f"\n### 📊 Simulation Output:\n"
                    f"* **Cashflow Difference**: ₹{outcome.get('cash_flow_difference', 0.0):,.2f}/mo\n"
                    f"* **Goal Delay**: {outcome.get('goal_delay_months', 0.0):.1f} months\n"
                    f"* **Recommendation**: {outcome.get('recommendation', 'N/A')}\n"
                )
            
            for word in fallback_text.split(" "):
                yield word + " "
            return

        client = self._get_client()
        response = await client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            stream=True
        )

        async for chunk in response:
            token = chunk.choices[0].delta.content
            if token:
                yield token
