import os
import pypdf

class DocumentParser:
    """
    Parses PDF document page-by-page.
    """
    def parse_pdf(self, file_path: str) -> dict:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF not found at: {file_path}")
            
        page_texts = {}
        full_text = ""
        
        try:
            reader = pypdf.PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                page_num = idx + 1
                txt = page.extract_text() or ""
                page_texts[page_num] = txt
                full_text += txt + "\n"
        except Exception as e:
            raise ValueError(f"Failed to parse PDF: {str(e)}")
            
        return {
            "full_text": full_text.strip(),
            "pages": page_texts
        }
