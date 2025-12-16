# Document Upload Details for RAG System

## Required Fields When Uploading Documents

Your friend needs to fill in the following details when uploading documents to the RAG system on their local server:

### **REQUIRED FIELDS (Must be provided):**

1. **title** (String)
   - The official name/title of the document
   - Example: "Pakistan Food Composition Table 2019"
   - Used in citations and document references

2. **source** (String)
   - Who published/created the document or the organization
   - Example: "Ministry of Health, Pakistan" or "American Diabetes Association" or "WHO"
   - Helps identify the authority/credibility of the document

3. **country** (String)
   - The country/region this document is for
   - Example: "Pakistan", "India", "USA", "UAE", "Bangladesh", "Global", "International"
   - Used for regional-specific RAG queries (critical for diet plans)

4. **doc_type** (String) - MUST be ONE of these values:
   - `guideline` - Official dietary or health guidelines
   - `research_paper` - Academic research papers
   - `diet_chart` - Food composition tables, meal planning charts
   - `exercise_recommendation` - Exercise and fitness guidelines
   - `clinical_material` - Clinical protocols and procedures
   - `other` - Any other document type
   
   Example values for RAG:
   - "guideline" → For Pakistan Dietary Guidelines 2019
   - "diet_chart" → For Food Composition Table
   - "guideline" → For Ramadan Fasting Guidelines
   - "research_paper" → For diabetes studies

5. **File** (PDF, DOCX, DOC, TXT, MD, CSV)
   - The actual document file to be uploaded
   - Supported formats: PDF, DOCX, DOC, TXT, Markdown, CSV
   - PDF must be text-searchable (not scanned/image-based)

### **OPTIONAL FIELDS (Can be provided):**

6. **version** (String)
   - Document version number
   - Default: "1.0"
   - Example: "2019", "2.5", "Updated-2024"

7. **force** (Boolean as string: "true" or "false")
   - If set to "true", allows uploading duplicate documents (same content)
   - Default: false (prevents duplicates)
   - Use only if you intentionally want to re-upload

---

## Example Upload Scenarios

### Scenario 1: Pakistan Dietary Guidelines
```
title: "Pakistan Dietary Nutrition Guidelines 2019"
source: "Ministry of Health, Government of Pakistan"
country: "Pakistan"
doc_type: "guideline"
version: "2019"
file: Pakistan_Dietary_Nutrition_2019.pdf
```

### Scenario 2: Food Composition Table
```
title: "Book of Food Composition Table for Pakistan"
source: "PCSIR (Pakistan Council of Scientific and Industrial Research)"
country: "Pakistan"
doc_type: "diet_chart"
version: "1.0"
file: Book_Food_Composition_Table_for_Pakistan.pdf
```

### Scenario 3: Diabetic Exchange List
```
title: "The Diabetic Exchange List"
source: "American Diabetes Association"
country: "USA"
doc_type: "diet_chart"
version: "2024"
file: THE-DIABETIC-EXCHANGE-LIST.pdf
```

### Scenario 4: Ramadan Fasting Guidelines
```
title: "IDF Practical Guidelines for Managing Type 2 Diabetes During Ramadan"
source: "International Diabetes Federation"
country: "Global"
doc_type: "guideline"
version: "2.0"
file: IDF_Ramadan_Guidelines.pdf
```

### Scenario 5: Clinical Research
```
title: "Effectiveness of Structured Lifestyle Intervention in Type 2 Diabetes"
source: "National Center for Biotechnology Information"
country: "USA"
doc_type: "research_paper"
version: "1.0"
file: diabetes_research_study.pdf
```

---

## How These Fields Are Used

### In Diet Plan Generation:
- **country**: Used to filter documents in RAG queries (e.g., "Pakistan" documents for Pakistani users)
- **doc_type**: Filters to only "diet_chart" and "guideline" types for meal planning
- **title**: Displayed as citations in the generated meal plan
- **source**: Shows credibility of the dietary recommendations

### In MongoDB Database:
All these fields are stored with additional auto-generated metadata:
- `doc_id`: Unique identifier (UUID)
- `checksum`: Prevents uploading duplicate content
- `page_count`: Auto-calculated from document
- `chunk_count`: Number of text chunks created
- `ingested_on`: Timestamp when uploaded
- `status`: "ingested" (if successful)

### In ChromaDB Vector Store:
Each chunk of text is stored with metadata including:
- title
- source
- country
- doc_type
- version
- original_filename
- page number
- chunk index

---

## Important Notes for Your Friend

✅ **DO:**
- Use standardized country names (Pakistan, India, USA, UAE, Bangladesh, Global, etc.)
- Choose the most appropriate doc_type (diet_chart for food composition, guideline for recommendations)
- Ensure PDF files are text-searchable (use OCR if needed)
- Provide accurate source information for credibility

❌ **DON'T:**
- Upload scanned/image-based PDFs without OCR conversion
- Leave required fields blank
- Use invalid doc_types (only the 6 listed options are allowed)
- Upload the same document twice without "force=true"

---

## API Request Example (for POST /api/v1/admin/docs/upload)

Using curl:
```bash
curl -X POST http://localhost:5000/api/v1/admin/docs/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@Pakistan_Food_Composition_Table.pdf" \
  -F "title=Book of Food Composition Table for Pakistan" \
  -F "source=PCSIR" \
  -F "country=Pakistan" \
  -F "doc_type=diet_chart" \
  -F "version=1.0"
```

Using FormData in JavaScript:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'Pakistan Food Composition Table');
formData.append('source', 'PCSIR');
formData.append('country', 'Pakistan');
formData.append('doc_type', 'diet_chart');
formData.append('version', '1.0');

const response = await fetch('http://localhost:5000/api/v1/admin/docs/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + jwtToken
  },
  body: formData
});
```

---

## Response After Successful Upload

```json
{
  "success": true,
  "doc_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ingested",
  "chunks_created": 42,
  "message": "Document ingested successfully"
}
```

The document is now:
- ✅ Stored in MongoDB with full metadata
- ✅ Split into chunks and embedded with vectors in ChromaDB
- ✅ Ready to be used by the RAG system for diet plan generation
- ✅ Searchable and retrievable for AI responses

---

**Tell your friend to fill in these 5 required fields + the file, and the system will handle the rest automatically!**
