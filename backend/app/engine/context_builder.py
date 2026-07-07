import datetime
import uuid
from decimal import Decimal
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.financials import (
    FinancialProfile, IncomeSource, ExpenseCategory,
    Asset, Liability, Goal, Investment, Insurance,
    Subscription, Document, AIInsight, AIMemory, Conversation
)

class ContextBuilder:
    """
    Builds a unified read-only context object containing the entire financial profile of the user.
    The LLM never directly queries the database.
    """

    async def build_context(self, user_id: Any, db: AsyncSession) -> Dict[str, Any]:
        # 1. Fetch Profile
        profile_res = await db.execute(select(FinancialProfile).filter(FinancialProfile.user_id == user_id))
        profile = profile_res.scalars().first()
        profile_dict = self._to_dict(profile) if profile else {}

        # 2. Fetch Lists of Financial Sub-entities
        income_res = await db.execute(select(IncomeSource).filter(IncomeSource.user_id == user_id, IncomeSource.active == True))
        incomes = [self._to_dict(x) for x in income_res.scalars().all()]

        expense_res = await db.execute(select(ExpenseCategory).filter(ExpenseCategory.user_id == user_id))
        expenses = [self._to_dict(x) for x in expense_res.scalars().all()]

        asset_res = await db.execute(select(Asset).filter(Asset.user_id == user_id))
        assets = [self._to_dict(x) for x in asset_res.scalars().all()]

        liability_res = await db.execute(select(Liability).filter(Liability.user_id == user_id))
        liabilities = [self._to_dict(x) for x in liability_res.scalars().all()]

        goal_res = await db.execute(select(Goal).filter(Goal.user_id == user_id))
        goals = [self._to_dict(x) for x in goal_res.scalars().all()]

        investment_res = await db.execute(select(Investment).filter(Investment.user_id == user_id))
        investments = [self._to_dict(x) for x in investment_res.scalars().all()]

        insurance_res = await db.execute(select(Insurance).filter(Insurance.user_id == user_id))
        insurances = [self._to_dict(x) for x in insurance_res.scalars().all()]

        sub_res = await db.execute(select(Subscription).filter(Subscription.user_id == user_id, Subscription.active == True))
        subscriptions = [self._to_dict(x) for x in sub_res.scalars().all()]

        doc_res = await db.execute(select(Document).filter(Document.user_id == user_id))
        documents = [self._to_dict(x) for x in doc_res.scalars().all()]

        insight_res = await db.execute(select(AIInsight).filter(AIInsight.user_id == user_id))
        insights = [self._to_dict(x) for x in insight_res.scalars().all()]

        memory_res = await db.execute(select(AIMemory).filter(AIMemory.user_id == user_id))
        memories = [self._to_dict(x) for x in memory_res.scalars().all()]

        # Generate upcoming bills
        upcoming_bills = []
        today = datetime.date.today()
        for s in subscriptions:
            rdate = s.get("renewal_date")
            if rdate:
                # If rdate is string or datetime
                if isinstance(rdate, str):
                    rdate = datetime.date.fromisoformat(rdate)
                elif isinstance(rdate, (datetime.datetime, datetime.date)):
                    if isinstance(rdate, datetime.datetime):
                        rdate = rdate.date()
                if 0 <= (rdate - today).days <= 30:
                    upcoming_bills.append({
                        "service": s.get("service"),
                        "amount": s.get("amount"),
                        "due_date": rdate.isoformat()
                    })

        for ins in insurances:
            rdate = ins.get("renewal_date")
            if rdate:
                if isinstance(rdate, str):
                    rdate = datetime.date.fromisoformat(rdate)
                elif isinstance(rdate, (datetime.datetime, datetime.date)):
                    if isinstance(rdate, datetime.datetime):
                        rdate = rdate.date()
                if 0 <= (rdate - today).days <= 30:
                    upcoming_bills.append({
                        "service": f"Insurance: {ins.get('policy_name')}",
                        "amount": ins.get("premium"),
                        "due_date": rdate.isoformat()
                    })

        return {
            "current_date": today.isoformat(),
            "profile": profile_dict,
            "incomes": incomes,
            "expenses": expenses,
            "assets": assets,
            "liabilities": liabilities,
            "goals": goals,
            "investments": investments,
            "insurance": insurances,
            "subscriptions": subscriptions,
            "documents": documents,
            "insights": insights,
            "memories": memories,
            "upcoming_bills": upcoming_bills
        }

    def _to_dict(self, model_obj: Any) -> Dict[str, Any]:
        if not model_obj:
            return {}
        d = {}
        for col in model_obj.__table__.columns:
            val = getattr(model_obj, col.name)
            if isinstance(val, Decimal):
                val = float(val)
            elif isinstance(val, (datetime.datetime, datetime.date)):
                val = val.isoformat()
            elif isinstance(val, uuid.UUID):
                val = str(val)
            d[col.name] = val
        return d
