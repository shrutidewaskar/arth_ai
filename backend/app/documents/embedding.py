import os
import openai
from app.config import settings

class EmbeddingService:
    """
    Abstract embedding generation logic with fallback capabilities.
    """
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = "text-embedding-3-small"
        self.dimension = 1536
        
        # Check fallback criteria
        if self.api_key == "sk-dummy-key" or "sk-proj-..." in self.api_key or not self.api_key.strip():
            self.mode = "lexical_fallback"
        else:
            self.mode = "vector"
            
    def generate_embedding(self, text: str) -> list:
        if self.mode == "lexical_fallback":
            # Return empty structure as fallback mode is configured
            return []
            
        try:
            client = openai.OpenAI(api_key=self.api_key)
            res = client.embeddings.create(input=[text], model=self.model)
            return res.data[0].embedding
        except Exception as e:
            # Silently fallback during execution
            return []
            
    def generate_embeddings(self, texts: list) -> list:
        if self.mode == "lexical_fallback" or not texts:
            return [[] for _ in texts]
            
        try:
            client = openai.OpenAI(api_key=self.api_key)
            res = client.embeddings.create(input=texts, model=self.model)
            return [d.embedding for d in res.data]
        except Exception as e:
            return [[] for _ in texts]
