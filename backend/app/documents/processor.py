import datetime
from sqlalchemy import select
from app.models.financials import Document, DocumentFinancialFact, DocumentChunk
from app.documents.parser import DocumentParser
from app.documents.classifier import DocumentClassifier
from app.documents.extractor import FinancialFactExtractor
from app.documents.chunker import DocumentChunker

class DocumentProcessor:
    """
    Coordinates the document intelligence execution workflow.
    """
    def __init__(self):
        self.parser = DocumentParser()
        self.classifier = DocumentClassifier()
        self.extractor = FinancialFactExtractor()
        self.chunker = DocumentChunker()
        
    async def process_document(self, db, doc_id: str, file_path: str, user_id) -> Document:
        # Load document metadata from db
        res = await db.execute(select(Document).filter(Document.id == doc_id))
        doc = res.scalars().first()
        if not doc:
            raise ValueError(f"Document {doc_id} not found in database.")
            
        doc.status = "PROCESSING"
        await db.flush()
        
        try:
            # 1. Page-aware text extraction
            parse_res = self.parser.parse_pdf(file_path)
            full_text = parse_res["full_text"]
            pages = parse_res["pages"]
            
            doc.extracted_text = full_text
            doc.ocr_text = full_text
            
            # 2. Document classification
            class_res = self.classifier.classify_text(full_text)
            doc.document_type = class_res["document_type"]
            
            # 3. Facts extraction
            facts = self.extractor.extract_facts(pages, class_res["document_type"])
            for f in facts:
                fact_obj = DocumentFinancialFact(
                    document_id=doc.id,
                    user_id=user_id,
                    fact_type=f["fact_type"],
                    fact_key=f["fact_key"],
                    fact_value=str(f["fact_value"]),
                    confidence=f["confidence"],
                    source_page=f["source_page"]
                )
                db.add(fact_obj)
                
            # 4. Source-aware chunking
            from app.documents.embedding import EmbeddingService
            embedding_service = EmbeddingService()
            
            chunks = self.chunker.chunk_document(pages)
            for c in chunks:
                emb = embedding_service.generate_embedding(c["content"])
                emb_str = str(emb) if emb else None
                
                chunk_obj = DocumentChunk(
                    document_id=doc.id,
                    user_id=user_id,
                    page_number=c["page_number"],
                    chunk_index=c["chunk_index"],
                    content=c["content"],
                    embedding=emb_str
                )
                db.add(chunk_obj)
                
            doc.status = "PROCESSED"
            doc.processed_at = datetime.datetime.now(datetime.timezone.utc)
            
        except Exception as e:
            doc.status = "FAILED"
            doc.error_message = str(e)
            
        await db.flush()
        return doc
