import sys
import os
import asyncio
from decimal import Decimal

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.engine.intent_classifier import IntentClassifier
from app.engine.rules_engine import BusinessRuleEngine
from app.engine.simulation_engine import SimulationEngine
from app.engine.knowledge_engine import KnowledgeEngine
from app.agents.orchestrator import AgentOrchestrator

async def run_tests():
    print("[TEST] Running ArthAI Intelligence Layer Tests...")

    # 1. Test Intent Classifier
    print("Testing Intent Classifier...")
    classifier = IntentClassifier()
    intents = await classifier.classify("Should I buy a vehicle and how does that affect my retirement goals?")
    print(f"Detected Intents: {intents}")
    assert "Decision Analysis" in intents
    print("SUCCESS: Intent Classifier passed.")

    # 2. Test Knowledge Engine
    print("Testing Knowledge Engine...")
    ke = KnowledgeEngine()
    guidelines = ke.get_all_guidelines()
    print(f"Loaded tax keys: {list(guidelines.get('tax', {}).keys())}")
    assert "indian_tax_regimes" in guidelines["tax"]
    print("SUCCESS: Knowledge Engine passed.")

    # 3. Test Business Rule Engine with Weighted Health Score Breakdown
    print("Testing Business Rule Engine...")
    engine = BusinessRuleEngine()
    profile = {"monthly_income": 200000, "monthly_expenses": 120000, "monthly_savings": 80000, "emergency_fund": 600000}
    rules = engine.compute_all_rules(
        profile=profile,
        income_sources=[],
        expense_categories=[],
        assets=[{"current_value": 5000000}],
        liabilities=[{"outstanding": 1500000, "emi": 35000}],
        goals=[{"goal_name": "Retirement", "target_amount": 10000000, "saved_amount": 2500000, "monthly_contribution": 20000}],
        investments=[],
        insurance=[],
        subscriptions=[]
    )
    print(f"Weighted Health Score: {rules['financial_health_score']}")
    print(f"Breakdown Details: {rules['financial_health_score_breakdown']}")
    assert rules["financial_health_score"] > 0
    assert "savings" in rules["financial_health_score_breakdown"]
    print("SUCCESS: Business Rule Engine passed.")

    # 4. Test Agent Orchestrator with Recommendation Schema
    print("Testing Agent Orchestrator...")
    orchestrator = AgentOrchestrator()
    dummy_context = {
        "profile": profile,
        "incomes": [],
        "expenses": [],
        "assets": [],
        "liabilities": [],
        "goals": [],
        "investments": [],
        "insurance": [],
        "subscriptions": []
    }
    recs = await orchestrator.orchestrate_agents(intents, dummy_context)
    print(f"Number of generated recommendations: {len(recs)}")
    
    # Assert each recommendation has key schema keys
    for r in recs:
        assert "priority" in r
        assert "category" in r
        assert "confidence" in r
        assert "financialImpact" in r
        assert "recommendation" in r
        assert "reasoning" in r
        assert "supportingCalculations" in r
    
    print("SUCCESS: Agent Orchestrator & Recommendation Schema passed.")

    print("\nSUCCESS: All tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(run_tests())
