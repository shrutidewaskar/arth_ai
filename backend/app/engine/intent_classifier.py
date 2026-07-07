from typing import List, Set

class IntentClassifier:
    """
    Classifies a user query into one or more of the 14 supported financial intents.
    Supports multi-intent queries to trigger multiple specialized agents.
    """
    
    INTENT_KEYWORDS = {
        "General Financial Advice": [
            "advice", "guide", "help", "financial", "cfo", "recommendation", "suggest", "opinion"
        ],
        "Expense Analysis": [
            "expense", "spending", "spent", "budget", "outflow", "cost", "bill", "subscription", "leak"
        ],
        "Cash Flow": [
            "cash flow", "cashflow", "income", "salary", "earnings", "surplus", "burn rate", "monthly cash"
        ],
        "Goal Planning": [
            "goal", "target", "house", "car", "education", "retirement", "vacation", "save for", "future"
        ],
        "Investment Advice": [
            "invest", "portfolio", "mutual fund", "stock", "sip", "fd", "fixed deposit", "ppf", "elss", "equity", "gold"
        ],
        "Insurance Analysis": [
            "insurance", "policy", "premium", "coverage", "life cover", "health cover", "medical insurance", "term plan"
        ],
        "Decision Analysis": [
            "buy", "purchase", "afford", "spend", "should i get", "is it worth", "upgrade"
        ],
        "Scenario Simulation": [
            "simulate", "scenario", "what if", "career switch", "salary drop", "salary increase", "medical emergency"
        ],
        "Document Analysis": [
            "document", "pdf", "file", "upload", "parse", "salary slip", "statement", "scan"
        ],
        "Subscription Review": [
            "subscription", "netflix", "prime", "recurring", "monthly fee", "membership"
        ],
        "Financial Health": [
            "health", "score", "index", "ratio", "dti", "savings rate", "financial status", "how am i doing"
        ],
        "Tax Planning": [
            "tax", "itr", "regime", "deduction", "section 80c", "income tax", "save tax"
        ],
        "Retirement Planning": [
            "retirement", "retire", "pension", "nps", "senior citizen", "provident fund"
        ],
        "Emergency Fund": [
            "emergency", "rainy day", "runway", "safety net", "contingency", "liquid cash"
        ]
    }

    async def classify(self, query: str) -> List[str]:
        query_lower = query.lower()
        matched_intents: Set[str] = set()

        for intent, keywords in self.INTENT_KEYWORDS.items():
            for kw in keywords:
                if kw in query_lower:
                    matched_intents.add(intent)
                    break
        
        # Fallback to General Financial Advice if no specific intents are found
        if not matched_intents:
            matched_intents.add("General Financial Advice")
            
        return list(matched_intents)
