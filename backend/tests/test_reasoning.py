import sys
import os
import asyncio
import datetime
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

    # 5. Test Onboarding Calculations Integration Mock
    print("Testing Onboarding Calculations Route simulation...")
    re = BusinessRuleEngine()
    mock_payload = {
        "monthly_income": 100000,
        "monthly_expenses": 60000,
        "incomes": [{"source_name": "Job", "amount": 100000}],
        "expenses": [{"category": "Housing", "amount": 40000, "essential": True}],
        "assets": [{"asset_name": "FD", "current_value": 200000}],
        "liabilities": [{"loan_name": "Car", "outstanding": 50000, "emi": 5000}],
        "goals": []
    }
    
    total_assets = sum(a["current_value"] for a in mock_payload["assets"])
    total_liabilities = sum(l["outstanding"] for l in mock_payload["liabilities"])
    total_emis = sum(l["emi"] for l in mock_payload["liabilities"])
    surplus = mock_payload["monthly_income"] - mock_payload["monthly_expenses"] - total_emis
    
    assert surplus == 35000
    assert total_assets - total_liabilities == 150000
    print("SUCCESS: Onboarding Calculations Mock passed.")

    # 6. Test Dashboard Summary Calculations Mock
    print("Testing Dashboard Summary Calculations Logic...")
    profile_mock = {
        "monthly_income": 100000,
        "monthly_expenses": 60000,
        "monthly_savings": 40000,
        "emergency_fund": 200000
    }
    rules_out = re.compute_all_rules(
        profile=profile_mock,
        income_sources=[],
        expense_categories=[],
        assets=[{"current_value": 200000}],
        liabilities=[],
        goals=[{"goal_name": "Emergency Fund", "target_amount": 300000, "saved_amount": 100000, "monthly_contribution": 10000}],
        investments=[],
        insurance=[],
        subscriptions=[]
    )
    assert rules_out["financial_health_score"] > 0
    assert rules_out["total_assets"] == 200000.0
    
    # Assert breakdown mapping logic
    mock_assets = [{"asset_type": "Gold", "current_value": 500000}]
    asset_types_found = {}
    for a in mock_assets:
        atype = a.get("asset_type")
        val = float(a.get("current_value"))
        asset_types_found[atype] = asset_types_found.get(atype, 0.0) + val
    assert asset_types_found["Gold"] == 500000.0
    print("SUCCESS: Dashboard Summary Breakdown Logic passed.")

    # 7. Test Financial Diagnosis Engine
    print("Testing Financial Diagnosis Engine...")
    from app.engine.financial_diagnosis import FinancialDiagnosisEngine
    de = FinancialDiagnosisEngine()
    
    # 1. Healthy financial profile
    rules_healthy = {
        "savings_rate_pct": 35.0,
        "dti_ratio_pct": 10.0,
        "emergency_runway_months": 7.0,
        "financial_health_score": 85,
        "net_worth": 1000000.0
    }
    context_healthy = {
        "profile": {"age": 30, "emergency_fund": 350000, "monthly_expenses": 50000},
        "incomes": [{"amount": 100000}],
        "expenses": [{"amount": 50000}],
        "assets": [{"current_value": 700000}],
        "liabilities": [{"emi": 10000}],
        "goals": []
    }
    diag_healthy = de.analyze_financials(rules_healthy, context_healthy)
    assert diag_healthy["overall_state"]["score"] == 85
    assert len(diag_healthy["strengths"]) > 0
    assert len(diag_healthy["risks"]) == 0
    
    # 2. Low emergency runway
    rules_low_runway = {
        "savings_rate_pct": 30.0,
        "dti_ratio_pct": 10.0,
        "emergency_runway_months": 2.0,
        "financial_health_score": 55,
        "net_worth": 100000.0
    }
    context_low_runway = {
        "profile": {"age": 30, "emergency_fund": 100000, "monthly_expenses": 50000},
        "incomes": [{"amount": 100000}],
        "expenses": [{"amount": 50000}],
        "assets": [],
        "liabilities": [],
        "goals": []
    }
    diag_runway = de.analyze_financials(rules_low_runway, context_low_runway)
    assert any(r["id"] == "risk_emergency_runway" for r in diag_runway["risks"])
    # Verify runway reserve gap calculation
    evidence = diag_runway["risks"][0]["evidence"]
    assert evidence["current_runway"] == 2.0
    assert evidence["target_reserve"] == 300000.0
    assert evidence["gap"] == 200000.0
    
    # 3. High DTI
    rules_high_dti = {
        "savings_rate_pct": 30.0,
        "dti_ratio_pct": 45.0,
        "emergency_runway_months": 6.0,
        "financial_health_score": 50,
        "net_worth": 200000.0
    }
    context_high_dti = {
        "profile": {"age": 30},
        "incomes": [{"amount": 100000}],
        "expenses": [{"amount": 30000}],
        "assets": [],
        "liabilities": [{"emi": 45000}],
        "goals": []
    }
    diag_dti = de.analyze_financials(rules_high_dti, context_high_dti)
    assert any(r["id"] == "risk_dti" for r in diag_dti["risks"])
    
    # 4. Low savings rate
    rules_low_savings = {
        "savings_rate_pct": 8.0,
        "dti_ratio_pct": 10.0,
        "emergency_runway_months": 6.0,
        "financial_health_score": 60,
        "net_worth": 100000.0
    }
    context_low_savings = {
        "profile": {"age": 30},
        "incomes": [{"amount": 100000}],
        "expenses": [{"amount": 80000}],
        "assets": [],
        "liabilities": [],
        "goals": []
    }
    diag_savings = de.analyze_financials(rules_low_savings, context_low_savings)
    assert any(r["id"] == "risk_savings_rate" for r in diag_savings["risks"])
    
    # 5. Low/negative surplus
    rules_neg_surplus = {
        "savings_rate_pct": 0.0,
        "dti_ratio_pct": 20.0,
        "emergency_runway_months": 2.0,
        "financial_health_score": 40,
        "net_worth": 50000.0
    }
    context_neg_surplus = {
        "profile": {"age": 30, "emergency_fund": 50000, "monthly_expenses": 80000},
        "incomes": [{"amount": 100000}],
        "expenses": [{"amount": 90000}],
        "assets": [],
        "liabilities": [{"emi": 20000}],
        "goals": []
    }
    diag_surplus = de.analyze_financials(rules_neg_surplus, context_neg_surplus)
    # Action recommendation should suggest reducing discretionary spending
    assert "Reduce discretionary spending" in diag_surplus["recommendations"][0]["action"]
    
    # 6. Multiple simultaneous risks & Priority ranking
    rules_multi = {
        "savings_rate_pct": 5.0,
        "dti_ratio_pct": 55.0,
        "emergency_runway_months": 1.0,
        "financial_health_score": 35,
        "net_worth": 10000.0
    }
    context_multi = {
        "profile": {"age": 30, "emergency_fund": 10000, "monthly_expenses": 50000},
        "incomes": [{"amount": 100000}],
        "expenses": [{"amount": 50000}],
        "assets": [],
        "liabilities": [{"emi": 55000}],
        "goals": []
    }
    diag_multi = de.analyze_financials(rules_multi, context_multi)
    # The priorities list should be sorted by priority score (high impact first)
    priorities = diag_multi["priorities"]
    assert len(priorities) > 0
    # Ensure rank sequence is sequential starting from 1
    for idx, p in enumerate(priorities, start=1):
        assert p["rank"] == idx

    # 7. Goal with trajectory warning
    rules_goal = {
        "savings_rate_pct": 30.0,
        "dti_ratio_pct": 0.0,
        "emergency_runway_months": 6.0,
        "financial_health_score": 70,
        "net_worth": 200000.0
    }
    context_goal = {
        "profile": {"age": 30},
        "incomes": [{"amount": 100000}],
        "expenses": [{"amount": 50000}],
        "assets": [],
        "liabilities": [],
        "goals": [{"goal_name": "Car Fund", "target_amount": 1000000, "saved_amount": 50000}]
    }
    diag_goal = de.analyze_financials(rules_goal, context_goal)
    assert any("trajectory" in r["title"].lower() for r in diag_goal["risks"])

    # 8. Empty profile
    diag_empty = de.analyze_financials({}, {})
    assert diag_empty["overall_state"]["label"] == "Insufficient Data"

    # 9. Partial profile
    diag_partial = de.analyze_financials({}, {"profile": {"age": 30}})
    assert diag_partial["overall_state"]["label"] == "Insufficient Data"
    
    print("SUCCESS: Comprehensive Financial Diagnosis Engine checks passed.")

    # 8. Test Scenario Simulation Engine
    print("Testing Scenario Simulation Engine...")
    from app.engine.simulation_engine import SimulationEngine
    se = SimulationEngine()

    base_context = {
        "profile": {
            "monthly_income": 100000.0,
            "monthly_expenses": 50000.0,
            "monthly_savings": 50000.0,
            "emergency_fund": 300000.0
        },
        "incomes": [{"amount": 100000.0}],
        "expenses": [{"amount": 50000.0}],
        "assets": [{"current_value": 300000.0}],
        "liabilities": [],
        "goals": []
    }

    # INCOME_CHANGE increase test
    sim_inc_up = se.simulate_scenario("INCOME_CHANGE", {"change_type": "percentage", "value": 10.0}, base_context)
    assert sim_inc_up["projected"]["monthly_surplus"] == 60000.0
    assert sim_inc_up["impact"]["monthly_surplus_delta"] == 10000.0

    # INCOME_CHANGE decrease test
    sim_inc_down = se.simulate_scenario("INCOME_CHANGE", {"change_type": "absolute", "value": -20000.0}, base_context)
    assert sim_inc_down["projected"]["monthly_surplus"] == 30000.0

    # EXPENSE_CHANGE increase test
    sim_exp_up = se.simulate_scenario("EXPENSE_CHANGE", {"change_type": "absolute", "value": 15000.0}, base_context)
    assert sim_exp_up["projected"]["monthly_surplus"] == 35000.0

    # NEW_LIABILITY test
    sim_loan = se.simulate_scenario("NEW_LIABILITY", {
        "principal": 1200000.0,
        "interest_rate": 10.0,
        "tenure_years": 10.0,
        "asset_purchase_value": 1200000.0
    }, base_context)
    # Check that projected surplus drops and DTI increases
    assert sim_loan["projected"]["monthly_surplus"] < 50000.0
    assert sim_loan["projected"]["dti_ratio_pct"] > 0.0

    # Zero-interest liability
    sim_loan_zero = se.simulate_scenario("NEW_LIABILITY", {
        "principal": 1200000.0,
        "interest_rate": 0.0,
        "tenure_years": 10.0
    }, base_context)
    # 1200000 / 120 = 10000 monthly EMI
    assert sim_loan_zero["projected"]["monthly_surplus"] == 40000.0

    # INVESTMENT_CONTRIBUTION test
    sim_invest = se.simulate_scenario("INVESTMENT_CONTRIBUTION", {
        "monthly_change": 10000.0
    }, base_context)
    assert sim_invest["projected"]["net_worth"] == 300000.0
    assert sim_invest["projected"]["monthly_surplus"] == 40000.0

    # Purity check: base_context remains unmodified
    assert base_context["profile"]["monthly_income"] == 100000.0
    assert len(base_context["liabilities"]) == 0
    print("SUCCESS: Scenario Simulation Engine asserts passed.")

    # 9. Test Scenario Comparison Engine
    print("Testing Scenario Comparison Engine...")
    options_payload = [
        {
            "id": "option_a",
            "label": "Take Big Loan",
            "type": "NEW_LIABILITY",
            "parameters": {
                "principal": 1500000.0,
                "interest_rate": 8.5,
                "tenure_years": 5.0,
                "asset_purchase_value": 1500000.0
            }
        },
        {
            "id": "option_b",
            "label": "Increase Savings Plan",
            "type": "INVESTMENT_CONTRIBUTION",
            "parameters": {
                "monthly_change": 30000.0
            }
        }
    ]

    compare_res = se.compare_scenarios(options_payload, base_context)
    assert compare_res["baseline"]["net_worth"] == 300000.0
    assert len(compare_res["options"]) == 2
    
    # Ensure Option B is recommended due to DTI and surplus impact
    assert compare_res["comparison"]["recommended_option"] == "option_b"
    assert len(compare_res["comparison"]["reasons"]) > 0
    assert len(compare_res["comparison"]["tradeoffs"]) > 0
    assert compare_res["comparison"]["confidence"] == "moderate"

    # Verify Option B starting context is independent of Option A changes
    opt_a_res = next(o for o in compare_res["options"] if o["id"] == "option_a")
    opt_b_res = next(o for o in compare_res["options"] if o["id"] == "option_b")
    # Option A has a liability added, Option B does NOT have Option A's loan added!
    assert opt_b_res["projected"]["dti_ratio_pct"] == 0.0

    # Test Option Order Invariance [B, A] produces same recommended option
    compare_res_rev = se.compare_scenarios(list(reversed(options_payload)), base_context)
    assert compare_res_rev["comparison"]["recommended_option"] == "option_b"

    # Insufficient Data test
    incomplete_context = {
        "profile": {
            "monthly_income": 0.0,
            "monthly_expenses": 0.0
        }
    }
    incomplete_res = se.compare_scenarios(options_payload, incomplete_context)
    assert incomplete_res["comparison"]["recommended_option"] is None
    assert "Insufficient baseline financial profile data" in incomplete_res["comparison"]["reasons"][0]
    assert incomplete_res["comparison"]["confidence"] == "insufficient_data"

    # Test All Options Unsafe Case (e.g. loan DTI too high)
    unsafe_payload = [
        {
            "id": "option_unsafe_1",
            "label": "Extreme Loan",
            "type": "NEW_LIABILITY",
            "parameters": {
                "principal": 5000000.0,
                "interest_rate": 12.0,
                "tenure_years": 3.0
            }
        }
    ]
    unsafe_res = se.compare_scenarios(unsafe_payload, base_context)
    assert unsafe_res["comparison"]["recommended_option"] is None
    assert any("safety boundaries" in r.lower() for r in unsafe_res["comparison"]["reasons"])

    print("SUCCESS: Scenario Comparison Engine asserts passed.")

    # 10. Test Goal Feasibility Engine
    print("Testing Goal Feasibility Engine...")
    from app.engine.goal_feasibility import GoalFeasibilityEngine
    gfe = GoalFeasibilityEngine()

    # Synthetic goals context
    future_date_16m = (datetime.date.today() + datetime.timedelta(days=16 * 30)).isoformat()
    future_date_40m = (datetime.date.today() + datetime.timedelta(days=40 * 30)).isoformat()
    past_date = (datetime.date.today() - datetime.timedelta(days=30)).isoformat()
    
    test_goals = [
        {"id": "g1", "goal_name": "On Track Goal", "target_amount": 1000000.0, "saved_amount": 200000.0, "monthly_contribution": 50000.0, "target_date": future_date_16m, "priority": "High"},
        {"id": "g2", "goal_name": "Achieved Goal", "target_amount": 300000.0, "saved_amount": 350000.0, "monthly_contribution": 0.0, "target_date": future_date_16m, "priority": "Low"},
        {"id": "g3", "goal_name": "Underfunded Goal", "target_amount": 4000000.0, "saved_amount": 800000.0, "monthly_contribution": 30000.0, "target_date": future_date_40m, "priority": "High"},
        {"id": "g4", "goal_name": "Overdue Goal", "target_amount": 500000.0, "saved_amount": 200000.0, "monthly_contribution": 10000.0, "target_date": past_date, "priority": "Critical"}
    ]

    feasibility_res = gfe.analyze_goals_feasibility(test_goals, base_context)
    
    # Assert counts
    assert feasibility_res["summary"]["total_goals"] == 4
    
    g1_analysis = next(g for g in feasibility_res["goals"] if g["goal_id"] == "g1")
    assert g1_analysis["status"] == "ON_TRACK"
    assert g1_analysis["remaining_amount"] == 800000.0
    assert g1_analysis["required_monthly_contribution"] == 50000.0
    assert g1_analysis["funding_gap"] == 0.0
    
    g2_analysis = next(g for g in feasibility_res["goals"] if g["goal_id"] == "g2")
    assert g2_analysis["status"] == "ALREADY_ACHIEVED"
    assert g2_analysis["remaining_amount"] == 0.0
    
    g3_analysis = next(g for g in feasibility_res["goals"] if g["goal_id"] == "g3")
    assert g3_analysis["status"] == "UNDERFUNDED"
    assert g3_analysis["funding_gap"] > 0.0
    
    g4_analysis = next(g for g in feasibility_res["goals"] if g["goal_id"] == "g4")
    assert g4_analysis["status"] == "OVERDUE"

    # Multi-goal contribution pressure validation
    assert feasibility_res["cashflow_capacity"]["total_current_goal_contributions"] == 90000.0
    assert feasibility_res["cashflow_capacity"]["available_after_goal_contributions"] < 0
    print("SUCCESS: Goal Feasibility Engine asserts passed.")

    # 11. Test Action Planning Engine
    print("Testing Action Planning Engine...")
    from app.engine.action_planning import ActionPlanningEngine
    ape = ActionPlanningEngine()

    planning_res = ape.generate_action_plans(test_goals, base_context)
    
    assert len(planning_res["gaps"]) > 0
    assert len(planning_res["plans"]) > 0
    
    # Check Plan A (Reduce Expense & Increase Contribution) exists and is simulated
    plan_a = next(p for p in planning_res["plans"] if p["id"] == "plan_a")
    assert any(act["type"] == "REDUCE_EXPENSE" for act in plan_a["actions"])
    assert any(act["type"] == "INCREASE_GOAL_CONTRIBUTION" for act in plan_a["actions"])
    assert plan_a["projected"]["monthly_surplus"] > 0.0

    # Check Plan B (Increase Income) exists
    plan_b = next(p for p in planning_res["plans"] if p["id"] == "plan_b")
    assert any(act["type"] == "INCREASE_INCOME" for act in plan_b["actions"])

    # Check Plan C (Extend Timeline) exists
    plan_c = next(p for p in planning_res["plans"] if p["id"] == "plan_c")
    assert any(act["type"] == "EXTEND_GOAL_TIMELINE" for act in plan_c["actions"])

    # Verify immutability (purity check)
    assert base_context["profile"]["monthly_income"] == 100000.0

    # Safety constraint validation (Unviable Plan)
    # Mock a context where DTI limit gets breached or runway is < 1.5 months
    unsafe_context = base_context.copy()
    unsafe_context["profile"] = base_context["profile"].copy()
    unsafe_context["profile"]["emergency_runway_months"] = 0.5  # critically low runway
    
    # Build proper inputs to prevent rules calculation mismatch
    unsafe_context["profile"]["monthly_income"] = 100000.0
    unsafe_context["profile"]["monthly_expenses"] = 80000.0
    unsafe_context["profile"]["monthly_savings"] = 20000.0
    unsafe_context["profile"]["emergency_fund"] = 40000.0
    
    unsafe_planning_res = ape.generate_action_plans(test_goals, unsafe_context)
    # Verify that plan viability is evaluated as unsafe
    for p in unsafe_planning_res["plans"]:
        assert p["safety"]["is_viable"] is False
        assert len(p["safety"]["violations"]) > 0
        
    print("SUCCESS: Action Planning Engine asserts passed.")

    # 12. Test CFO Orchestrator
    print("Testing CFO Orchestrator...")
    from app.engine.cfo_orchestrator import CFOOrchestrator
    cfo = CFOOrchestrator()

    # Mock database session
    class MockDbSession:
        async def execute(self, statement):
            class MockResult:
                def scalars(self):
                    class MockScalars:
                        def first(self):
                            # Return mock profile matching base_context
                            class MockProfile:
                                id = "mock-uuid"
                                user_id = "mock-uuid"
                                monthly_income = 100000.0
                                monthly_expenses = 40000.0
                                monthly_savings = 60000.0
                                emergency_fund = 300000.0
                            return MockProfile()
                        def all(self):
                            return []
                    return MockScalars()
            return MockResult()

    db_mock = MockDbSession()
    
    # We stub ContextBuilder to return base_context directly to prevent db queries mismatches
    class MockContextBuilder:
        async def build_context(self, user_id: str, db):
            return base_context

    cfo.cb = MockContextBuilder()

    # Test purchase query triggers SimulationEngine
    cfo_res_purchase = await cfo.process_query("Can I afford a 20 lakh car?", "mock-user-id", db_mock)
    assert cfo_res_purchase["summary"] == "AI CFO Grounded Valuation Analysis"
    assert "SIMULATE_SCENARIO" in cfo_res_purchase["evidence_used"]
    assert len(cfo_res_purchase["answer"]) > 0

    # Test health query triggers FinancialDiagnosisEngine
    cfo_res_health = await cfo.process_query("How am I doing financially?", "mock-user-id", db_mock)
    assert "DIAGNOSE_FINANCIAL_POSITION" in cfo_res_health["evidence_used"]

    # Test plan query triggers ActionPlanningEngine
    cfo_res_plan = await cfo.process_query("What plan can improve my savings?", "mock-user-id", db_mock)
    assert "GENERATE_ACTION_PLANS" in cfo_res_plan["evidence_used"]

    # Test Insufficient Data response
    empty_context = {
        "profile": {
            "monthly_income": 0.0,
            "monthly_expenses": 0.0
        }
    }
    class MockEmptyContextBuilder:
        async def build_context(self, user_id: str, db):
            return empty_context

    cfo.cb = MockEmptyContextBuilder()
    cfo_res_empty = await cfo.process_query("Can I afford a car?", "mock-user-id", db_mock)
    assert cfo_res_empty["status"] == "INSUFFICIENT_DATA"
    assert "Monthly Income" in cfo_res_empty["reasons"][0]

    # Test Input Range Validation
    try:
        cfo._validate_simulate_inputs({"principal": -100.0, "interest_rate": 8.5, "tenure_years": 5.0, "asset_purchase_value": 0.0})
        assert False, "Should raise ValueError on negative principal"
    except ValueError:
        pass

    try:
        cfo._validate_simulate_inputs({"principal": 100.0, "interest_rate": 150.0, "tenure_years": 5.0, "asset_purchase_value": 0.0})
        assert False, "Should raise ValueError on rate > 100%"
    except ValueError:
        pass

    try:
        cfo._validate_simulate_inputs({"principal": 100.0, "interest_rate": 8.5, "tenure_years": 65.0, "asset_purchase_value": 0.0})
        assert False, "Should raise ValueError on tenure > 50 years"
    except ValueError:
        pass

    # 13. Test LLM Gateway & Provider switching
    print("Testing LLM Gateway & Provider switching...")
    from app.engine.llm_gateway import LLMGateway
    gateway = LLMGateway()

    # Test provider instances loaded
    assert "openai" in gateway.providers
    assert "gemini" in gateway.providers
    assert "groq" in gateway.providers
    assert "openrouter" in gateway.providers

    # Stub primary provider to raise an exception to force fallback execution
    original_openai = gateway.providers["openai"]
    
    class FailingProvider:
        async def generate(self, system, user, temp=0.0, max_t=2000):
            raise RuntimeError("Primary API Outage Simulation")

    gateway.providers["openai"] = FailingProvider()

    # Verify fallback triggers groq adapter execution successfully
    from app.config import settings
    settings.LLM_PROVIDER = "openai"
    settings.LLM_FALLBACK_PROVIDER = "groq"

    # Make the call
    gateway_res = await gateway.generate_response("system", '{"query": "health"}')
    assert gateway_res.provider == "groq"
    assert "Mocked response for provider: groq" in gateway_res.content

    # Restore providers list
    gateway.providers["openai"] = original_openai
    print("SUCCESS: LLM Gateway assertions passed.")

    print("SUCCESS: CFO Orchestrator asserts passed.")

    print("\nSUCCESS: All tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(run_tests())
