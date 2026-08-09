class DocumentChunker:
    """
    Creates text chunks preserving page numbers.
    """
    def chunk_document(self, page_texts: dict, chunk_size: int = 400, overlap: int = 80) -> list:
        chunks = []
        chunk_idx = 0
        
        for page_num, text in page_texts.items():
            if not text.strip():
                continue
                
            words = text.split()
            if not words:
                continue
                
            for i in range(0, len(words), chunk_size - overlap):
                chunk_words = words[i:i + chunk_size]
                chunk_content = " ".join(chunk_words)
                
                chunks.append({
                    "page_number": page_num,
                    "chunk_index": chunk_idx,
                    "content": chunk_content
                })
                chunk_idx += 1
                
                if i + chunk_size >= len(words):
                    break
                    
        return chunks
