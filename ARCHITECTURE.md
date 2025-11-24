# System Architecture - Document Ingestion Pipeline

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + MUI)                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    DocumentUpload.jsx                         │  │
│  │  • Drag & Drop Interface                                      │  │
│  │  • Metadata Form (title, source, country, type, version)      │  │
│  │  • Upload Progress Bar                                        │  │
│  │  • Document List & Management                                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ HTTPS POST /api/v1/admin/docs/upload
                            │ (multipart/form-data + JWT token)
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Middlewares                               │  │
│  │  • verifyAccessTokenMiddleware (JWT Auth)                    │  │
│  │  • superAdminMiddleware (Role Check)                         │  │
│  │  • multer (File Upload Handler)                              │  │
│  └─────────────────────────┬───────────────────────────────────┘  │
│                            │                                        │
│  ┌─────────────────────────▼───────────────────────────────────┐  │
│  │              documentController.js                           │  │
│  │  • uploadDocument()                                          │  │
│  │  • getAllDocuments()                                         │  │
│  │  • getDocumentById()                                         │  │
│  │  • deleteDocument()                                          │  │
│  └─────────┬──────────────┬──────────────┬─────────────────────┘  │
│            │              │              │                         │
│  ┌─────────▼──────┐  ┌───▼────────┐  ┌──▼──────────────┐         │
│  │ documentService│  │  embedding │  │  chromaService   │         │
│  │                │  │  Service   │  │                  │         │
│  │ • extractText()│  │ • generate │  │ • upsertChunks() │         │
│  │ • chunkText()  │  │   Embedding│  │ • queryChunks()  │         │
│  │ • checksum()   │  │ • batch()  │  │ • delete()       │         │
│  └─────────┬──────┘  └───┬────────┘  └──┬──────────────┘         │
│            │             │              │                          │
└────────────┼─────────────┼──────────────┼──────────────────────────┘
             │             │              │
    ┌────────▼──────┐  ┌──▼─────────┐  ┌▼──────────────┐
    │  File System  │  │  @xenova/  │  │   ChromaDB    │
    │               │  │transformers│  │               │
    │ uploads/      │  │            │  │  Collection:  │
    │ ├─original/   │  │  Model:    │  │ diabetes_docs │
    │ └─extracted/  │  │  MiniLM    │  │               │
    └───────────────┘  │  L6-v2     │  │  384-dim      │
                       │            │  │  vectors      │
                       └────────────┘  └───────┬───────┘
                                               │
                                    ┌──────────▼────────┐
                                    │     MongoDB       │
                                    │                   │
                                    │  documents        │
                                    │  collection       │
                                    │                   │
                                    │  Metadata:        │
                                    │  • doc_id         │
                                    │  • checksum       │
                                    │  • title          │
                                    │  • source         │
                                    │  • country        │
                                    │  • chunk_count    │
                                    └───────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│  Super      │
│  Admin      │
│  User       │
└──────┬──────┘
       │
       │ 1. Upload File + Metadata
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                         INGESTION PIPELINE                       │
│                                                                  │
│  Step 1: Receive File                                           │
│  ┌────────────────────────────────────────────┐                 │
│  │ • Validate file type (PDF/DOCX/TXT)        │                 │
│  │ • Validate file size (<50MB)               │                 │
│  │ • Save to uploads/original_files/          │                 │
│  └────────────────┬───────────────────────────┘                 │
│                   │                                              │
│  Step 2: Calculate Checksum                                     │
│  ┌────────────────▼───────────────────────────┐                 │
│  │ • SHA-256 hash of file content             │                 │
│  │ • Check MongoDB for duplicate              │                 │
│  │ • Return 409 if exists (unless force=true) │                 │
│  └────────────────┬───────────────────────────┘                 │
│                   │                                              │
│  Step 3: Extract Text                                           │
│  ┌────────────────▼───────────────────────────┐                 │
│  │ • PDF → pdf-parse                          │                 │
│  │ • DOCX → mammoth                           │                 │
│  │ • TXT/MD/CSV → fs.readFileSync             │                 │
│  │ • Clean and normalize text                 │                 │
│  │ • Save to uploads/extracted_text/{uuid}.txt│                 │
│  └────────────────┬───────────────────────────┘                 │
│                   │                                              │
│  Step 4: Chunk Text                                             │
│  ┌────────────────▼───────────────────────────┐                 │
│  │ • Split into 350-token chunks              │                 │
│  │ • 80-token overlap between chunks          │                 │
│  │ • Generate chunk index (0, 1, 2, ...)      │                 │
│  └────────────────┬───────────────────────────┘                 │
│                   │                                              │
│  Step 5: Generate Embeddings                                    │
│  ┌────────────────▼───────────────────────────┐                 │
│  │ • Initialize transformer model (first run) │                 │
│  │ • Process chunks in batches of 10          │                 │
│  │ • Generate 384-dim vectors                 │                 │
│  │ • Model: sentence-transformers/MiniLM      │                 │
│  └────────────────┬───────────────────────────┘                 │
│                   │                                              │
│  Step 6: Store in ChromaDB                                      │
│  ┌────────────────▼───────────────────────────┐                 │
│  │ • Upsert chunks with embeddings            │                 │
│  │ • Store metadata: doc_id, chunk_index      │                 │
│  │ • Store metadata: title, country, type     │                 │
│  │ • Use cosine similarity for search         │                 │
│  └────────────────┬───────────────────────────┘                 │
│                   │                                              │
│  Step 7: Save Metadata to MongoDB                               │
│  ┌────────────────▼───────────────────────────┐                 │
│  │ • Create Document record                   │                 │
│  │ • Store: doc_id, checksum, paths           │                 │
│  │ • Store: title, source, country, type      │                 │
│  │ • Store: page_count, chunk_count           │                 │
│  │ • Store: ingested_by (user_id)             │                 │
│  │ • Status: "ingested"                       │                 │
│  └────────────────┬───────────────────────────┘                 │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    │ 8. Return Response
                    │
