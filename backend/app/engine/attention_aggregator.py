import datetime
from typing import Dict, Any, List, Optional
from app.schemas.financials import AttentionItem

class AttentionAggregator:
    """
    Deterministic Intelligence-to-Attention Aggregator (Hardened for Stage 5C.1).
    
    Principles:
      1. Emergency-fund semantics: Explicitly distinguish total assets from designated liquid emergency reserves.
      2. Debt semantics: Separately report monthly debt service cashflow health vs total balance-sheet liability position.
      3. Attention explanations: Every item strictly answers WHAT, WHY, IMPACT (HOW MUCH), and WHAT CAN I DO.
      4. Density & Coherence control: Low cognitive density. Prevents alert fatigue by rolling overlapping secondary
         observations into structured primary items and capping concurrent primary alerts.
      5. Pure determinism: No LLM hallucination, no fabricated state, strictly grounded mathematical evidence.
    """

    SEVERITY_RANKS = {
        "critical": 1,
        "high": 2,
        "medium": 3,
        "low": 4,
        "positive": 5
    }

    DOMAIN_RANKS = {
        "data_quality": 1,
        "emergency_fund": 2,
        "debt": 3,
        "cash_flow": 4,
        "goal": 5,
        "investment": 6,
        "insurance": 7,
        "tax": 8,
        "opportunity": 9,
        "net_worth": 10
    }

    def aggregate(
        self,
        context: Dict[str, Any],
        rules: Dict[str, Any],
        diagnosis: Dict[str, Any],
        feasibility: Dict[str, Any],
        action_plans: Optional[Dict[str, Any]] = None
    ) -> List[AttentionItem]:
        profile = context.get("profile", {})
        incomes = context.get("incomes", [])
        expenses = context.get("expenses", [])
        assets = context.get("assets", [])
        liabilities = context.get("liabilities", [])
        goals = context.get("goals", [])

        items: List[AttentionItem] = []

        # 1. Completeness & Empty Checks (Missing != Zero)
        has_profile = bool(profile and profile.get("age") and profile.get("city"))
        has_income = len(incomes) > 0
        has_expenses = len(expenses) > 0
        has_assets = len(assets) > 0
        has_liabilities = len(liabilities) > 0
        has_goals = len(goals) > 0

        is_empty_user = (not has_profile and not has_income and not has_expenses and not has_assets and not has_liabilities and not has_goals)
        if is_empty_user:
            return [
                AttentionItem(
                    id="data_quality_empty_profile",
                    category="data_quality",
                    severity="medium",
                    title="Complete Your Financial Profile",
                    description="Complete your financial profile to unlock your personalized Financial Pulse, deterministic diagnosis, and AI CFO insights.",
                    what="Your financial profile has no recorded cash flows, assets, or obligations.",
                    why="ArthAI operates on real grounded mathematical models rather than generic assumptions.",
                    impact="Financial Pulse and intelligence engines remain inactive until setup is completed.",
                    next_step="Complete the guided onboarding steps to record your cash flows and balance sheet.",
                    metric_evidence={
                        "has_profile": False,
                        "has_income": False,
                        "has_expenses": False,
                        "has_assets": False,
                        "has_liabilities": False,
                        "has_goals": False
                    },
                    action_label="Start Onboarding",
                    action_type="navigate",
                    target_route="/onboarding",
                    dedup_key="data_quality_onboarding"
                )
            ]

        # Partial Data Quality Warnings
        if not has_profile:
            items.append(
                AttentionItem(
                    id="data_quality_missing_profile",
                    category="data_quality",
                    severity="medium",
                    title="Complete Personal Demographics",
                    description="Demographics (age, city, dependents) are missing. Complete them to refine tax and life-stage benchmarks.",
                    what="Age and location demographics are unrecorded in your profile.",
                    why="Financial risk benchmarks, tax regimes, and safe liquidity targets scale with age and dependents.",
                    impact="Calculations use standard baseline defaults rather than life-stage tailored parameters.",
                    next_step="Update your profile settings with your current age and city.",
                    metric_evidence={"missing_domain": "profile"},
                    action_label="Complete Profile",
                    action_type="navigate",
                    target_route="/onboarding",
                    dedup_key="data_quality_profile"
                )
            )

        if has_income and not has_expenses:
            items.append(
                AttentionItem(
                    id="data_quality_missing_expenses",
                    category="data_quality",
                    severity="high",
                    title="Add Monthly Living Expenses",
                    description="Monthly income is recorded, but living expenses are missing. Enter expenses to compute your true cash flow surplus and runway.",
                    what="Living expenses are unrecorded while income is active.",
                    why="Without knowing monthly outflows, cash flow surplus and emergency coverage cannot be safely established.",
                    impact="Missing data is not treated as ₹0 expenses.",
                    next_step="Log your core living, housing, and discretionary monthly expenses.",
                    metric_evidence={"recorded_income_count": len(incomes), "expenses_count": 0},
                    action_label="Add Expenses",
                    action_type="tab_switch",
                    target_route="overview",
                    dedup_key="data_quality_expenses"
                )
            )

        if not has_income and has_expenses:
            items.append(
                AttentionItem(
                    id="data_quality_missing_income",
                    category="data_quality",
                    severity="high",
                    title="Add Income Sources",
                    description="Monthly expenses are recorded, but income sources are missing. Add income to verify surplus and debt serviceability.",
                    what="Expenses are recorded without matching income inflows.",
                    why="Inflow capacity is required to calculate savings rate, DTI, and goal contribution capacity.",
                    impact="Cash flow health cannot be evaluated without recorded gross take-home income.",
                    next_step="Add your salary, business, or investment income sources.",
                    metric_evidence={"recorded_expenses_count": len(expenses), "income_count": 0},
                    action_label="Add Income",
                    action_type="tab_switch",
                    target_route="overview",
                    dedup_key="data_quality_income"
                )
            )

        if has_liabilities and not has_assets:
            items.append(
                AttentionItem(
                    id="data_quality_missing_assets",
                    category="data_quality",
                    severity="medium",
                    title="Record Asset Holdings",
                    description="Outstanding liabilities are recorded, but asset accounts are missing. Add your bank accounts, deposits, or investments to assess true net worth.",
                    what="Liabilities are active with 0 recorded asset holdings.",
                    why="Assessing balance sheet resilience requires comparing debt against liquid and illiquid assets.",
                    impact="Balance sheet displays full liability debt without offsetting asset equity.",
                    next_step="Add your savings, fixed deposits, mutual funds, or real estate assets.",
                    metric_evidence={"recorded_liabilities_count": len(liabilities), "assets_count": 0},
                    action_label="Add Assets",
                    action_type="tab_switch",
                    target_route="overview",
                    dedup_key="data_quality_assets"
                )
            )

        # 2. Extract authoritative baseline metrics
        total_income = sum(float(i.get("amount", 0)) for i in incomes)
        total_expenses = sum(float(e.get("amount", 0)) for e in expenses)
        total_emi = sum(float(l.get("emi", 0)) for l in liabilities)
        monthly_surplus = total_income - total_expenses - total_emi

        total_assets = sum(float(a.get("current_value", 0)) for a in assets)
        total_liabilities = sum(float(l.get("outstanding", 0)) for l in liabilities)
        net_worth = total_assets - total_liabilities

        # Explicit Emergency Fund Semantics: Total Assets != Emergency Reserve
        emergency_fund_val = profile.get("emergency_fund")
        has_designated_emergency_fund = (emergency_fund_val is not None and float(emergency_fund_val) > 0)
        emergency_fund_current = float(emergency_fund_val or 0)
        emergency_runway = rules.get("emergency_runway_months", 0.0)

        dti_ratio = rules.get("dti_ratio_pct", 0.0)
        savings_rate = rules.get("savings_rate_pct", 0.0)

        # 3. Emergency Fund Evaluation (Clean separation of designated cash vs unallocated assets)
        if total_expenses > 0:
            target_reserve = 6.0 * total_expenses
            gap = max(0.0, target_reserve - emergency_fund_current)

            if not has_designated_emergency_fund:
                # If total assets exist but no designated emergency fund is tagged in profile
                if total_assets > 0:
                    items.append(
                        AttentionItem(
                            id="attention_emergency_undesignated",
                            category="emergency_fund",
                            severity="critical" if total_expenses > 0 else "medium",
                            title="Emergency Reserve: Unknown / Not Designated",
                            description=f"You have ₹{total_assets:,.2f} in recorded assets, but no dedicated liquid emergency reserve is tagged. Total assets are not automatically counted as emergency funds.",
                            what="Recorded assets have not been designated as liquid emergency reserves.",
                            why="Non-liquid holdings (such as property, equity, or lock-in deposits) cannot be liquidated immediately in a liquidity disruption without penalty or market risk.",
                            impact=f"Target 6-month buffer is ₹{target_reserve:,.2f} (₹{total_expenses:,.2f}/mo essential burn). Current designated liquid reserve is ₹0.00.",
                            next_step="Tag or allocate liquid cash in your profile to establish a designated emergency reserve.",
                            metric_evidence={
                                "designated_emergency_fund": 0.0,
                                "total_assets": total_assets,
                                "monthly_essential_burn": total_expenses,
                                "target_reserve": target_reserve,
                                "target_runway_months": 6.0
                            },
                            action_label="Designate Emergency Fund",
                            action_type="tab_switch",
                            target_route="action-plans",
                            dedup_key="emergency_fund_runway"
                        )
                    )
                else:
                    items.append(
                        AttentionItem(
                            id="attention_emergency_zero",
                            category="emergency_fund",
                            severity="critical",
                            title="Critically Low Emergency Buffer",
                            description=f"No emergency reserves are recorded against monthly outflows of ₹{total_expenses:,.2f}.",
                            what="Zero liquid emergency reserves recorded.",
                            why="An unexpected cashflow disruption or medical event could force expensive borrowing or immediate default.",
                            impact=f"₹{target_reserve:,.2f} required for a standard 6-month liquidity buffer (Current runway: 0.0 months).",
                            next_step="Prioritize building at least 3 to 6 months of living expenses in an accessible liquid account.",
                            metric_evidence={
                                "current_runway_months": 0.0,
                                "current_reserve": 0.0,
                                "target_reserve": target_reserve,
                                "gap": target_reserve,
                                "monthly_burn": total_expenses
                            },
                            action_label="Build Reserve Plan",
                            action_type="tab_switch",
                            target_route="action-plans",
                            dedup_key="emergency_fund_runway"
                        )
                    )
            elif emergency_runway < 1.5:
                items.append(
                    AttentionItem(
                        id="attention_emergency_critical",
                        category="emergency_fund",
                        severity="critical",
                        title="Critically Low Emergency Buffer",
                        description=f"Liquid cash holdings cover only {emergency_runway:.1f} months of expenses (₹{emergency_fund_current:,.2f} vs ₹{target_reserve:,.2f} 6-month target).",
                        what=f"Emergency cash reserves provide only {emergency_runway:.1f} months of coverage.",
                        why="A minimum 3 to 6 months buffer is needed to insulate against income disruption or unexpected expenses.",
                        impact=f"Deficit of ₹{gap:,.2f} below the safe 6-month benchmark of ₹{target_reserve:,.2f}.",
                        next_step="Redirect a portion of monthly surplus into high-liquidity savings accounts.",
                        metric_evidence={
                            "current_runway_months": emergency_runway,
                            "current_reserve": emergency_fund_current,
                            "target_reserve": target_reserve,
                            "gap": gap,
                            "monthly_burn": total_expenses
                        },
                        action_label="Build Reserve Plan",
                        action_type="tab_switch",
                        target_route="action-plans",
                        dedup_key="emergency_fund_runway"
                    )
                )
            elif emergency_runway < 3.0:
                items.append(
                    AttentionItem(
                        id="attention_emergency_high",
                        category="emergency_fund",
                        severity="high",
                        title="Emergency Runway Below Target",
                        description=f"Emergency cash reserves cover {emergency_runway:.1f} months of expenses. Target benchmark is 6 months.",
                        what=f"Emergency fund covers {emergency_runway:.1f} months of living expenses.",
                        why="Falling below 3 months increases vulnerability during sudden career or health disruptions.",
                        impact=f"Current reserve is ₹{emergency_fund_current:,.2f} with a ₹{gap:,.2f} gap to reach 6 months.",
                        next_step="Increase monthly liquidity contributions until 6 months of buffer is reached.",
                        metric_evidence={
                            "current_runway_months": emergency_runway,
                            "current_reserve": emergency_fund_current,
                            "target_reserve": target_reserve,
                            "gap": gap
                        },
                        action_label="Review Liquidity",
                        action_type="tab_switch",
                        target_route="action-plans",
                        dedup_key="emergency_fund_runway"
                    )
                )
            elif emergency_runway >= 6.0 and emergency_fund_current > 0:
                items.append(
                    AttentionItem(
                        id="attention_emergency_positive",
                        category="emergency_fund",
                        severity="positive",
                        title="Robust Emergency Liquidity",
                        description=f"Your liquid emergency buffer covers {emergency_runway:.1f} months of expenses (₹{emergency_fund_current:,.2f}), satisfying financial resilience benchmarks.",
                        what=f"Your liquid emergency buffer provides {emergency_runway:.1f} months of living expense coverage.",
                        why="You satisfy financial resilience benchmarks and can handle disruptions without tapping debt or selling investments.",
                        impact=f"₹{emergency_fund_current:,.2f} in designated reserves (exceeds 6-month target of ₹{target_reserve:,.2f}).",
                        next_step="Maintain reserve and direct subsequent cash surpluses toward long-term wealth goals.",
                        metric_evidence={
                            "current_runway_months": emergency_runway,
                            "current_reserve": emergency_fund_current,
                            "target_reserve": target_reserve
                        },
                        action_label="View Liquidity Details",
                        action_type="tab_switch",
                        target_route="overview",
                        dedup_key="emergency_fund_runway"
                    )
                )

        # 4. Debt Semantics: Monthly Debt Service Health vs Balance Sheet Debt Position
        if has_liabilities:
            # 4A. Monthly Debt Service (Cash Flow Flow)
            if dti_ratio > 45.0:
                items.append(
                    AttentionItem(
                        id="attention_debt_critical_dti",
                        category="debt",
                        severity="critical",
                        title="Critical Monthly Debt Service Burden",
                        description=f"Monthly EMIs (₹{total_emi:,.2f}) consume {dti_ratio:.1f}% of monthly income, placing severe pressure on liquidity.",
                        what=f"Debt payments consume {dti_ratio:.1f}% of your monthly take-home income.",
                        why="DTI above 45% leaves inadequate room for essential living expenses, savings, and unforeseen shocks.",
                        impact=f"₹{total_emi:,.2f}/mo out of ₹{total_income:,.2f}/mo is committed to fixed EMIs.",
                        next_step="Explore loan restructuring, refinancing to lower APRs, or accelerating prepayments.",
                        metric_evidence={
                            "dti_ratio_pct": dti_ratio,
                            "total_monthly_emi": total_emi,
                            "monthly_income": total_income,
                            "safe_threshold": 35.0
                        },
                        action_label="Simulate Debt Prepayment",
                        action_type="tab_switch",
                        target_route="simulator",
                        dedup_key="debt_service_health"
                    )
                )
            elif dti_ratio > 35.0:
                items.append(
                    AttentionItem(
                        id="attention_debt_elevated_dti",
                        category="debt",
                        severity="high",
                        title="Elevated Monthly Debt Payments",
                        description=f"Debt EMIs consume {dti_ratio:.1f}% of income, exceeding the recommended 35% safe ceiling.",
                        what=f"Debt service is {dti_ratio:.1f}% of monthly income (exceeds 35% benchmark).",
                        why="High monthly debt service restricts discretionary flexibility and limits goal contributions.",
                        impact=f"₹{total_emi:,.2f} spent monthly on debt maintenance.",
                        next_step="Prioritize debt prepayment on highest-interest liabilities.",
                        metric_evidence={
                            "dti_ratio_pct": dti_ratio,
                            "total_monthly_emi": total_emi,
                            "monthly_income": total_income,
                            "safe_threshold": 35.0
                        },
                        action_label="Optimize Liabilities",
                        action_type="tab_switch",
                        target_route="simulator",
                        dedup_key="debt_service_health"
                    )
                )
            elif dti_ratio <= 15.0 and total_emi > 0:
                items.append(
                    AttentionItem(
                        id="attention_debt_healthy_service",
                        category="debt",
                        severity="positive",
                        title="Monthly Debt Payments Look Manageable",
                        description=f"Monthly EMIs represent only {dti_ratio:.1f}% of income, well below the 35% safe limit.",
                        what=f"Your EMI obligations consume only {dti_ratio:.1f}% of monthly take-home income.",
                        why="Healthy debt service ratio indicates low monthly cash flow stress from borrowing.",
                        impact=f"Fixed debt commitment is limited to ₹{total_emi:,.2f}/mo out of ₹{total_income:,.2f}/mo.",
                        next_step="Maintain timely repayments and leverage remaining cash surplus for goal investing.",
                        metric_evidence={
                            "dti_ratio_pct": dti_ratio,
                            "total_monthly_emi": total_emi,
                            "monthly_income": total_income
                        },
                        action_label="View Debt Summary",
                        action_type="tab_switch",
                        target_route="overview",
                        dedup_key="debt_service_health"
                    )
                )

            # 4B. Balance Sheet Total Position (Asset vs Liability Stock)
            if total_liabilities > total_assets and total_assets > 0:
                items.append(
                    AttentionItem(
                        id="attention_debt_networth_imbalance",
                        category="debt",
                        severity="high",
                        title="Overall Liabilities Exceed Recorded Assets",
                        description=f"You owe ₹{total_liabilities:,.2f} in total liabilities against ₹{total_assets:,.2f} in recorded assets (Net worth: -₹{abs(net_worth):,.2f}).",
                        what=f"Outstanding obligations (₹{total_liabilities:,.2f}) exceed total recorded assets (₹{total_assets:,.2f}).",
                        why="Your balance sheet is in negative net worth (-₹{abs(net_worth):,.2f}), meaning debt outweighs total asset equity.",
                        impact=f"Net worth is -₹{abs(net_worth):,.2f}. Balance sheet leverage is inverted.",
                        next_step="Model a structured deleveraging timeline using scenario simulations.",
                        metric_evidence={
                            "total_assets": total_assets,
                            "total_liabilities": total_liabilities,
                            "net_worth": net_worth
                        },
                        action_label="Run Deleveraging Simulation",
                        action_type="tab_switch",
                        target_route="simulator",
                        dedup_key="debt_balance_sheet_position"
                    )
                )

        # 5. Cash Flow Surplus / Deficit
        if (has_income and has_expenses):
            if monthly_surplus < 0:
                items.append(
                    AttentionItem(
                        id="attention_cashflow_negative",
                        category="cash_flow",
                        severity="critical",
                        title="Monthly Inflow Deficit",
                        description=f"Monthly outflows (₹{total_expenses + total_emi:,.2f}) exceed income (₹{total_income:,.2f}) by ₹{abs(monthly_surplus):,.2f}/month.",
                        what=f"Recurring monthly cash deficit of ₹{abs(monthly_surplus):,.2f}.",
                        why="Spending more than take-home income causes rapid liquidity depletion and forces reliance on debt.",
                        impact=f"Loss of ₹{abs(monthly_surplus):,.2f} each month from cash reserves.",
                        next_step="Review discretionary expense categories and explore immediate cashflow rebalancing plans.",
                        metric_evidence={
                            "monthly_income": total_income,
                            "monthly_expenses": total_expenses,
                            "monthly_emi": total_emi,
                            "monthly_surplus": monthly_surplus
                        },
                        action_label="Explore Action Plan",
                        action_type="tab_switch",
                        target_route="action-plans",
                        dedup_key="cashflow_surplus_deficit"
                    )
                )
            elif monthly_surplus > 0 and savings_rate >= 30.0:
                items.append(
                    AttentionItem(
                        id="attention_cashflow_positive",
                        category="cash_flow",
                        severity="positive",
                        title="Healthy Monthly Cash Surplus",
                        description=f"Monthly income of ₹{total_income:,.2f} produces a positive surplus of ₹{monthly_surplus:,.2f} (Savings rate: {savings_rate:.1f}%).",
                        what=f"Generating ₹{monthly_surplus:,.2f}/mo in net surplus ({savings_rate:.1f}% savings rate).",
                        why="Strong surplus provides dry powder to fund milestones and build long-term compounding assets.",
                        impact=f"₹{monthly_surplus:,.2f}/month available for emergency fund acceleration and goal funding.",
                        next_step="Direct surplus systematically into designated milestone goals.",
                        metric_evidence={
                            "monthly_income": total_income,
                            "monthly_expenses": total_expenses,
                            "monthly_emi": total_emi,
                            "monthly_surplus": monthly_surplus,
                            "savings_rate_pct": savings_rate
                        },
                        action_label="Allocate to Goals",
                        action_type="tab_switch",
                        target_route="goals",
                        dedup_key="cashflow_surplus_deficit"
                    )
                )

        # 6. Goal Feasibility
        analyzed_goals = feasibility.get("goals", [])
        for ag in analyzed_goals:
            g_id = ag.get("goal_id", "")
            g_name = ag.get("goal_name", "Goal")
            g_status = ag.get("status")
            target_amount = ag.get("target_amount", 0.0)
            saved_amount = ag.get("saved_amount", 0.0)
            req_contrib = ag.get("required_monthly_contribution", 0.0)
            cur_contrib = ag.get("current_monthly_contribution", 0.0)
            funding_gap = ag.get("funding_gap", 0.0)

            if g_status == "UNDERFUNDED":
                items.append(
                    AttentionItem(
                        id=f"attention_goal_underfunded_{g_id}",
                        category="goal",
                        severity="high",
                        title=f"Goal Underfunded: {g_name}",
                        description=f"Target ₹{target_amount:,.2f} has a projected shortfall of ₹{funding_gap:,.2f}. Required contribution is ₹{req_contrib:,.2f}/mo vs current ₹{cur_contrib:,.2f}/mo.",
                        what=f"Shortfall of ₹{funding_gap:,.2f} projected by scheduled target date.",
                        why=f"Current monthly contribution of ₹{cur_contrib:,.2f} is insufficient to meet the target of ₹{target_amount:,.2f}.",
                        impact=f"Requires an additional ₹{max(0.0, req_contrib - cur_contrib):,.2f}/month to bridge the trajectory gap.",
                        next_step="Review the deterministic Action Plan or adjust milestone target date.",
                        metric_evidence={
                            "goal_id": g_id,
                            "goal_name": g_name,
                            "target_amount": target_amount,
                            "saved_amount": saved_amount,
                            "required_monthly_contribution": req_contrib,
                            "current_monthly_contribution": cur_contrib,
                            "funding_gap": funding_gap,
                            "status": g_status
                        },
                        action_label="Rebalance Goal Strategy",
                        action_type="tab_switch",
                        target_route="action-plans",
                        dedup_key=f"goal_{g_id}_feasibility"
                    )
                )
            elif g_status == "AT_RISK":
                items.append(
                    AttentionItem(
                        id=f"attention_goal_at_risk_{g_id}",
                        category="goal",
                        severity="medium",
                        title=f"Goal At Risk: {g_name}",
                        description=f"Current monthly contribution (₹{cur_contrib:,.2f}) is below the required rate (₹{req_contrib:,.2f}), though affordable within your monthly surplus.",
                        what=f"Current contribution is ₹{cur_contrib:,.2f}/mo vs required ₹{req_contrib:,.2f}/mo.",
                        why="Pacing is currently behind schedule, but your cashflow surplus can support the required increase.",
                        impact=f"Adjusting contribution by ₹{max(0.0, req_contrib - cur_contrib):,.2f}/mo will return goal to on-track status.",
                        next_step="Increase monthly contribution from existing surplus cash flow.",
                        metric_evidence={
                            "goal_id": g_id,
                            "goal_name": g_name,
                            "target_amount": target_amount,
                            "saved_amount": saved_amount,
                            "required_monthly_contribution": req_contrib,
                            "current_monthly_contribution": cur_contrib,
                            "funding_gap": funding_gap,
                            "status": g_status
                        },
                        action_label="Adjust Goal Contribution",
                        action_type="tab_switch",
                        target_route="goals",
                        dedup_key=f"goal_{g_id}_feasibility"
                    )
                )
            elif g_status == "ON_TRACK":
                items.append(
                    AttentionItem(
                        id=f"attention_goal_on_track_{g_id}",
                        category="goal",
                        severity="positive",
                        title=f"Goal On Track: {g_name}",
                        description=f"Current contributions (₹{cur_contrib:,.2f}/mo) are on trajectory to achieve target ₹{target_amount:,.2f} by scheduled date.",
                        what=f"Trajectory is fully funded to reach ₹{target_amount:,.2f}.",
                        why=f"Monthly contributions of ₹{cur_contrib:,.2f} cover the required timeline rate.",
                        impact=f"₹{saved_amount:,.2f} accumulated toward ₹{target_amount:,.2f} goal.",
                        next_step="Maintain current contributions until milestone completion.",
                        metric_evidence={
                            "goal_id": g_id,
                            "goal_name": g_name,
                            "target_amount": target_amount,
                            "saved_amount": saved_amount,
                            "status": g_status
                        },
                        action_label="View Goal Details",
                        action_type="tab_switch",
                        target_route="goals",
                        dedup_key=f"goal_{g_id}_feasibility"
                    )
                )

        # 7. Action Planning Engine integration
        if action_plans and action_plans.get("plans"):
            recommended_plan_id = action_plans.get("recommendation", {}).get("plan_id")
            if recommended_plan_id:
                plan_obj = next((p for p in action_plans["plans"] if p["id"] == recommended_plan_id), None)
                if plan_obj and plan_obj.get("safety", {}).get("is_viable"):
                    items.append(
                        AttentionItem(
                            id="attention_action_plan_viable",
                            category="opportunity",
                            severity="medium",
                            title="Viable Action Plan Available",
                            description=f"A deterministic plan ('{plan_obj.get('label')}') can resolve identified goal funding shortfalls while preserving liquidity safety gates.",
                            what=f"Viable solution '{plan_obj.get('label')}' identified.",
                            why="Closes milestone funding gaps while keeping DTI and liquidity runway within safe limits.",
                            impact=f"Projected Health Score: {plan_obj.get('projected', {}).get('financial_health_score')}/100.",
                            next_step="Review the step-by-step action plan tradeoffs and adopt the simulation.",
                            metric_evidence={
                                "plan_id": plan_obj.get("id"),
                                "projected_health_score": plan_obj.get("projected", {}).get("financial_health_score"),
                                "projected_surplus": plan_obj.get("projected", {}).get("monthly_surplus")
                            },
                            action_label="Review Action Plan",
                            action_type="tab_switch",
                            target_route="action-plans",
                            dedup_key="action_plan_recommendation"
                        )
                    )

        # 8. Deterministic Deduplication: Retain highest severity & richest evidence per dedup_key
        dedup_map: Dict[str, AttentionItem] = {}
        for item in items:
            key = item.dedup_key or item.id
            if key not in dedup_map:
                dedup_map[key] = item
            else:
                existing = dedup_map[key]
                existing_rank = self.SEVERITY_RANKS.get(existing.severity, 99)
                new_rank = self.SEVERITY_RANKS.get(item.severity, 99)
                if new_rank < existing_rank:
                    dedup_map[key] = item
                elif new_rank == existing_rank:
                    if len(item.metric_evidence) > len(existing.metric_evidence):
                        dedup_map[key] = item

        deduped_items = list(dedup_map.values())

        # 9. Coherent Multi-Key Ordering
        def sort_key(item: AttentionItem):
            s_rank = self.SEVERITY_RANKS.get(item.severity, 99)
            d_rank = self.DOMAIN_RANKS.get(item.category, 99)
            return (s_rank, d_rank, item.title)

        deduped_items.sort(key=sort_key)
        return deduped_items
