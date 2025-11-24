# Document Ingestion System - README

## Overview

The Document Ingestion System is a comprehensive pipeline for uploading, processing, and storing diabetes-related documents that will be used by the Diabetica-7B model for generating personalized suggestions. This system handles document upload, text extraction, embedding generation, and vector storage in ChromaDB.

## Features

### ✅ Implemented Features

1. **Secure Upload** - Only super_admin users can upload documents
2. **Multiple File Formats** - Supports PDF, DOCX, DOC, TXT, MD, CSV
3. **Text Extraction** - Automated extraction from various document formats
4. **Duplicate Detection** - SHA-256 checksum-based duplicate prevention
5. **Text Chunking** - Intelligent chunking with configurable size and overlap
6. **Embedding Generation** - Using sentence-transformers/all-MiniLM-L6-v2
7. **Vector Storage** - ChromaDB for efficient similarity search
8. **Metadata Management** - MongoDB for document metadata
9. **Frontend Interface** - Drag-and-drop upload with progress tracking
10. **Document Management** - View and delete uploaded documents

## Architecture

### Backend Components

#### 1. Models
- **Document.js** - MongoDB schema for document metadata
  - Fields: doc_id, checksum, title, source, country, doc_type, version, paths, counts, ingestion details

#### 2. Services
- **documentService.js** - Text extraction and processing
  - PDF extraction using pdf-parse
  - DOCX extraction using mammoth
  - Plain text extraction for TXT/MD/CSV
  - Text chunking with overlap
  - Checksum calculation

- **embeddingService.js** - Embedding generation
  - Uses @xenova/transformers
  - Model: sentence-transformers/all-MiniLM-L6-v2
  - Batch processing for efficiency
  - 384-dimensional embeddings

- **chromaService.js** - Vector database operations
  - ChromaDB client initialization
  - Collection management (diabetes_docs)
  - Chunk upsertion with metadata
  - Query and deletion operations

#### 3. Controllers
- **documentController.js** - Request handling
  - uploadDocument - Handle file upload and ingestion
  - getAllDocuments - Retrieve all documents
  - getDocumentById - Get single document details
  - deleteDocument - Remove document and chunks

#### 4. Routes
- **documentRoutes.js** - API endpoints
  - POST /api/v1/admin/docs/upload - Upload document
  - GET /api/v1/admin/docs - List all documents
  - GET /api/v1/admin/docs/:docId - Get document details
  - DELETE /api/v1/admin/docs/:docId - Delete document

#### 5. Middlewares
- **verifyAccessTokenMiddleware** - JWT authentication
- **superAdminMiddleware** - Role-based access control

### Frontend Components

#### DocumentUpload.jsx
- Drag-and-drop file upload interface
- Metadata form (title, source, country, doc_type, version)
- Force override toggle for duplicates
- Upload progress indicator
- Success/error feedback
- Document list with delete functionality

## Configuration

### Environment Variables (.env)

```env
# Document Ingestion Configuration
UPLOAD_DIR=./uploads
CHROMA_DB_PATH=./chroma_db
EMBEDDING_PROVIDER=local-sentence-transformers
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
CHUNK_SIZE=350
CHUNK_OVERLAP=80
```

### Configuration Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| UPLOAD_DIR | ./uploads | Directory for uploaded files |
| CHROMA_DB_PATH | ./chroma_db | ChromaDB storage path |
| EMBEDDING_MODEL | Xenova/all-MiniLM-L6-v2 | Embedding model |
| CHUNK_SIZE | 350 | Chunk size in tokens |
| CHUNK_OVERLAP | 80 | Overlap between chunks |

## API Documentation

### Upload Document

**Endpoint:** `POST /api/v1/admin/docs/upload`

**Authentication:** Required (super_admin only)

**Content-Type:** multipart/form-data

**Request Body:**
- `file` (file) - Document file
- `title` (string) - Document title
- `source` (string) - Source organization/publisher
- `country` (string) - Country/region
- `doc_type` (string) - Document type (guideline, research_paper, diet_chart, exercise_recommendation, clinical_material, other)
- `version` (string) - Version number (optional, default: 1.0)
- `force` (boolean) - Force override duplicate (optional, default: false)

**Response (200 Success):**
```json
{
  "success": true,
  "doc_id": "uuid",
  "status": "ingested",
  "chunks_created": 42,
  "warnings": [],
  "message": "Document ingested successfully"
}
```

**Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Document already exists (duplicate checksum)",
  "code": "DUPLICATE_DOCUMENT",
  "existing_doc_id": "uuid"
}
```

**Response (400 Validation Error):**
```json
{
  "success": false,
  "message": "Missing required fields: title, source, country, doc_type",
  "code": "VALIDATION_ERROR"
}
```

### Get All Documents

**Endpoint:** `GET /api/v1/admin/docs`

**Authentication:** Required (super_admin only)

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "documents": [...]
}
```

### Get Document by ID

**Endpoint:** `GET /api/v1/admin/docs/:docId`

**Authentication:** Required (super_admin only)

