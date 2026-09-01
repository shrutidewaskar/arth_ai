import datetime
import math
from typing import Dict, Any, List
from app.engine.rules_engine import BusinessRuleEngine
from app.engine.goal_feasibility import GoalFeasibilityEngine

class ActionPlanningEngine:
    """
    Orchestrates deterministic action planning over existing ContextBuilder,
    BusinessRuleEngine, GoalFeasibilityEngine, and SimulationEngine concepts.
    Produces structured plans and trade-offs.
    """

    def generate_action_plans(
        self,
        goals: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        profile = context.get("profile", {})
        incomes = context.get("incomes", [])
        expenses = context.get("expenses", [])
        assets = context.get("assets", [])
        liabilities = context.get("liabilities", [])
        investments = context.get("investments", [])
        insurance = context.get("insurance", [])
        subscriptions = context.get("subscriptions", [])

        # Step 1: Run Goal Feasibility to discover baseline state and gaps
        gfe = GoalFeasibilityEngine()
        feasibility_res = gfe.analyze_goals_feasibility(goals, context)

        base_income = sum(float(i.get("amount", 0)) for i in incomes)
        base_expenses = sum(float(e.get("amount", 0)) for e in expenses)
        base_emi = sum(float(l.get("emi", 0)) for l in liabilities)
        available_surplus = round(base_income - base_expenses - base_emi, 2)

        # Baseline metrics from rules engine to output in API response
        re = BusinessRuleEngine()
        profile_in = {
            "monthly_income": float(profile.get("monthly_income", 0.0)),
            "monthly_expenses": float(profile.get("monthly_expenses", 0.0)),
            "monthly_savings": float(profile.get("monthly_savings", 0.0)),
            "emergency_fund": float(profile.get("emergency_fund", 0.0))
        }

        baseline_rules = re.compute_all_rules(
            profile=profile_in,
            income_sources=incomes,
            expense_categories=expenses,
            assets=assets,
            liabilities=liabilities,
            goals=goals,
            investments=investments,
            insurance=insurance,
            subscriptions=subscriptions
        )

        gaps = []
        underfunded_goals = []
        for fg in feasibility_res["goals"]:
            if fg["status"] in ["UNDERFUNDED", "AT_RISK", "OVERDUE"]:
                underfunded_goals.append(fg)
                gaps.append({
                    "goal_id": fg["goal_id"],
                    "goal_name": fg["goal_name"],
                    "type": "FUNDING_GAP",
                    "amount": fg["funding_gap"],
                    "severity": "high" if fg["status"] in ["UNDERFUNDED", "OVERDUE"] else "medium"
                })

        plans = []
        today = datetime.date.today()

        # Step 2: Candidate Plans Generation (Only if there are underfunded goals or budget pressure)
        if len(underfunded_goals) > 0:
            primary_goal = underfunded_goals[0]
            g_id = primary_goal["goal_id"]
            g_name = primary_goal["goal_name"]
            gap_amount = primary_goal["funding_gap"]
            remaining_amt = primary_goal["remaining_amount"]
            current_contrib = primary_goal["current_monthly_contribution"]

            # Plan A: Reduce Expenses + Increase Contribution
            expense_reduction = min(gap_amount / 2.0, available_surplus * 0.15, base_expenses * 0.10)
            expense_reduction = round(expense_reduction, 2)
            contrib_increase = round(gap_amount - expense_reduction, 2)

            plan_a_actions = []
            if expense_reduction > 0:
                plan_a_actions.append({"type": "REDUCE_EXPENSE", "amount": expense_reduction})
            if contrib_increase > 0:
                plan_a_actions.append({"type": "INCREASE_GOAL_CONTRIBUTION", "amount": contrib_increase, "goal_id": g_id})

            # Simulate Plan A
            sim_a_incomes = incomes.copy()
            sim_a_expenses = [e.copy() for e in expenses]
            if expense_reduction > 0 and len(sim_a_expenses) > 0:
                # Distribute expense reduction across active categories
                reduction_share = expense_reduction / len(sim_a_expenses)
                for e in sim_a_expenses:
                    e["amount"] = max(0.0, float(e.get("amount", 0.0)) - reduction_share)

            sim_a_profile = profile_in.copy()
            sim_a_profile["monthly_expenses"] = max(0.0, float(sim_a_profile["monthly_expenses"]) - expense_reduction)
            sim_a_profile["monthly_savings"] = max(0.0, float(sim_a_profile["monthly_income"]) - sim_a_profile["monthly_expenses"])

            # Mutate goal contribution in simulation payload
            sim_a_goals = [g.copy() for g in goals]
            for sg in sim_a_goals:
                if str(sg.get("id")) == g_id:
                    sg["monthly_contribution"] = float(sg.get("monthly_contribution", 0.0)) + contrib_increase

            rules_a = re.compute_all_rules(
                profile=sim_a_profile,
                income_sources=sim_a_incomes,
                expense_categories=sim_a_expenses,
                assets=assets,
                liabilities=liabilities,
                goals=sim_a_goals,
                investments=investments,
                insurance=insurance,
                subscriptions=subscriptions
            )

            # Plan B: Increase Income
            plan_b_actions = [{"type": "INCREASE_INCOME", "amount": gap_amount}]
            sim_b_profile = profile_in.copy()
            sim_b_profile["monthly_income"] = float(sim_b_profile["monthly_income"]) + gap_amount
            sim_b_profile["monthly_savings"] = max(0.0, float(sim_b_profile["monthly_income"]) - sim_b_profile["monthly_expenses"])

            sim_b_goals = [g.copy() for g in goals]
            for sg in sim_b_goals:
                if str(sg.get("id")) == g_id:
                    sg["monthly_contribution"] = float(sg.get("monthly_contribution", 0.0)) + gap_amount

            rules_b = re.compute_all_rules(
                profile=sim_b_profile,
                income_sources=incomes,
                expense_categories=expenses,
                assets=assets,
                liabilities=liabilities,
                goals=sim_b_goals,
                investments=investments,
                insurance=insurance,
                subscriptions=subscriptions
            )

            # Plan C: Extend Target Date
            target_amount = primary_goal["target_amount"]
            saved_amount = primary_goal["saved_amount"]
            active_contrib = max(current_contrib, available_surplus * 0.1, 1000.0)
            months_needed = math.ceil((target_amount - saved_amount) / active_contrib)
            extended_date = today + datetime.timedelta(days=months_needed * 30.5)

            plan_c_actions = [{"type": "EXTEND_GOAL_TIMELINE", "months": months_needed, "goal_id": g_id, "extended_date": extended_date.isoformat()}]
            sim_c_goals = [g.copy() for g in goals]
            for sg in sim_c_goals:
                if str(sg.get("id")) == g_id:
                    sg["target_date"] = extended_date.isoformat()

            rules_c = re.compute_all_rules(
                profile=profile_in,
                income_sources=incomes,
                expense_categories=expenses,
                assets=assets,
                liabilities=liabilities,
                goals=sim_c_goals,
                investments=investments,
                insurance=insurance,
                subscriptions=subscriptions
            )

            # Package and evaluate Plan A, B, C
            candidate_plans = [
                {
                    "id": "plan_a",
                    "label": "Expense Reduction & Optimized Contributions",
                    "actions": plan_a_actions,
                    "rules": rules_a,
                    "tradeoffs": [
                        "Requires immediate budget discipline with a monthly reduction of ₹{:.2f} in discretionary spending.".format(expense_reduction),
                        "Achieves target date on schedule without requiring salary adjustments or new debt."
                    ]
                },
                {
                    "id": "plan_b",
                    "label": "Income Adjustments Target",
                    "actions": plan_b_actions,
                    "rules": rules_b,
                    "tradeoffs": [
                        "Avoids spending cuts but relies on securing an additional ₹{:.2f}/mo in monthly gross capacity (new gigs or promotions).".format(gap_amount),
                        "Fully secures goals timeline on schedule."
                    ]
                },
                {
                    "id": "plan_c",
                    "label": "Extend Milestone Target Timeline",
                    "actions": plan_c_actions,
                    "rules": rules_c,
                    "tradeoffs": [
                        "Avoids changing monthly budgets or cutting expenses.",
                        "Delays milestone target completion date to {} ({} months remaining).".format(extended_date.strftime("%B %Y"), months_needed)
                    ]
                }
            ]

            # Step 3: Run Safety Gating and Preference Ranking
            for p in candidate_plans:
                rules = p["rules"]
                proj_surplus = float(rules["net_worth"]) # dummy check or compute actual
                
                # Re-calculate projected surplus
                p_income = float(rules["total_assets"]) # mapping
                p_surplus = float(sim_a_profile["monthly_savings"]) if p["id"] == "plan_a" else (float(sim_b_profile["monthly_savings"]) if p["id"] == "plan_b" else float(profile_in["monthly_savings"]))
                
                dti_ratio = rules["dti_ratio_pct"]
                runway = rules["emergency_runway_months"]

                is_viable = True
                violations = []

                if dti_ratio > 45.0:
                    is_viable = False
                    violations.append("DTI ratio exceeds safety gates (>45%).")
                if runway < 1.5:
                    is_viable = False
                    violations.append("Liquidity runway falls below minimum threshold (<1.5 months).")
                if p_surplus < 0.0:
                    is_viable = False
                    violations.append("Outflows exceed inflows resulting in recurring cash deficits.")

                p["safety"] = {
                    "is_viable": is_viable,
                    "violations": violations
                }

                # Preference Score calculations matching Decision Engine
                health_delta = rules["financial_health_score"] - baseline_rules["financial_health_score"]
                surplus_delta = p_surplus - available_surplus
                surplus_delta_pct = (surplus_delta / max(1.0, base_income)) * 100.0

                dti_delta = dti_ratio - baseline_rules["dti_ratio_pct"]
                runway_delta = runway - baseline_rules["emergency_runway_months"]

                p["score"] = (health_delta * 2.0) + (surplus_delta_pct * 1.5) + (-dti_delta * 1.2) + (runway_delta * 4.0)
                p["projected"] = {
                    "monthly_surplus": round(p_surplus, 2),
                    "dti_ratio_pct": round(dti_ratio, 2),
                    "emergency_runway_months": round(runway, 2),
                    "financial_health_score": rules["financial_health_score"]
                }
                del p["rules"] # delete rules helper from output

            # Sort viable plans first, then by score descending
            viable_plans = [p for p in candidate_plans if p["safety"]["is_viable"]]
            unviable_plans = [p for p in candidate_plans if not p["safety"]["is_viable"]]
            
            viable_plans.sort(key=lambda x: x["score"], reverse=True)
            ranked_plans = viable_plans + unviable_plans
            plans = ranked_plans

        # Step 4: Final Recommendation selection
        recommended_plan_id = None
        reasons = []
        if len(plans) > 0 and plans[0]["safety"]["is_viable"]:
            recommended_plan_id = plans[0]["id"]
            reasons.append("Highest-ranked viable plan under the current cash-flow model.")
            reasons.append("Closes the current goal funding gaps without breaching debt or emergency buffer levels.")
        else:
            reasons.append("No viable plans could be determined that satisfy baseline safety limits. Consider reducing milestone targets.")

        return {
            "baseline": {
                "monthly_income": base_income,
                "monthly_surplus": available_surplus,
                "emergency_runway_months": baseline_rules["emergency_runway_months"],
                "dti_ratio_pct": baseline_rules["dti_ratio_pct"],
                "financial_health_score": baseline_rules["financial_health_score"]
            },
            "gaps": gaps,
            "plans": plans,
            "recommendation": {
                "plan_id": recommended_plan_id,
                "confidence": "moderate" if len(gaps) > 0 else "high",
                "reasons": reasons
            }
        }
