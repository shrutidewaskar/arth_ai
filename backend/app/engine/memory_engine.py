import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.financials import AIMemory
import openai
from app.config import settings

class MemoryEngine:
    """
    Manages short-term and long-term memory storage and retrieval.
    Automatically categorizes, evaluates importance score, and persists memories.
    """

    async def get_relevant_memories(
        self,
        user_id: Any,
        query: str,
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        # Fetch all memories for the user
        result = await db.execute(
            select(AIMemory).filter(AIMemory.user_id == user_id).order_by(AIMemory.importance_score.desc())
        )
        memories = result.scalars().all()
        
        # Simulating keyword/similarity check for relevance
        query_words = set(query.lower().split())
        relevant = []
        
        for m in memories:
            summary_lower = m.summary.lower()
            # Simple keyword matching heuristic
            score = 0
            for word in query_words:
                if len(word) > 3 and word in summary_lower:
                    score += 1
            
            # High importance memories are also always included if they match slightly,
            # or if the query is general, we grab top 5 highest importance ones.
            if score > 0 or m.importance_score >= 7:
                relevant.append({
                    "id": str(m.id),
                    "memory_type": m.memory_type,
                    "summary": m.summary,
                    "importance_score": m.importance_score,
                    "created_at": m.created_at.isoformat() if m.created_at else None
                })
                
        # Limit to top 8 memories
        return relevant[:8]

    async def create_memory(
        self,
        user_id: Any,
        summary: str,
        memory_type: str,
        importance_score: int,
        db: AsyncSession
    ) -> Dict[str, Any]:
        memory = AIMemory(
            user_id=user_id,
            memory_type=memory_type,
            summary=summary,
            importance_score=importance_score
        )
        db.add(memory)
        await db.flush()
        return {
            "id": str(memory.id),
            "memory_type": memory.memory_type,
            "summary": memory.summary,
            "importance_score": memory.importance_score
        }

    async def run_auto_summarization(
        self,
        user_id: Any,
        conversation_history: List[Dict[str, Any]],
        db: AsyncSession
    ) -> None:
        """
        Invokes LLM in background (or heuristic) to parse the conversation, extract key facts,
        calculate importance, and save as AIMemory.
        """
        if not conversation_history or len(conversation_history) < 2:
            return

        chat_str = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in conversation_history[-6:]])
        
        # Fallback dummy memory if API fails or settings is dummy
        summary = "User discussed general budgeting."
        importance = 4
        category = "Fact"

        if settings.OPENAI_API_KEY != "sk-dummy-key":
            try:
                # Call OpenAI to extract a structured fact memory
                client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                prompt = (
                    "Analyze this conversation and extract a single concise, important financial fact or preference "
                    "about the user (e.g., 'Planning to buy an SUV in Oct', 'Risk tolerance is conservative', 'HDFC loan outstanding is 45L'). "
                    "Format response exactly as JSON:\n"
                    "{\"summary\": \"...\", \"category\": \"Fact|Preference|Goal|Risk\", \"importance_score\": 1-10}\n\n"
                    f"Chat:\n{chat_str}"
                )
                response = await client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"}
                )
                import json
                data = json.loads(response.choices[0].message.content)
                summary = data.get("summary", summary)
                importance = int(data.get("importance_score", importance))
                category = data.get("category", category)
            except Exception:
                pass

        # Save to database
        if len(summary.strip()) > 5:
            await self.create_memory(
                user_id=user_id,
                summary=summary,
                memory_type=category,
                importance_score=importance,
                db=db
            )
