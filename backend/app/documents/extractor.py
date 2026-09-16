import re
from typing import Dict, Any, List

class FinancialFactExtractor:
    """
    Deterministic Fact & Transaction Extractor for Stage 5D.
    Extracts structured key-value parameters and tabular transactions from statements.
    """
    
    PATTERNS = {
        "LOAN_STATEMENT": {
            "lender": [r'(hdfc|sbi|icici|axis|lic|bajaj|kotak)'],
            "loan_type": [r'(home loan|personal loan|car loan|vehicle loan|education loan)'],
            "principal": [r'(?:principal|sanctioned|loan amount)\D*?([\d,]{5,10})'],
            "outstanding": [r'(?:outstanding|balance|amount due|closing balance)\D*?([\d,]{5,10})'],
            "interest_rate": [r'(?:interest rate|rate of interest|roi)\D*?(\d{1,2}\.?\d{0,2})\s*%'],
            "emi": [r'(?:emi|installment|monthly installment)\D*?([\d,]{4,7})'],
            "tenure": [r'(?:tenure|period|months|years)\D*?(\d+)\s*(?:months|years)']
        },
        "INSURANCE_POLICY": {
            "provider": [r'(star health|icici lombard|hdfc ergo|lic|max life|tata aia|care health)'],
            "policy_type": [r'(health|term|car|motor|vehicle|medical|life)\s*insurance'],
            "coverage": [r'(?:sum insured|sum assured|coverage|limit)\D*?([\d,]{5,8})'],
            "premium": [r'(?:premium|amount paid|installment premium)\D*?([\d,]{4,6})'],
            "renewal_date": [r'(?:renewal date|due date|expiry date)\D*?(\d{2}[-/]\d{2}[-/]\d{4})'],
            "beneficiary": [r'(?:beneficiary|nominee)\D*?([a-zA-Z\s]{4,30})']
        },
        "SALARY_SLIP": {
            "employer": [r'(?:employer|company|organisation)\D*?([a-zA-Z0-9\s.,]{3,40})'],
            "gross_income": [r'(?:gross)\s*(?:salary|pay|earnings)\D*?([\d,]{5,7})'],
            "net_income": [r'(?:net)\s*(?:salary|pay|earnings|take home)\D*?([\d,]{5,7})'],
            "basic_salary": [r'(?:basic)\s*(?:salary|pay|earnings)\D*?([\d,]{5,7})'],
            "deductions": [r'(?:total deductions|deductions)\D*?([\d,]{4,6})']
        },
        "BANK_STATEMENT": {
            "statement_period": [r'(?:statement period|period)\D*?([a-zA-Z0-9\s-]{15,35})'],
            "total_credits": [r'(?:credits|total credits|total deposits)\D*?([\d,]{5,8})'],
            "total_debits": [r'(?:debits|total debits|total withdrawals)\D*?([\d,]{5,8})'],
            "account_number": [r'(?:a/c|acct|account no|account number)\D*?(\w{4,18})']
        }
    }

    def extract_facts(self, page_texts: Dict[int, str], doc_type: str) -> List[Dict[str, Any]]:
        facts = []
        if doc_type not in self.PATTERNS:
            return facts
            
        type_patterns = self.PATTERNS[doc_type]
        for page_num, text in page_texts.items():
            text_lower = text.lower()
            for key, regexes in type_patterns.items():
                for regex in regexes:
                    match = re.search(regex, text_lower)
                    if match:
                        val = match.group(1).strip()
                        if key in ["principal", "outstanding", "emi", "premium", "coverage", "gross_income", "net_income", "basic_salary", "deductions", "total_credits", "total_debits"]:
                            val = val.replace(",", "")
                        
                        facts.append({
                            "fact_type": doc_type,
                            "fact_key": key,
                            "fact_value": val,
                            "confidence": 0.94 if doc_type == "LOAN_STATEMENT" else 0.90,
                            "source_page": page_num
                        })
                        break
        return facts

    def extract_bank_transactions(self, page_texts: Dict[int, str]) -> List[Dict[str, Any]]:
        """
        Extracts structured tabular bank statement transaction lines:
        Date | Description | Amount | Debit/Credit | Running Balance
        """
        transactions = []
        
        # Regex to parse typical Indian bank statement line:
        # e.g., '05-04-2026 SALARY CREDIT FROM ACME TECH LTD 80,000.00 CR 1,20,000.00'
        # e.g., '10-04-2026 HDFC LTD HOME LOAN EMI 32,500.00 DR 87,500.00'
        # e.g., '15-04-2026 SWIGGY INSTAMART GROCERIES 1,200.00 DR 86,300.00'
        # e.g., '20-04-2026 NETFLIX SUBSCRIPTION 649.00 DR 85,651.00'
        # e.g., '25-04-2026 GROWW MUTUAL FUND SIP 5,000.00 DR 80,651.00'
        # e.g., '28-04-2026 HOUSE RENT PAYMENT 20,000.00 DR 60,651.00'
        
        tx_regex = re.compile(
            r'(\d{2}[-/]\d{2}[-/]\d{4})\s+' # Date (DD-MM-YYYY or DD/MM/YYYY)
            r'([A-Za-z0-9\s\-._/]{3,60}?)\s+' # Raw Description
            r'([\d,]+\.?\d{0,2})\s+' # Amount
            r'(CR|DR|CREDIT|DEBIT)\s*' # Direction
            r'([\d,]+\.?\d{0,2})?', # Optional Balance
            re.IGNORECASE
        )
        
        for page_num, text in page_texts.items():
            lines = text.split('\n')
            for line in lines:
                line_str = line.strip()
                # Skip summary or header lines
                if re.search(r'(total\s+deposits|total\s+withdrawals|statement\s+period|opening\s+balance|closing\s+balance)', line_str, re.IGNORECASE):
                    continue
                match = tx_regex.search(line_str)
                if match:
                    tx_date = match.group(1)
                    raw_desc = match.group(2).strip()
                    amt_str = match.group(3).replace(',', '')
                    direction_str = match.group(4).upper()
                    bal_str = match.group(5).replace(',', '') if match.group(5) else None
                    
                    try:
                        amount = float(amt_str)
                        balance = float(bal_str) if bal_str else None
                    except ValueError:
                        continue
                        
                    direction = "CREDIT" if direction_str in ["CR", "CREDIT"] else "DEBIT"
                    
                    transactions.append({
                        "date": tx_date,
                        "raw_description": raw_desc,
                        "amount": amount,
                        "direction": direction,
                        "balance": balance,
                        "source_page": page_num,
                        "raw_line": line_str
                    })
                    
        return transactions
