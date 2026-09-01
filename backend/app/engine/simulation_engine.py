import copy
from decimal import Decimal
from typing import Dict, Any, List
from app.engine.rules_engine import BusinessRuleEngine
from app.engine.financial_diagnosis import FinancialDiagnosisEngine

class SimulationEngine:
    """
    Simulates specific financial scenarios and compares multiple options against the baseline.
    This simulation is PURE and does NOT mutate any database records.
    """

    def simulate_scenario(
        self,
        scenario_type: str,
        inputs: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        # 1. Deep copy the context to guarantee immutability/no DB mutation
        temp_context = copy.deepcopy(context)
        
        profile = temp_context.get("profile", {})
        incomes = temp_context.get("incomes", [])
        expenses = temp_context.get("expenses", [])
        assets = temp_context.get("assets", [])
        liabilities = temp_context.get("liabilities", [])
        goals = temp_context.get("goals", [])
        investments = temp_context.get("investments", [])
        insurance = temp_context.get("insurance", [])
        subscriptions = temp_context.get("subscriptions", [])

        # Ensure baseline profile defaults are populated to prevent crashes
        profile_in = {
            "monthly_income": float(profile.get("monthly_income", 0.0)),
            "monthly_expenses": float(profile.get("monthly_expenses", 0.0)),
            "monthly_savings": float(profile.get("monthly_savings", 0.0)),
            "emergency_fund": float(profile.get("emergency_fund", 0.0))
        }

        re = BusinessRuleEngine()
        de = FinancialDiagnosisEngine()

        # 2. Compute Baseline Rules
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

        # Baseline Cashflow Sums
        base_income = sum(float(i.get("amount", 0)) for i in incomes)
        base_expenses = sum(float(e.get("amount", 0)) for e in expenses)
        base_emi = sum(float(l.get("emi", 0)) for l in liabilities)
        base_surplus = base_income - base_expenses - base_emi

        # 3. Apply Scenario to Temporary Context
        projected_profile = profile_in.copy()
        warnings = []
        verdict_summary = ""

        # Validate inputs
        if scenario_type == "INCOME_CHANGE":
            change_type = inputs.get("change_type", "absolute")
            val = float(inputs.get("value", 0.0))
            if change_type == "percentage":
                new_inc = projected_profile["monthly_income"] * (1.0 + (val / 100.0))
            else:
                new_inc = projected_profile["monthly_income"] + val
            projected_profile["monthly_income"] = max(0.0, new_inc)
            projected_profile["monthly_savings"] = max(0.0, projected_profile["monthly_income"] - projected_profile["monthly_expenses"])
            verdict_summary = f"Simulated monthly income adjusted to ₹{projected_profile['monthly_income']:,.2f}."

        elif scenario_type == "EXPENSE_CHANGE":
            change_type = inputs.get("change_type", "absolute")
            val = float(inputs.get("value", 0.0))
            if change_type == "percentage":
                new_exp = projected_profile["monthly_expenses"] * (1.0 + (val / 100.0))
            else:
                new_exp = projected_profile["monthly_expenses"] + val
            projected_profile["monthly_expenses"] = max(0.0, new_exp)
            projected_profile["monthly_savings"] = max(0.0, projected_profile["monthly_income"] - projected_profile["monthly_expenses"])
            verdict_summary = f"Simulated monthly expenses adjusted to ₹{projected_profile['monthly_expenses']:,.2f}."

        elif scenario_type == "NEW_LIABILITY":
            principal = float(inputs.get("principal", 0.0))
            interest_rate = float(inputs.get("interest_rate", 0.0))
            tenure_years = float(inputs.get("tenure_years", 1.0))
            asset_value = float(inputs.get("asset_purchase_value", 0.0))

            if principal < 0 or interest_rate < 0 or tenure_years <= 0:
                raise ValueError("Invalid principal, interest rate, or tenure parameters provided.")

            # Calculate EMI via amortization formula
            r = (interest_rate / 12.0) / 100.0
            n = tenure_years * 12.0
            if r > 0:
                emi = principal * r * ((1.0 + r) ** n) / (((1.0 + r) ** n) - 1.0)
            else:
                emi = principal / n if n > 0 else 0.0

            # Add to liabilities context list
            liabilities.append({
                "loan_name": "Simulated Loan",
                "loan_type": "Other",
                "outstanding": principal,
                "interest_rate": interest_rate,
                "emi": emi
            })

            # Update cash flows
            projected_profile["monthly_expenses"] += emi
            projected_profile["monthly_savings"] = max(0.0, projected_profile["monthly_income"] - projected_profile["monthly_expenses"])

            # Map Asset purchases if provided
            if asset_value > 0:
                assets.append({
                    "asset_name": "Simulated Asset Purchased",
                    "current_value": asset_value,
                    "asset_type": "Other"
                })
            
            verdict_summary = f"Simulated a new loan of ₹{principal:,.2f} at {interest_rate}% interest rate over {tenure_years} years. Resulting monthly EMI: ₹{emi:,.2f}."

        elif scenario_type == "INVESTMENT_CONTRIBUTION":
            monthly_change = float(inputs.get("monthly_change", 0.0))
            # Affects investments totals
            investments.append({
                "name": "Simulated Investment Increment",
                "current_value": monthly_change * 12.0,
                "invested_amount": monthly_change * 12.0
            })
            verdict_summary = f"Simulated a change of ₹{monthly_change:,.2f}/mo in recurring investment contributions."

        # 4. Compute Projected Scenario Rules
        projected_rules = re.compute_all_rules(
            profile=projected_profile,
            income_sources=incomes,
            expense_categories=expenses,
            assets=assets,
            liabilities=liabilities,
            goals=goals,
            investments=investments,
            insurance=insurance,
            subscriptions=subscriptions
        )

        # Projected Cashflow Sums
        proj_income = sum(float(i.get("amount", 0)) for i in incomes)
        if scenario_type == "INCOME_CHANGE":
            proj_income = projected_profile["monthly_income"]
        proj_expenses = sum(float(e.get("amount", 0)) for e in expenses)
        if scenario_type == "EXPENSE_CHANGE":
            proj_expenses = projected_profile["monthly_expenses"]
        proj_emi = sum(float(l.get("emi", 0)) for l in liabilities)
        proj_surplus_val = proj_income - proj_expenses - proj_emi
        if scenario_type == "INVESTMENT_CONTRIBUTION":
            proj_surplus_val -= float(inputs.get("monthly_change", 0.0))
        proj_surplus = round(proj_surplus_val, 2)
        base_surplus = round(base_surplus, 2)

        # Compute Absolute Deltas
        net_worth_delta = round(projected_rules["net_worth"] - baseline_rules["net_worth"], 2)
        surplus_delta = round(proj_surplus - base_surplus, 2)
        savings_rate_delta = round(projected_rules["savings_rate_pct"] - baseline_rules["savings_rate_pct"], 2)
        dti_delta = round(projected_rules["dti_ratio_pct"] - baseline_rules["dti_ratio_pct"], 2)
        runway_delta = round(projected_rules["emergency_runway_months"] - baseline_rules["emergency_runway_months"], 2)
        health_score_delta = round(projected_rules["financial_health_score"] - baseline_rules["financial_health_score"], 2)

        # 5. Formulate Warnings and Impact Evaluation Verdicts
        verdict_label = "Neutral"
        verdict_severity = "low"

        if health_score_delta < -10.0 or dti_delta > 15.0 or runway_delta < -2.0 or surplus_delta < -20000.0:
            verdict_label = "Needs Attention"
            verdict_severity = "high"
            warnings.append("This decision significantly reduces your monthly cash surplus or emergency liquidity runway.")
        if projected_rules["dti_ratio_pct"] > 45.0:
            verdict_label = "High Risk"
            verdict_severity = "critical"
            warnings.append("Projected Debt-to-Income ratio exceeds safety limits (>45%). Prepayment is highly recommended.")
        if projected_rules["emergency_runway_months"] < 3.0 and runway_delta < 0:
            warnings.append("Your emergency reserve runway will fall below 3 months, increasing liquidity vulnerability.")
        if health_score_delta > 5.0 and surplus_delta > 0:
            verdict_label = "Positive Impact"
            verdict_severity = "low"

        return {
            "scenario": {
                "type": scenario_type,
                "inputs": inputs
            },
            "baseline": {
                "net_worth": baseline_rules["net_worth"],
                "monthly_surplus": base_surplus,
                "savings_rate_pct": baseline_rules["savings_rate_pct"],
                "dti_ratio_pct": baseline_rules["dti_ratio_pct"],
                "emergency_runway_months": baseline_rules["emergency_runway_months"],
                "financial_health_score": baseline_rules["financial_health_score"]
            },
            "projected": {
                "net_worth": projected_rules["net_worth"],
                "monthly_surplus": proj_surplus,
                "savings_rate_pct": projected_rules["savings_rate_pct"],
                "dti_ratio_pct": projected_rules["dti_ratio_pct"],
                "emergency_runway_months": projected_rules["emergency_runway_months"],
                "financial_health_score": projected_rules["financial_health_score"]
            },
            "impact": {
                "net_worth_delta": net_worth_delta,
                "monthly_surplus_delta": surplus_delta,
                "savings_rate_delta": savings_rate_delta,
                "dti_delta": dti_delta,
                "runway_delta": runway_delta,
                "health_score_delta": health_score_delta
            },
            "assessment": {
                "label": verdict_label,
                "severity": verdict_severity,
                "summary": verdict_summary,
                "warnings": warnings
            }
        }

    def compare_scenarios(
        self,
        options: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        # Formally check baseline/insufficient data boundaries
        profile = context.get("profile", {})
        baseline_income = float(profile.get("monthly_income", 0.0))
        baseline_expenses = float(profile.get("monthly_expenses", 0.0))

        # Check Insufficient Data conditions
        if baseline_income <= 0.0 or baseline_expenses <= 0.0:
            missing_fields = []
            if baseline_income <= 0.0: missing_fields.append("Monthly Income")
            if baseline_expenses <= 0.0: missing_fields.append("Monthly Expenses")
            
            return {
                "baseline": {},
                "options": [],
                "comparison": {
                    "recommended_option": None,
                    "confidence": "insufficient_data",
                    "reasons": [
                        f"Insufficient baseline financial profile data (missing: {', '.join(missing_fields)}). Recommending options is deferred until onboarding details are completed."
                    ],
                    "tradeoffs": []
                }
            }

        sim_options = []
        baseline_metrics = None

        # Simulate each option independently from the SAME original baseline context
        for opt in options:
            opt_id = opt.get("id")
            opt_label = opt.get("label", "Alternative Option")
            opt_type = opt.get("type")
            opt_params = opt.get("parameters", {})

            sim_res = self.simulate_scenario(opt_type, opt_params, context)
            if baseline_metrics is None:
                baseline_metrics = sim_res["baseline"]

            sim_options.append({
                "id": opt_id,
                "label": opt_label,
                "scenario": sim_res["scenario"],
                "projected": sim_res["projected"],
                "impact": sim_res["impact"],
                "assessment": sim_res["assessment"]
            })

        # Calculate baseline surplus
        base_surplus = baseline_metrics["monthly_surplus"]

        # STAGE 1: SAFETY FILTERING
        safe_options = []
        unsafe_options = []

        for sim_opt in sim_options:
            proj = sim_opt["projected"]
            warnings = sim_opt["assessment"]["warnings"]
            is_safe = True

            # Critical safety boundaries check
            if proj["dti_ratio_pct"] > 45.0:
                is_safe = False
                warnings.append("Projected Debt-to-Income ratio exceeds safety limits (>45%).")
            if proj["emergency_runway_months"] < 1.5:
                is_safe = False
                warnings.append("Emergency runway falls below critical liquidity threshold (<1.5 months).")
            if proj["monthly_surplus"] < 0.0:
                is_safe = False
                warnings.append("Projected recurring outflows exceed current monthly inflows (negative surplus).")

            sim_opt["assessment"]["is_safe"] = is_safe
            if is_safe:
                safe_options.append(sim_opt)
            else:
                unsafe_options.append(sim_opt)

        # STAGE 2: PREFERENCE SCORING among financially viable (safe) options
        best_option_id = None
        best_score = -9999999.0
        reasons = []
        tradeoffs = []

        if len(safe_options) > 0:
            for sim_opt in safe_options:
                proj = sim_opt["projected"]
                imp = sim_opt["impact"]

                # Scale Invariant Normalization of Surplus Delta relative to baseline income
                surplus_delta_pct = (imp["monthly_surplus_delta"] / baseline_income) * 100.0

                # Explicit, documented scoring weights using normalized units
                health_impact = imp["health_score_delta"] * 2.0
                surplus_impact = surplus_delta_pct * 1.5
                dti_impact = -imp["dti_delta"] * 1.2
                runway_impact = imp["runway_delta"] * 4.0

                opt_score = health_impact + surplus_impact + dti_impact + runway_impact

                if opt_score > best_score:
                    best_score = opt_score
                    best_option_id = sim_opt["id"]
        else:
            # All options are unsafe
            best_option_id = None
            reasons.append("No simulated options are financially safe. All options violate critical safety boundaries (DTI > 45%, Emergency Runway < 1.5 months, or negative monthly surplus).")

        # Determine baseline data completeness for confidence
        has_assets = len(context.get("assets", [])) > 0
        has_liabilities = len(context.get("liabilities", [])) > 0
        has_goals = len(context.get("goals", [])) > 0

        if has_assets and has_liabilities and has_goals:
            confidence_level = "high"
        elif has_assets or has_liabilities:
            confidence_level = "moderate"
        else:
            confidence_level = "low"

        # Populate comparative reasons and tradeoffs
        if best_option_id:
            best_opt = next(o for o in safe_options if o["id"] == best_option_id)
            reasons.append(f"Recommended option is '{best_opt['label']}' based on optimal cash flow preservation and risk boundaries.")
            
            if best_opt["projected"]["dti_ratio_pct"] < 35.0:
                reasons.append("Keeps projected Debt-to-Income ratio within a safe, conservative threshold (<35%).")
            if best_opt["impact"]["monthly_surplus_delta"] >= 0.0:
                reasons.append("Preserves or improves your monthly cash surplus balance.")
            else:
                reasons.append("Minimizes reduction in monthly surplus compared to other simulated scenarios.")
            
            if best_opt["projected"]["emergency_runway_months"] >= 6.0:
                reasons.append("Maintains fully covered emergency reserve runway coverage (6+ months).")

            # Tradeoffs logic
            for sim_opt in sim_options:
                if sim_opt["id"] == best_option_id:
                    if sim_opt["scenario"]["type"] == "NEW_LIABILITY":
                        tradeoffs.append(f"'{sim_opt['label']}' provides immediate asset purchase utility but locks in long-term monthly EMI commitments.")
                    elif sim_opt["scenario"]["type"] == "INVESTMENT_CONTRIBUTION":
                        tradeoffs.append(f"'{sim_opt['label']}' boosts net worth growth rate but reduces immediate monthly disposable cash availability.")
                else:
                    if sim_opt["scenario"]["type"] == "NEW_LIABILITY":
                        tradeoffs.append(f"Foregoing '{sim_opt['label']}' delays vehicle/property utility but keeps balance sheet debt-free.")

        return {
            "baseline": baseline_metrics,
            "options": sim_options,
            "comparison": {
                "recommended_option": best_option_id,
                "confidence": confidence_level,
                "reasons": reasons,
                "tradeoffs": tradeoffs
            }
        }
