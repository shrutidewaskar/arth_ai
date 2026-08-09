from sqlalchemy import select, and_, or_
from app.models.financials import DocumentChunk, Document

class DocumentRetriever:
    """
    RAG helper to query document chunks database, filtered by user_id for strict security.
    """
    async def retrieve_relevant_chunks(self, db, user_id, query, document_id=None, top_k=5) -> list:
        # Build strict filters
        filters = [DocumentChunk.user_id == user_id]
        if document_id:
            filters.append(DocumentChunk.document_id == document_id)
            
        # Perform search
        # As database is local/Supabase and pgvector is unavailable, we use a simple lexical fallback
        # by checking word matches
        query_words = [w.strip() for w in query.lower().split() if len(w.strip()) > 3]
        
        stmt = select(DocumentChunk).filter(and_(*filters))
        res = await db.execute(stmt)
        all_chunks = res.scalars().all()
        
        scored_chunks = []
        for chunk in all_chunks:
            content_lower = chunk.content.lower()
            score = sum(1 for w in query_words if w in content_lower)
            scored_chunks.append((chunk, score))
            
        # Sort by match score
        scored_chunks.sort(key=lambda x: x[1], reverse=True)
        top_chunks = scored_chunks[:top_k]
        
        # Load document details
        results = []
        for chunk, score in top_chunks:
            # Skip empty scores if query words exist
            if query_words and score == 0:
                continue
                
            doc_res = await db.execute(select(Document).filter(Document.id == chunk.document_id))
            doc = doc_res.scalars().first()
            doc_name = doc.file_name if doc else "Document"
            
            results.append({
                "content": chunk.content,
                "document_id": str(chunk.document_id),
                "document_name": doc_name,
                "page_number": chunk.page_number,
                "relevance": float(score) / max(len(query_words), 1)
            })
            
        return results