┌───────────────────▼──────────────────────────┐
│  Response JSON                               │
│  {                                           │
│    "success": true,                          │
│    "doc_id": "uuid",                         │
│    "status": "ingested",                     │
│    "chunks_created": 42,                     │
│    "warnings": []                            │
│  }                                           │
└──────────────────────────────────────────────┘
```

## Component Interaction

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │◄───────►│   Backend    │◄───────►│   MongoDB    │
│              │   REST  │              │  Queries│              │
│ • Upload UI  │   API   │ • Routes     │         │ • Documents  │
│ • Progress   │         │ • Controllers│         │ • Metadata   │
│ • Document   │         │ • Middleware │         │              │
│   List       │         │              │         │              │
└──────────────┘         └───────┬──────┘         └──────────────┘
                                 │
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼──────┐ ┌──▼──────┐ ┌──▼──────────┐
            │ Document     │ │Embedding│ │  Chroma     │
            │ Service      │ │Service  │ │  Service    │
            │              │ │         │ │             │
            │ • Extract    │ │ • Model │ │ • Upsert    │
            │ • Chunk      │ │ • Embed │ │ • Query     │
            │ • Checksum   │ │ • Batch │ │ • Delete    │
            └───────┬──────┘ └──┬──────┘ └──┬──────────┘
                    │           │           │
            ┌───────▼──────┐ ┌──▼──────┐ ┌──▼──────────┐
            │ File System  │ │ ML Model│ │  ChromaDB   │
            │              │ │         │ │             │
            │ • Original   │ │ • Cache │ │ • Vectors   │
            │ • Extracted  │ │ • 384d  │ │ • Metadata  │
            └──────────────┘ └─────────┘ └─────────────┘
```

## Storage Architecture

```
Project Root
│
├── backend/
│   ├── uploads/
│   │   ├── original_files/
│   │   │   └── {timestamp}_{filename}.{ext}  ← Original uploaded files
│   │   │
│   │   └── extracted_text/
│   │       └── {doc_id}.txt  ← Extracted & cleaned text
│   │
│   ├── chroma_db/  ← ChromaDB persistent storage
│   │   ├── chroma.sqlite3
│   │   └── [vector data files]
│   │
│   └── node_modules/
│       └── @xenova/transformers/
│           └── .cache/  ← Downloaded ML models
│
└── MongoDB (External)
    └── Diavise (Database)
        └── documents (Collection)
            └── { doc_id, checksum, metadata, ... }
```

## Security Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
│                                                             │
│  Layer 1: Authentication                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • JWT Token Verification                              │ │
│  │ • Token in Authorization Header or Cookie            │ │
│  │ • verifyAccessTokenMiddleware                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                                │
│  Layer 2: Authorization                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Role Check: super_admin required                    │ │
│  │ • Database query: UsersRoles collection              │ │
│  │ • superAdminMiddleware                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                                │
│  Layer 3: Input Validation                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • File Type: PDF, DOCX, TXT, MD, CSV only            │ │
│  │ • File Size: Max 50MB                                 │ │
│  │ • Metadata: Required fields validation               │ │
│  │ • Sanitization: Path traversal prevention            │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                                │
│  Layer 4: Business Logic                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Checksum duplicate detection                        │ │
│  │ • Force override option                               │ │
│  │ • Error handling & cleanup                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                                │
│                       [PROCESS]                             │
└─────────────────────────────────────────────────────────────┘
```

## Embedding Pipeline Detail

```
Text Chunk (350 tokens)
         │
         │ Input
         ▼
┌────────────────────┐
│   Tokenization     │
│   (WordPiece)      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Transformer Model │
│  (6 layers)        │
│  MiniLM-L6-v2      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Mean Pooling      │
│  (aggregate tokens)│
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Normalization     │
│  (unit vector)     │
└─────────┬──────────┘
          │
          ▼
   384-dim Vector
   [0.234, -0.123, ...]
         │
         │ Store
         ▼
    ChromaDB
```

## API Request/Response Flow

```
Client Request:
POST /api/v1/admin/docs/upload
Headers: Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
Body:
  - file: [binary]
  - title: "Diabetes Guidelines"
  - source: "WHO"
  - country: "Global"
  - doc_type: "guideline"
  - version: "1.0"
  - force: "false"

         │
         ▼
┌─────────────────────┐
│  Middleware Chain   │
│  1. CORS            │
│  2. JSON Parser     │
│  3. Auth Verify     │
│  4. Super Admin     │
│  5. Multer          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Controller        │
│   uploadDocument()  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Processing...      │
│  (Steps 1-7)        │
└──────────┬──────────┘
           │
           ▼
Server Response:
HTTP 200 OK
Content-Type: application/json
Body:
{
  "success": true,
  "doc_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ingested",
  "chunks_created": 42,
  "warnings": [],
  "message": "Document ingested successfully"
}
```

## Error Handling Flow

```
                   [Error Occurs]
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   [Validation]    [Processing]    [Storage]
    Error           Error           Error
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
            ┌──────────────────────┐
            │  Error Handler       │
            │  • Log error         │
            │  • Cleanup files     │
            │  • Rollback changes  │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  HTTP Response       │
            │  • 400 Validation    │
            │  • 401 Auth Failed   │
            │  • 403 Forbidden     │
            │  • 409 Duplicate     │
            │  • 500 Server Error  │
            └──────────────────────┘
```

---

This architecture ensures:
✅ Secure access control  
✅ Efficient processing  
✅ Scalable storage  
✅ Error resilience  
✅ Data integrity  
