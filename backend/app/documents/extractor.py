import re

class FinancialFactExtractor:
    """
    Regex and label matcher to parse numerical facts from statements.
    """
    def extract_facts(self, page_texts: dict, doc_type: str) -> list:
        facts = []
        
        # Define regex mappings for statement types
        patterns = {
            "LOAN_STATEMENT": {
                "lender": [r'(hdfc|sbi|icici|axis|lic|bajaj|kotak)'],
                "loan_type": [r'(home loan|personal loan|car loan|vehicle loan)'],
                "principal": [r'(?:principal|sanctioned|loan amount)\D*?([\d,]{5,10})'],
                "outstanding": [r'(?:outstanding|balance|amount due|closing balance)\D*?([\d,]{5,10})'],
                "interest_rate": [r'(?:interest rate|rate of interest|roi)\D*?(\d{1,2}\.?\d{0,2})\s*%'],
                "emi": [r'(?:emi|installment|monthly installment)\D*?([\d,]{4,7})'],
                "tenure": [r'(?:tenure|period|months|years)\D*?(\d+)\s*(?:months|years)']
            },
            "INSURANCE_POLICY": {
                "provider": [r'(star health|icici lombard|hdfc ergo|lic|max life|tata aia)'],
                "policy_type": [r'(health|term|car|motor|vehicle|medical)\s*insurance'],
                "coverage": [r'(?:sum insured|sum assured|coverage|limit)\D*?([\d,]{5,8})'],
                "premium": [r'(?:premium|amount paid|installment premium)\D*?([\d,]{4,6})'],
                "renewal_date": [r'(?:renewal date|due date|expiry date)\D*?(\d{2}[-/]\d{2}[-/]\d{4})'],
                "beneficiary": [r'(?:beneficiary|nominee)\D*?([a-zA-Z\s]{4,30})']
            },
            "SALARY_SLIP": {
                "gross_income": [r'(?:gross)\s*(?:salary|pay|earnings)\D*?([\d,]{5,7})'],
                "net_income": [r'(?:net)\s*(?:salary|pay|earnings)\D*?([\d,]{5,7})'],
                "basic_salary": [r'(?:basic)\s*(?:salary|pay|earnings)\D*?([\d,]{5,7})'],
                "deductions": [r'(?:total deductions|deductions)\D*?([\d,]{4,6})']
            },
            "BANK_STATEMENT": {
                "statement_period": [r'(?:statement period|period)\D*?([a-zA-Z0-9\s-]{15,30})'],
                "total_credits": [r'(?:credits|total credits|total deposits)\D*?([\d,]{5,8})'],
                "total_debits": [r'(?:debits|total debits|total withdrawals)\D*?([\d,]{5,8})']
            }
        }
        
        if doc_type not in patterns:
            return facts
            
        type_patterns = patterns[doc_type]
        for page_num, text in page_texts.items():
            text_lower = text.lower()
            for key, regexes in type_patterns.items():
                for regex in regexes:
                    match = re.search(regex, text_lower)
                    if match:
                        val = match.group(1).strip()
                        # Cleanup comma separators in numeric parameters
                        if key in ["principal", "outstanding", "emi", "premium", "coverage", "gross_income", "net_income", "basic_salary", "deductions", "total_credits", "total_debits"]:
                            val = val.replace(",", "")
                        
                        facts.append({
                            "fact_type": doc_type,
                            "fact_key": key,
                            "fact_value": val,
                            "confidence": 0.90,
                            "source_page": page_num
                        })
                        break # Only pick the first match per page
                        
        return facts