**Response (200):**
```json
{
  "success": true,
  "document": {...}
}
```

### Delete Document

**Endpoint:** `DELETE /api/v1/admin/docs/:docId`

**Authentication:** Required (super_admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## Usage

### For Super Admins

1. **Login** as a super_admin user
2. **Navigate** to Admin Dashboard → Document Upload
3. **Upload Document:**
   - Drag & drop file or click to browse
   - Fill in metadata fields
   - Click "Upload & Ingest"
4. **Monitor Progress** - Progress bar shows upload status
5. **View Result** - Success message with doc_id and chunk count
6. **Manage Documents** - View uploaded documents and delete if needed

### Document Types

- **Guideline** - Clinical guidelines and protocols
- **Research Paper** - Scientific research and studies
- **Diet Chart** - Nutritional guidelines and meal plans
- **Exercise Recommendation** - Physical activity guidelines
- **Clinical Material** - Medical references and materials
- **Other** - Miscellaneous diabetes-related content

## Processing Pipeline

1. **Upload** - File received via multipart/form-data
2. **Validation** - Check file type, size, and required fields
3. **Checksum** - Calculate SHA-256 to detect duplicates
4. **Extraction** - Extract text based on file type
5. **Chunking** - Split text into overlapping chunks
6. **Embedding** - Generate 384-dim vectors for each chunk
7. **Storage** - Upsert chunks to ChromaDB with metadata
8. **Metadata** - Save document info to MongoDB
9. **Response** - Return success with doc_id and stats

## Data Storage

### MongoDB (Document Metadata)
- Collection: documents
- Stores: metadata, paths, counts, status
- Indexed: doc_id, checksum, doc_type, country

### ChromaDB (Vector Embeddings)
- Collection: diabetes_docs
- Stores: chunk embeddings, text, metadata
- Distance: Cosine similarity
- Metadata includes: document_id, chunk_index, title, country, doc_type, etc.

### File System
- `uploads/original_files/` - Original uploaded files
- `uploads/extracted_text/` - Extracted text files
- `chroma_db/` - ChromaDB persistent storage

## Security

- **Authentication** - JWT token required
- **Authorization** - Only super_admin role can access
- **File Validation** - Type and size restrictions
- **Error Handling** - Secure error messages
- **Cleanup** - Failed uploads are cleaned up

## Error Handling

### Common Errors

| Error Code | Status | Description | Solution |
|------------|--------|-------------|----------|
| FILE_MISSING | 400 | No file uploaded | Upload a file |
| VALIDATION_ERROR | 400 | Missing required fields | Fill all fields |
| INVALID_FILE_TYPE | 400 | Unsupported file type | Use PDF/DOCX/TXT |
| DUPLICATE_DOCUMENT | 409 | File already exists | Enable force override |
| INGESTION_ERROR | 500 | Processing failed | Check logs |

## Performance

- **File Size Limit:** 50MB
- **Batch Size:** 10 chunks per embedding batch
- **Chunking:** 350 tokens with 80 token overlap
- **Embedding Model:** Lightweight (all-MiniLM-L6-v2)
- **Vector Dimensions:** 384

## Future Enhancements (Not Implemented)

- ❌ OCR for scanned PDFs (tesseract integration ready)
- ❌ Document retrieval and query
- ❌ Integration with Diabetica-7B model
- ❌ Answer generation from retrieved chunks
- ❌ Bulk document upload
- ❌ Document versioning
- ❌ Advanced search and filtering
- ❌ Document preview
- ❌ Analytics dashboard

## Dependencies

### Backend
- multer - File upload handling
- pdf-parse - PDF text extraction
- mammoth - DOCX text extraction
- chromadb - Vector database
- @xenova/transformers - Embedding generation
- uuid - Unique ID generation
- crypto (built-in) - Checksum calculation

### Frontend
- @mui/material - UI components
- axios - HTTP client
- react-toastify - Toast notifications

## Testing

To test the complete pipeline:

1. Start MongoDB
2. Start backend server: `npm start` in backend/
3. Start frontend: `npm run dev` in frontend/
4. Login as super_admin
5. Upload sample documents (PDF, DOCX, TXT)
6. Verify in MongoDB: `db.documents.find()`
7. Check ChromaDB: Files in `chroma_db/`
8. Check uploads: Files in `uploads/`

## Troubleshooting

### Issue: "Module not found" errors
**Solution:** Run `npm install` in backend directory

### Issue: ChromaDB initialization fails
**Solution:** Ensure `chroma_db` directory exists and has write permissions

### Issue: Embedding generation is slow
**Solution:** First run downloads the model; subsequent runs are faster

### Issue: "Access denied" on upload
**Solution:** Verify user has super_admin role

### Issue: File upload fails
**Solution:** Check file size (<50MB) and type (PDF/DOCX/TXT)

## Support

For issues or questions:
1. Check error logs in backend console
2. Verify environment configuration
3. Ensure all dependencies are installed
4. Check user roles and permissions

## License

Part of the Diabetes Symptom Collector & Suggestion System FYP project.
