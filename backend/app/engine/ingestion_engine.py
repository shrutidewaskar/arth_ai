import re
import datetime
from typing import Dict, Any, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.financials import CandidateFinancialEntity, IncomeSource, ExpenseCategory, Liability, Subscription, Investment, Document

class IngestionEngine:
    """
    Deterministic Ingestion Engine for Stage 5D & 5D.1.
    Transforms raw facts and extracted transactions into reviewable, provenance-aware
    CandidateFinancialEntity records staged under PENDING_REVIEW.
    
    Integrity Guarantees:
    - Calculates semantic confidence explicitly (or leaves None if unknown).
    - Prevents duplicate candidate staging from overlapping/repeated statements.
    - Preserves deep provenance links (document, page, excerpt, transaction date/line) through approval.
    - Enforces state machine transitions (cannot re-approve a REJECTED candidate without valid transition).
    - Validates edited candidate data strictly.
    - Preserves existing manual state unless explicitly updated.
    """

    MERCHANT_RULES = [
        # Subscriptions
        {"pattern": r'(netflix|spotify|prime\s*video|hotstar|disney|apple\.com|adobe|aws|google\s*one)', "merchant": "Subscription Service", "category": "Entertainment", "type": "SUBSCRIPTION"},
        # Food & Groceries
        {"pattern": r'(swiggy|zomato|zepto|blinkit|instamart|bbnow|bigbasket)', "merchant": "Food & Groceries", "category": "Food & Dining", "type": "EXPENSE"},
        # Rent
        {"pattern": r'(rent|house\s*rent|owner\s*rent|landlord)', "merchant": "House Rent", "category": "Housing & Rent", "type": "EXPENSE"},
        # Loan EMI
        {"pattern": r'(hdfc\s*ltd|sbi\s*home|icici\s*bank\s*loan|bajaj\s*finserv|emi\s*debit|loan\s*installment)', "merchant": "Loan Provider", "category": "Debt Repayment", "type": "LIABILITY"},
        # Investments & SIP
        {"pattern": r'(groww|zerodha|cams|kfintech|uti\s*mf|nippon|hdfc\s*mutual|sbi\s*mutual|axis\s*mf|sip\s*debit)', "merchant": "Investment Platform", "category": "Investments & SIP", "type": "INVESTMENT"},
        # Salary / Income
        {"pattern": r'(salary|payroll|acme\s*tech|wipro|infosys|tcs|direct\s*credit\s*salary|contract\s*pay)', "merchant": "Employer / Client", "category": "Salary", "type": "INCOME"},
        # Utilities
        {"pattern": r'(electricity|bescom|tneb|mahadiscom|airtel|jio|act\s*corp|tatasky|gas\s*bill)', "merchant": "Utilities Provider", "category": "Utilities", "type": "EXPENSE"},
        # Internal Account Transfer / Self Transfer (Not an expense)
        {"pattern": r'(self\s*transfer|transfer\s*to\s*own|own\s*acc|internal\s*fund\s*transfer|neft\s*to\s*self)', "merchant": "Own Account Transfer", "category": "Transfer", "type": "TRANSFER"}
    ]

    def normalize_transaction(self, raw_desc: str, amount: float, direction: str) -> Dict[str, Any]:
        """
        Normalizes raw statement description into clean merchant, candidate_type, and category.
        Avoids blindly defaulting ambiguous debits to EXPENSE:
        - Transfers tagged as TRANSFER
        - Ambiguous debits without high-confidence match tagged as NEEDS_REVIEW
        """
        desc_lower = raw_desc.lower()
        
        for rule in self.MERCHANT_RULES:
            if re.search(rule["pattern"], desc_lower):
                return {
                    "matched_merchant": rule["merchant"],
                    "suggested_category": rule["category"],
                    "candidate_type": rule["type"],
                    "confidence": 0.92
                }
                
        # Ambiguity Handling: Do NOT blindly classify unknown transactions as EXPENSE
        if direction == "CREDIT":
            return {
                "matched_merchant": raw_desc.strip(),
                "suggested_category": "Unclassified Inflow",
                "candidate_type": "INCOME",
                "confidence": 0.65
            }
        else:
            # Check if this is an ambiguous large debit or unknown transfer
            if "transfer" in desc_lower or "trf" in desc_lower or "upi" in desc_lower:
                return {
                    "matched_merchant": raw_desc.strip(),
                    "suggested_category": "Review Required",
                    "candidate_type": "NEEDS_REVIEW",
                    "confidence": None # Explicitly unknown
                }
            return {
                "matched_merchant": raw_desc.strip(),
                "suggested_category": "Review Required",
                "candidate_type": "NEEDS_REVIEW",
                "confidence": None
            }

    async def detect_conflicts(
        self,
        db: AsyncSession,
        user_id: UUID
    ) -> List[Dict[str, Any]]:
        """
        Detects discrepancies between candidate financial evidence and existing canonical records.
        Surfaces corroborating independent sources and explicit recommendations.
        """
        conflicts = []
        
        # 1. Fetch pending candidates
        cand_res = await db.execute(
            select(CandidateFinancialEntity).filter(
                CandidateFinancialEntity.user_id == user_id,
                CandidateFinancialEntity.status.in_(["PENDING_REVIEW", "CONFLICT_DETECTED"])
            )
        )
        candidates = cand_res.scalars().all()
        
        # 2. Fetch canonical state
        incomes_res = await db.execute(select(IncomeSource).filter(IncomeSource.user_id == user_id, IncomeSource.active == True))
        canonical_incomes = incomes_res.scalars().all()
        
        liabs_res = await db.execute(select(Liability).filter(Liability.user_id == user_id))
        canonical_liabs = liabs_res.scalars().all()
        
        for c in candidates:
            c_data = c.suggested_data or {}
            c_prov = c.provenance or {}
            
            # Conflict Check on INCOME (e.g., Manual Salary vs Extracted Salary)
            if c.candidate_type == "INCOME":
                s_amt = float(c_data.get("amount", 0))
                s_name = c_data.get("source_name", "").lower()
                for inc in canonical_incomes:
                    inc_amt = float(inc.amount)
                    inc_name = (inc.source_name or "").lower()
                    
                    # Match by source name or salary type
                    if (s_name in inc_name or inc_name in s_name or "salary" in inc_name or "salary" in s_name) and abs(s_amt - inc_amt) > 1.0:
                        # Count independent corroborating documents for this higher/different amount
                        matching_cands = [
                            other for other in candidates
                            if other.candidate_type == "INCOME" and abs(float(other.suggested_data.get("amount", 0)) - s_amt) < 1.0
                        ]
                        sources = list({other.provenance.get("file_name", "Document") for other in matching_cands if other.provenance.get("file_name")})
                        
                        conflicts.append({
                            "candidate_id": c.id,
                            "candidate_type": "INCOME",
                            "field_name": "amount",
                            "canonical_entity_id": inc.id,
                            "canonical_value": inc_amt,
                            "canonical_source": "Manual Profile Entry",
                            "suggested_value": s_amt,
                            "suggested_source": c_prov.get("file_name", "Uploaded Document"),
                            "corroborating_sources": sources,
                            "explanation": f"{len(sources)} independent source(s) ({', '.join(sources)}) report ₹{s_amt:,.2f}, while your existing profile records ₹{inc_amt:,.2f}.",
                            "recommended_action": f"Update income to ₹{s_amt:,.2f} based on corroborated evidence."
                        })
                        
            # Conflict Check on LIABILITY (e.g., Declining Loan Outstanding / Rate Difference)
            elif c.candidate_type == "LIABILITY":
                s_out = float(c_data.get("outstanding", 0))
                s_loan = c_data.get("loan_name", "").lower()
                for liab in canonical_liabs:
                    liab_out = float(liab.outstanding)
                    liab_loan = (liab.loan_name or "").lower()
                    
                    # Check if loans refer to the same institution
                    if any(w in liab_loan for w in s_loan.split() if len(w) > 3) and abs(s_out - liab_out) > 1.0:
                        conflicts.append({
                            "candidate_id": c.id,
                            "candidate_type": "LIABILITY",
                            "field_name": "outstanding",
                            "canonical_entity_id": liab.id,
                            "canonical_value": liab_out,
                            "canonical_source": "Previous Canonical Balance",
                            "suggested_value": s_out,
                            "suggested_source": c_prov.get("file_name", "Latest Statement"),
                            "corroborating_sources": [c_prov.get("file_name", "Statement")],
                            "explanation": f"Latest statement reports ₹{s_out:,.2f} outstanding, compared to recorded balance of ₹{liab_out:,.2f}.",
                            "recommended_action": f"Reconcile liability balance to ₹{s_out:,.2f} (Temporal Observation Update)."
                        })

        return conflicts


    async def generate_candidates_from_document(
        self,
        db: AsyncSession,
        document_id: UUID,
        user_id: UUID,
        doc_type: str,
        page_texts: Dict[int, str],
        facts: List[Dict[str, Any]],
        file_name: str
    ) -> List[CandidateFinancialEntity]:
        """
        Processes document evidence and stages candidate financial facts.
        Applies deduplication and verification against previously staged candidates.
        """
        candidates: List[CandidateFinancialEntity] = []

        # Load existing candidates for this user to deduplicate transactions/liabilities
        existing_cands_res = await db.execute(
            select(CandidateFinancialEntity).filter(CandidateFinancialEntity.user_id == user_id)
        )
        user_existing_cands = existing_cands_res.scalars().all()

        # 1. LOAN STATEMENT SLICE
        if doc_type == "LOAN_STATEMENT":
            fact_map = {f["fact_key"]: f["fact_value"] for f in facts}
            if fact_map.get("outstanding") or fact_map.get("emi") or fact_map.get("principal"):
                lender = fact_map.get("lender", "Financial Institution").upper()
                loan_type = fact_map.get("loan_type", "Personal Loan").title()
                
                outstanding = float(fact_map.get("outstanding") or fact_map.get("principal") or 0.0)
                principal = float(fact_map.get("principal") or outstanding)
                emi = float(fact_map.get("emi") or 0.0)
                interest_rate = float(fact_map.get("interest_rate") or 10.5)
                
                loan_name = f"{lender} {loan_type}"
                
                # Deduplicate against duplicate staging of the exact same document or identical pending candidate
                is_duplicate = False
                for c in user_existing_cands:
                    if c.candidate_type == "LIABILITY":
                        if c.document_id == document_id:
                            is_duplicate = True
                            break
                        if c.status == "PENDING_REVIEW":
                            c_loan = c.suggested_data.get("loan_name", "")
                            if lender.lower() in c_loan.lower() and abs(float(c.suggested_data.get("outstanding", 0)) - outstanding) < 1.0 and abs(float(c.suggested_data.get("emi", 0)) - emi) < 1.0:
                                is_duplicate = True
                                break
                            
                if not is_duplicate:
                    cand = CandidateFinancialEntity(
                        user_id=user_id,
                        document_id=document_id,
                        candidate_type="LIABILITY",
                        status="PENDING_REVIEW",
                        confidence=0.95,
                        suggested_data={
                            "loan_name": loan_name,
                            "loan_type": loan_type,
                            "principal": principal,
                            "outstanding": outstanding,
                            "interest_rate": interest_rate,
                            "emi": emi
                        },
                        provenance={
                            "document_id": str(document_id),
                            "file_name": file_name,
                            "source_page": facts[0]["source_page"] if facts else 1,
                            "raw_facts": fact_map,
                            "extraction_method": "deterministic_regex_rule"
                        }
                    )
                    db.add(cand)
                    candidates.append(cand)

        # 2. SALARY SLIP SLICE
        elif doc_type == "SALARY_SLIP":
            fact_map = {f["fact_key"]: f["fact_value"] for f in facts}
            net_income = float(fact_map.get("net_income") or fact_map.get("gross_income") or 0.0)
            if net_income > 0:
                employer = fact_map.get("employer", "Company Salary").strip()
                
                # Deduplicate against existing salary candidates from exact same period/doc
                is_duplicate = any(
                    c.candidate_type == "INCOME" and c.document_id == document_id
                    for c in user_existing_cands
                )
                if not is_duplicate:
                    cand = CandidateFinancialEntity(
                        user_id=user_id,
                        document_id=document_id,
                        candidate_type="INCOME",
                        status="PENDING_REVIEW",
                        confidence=0.96,
                        suggested_data={
                            "source_name": employer,
                            "type": "Salary",
                            "amount": net_income,
                            "frequency": "Monthly"
                        },
                        provenance={
                            "document_id": str(document_id),
                            "file_name": file_name,
                            "source_page": facts[0]["source_page"] if facts else 1,
                            "raw_facts": fact_map,
                            "extraction_method": "deterministic_regex_rule"
                        }
                    )
                    db.add(cand)
                    candidates.append(cand)

        # 3. BANK STATEMENT TRANSACTIONS SLICE
        elif doc_type == "BANK_STATEMENT":
            from app.documents.extractor import FinancialFactExtractor
            extractor = FinancialFactExtractor()
            transactions = extractor.extract_bank_transactions(page_texts)
            
            for tx in transactions:
                norm = self.normalize_transaction(tx["raw_description"], tx["amount"], tx["direction"])
                c_type = norm["candidate_type"]
                
                # Deduplicate overlapping transactions (same date, exact amount, and same raw description)
                tx_dup = False
                for c in user_existing_cands:
                    p = c.provenance or {}
                    c_amt = float(
                        c.suggested_data.get("amount", 0) or 
                        c.suggested_data.get("emi", 0) or 
                        c.suggested_data.get("current_value", 0) or 
                        c.suggested_data.get("total_invested", 0)
                    )
                    if (
                        p.get("transaction_date") == tx["date"] and
                        abs(c_amt - tx["amount"]) < 0.01 and
                        p.get("raw_description") == tx["raw_description"]
                    ):
                        tx_dup = True
                        break
                        
                if tx_dup:
                    continue # Skip duplicating previously ingested identical statement transaction
                
                # Deduplicate Bank EMI transaction if a formal Loan Statement liability already exists
                if c_type == "LIABILITY":
                    existing_loan_match = any(
                        c.candidate_type == "LIABILITY" and
                        (abs(float(c.suggested_data.get("emi", 0)) - tx["amount"]) < 1.0 or
                         norm["matched_merchant"].lower() in c.suggested_data.get("loan_name", "").lower())
                        for c in user_existing_cands
                    )
                    if existing_loan_match:
                        # Transaction acts as supporting evidence, does not stage second conflicting liability
                        continue

                # Format suggested data by candidate type
                if c_type == "INCOME":
                    s_data = {
                        "source_name": norm["matched_merchant"],
                        "type": "Salary" if "salary" in tx["raw_description"].lower() else "Other",
                        "amount": tx["amount"],
                        "frequency": "Monthly"
                    }
                elif c_type == "LIABILITY":
                    s_data = {
                        "loan_name": f"{norm['matched_merchant']} Loan",
                        "loan_type": "Personal / Auto",
                        "principal": tx["amount"] * 24, # Estimator default
                        "outstanding": tx["amount"] * 24,
                        "interest_rate": 10.0,
                        "emi": tx["amount"]
                    }
                elif c_type == "SUBSCRIPTION":
                    s_data = {
                        "service_name": norm["matched_merchant"],
                        "category": norm["suggested_category"],
                        "amount": tx["amount"],
                        "billing_cycle": "Monthly"
                    }
                elif c_type == "INVESTMENT":
                    s_data = {
                        "asset_type": "Mutual Funds",
                        "institution": norm["matched_merchant"],
                        "current_value": tx["amount"],
                        "total_invested": tx["amount"]
                    }
                else: # EXPENSE
                    s_data = {
                        "category": norm["suggested_category"],
                        "amount": tx["amount"]
                    }

                cand = CandidateFinancialEntity(
                    user_id=user_id,
                    document_id=document_id,
                    candidate_type=c_type,
                    status="PENDING_REVIEW",
                    confidence=norm["confidence"],
                    suggested_data=s_data,
                    provenance={
                        "document_id": str(document_id),
                        "file_name": file_name,
                        "source_page": tx["source_page"],
                        "transaction_date": tx["date"],
                        "raw_description": tx["raw_description"],
                        "raw_line": tx["raw_line"],
                        "extraction_method": "tabular_transaction_parser"
                    }
                )
                db.add(cand)
                candidates.append(cand)
                user_existing_cands.append(cand)

        await db.flush()
        return candidates

    async def approve_candidate(
        self,
        db: AsyncSession,
        candidate_id: UUID,
        user_id: UUID,
        override_data: Optional[Dict[str, Any]] = None
    ) -> CandidateFinancialEntity:
        """
        Human-in-the-Loop promotion: Commits approved candidate to canonical financial state.
        Guarantees:
        - Idempotency: re-approving an approved candidate does not duplicate canonical records.
        - Rejection safety: cannot directly approve a candidate in REJECTED state.
        - Validation: rejects negative or invalid numbers during approval/editing.
        - Provenance retention: candidate retains reference to created canonical entity id.
        """
        res = await db.execute(
            select(CandidateFinancialEntity).filter(
                CandidateFinancialEntity.id == candidate_id,
                CandidateFinancialEntity.user_id == user_id
            )
        )
        candidate = res.scalars().first()
        if not candidate:
            raise ValueError(f"Candidate {candidate_id} not found.")

        # Rejection Safety: REJECTED candidates cannot be approved without explicit reset
        if candidate.status == "REJECTED":
            raise ValueError("Cannot approve a candidate that has been REJECTED.")

        # Idempotency: if already APPROVED and no new override data provided, return existing state
        if candidate.status == "APPROVED" and not override_data:
            return candidate

        data = {**candidate.suggested_data, **(override_data or {})}

        # Validate numeric fields strictly
        for num_field in ["amount", "principal", "outstanding", "emi", "interest_rate", "current_value", "total_invested"]:
            if num_field in data:
                try:
                    val = float(data[num_field])
                    if val < 0:
                        raise ValueError(f"Field '{num_field}' cannot be negative.")
                    data[num_field] = val
                except (TypeError, ValueError) as e:
                    raise ValueError(f"Invalid numeric value for field '{num_field}': {str(e)}")

        canonical_id = candidate.canonical_entity_id

        if candidate.candidate_type == "INCOME":
            src_name = data.get("source_name", "Income Source")
            if canonical_id:
                inc_res = await db.execute(select(IncomeSource).filter(IncomeSource.id == canonical_id, IncomeSource.user_id == user_id))
                inc = inc_res.scalars().first()
            else:
                # Entity matching: exact match or partial salary match
                inc_res = await db.execute(select(IncomeSource).filter(IncomeSource.user_id == user_id))
                all_incs = inc_res.scalars().all()
                inc = next(
                    (i for i in all_incs if (src_name.lower() in i.source_name.lower() or i.source_name.lower() in src_name.lower() or ("salary" in src_name.lower() and "salary" in i.source_name.lower()))),
                    None
                )

            if inc:
                inc.source_name = src_name if src_name != "Employer / Client" else inc.source_name
                inc.amount = float(data.get("amount", inc.amount))
                inc.type = data.get("type", inc.type)
                canonical_id = inc.id
            else:
                new_inc = IncomeSource(
                    user_id=user_id,
                    source_name=src_name,
                    type=data.get("type", "Salary"),
                    amount=float(data.get("amount", 0.0))
                )
                db.add(new_inc)
                await db.flush()
                canonical_id = new_inc.id

        elif candidate.candidate_type == "EXPENSE":
            cat_name = data.get("category", "General Expense")
            if canonical_id:
                exp_res = await db.execute(select(ExpenseCategory).filter(ExpenseCategory.id == canonical_id, ExpenseCategory.user_id == user_id))
                exp = exp_res.scalars().first()
            else:
                exp_res = await db.execute(select(ExpenseCategory).filter(ExpenseCategory.user_id == user_id, ExpenseCategory.category == cat_name))
                exp = exp_res.scalars().first()

            if exp:
                exp.category = cat_name
                exp.amount = float(data.get("amount", exp.amount))
                canonical_id = exp.id
            else:
                new_exp = ExpenseCategory(
                    user_id=user_id,
                    category=cat_name,
                    amount=float(data.get("amount", 0.0))
                )
                db.add(new_exp)
                await db.flush()
                canonical_id = new_exp.id

        elif candidate.candidate_type == "LIABILITY":
            loan_name = data.get("loan_name", "Loan")
            if canonical_id:
                liab_res = await db.execute(select(Liability).filter(Liability.id == canonical_id, Liability.user_id == user_id))
                liab = liab_res.scalars().first()
            else:
                # Entity matching: Match existing liability by institution/lender keywords
                all_liabs = (await db.execute(select(Liability).filter(Liability.user_id == user_id))).scalars().all()
                liab = None
                for l in all_liabs:
                    # check overlapping meaningful tokens (e.g., 'hdfc', 'sbi', 'icici', 'home', 'loan')
                    tokens_cand = [t for t in loan_name.lower().split() if len(t) > 3]
                    tokens_exist = [t for t in l.loan_name.lower().split() if len(t) > 3]
                    if any(t in tokens_exist for t in tokens_cand) or l.loan_name.lower() == loan_name.lower():
                        liab = l
                        break

            if liab:
                # Source Authority & Temporal tracking:
                # If incoming is a loan statement or explicit update, update outstanding & terms
                if "outstanding" in data and data["outstanding"] > 0:
                    liab.outstanding = float(data["outstanding"])
                if "principal" in data and data["principal"] > 0 and (liab.principal == 0 or data.get("principal") != data.get("outstanding")):
                    liab.principal = float(data["principal"])
                if "interest_rate" in data and data["interest_rate"] > 0:
                    liab.interest_rate = float(data["interest_rate"])
                if "emi" in data and data["emi"] > 0:
                    liab.emi = float(data["emi"])
                if loan_name != "Loan Provider Loan":
                    liab.loan_name = loan_name
                canonical_id = liab.id
            else:
                new_liab = Liability(
                    user_id=user_id,
                    loan_name=loan_name,
                    loan_type=data.get("loan_type", "Personal"),
                    principal=float(data.get("principal", 0.0)),
                    outstanding=float(data.get("outstanding", 0.0)),
                    interest_rate=float(data.get("interest_rate", 10.0)),
                    emi=float(data.get("emi", 0.0))
                )
                db.add(new_liab)
                await db.flush()
                canonical_id = new_liab.id

        elif candidate.candidate_type == "SUBSCRIPTION":
            svc_name = data.get("service_name", "Subscription")
            if canonical_id:
                sub_res = await db.execute(select(Subscription).filter(Subscription.id == canonical_id, Subscription.user_id == user_id))
                sub = sub_res.scalars().first()
            else:
                sub_res = await db.execute(select(Subscription).filter(Subscription.user_id == user_id, Subscription.service == svc_name))
                sub = sub_res.scalars().first()

            if sub:
                sub.service = svc_name
                sub.amount = float(data.get("amount", sub.amount))
                canonical_id = sub.id
            else:
                new_sub = Subscription(
                    user_id=user_id,
                    service=svc_name,
                    amount=float(data.get("amount", 0.0)),
                    billing_cycle=data.get("billing_cycle", "Monthly")
                )
                db.add(new_sub)
                await db.flush()
                canonical_id = new_sub.id

        elif candidate.candidate_type == "INVESTMENT":
            inst_name = data.get("institution", "Mutual Fund")
            if canonical_id:
                inv_res = await db.execute(select(Investment).filter(Investment.id == canonical_id, Investment.user_id == user_id))
                inv = inv_res.scalars().first()
            else:
                inv_res = await db.execute(select(Investment).filter(Investment.user_id == user_id, Investment.platform == inst_name))
                inv = inv_res.scalars().first()

            if inv:
                inv.platform = inst_name
                inv.current_value = float(data.get("current_value", inv.current_value))
                canonical_id = inv.id
            else:
                new_inv = Investment(
                    user_id=user_id,
                    investment_type=data.get("asset_type", "MutualFunds"),
                    platform=inst_name,
                    current_value=float(data.get("current_value", 0.0)),
                    invested_amount=float(data.get("total_invested", 0.0))
                )
                db.add(new_inv)
                await db.flush()
                canonical_id = new_inv.id

        # Update candidate record with provenance link
        candidate.status = "APPROVED" if not override_data else "EDITED"
        candidate.canonical_entity_id = canonical_id
        candidate.reviewed_at = datetime.datetime.now(datetime.timezone.utc)
        if override_data:
            candidate.suggested_data = data

        await db.flush()
        return candidate

    async def reject_candidate(
        self,
        db: AsyncSession,
        candidate_id: UUID,
        user_id: UUID
    ) -> CandidateFinancialEntity:
        """
        Rejects a candidate fact without modifying any canonical financial state.
        """
        res = await db.execute(
            select(CandidateFinancialEntity).filter(
                CandidateFinancialEntity.id == candidate_id,
                CandidateFinancialEntity.user_id == user_id
            )
        )
        candidate = res.scalars().first()
        if not candidate:
            raise ValueError(f"Candidate {candidate_id} not found.")

        candidate.status = "REJECTED"
        candidate.reviewed_at = datetime.datetime.now(datetime.timezone.utc)
        await db.flush()
        return candidate
