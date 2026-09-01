import datetime
from decimal import Decimal
from typing import Dict, Any, List
from app.engine.rules_engine import BusinessRuleEngine

class GoalFeasibilityEngine:
    """
    Deterministically evaluates user goals against current cash-flow capacity and safety limits.
    Projections are strictly contribution-only, with no assumed market returns or CAGR.
    """

    def analyze_goals_feasibility(
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

        # Re-use rules engine calculations to preserve calculation consistency
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

        # Baseline Cashflow Capacity
        base_income = sum(float(i.get("amount", 0)) for i in incomes)
        base_expenses = sum(float(e.get("amount", 0)) for e in expenses)
        base_emi = sum(float(l.get("emi", 0)) for l in liabilities)
        available_surplus = round(base_income - base_expenses - base_emi, 2)

        # Basic summaries
        total_goals = len(goals)
        on_track_count = 0
        at_risk_count = 0
        underfunded_count = 0
        insufficient_data_count = 0
        already_achieved_count = 0
        overdue_count = 0

        analyzed_goals = []
        total_current_goal_contributions = 0.0

        today = datetime.date.today()

        for g in goals:
            g_id = str(g.get("id", ""))
            g_name = g.get("goal_name", "Financial Goal")
            target_amount = float(g.get("target_amount", 0.0))
            saved_amount = float(g.get("saved_amount", 0.0))
            current_contrib = float(g.get("monthly_contribution", 0.0))
            priority = g.get("priority", "Medium")

            total_current_goal_contributions += current_contrib

            # 1. Target Date Handling
            target_date_raw = g.get("target_date")
            target_date = None
            if target_date_raw:
                try:
                    if isinstance(target_date_raw, (datetime.datetime, datetime.date)):
                        target_date = target_date_raw
                        if isinstance(target_date, datetime.datetime):
                            target_date = target_date.date()
                    else:
                        # ISO date parsing
                        target_date = datetime.date.fromisoformat(str(target_date_raw).split("T")[0])
                except Exception:
                    target_date = None

            # 2. Check Insufficient Data
            if target_amount <= 0.0 or not target_date:
                insufficient_data_count += 1
                analyzed_goals.append({
                    "goal_id": g_id,
                    "goal_name": g_name,
                    "target_amount": target_amount,
                    "saved_amount": saved_amount,
                    "status": "INSUFFICIENT_DATA",
                    "reasons": ["Goal target amount or target date is missing or invalid."]
                })
                continue

            # Target date evaluation
            remaining_amount = max(target_amount - saved_amount, 0.0)

            # Months calculation
            if target_date <= today:
                months_remaining = 0
            else:
                months_remaining = (target_date.year - today.year) * 12 + (target_date.month - today.month)
                if months_remaining <= 0:
                    months_remaining = 1

            # Required contribution calculation
            if months_remaining > 0:
                required_contrib = remaining_amount / months_remaining
            else:
                required_contrib = remaining_amount

            # Contribution-only projection
            projected_amount = saved_amount + (current_contrib * months_remaining)
            funding_gap = max(target_amount - projected_amount, 0.0)

            # Affordability & safety checks
            cashflow_affordable = required_contrib <= available_surplus
            mathematically_feasible = (projected_amount >= target_amount) or cashflow_affordable

            # Financial safety checks
            emergency_runway = baseline_rules["emergency_runway_months"]
            dti = baseline_rules["dti_ratio_pct"]
            financially_safe = (emergency_runway >= 3.0) and (dti <= 35.0) and (available_surplus - required_contrib >= 5000.0)

            # Status logic
            reasons = []
            if saved_amount >= target_amount:
                status = "ALREADY_ACHIEVED"
                already_achieved_count += 1
                reasons.append("Goal target amount has been successfully achieved.")
            elif target_date <= today:
                status = "OVERDUE"
                overdue_count += 1
                reasons.append("Target date has already passed, but the goal remains uncompleted.")
            elif projected_amount >= target_amount:
                status = "ON_TRACK"
                on_track_count += 1
                reasons.append("Current contribution rate is sufficient to fund the goal by the target date.")
            elif cashflow_affordable:
                status = "AT_RISK"
                at_risk_count += 1
                reasons.append("Goal is at risk because current monthly contribution is below the required rate, though it remains affordable within your surplus cash flow.")
            else:
                status = "UNDERFUNDED"
                underfunded_count += 1
                reasons.append("Goal is underfunded. Current contributions produce a shortfall, and the required monthly contribution exceeds your available cash flow surplus.")

            if not cashflow_affordable and status != "ALREADY_ACHIEVED":
                reasons.append(f"Required contribution of ₹{required_contrib:,.2f}/mo exceeds available cash flow surplus of ₹{available_surplus:,.2f}/mo.")

            if not financially_safe and status in ["ON_TRACK", "AT_RISK"]:
                reasons.append("Pursuing this goal at the required rate may cause financial stress due to tight liquidity runway or high debt-to-income (DTI) obligations.")

            analyzed_goals.append({
                "goal_id": g_id,
                "goal_name": g_name,
                "target_amount": target_amount,
                "saved_amount": saved_amount,
                "remaining_amount": remaining_amount,
                "target_date": target_date.isoformat(),
                "months_remaining": months_remaining,
                "current_monthly_contribution": current_contrib,
                "required_monthly_contribution": round(required_contrib, 2),
                "projected_amount": projected_amount,
                "funding_gap": funding_gap,
                "projection_method": "contribution_only",
                "inflation_method": "nominal_values_only",
                "priority": priority,
                "feasibility": {
                    "mathematically_feasible": mathematically_feasible,
                    "cashflow_affordable": cashflow_affordable,
                    "financially_safe": financially_safe
                },
                "status": status,
                "reasons": reasons
            })

        # Calculate surplus after contributions
        available_after_contributions = round(available_surplus - total_current_goal_contributions, 2)

        return {
            "summary": {
                "total_goals": total_goals,
                "on_track": on_track_count,
                "at_risk": at_risk_count,
                "underfunded": underfunded_count,
                "already_achieved": already_achieved_count,
                "overdue": overdue_count,
                "insufficient_data": insufficient_data_count
            },
            "cashflow_capacity": {
                "monthly_surplus": available_surplus,
                "total_current_goal_contributions": total_current_goal_contributions,
                "available_after_goal_contributions": available_after_contributions
            },
            "goals": analyzed_goals
        }
