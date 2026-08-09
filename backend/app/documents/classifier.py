class DocumentClassifier:
    """
    Keyword-based document type classifier. Matches text against standard signals.
    """
    def classify_text(self, text: str) -> dict:
        text_lower = text.lower()
        
        # Keyword mappings
        signals = {
            "LOAN_STATEMENT": ["loan", "emi", "principal", "outstanding", "interest rate", "tenure", "lender"],
            "INSURANCE_POLICY": ["policy", "sum insured", "premium", "renewal", "beneficiary", "insurer"],
            "SALARY_SLIP": ["salary", "payslip", "earning", "gross salary", "net pay", "basic salary", "deductions"],
            "BANK_STATEMENT": ["statement of account", "transaction date", "debit", "credit", "balance", "withdrawal", "deposit"],
            "INVESTMENT_STATEMENT": ["portfolio", "mutual fund", "units", "nav", "investment value", "groww", "zerodha"],
            "TAX_DOCUMENT": ["tax return", "itr", "form 16", "assessment year", "taxable income"],
            "CREDIT_CARD_STATEMENT": ["credit card", "minimum amount due", "billing cycle", "card number", "credit limit"]
        }
        
        scores = {}
        for doc_type, keywords in signals.items():
            match_count = sum(1 for kw in keywords if kw in text_lower)
            if match_count > 0:
                scores[doc_type] = match_count
                
        if not scores:
            return {"document_type": "OTHER", "confidence": 1.0}
            
        # Select best match
        best_type = max(scores, key=scores.get)
        total_keywords = len(signals[best_type])
        confidence = min(float(scores[best_type]) / total_keywords, 1.0)
        
        return {
            "document_type": best_type,
            "confidence": round(confidence, 2)
        }
