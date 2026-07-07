from decimal import Decimal
from typing import Dict, Any, List

class SimulationEngine:
    """
    Simulates specific financial scenarios and calculates mathematical outcomes on the profile and goals.
    """

    def simulate_scenario(
        self,
        scenario_type: str,
        inputs: Dict[str, Any],
        profile: Dict[str, Any],
        goals: List[Dict[str, Any]],
        liabilities: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        
        monthly_income = Decimal(str(profile.get("monthly_income", 0)))
        monthly_expenses = Decimal(str(profile.get("monthly_expenses", 0)))
        monthly_savings = Decimal(str(profile.get("monthly_savings", 0)))
        emergency_fund = Decimal(str(profile.get("emergency_fund", 0)))
        
        current_net_worth = Decimal(str(profile.get("monthly_savings", 0))) * 12 # simple estimate
        # if assets/liabilities are passed, we can sum them
        total_assets = Decimal(0)
        total_liabilities = sum(Decimal(str(l.get("outstanding", 0))) for l in liabilities)

        current_position = {
            "monthly_income": float(monthly_income),
            "monthly_expenses": float(monthly_expenses),
            "monthly_savings": float(monthly_savings),
            "emergency_fund": float(emergency_fund)
        }

        future_position = current_position.copy()
        cash_flow_diff = 0.0
        goal_delay_months = 0.0
        net_worth_diff = 0.0
        risk_level = "Low"
        recommendation = ""
        confidence = 0.90

        # Scenario Logic
        if scenario_type == "Purchase Vehicle":
            price = Decimal(str(inputs.get("price", 1000000)))
            downpayment = Decimal(str(inputs.get("downpayment", 200000)))
            loan_interest = Decimal(str(inputs.get("loan_interest", 9.5)))
            loan_tenure_years = int(inputs.get("loan_tenure_years", 5))
            
            # Reduce emergency fund or assets by downpayment
            future_position["emergency_fund"] = max(0.0, float(emergency_fund - downpayment))
            
            # Calculate EMI for remainder
            loan_amount = price - downpayment
            r = (loan_interest / 12) / 100
            n = loan_tenure_years * 12
            if r > 0:
                emi = loan_amount * r * ((1 + r) ** n) / (((1 + r) ** n) - 1)
            else:
                emi = loan_amount / n
                
            future_position["monthly_expenses"] = float(monthly_expenses + emi)
            future_position["monthly_savings"] = max(0.0, float(monthly_income - Decimal(str(future_position["monthly_expenses"]))))
            
            cash_flow_diff = -float(emi)
            net_worth_diff = -float(downpayment) # initial downpayment cash out
            
            # Goal Delay Estimate: how much does this delay Critical goals?
            savings_drop = float(monthly_savings) - future_position["monthly_savings"]
            if savings_drop > 0:
                goal_delay_months = float(price) / max(1.0, future_position["monthly_savings"])
                
            risk_level = "Medium" if future_position["emergency_fund"] > float(monthly_expenses * 3) else "High"
            recommendation = f"Instead of {downpayment} cash downpayment, explore pre-approved gold/mutual fund collateralized loan to keep compounding active."

        elif scenario_type == "Purchase Home":
            price = Decimal(str(inputs.get("price", 5000000)))
            downpayment = Decimal(str(inputs.get("downpayment", 1000000)))
            loan_interest = Decimal(str(inputs.get("loan_interest", 8.5)))
            loan_tenure_years = int(inputs.get("loan_tenure_years", 20))
            
            future_position["emergency_fund"] = max(0.0, float(emergency_fund - downpayment))
            loan_amount = price - downpayment
            r = (loan_interest / 12) / 100
            n = loan_tenure_years * 12
            emi = loan_amount * r * ((1 + r) ** n) / (((1 + r) ** n) - 1) if r > 0 else loan_amount / n
            
            future_position["monthly_expenses"] = float(monthly_expenses + emi)
            future_position["monthly_savings"] = max(0.0, float(monthly_income - Decimal(str(future_position["monthly_expenses"]))))
            
            cash_flow_diff = -float(emi)
            net_worth_diff = -float(downpayment)
            
            goal_delay_months = float(price) / max(1.0, future_position["monthly_savings"])
            risk_level = "High" if future_position["emergency_fund"] < float(monthly_expenses * 2) else "Medium"
            recommendation = "Optimize tax deductions under Sec 24(b) and 80EEA. Make 1 extra EMI payment annually to reduce tenure by 4.5 years."

        elif scenario_type in ["Career Switch", "Salary Reduction", "Salary Increase"]:
            new_salary = Decimal(str(inputs.get("new_salary", monthly_income)))
            future_position["monthly_income"] = float(new_salary)
            future_position["monthly_savings"] = max(0.0, float(new_salary - monthly_expenses))
            
            cash_flow_diff = float(new_salary - monthly_income)
            net_worth_diff = cash_flow_diff * 12.0
            
            if cash_flow_diff < 0:
                goal_delay_months = abs(cash_flow_diff) * 6.0 / max(1.0, float(monthly_savings))
                risk_level = "High"
                recommendation = "Cut discretionary spending by 25% immediately to match new income envelope."
            else:
                goal_delay_months = -float(cash_flow_diff) * 12.0 / max(1.0, float(monthly_savings))
                risk_level = "Low"
                recommendation = "Reallocate 70% of the salary increment directly to SIPs targeting under-funded goals."

        elif scenario_type == "Unexpected Medical Expense":
            cost = Decimal(str(inputs.get("cost", 500000)))
            insurance_claim = Decimal(str(inputs.get("insurance_claim", 300000)))
            out_of_pocket = max(Decimal(0), cost - insurance_claim)
            
            future_position["emergency_fund"] = max(0.0, float(emergency_fund - out_of_pocket))
            net_worth_diff = -float(out_of_pocket)
            risk_level = "High" if future_position["emergency_fund"] < float(monthly_expenses * 3) else "Medium"
            recommendation = "Replenish emergency fund via temporary halt of non-essential SIPs for 3 months."

        elif scenario_type == "Vacation":
            cost = Decimal(str(inputs.get("cost", 300000)))
            future_position["emergency_fund"] = max(0.0, float(emergency_fund - cost))
            net_worth_diff = -float(cost)
            goal_delay_months = float(cost) / max(1.0, float(monthly_savings))
            risk_level = "Low" if future_position["emergency_fund"] >= float(monthly_expenses * 6) else "Medium"
            recommendation = "Fund the vacation using a separate short-term recurring deposit rather than draining emergency runway."

        else:
            # Fallback/Default Simulation (General)
            cost = Decimal(str(inputs.get("cost", 100000)))
            future_position["emergency_fund"] = max(0.0, float(emergency_fund - cost))
            net_worth_diff = -float(cost)
            risk_level = "Low"
            recommendation = "Review standard budget parameters before allocating surplus cash."

        return {
            "current_position": current_position,
            "future_position": future_position,
            "cash_flow_difference": cash_flow_diff,
            "goal_delay_months": max(0.0, goal_delay_months),
            "net_worth_difference": net_worth_diff,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "confidence": confidence
        }
