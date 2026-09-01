from typing import Dict, Any, List

class FinancialDiagnosisEngine:
    """
    Deterministic rule-based Financial Diagnosis Engine.
    Exposes strengths, risks, ranked priorities, and actionable recommendations
    based strictly on mathematical rules derived from user context metrics.
    """

    def analyze_financials(self, rules: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        profile = context.get("profile", {})
        incomes = context.get("incomes", [])
        expenses = context.get("expenses", [])
        assets = context.get("assets", [])
        liabilities = context.get("liabilities", [])
        goals = context.get("goals", [])

        # 1. Base inputs verification for missing/insufficient data checks
        total_income = sum(float(i.get("amount", 0)) for i in incomes)
        total_expenses = sum(float(e.get("amount", 0)) for e in expenses)
        total_emi = sum(float(l.get("emi", 0)) for l in liabilities)
        
        # If no profile parameters or basic cashflow indicators, declare insufficient data
        if not profile or (total_income == 0 and total_expenses == 0 and not assets and not liabilities):
            return {
                "overall_state": {
                    "label": "Insufficient Data",
                    "summary": "Please complete your onboarding profile or input your monthly cashflow values to generate financial insights.",
                    "score": 0
                },
                "strengths": [],
                "risks": [],
                "priorities": [],
                "recommendations": []
            }

        savings_rate = rules.get("savings_rate_pct", 0.0)
        dti_ratio = rules.get("dti_ratio_pct", 0.0)
        emergency_runway = rules.get("emergency_runway_months", 0.0)
        health_score = rules.get("financial_health_score", 50)
        net_worth = rules.get("net_worth", 0.0)

        strengths = []
        risks = []
        priority_candidates = []
        recommendations = []

        # Calculate user-specific cashflow details
        monthly_surplus = total_income - total_expenses - total_emi

        # -- Evaluation 1: Emergency Runway --
        emergency_fund_current = float(profile.get("emergency_fund", 0))
        monthly_essential_burn = float(profile.get("monthly_expenses", 0))
        target_runway = 6.0
        target_reserve = target_runway * monthly_essential_burn
        gap = max(0.0, target_reserve - emergency_fund_current)

        # Ensure property, gold, and other long-term assets are NOT counted as emergency reserves
        # Only the dedicated 'emergency_fund' from the profile is used.

        if emergency_runway >= target_runway:
            strengths.append({
                "id": "strength_emergency_runway",
                "category": "Liquidity",
                "title": "Robust Emergency Buffer",
                "description": f"Your cash holdings cover {emergency_runway:.1f} months of essential expenses, satisfying stability benchmarks.",
                "evidence": {
                    "current_runway": emergency_runway,
                    "target_minimum": target_runway,
                    "current_reserve": emergency_fund_current,
                    "target_reserve": target_reserve,
                    "gap": gap,
                    "monthly_burn": monthly_essential_burn
                }
            })
        else:
            severity = "critical" if emergency_runway < 1.5 else ("high" if emergency_runway < 3.0 else "medium")
            risks.append({
                "id": "risk_emergency_runway",
                "category": "Liquidity",
                "title": "Low Emergency Buffer",
                "severity": severity,
                "description": f"You only have {emergency_runway:.1f} months of emergency runway, exposing you to unexpected financial disruptions.",
                "evidence": {
                    "current_runway": emergency_runway,
                    "target_minimum": target_runway,
                    "current_reserve": emergency_fund_current,
                    "target_reserve": target_reserve,
                    "gap": gap,
                    "monthly_burn": monthly_essential_burn
                }
            })
            priority_candidates.append({
                "id": "priority_emergency_runway",
                "score": (target_runway - emergency_runway) * 20.0,
                "category": "Liquidity",
                "title": "Build Emergency Fund",
                "severity": severity,
                "reason": "Liquid cash reserves are key to avoiding debt or premature asset liquidation during unexpected cash flows.",
                "evidence": {
                    "current_runway": emergency_runway,
                    "target_minimum": target_runway,
                    "gap": gap
                },
                "recommended_action": "Increase your emergency reserve until you reach the recommended liquidity target."
            })

            # Formulate user-specific action plan instead of arbitrary recommendations
            if monthly_surplus > 0:
                months_option_a = gap / (monthly_surplus * 0.5) if (monthly_surplus * 0.5) > 0 else 0
                months_option_b = gap / monthly_surplus if monthly_surplus > 0 else 0
                action_text = (
                    f"Option A: Redirect 50% of surplus (₹{monthly_surplus * 0.5:,.2f}/mo) -> achieves target in ~{months_option_a:.1f} months. "
                    f"Option B: Redirect 100% of surplus (₹{monthly_surplus:,.2f}/mo) -> achieves target in ~{months_option_b:.1f} months."
                )
            else:
                action_text = "Reduce discretionary spending to establish a positive monthly surplus and redirect funds to cover the emergency reserve gap."

            recommendations.append({
                "id": "rec_emergency_runway",
                "category": "Liquidity",
                "title": "Optimize Emergency Savings Rate",
                "reason": f"Emergency reserve has a gap of ₹{gap:,.2f} relative to your 6-month target of ₹{target_reserve:,.2f}.",
                "action": action_text,
                "evidence": {
                    "current_runway": emergency_runway,
                    "gap": gap,
                    "monthly_surplus": monthly_surplus
                }
            })

        # -- Evaluation 2: Savings Rate --
        # 30% is treated as a diagnostic heuristic, not a universal financial law
        heuristic_target = 30.0
        if savings_rate >= heuristic_target:
            strengths.append({
                "id": "strength_savings_rate",
                "category": "Savings",
                "title": "Strong Savings Surplus",
                "description": f"Saving {savings_rate:.1f}% of your monthly inflow represents clean surplus control (assessed against a 30% diagnostic heuristic).",
                "evidence": {
                    "savings_rate": savings_rate,
                    "heuristic_target": heuristic_target
                }
            })
        else:
            severity = "high" if savings_rate < 10.0 else "medium"
            risks.append({
                "id": "risk_savings_rate",
                "category": "Savings",
                "title": "Low Monthly Savings Rate",
                "severity": severity,
                "description": f"Your current monthly savings rate is at {savings_rate:.1f}%, falling below the diagnostic heuristic benchmark of 30%.",
                "evidence": {
                    "savings_rate": savings_rate,
                    "heuristic_target": heuristic_target
                }
            })
            priority_candidates.append({
                "id": "priority_savings_rate",
                "score": (heuristic_target - savings_rate) * 2.0,
                "category": "Savings",
                "title": "Boost Monthly Savings Rate",
                "severity": severity,
                "reason": "Lower savings rates limit your ability to scale long-term compound investments or handle sudden shifts.",
                "evidence": {
                    "savings_rate": savings_rate,
                    "heuristic_target": heuristic_target
                },
                "recommended_action": "Review non-essential expenses and optimize monthly outflows to increase savings."
            })
            
            recommendations.append({
                "id": "rec_savings_rate",
                "category": "Savings",
                "title": "Optimize Monthly Outflows",
                "reason": f"Your monthly surplus rate is {savings_rate:.1f}%, limiting long-term asset accumulation.",
                "action": f"Audit monthly subscriptions and living expenses to target an additional ₹{total_income * 0.05:,.2f} (5% of income) in monthly savings.",
                "evidence": {
                    "savings_rate": savings_rate,
                    "monthly_income": total_income
                }
            })

        # -- Evaluation 3: Debt-to-Income (DTI) --
        safe_threshold = 35.0
        if dti_ratio <= 15.0 and liabilities:
            strengths.append({
                "id": "strength_dti",
                "category": "Debt",
                "title": "Comfortable Debt Load",
                "description": f"Your monthly debt EMIs utilize only {dti_ratio:.1f}% of your income, representing healthy leverage.",
                "evidence": {
                    "dti_ratio": dti_ratio,
                    "safe_threshold": safe_threshold
                }
            })
        elif dti_ratio > safe_threshold:
            severity = "critical" if dti_ratio > 45.0 else "high"
            risks.append({
                "id": "risk_dti",
                "category": "Debt",
                "title": "Elevated Debt-to-Income Ratio",
                "severity": severity,
                "description": f"Your EMIs consume {dti_ratio:.1f}% of monthly income. This represents a heavy fixed burden.",
                "evidence": {
                    "dti_ratio": dti_ratio,
                    "safe_threshold": safe_threshold
                }
            })
            priority_candidates.append({
                "id": "priority_dti",
                "score": (dti_ratio - safe_threshold) * 5.0,
                "category": "Debt",
                "title": "Deleverage Outstanding Liabilities",
                "severity": severity,
                "reason": "High DTI ratios restrict cashflow flexibility and make goal contributions harder.",
                "evidence": {
                    "dti_ratio": dti_ratio,
                    "safe_threshold": safe_threshold
                },
                "recommended_action": "Review outstanding liabilities and implement a debt prepayment strategy."
            })
            recommendations.append({
                "id": "rec_dti",
                "category": "Debt",
                "title": "Debt Prepayment Strategy",
                "reason": f"EMIs consume {dti_ratio:.1f}% of monthly take-home income, exceeding healthy limits.",
                "action": "Review your debt profile to prioritize prepayment on high-interest loans or seek lower interest refinance rates.",
                "evidence": {
                    "dti_ratio": dti_ratio
                }
            })

        # -- Evaluation 4: Goals Funding Shortfall --
        shortfunded_goals = []
        for g in goals:
            target = float(g.get("target_amount", 1))
            saved = float(g.get("saved_amount", 0))
            if (saved / target) < 0.20:
                shortfunded_goals.append(g.get("goal_name"))

        if shortfunded_goals:
            risks.append({
                "id": "risk_goal_shortfall",
                "category": "Goals",
                "title": "Goal Progress Target Requires Trajectory Analysis",
                "severity": "medium",
                "description": f"Milestone goals like {', '.join(shortfunded_goals)} have under 20% funded progress. Note: Current timeline data is insufficient to fully assess trajectory, a limitation which will be addressed in Sprint 7D.2.",
                "evidence": {
                    "shortfunded_goals_count": len(shortfunded_goals),
                    "goals_under_threshold": shortfunded_goals
                }
            })

        # Final score label definition
        if health_score >= 80:
            label = "Excellent — Highly Resilient"
            summary = "Your financial position is exceptionally strong, marked by low debt and robust cash flows. Focus on scaling long-term compound wealth."
        elif health_score >= 60:
            label = "Stable — Needs Care"
            summary = "Your financial layout is stable, but liquidity optimization and debt refinement can unlock significant capacity."
        else:
            label = "Vulnerable — Restructure Urgently"
            summary = "Your balance sheet shows key weaknesses in emergency buffer or debt leverage. Focus on deleveraging and cash reserves immediately."

        # Sort and limit priorities to prevent recommendation overload (top 3)
        sorted_candidates = sorted(priority_candidates, key=lambda x: x["score"], reverse=True)[:3]
        
        # Format priorities sequentially (Rank 1, 2, 3)
        priorities = []
        for i, cand in enumerate(sorted_candidates, start=1):
            priorities.append({
                "id": cand["id"],
                "rank": i,
                "category": cand["category"],
                "title": cand["title"],
                "severity": cand["severity"],
                "reason": cand["reason"],
                "evidence": cand["evidence"],
                "recommended_action": cand["recommended_action"]
            })

        return {
            "overall_state": {
                "label": label,
                "summary": summary,
                "score": health_score
            },
            "strengths": strengths,
            "risks": risks,
            "priorities": priorities,
            "recommendations": recommendations
        }
