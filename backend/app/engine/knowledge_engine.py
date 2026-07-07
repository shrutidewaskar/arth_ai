import json
import os
from typing import Dict, Any

class KnowledgeEngine:
    """
    Loads and provides reference knowledge guidelines for Tax, Financial benchmarks,
    Insurance, and Investments to ground AI reasoning in reality.
    """
    def __init__(self):
        self.base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")
        self.tax_rules = self._load_json("tax_rules.json")
        self.financial_rules = self._load_json("financial_rules.json")
        self.insurance_guidelines = self._load_json("insurance_guidelines.json")
        self.investment_guidelines = self._load_json("investment_guidelines.json")

    def _load_json(self, filename: str) -> Dict[str, Any]:
        path = os.path.join(self.base_dir, filename)
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception:
            return {}

    def get_all_guidelines(self) -> Dict[str, Any]:
        return {
            "tax": self.tax_rules,
            "financial_benchmarks": self.financial_rules,
            "insurance": self.insurance_guidelines,
            "investments": self.investment_guidelines
        }
