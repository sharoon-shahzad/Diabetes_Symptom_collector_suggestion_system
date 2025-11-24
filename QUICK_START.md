# Quick Start Guide - Document Ingestion System

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```powershell
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Start Services

```powershell
# Terminal 1: Start MongoDB (if not running)
net start MongoDB

# Terminal 2: Start Backend
cd backend
npm start

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

### 3. Access the System

1. Open browser: `http://localhost:5173`
2. Login with **super_admin** credentials
3. Go to **Admin Dashboard** → **Document Upload**

## 📤 Quick Upload Test

### Upload Sample Document

1. **Click** or **drag** the file:
   ```
   backend/uploads/sample_diabetes_guideline.txt
   ```

2. **Fill metadata:**
   - Title: `Sample Diabetes Guideline`
   - Source: `Test Document`
   - Country: `Global`
   - Doc Type: `Guideline`
   - Version: `1.0`

3. **Click** "Upload & Ingest"

4. **Wait** 30-60 seconds (first time - downloads model)

5. **Success!** Document appears in list

## ✅ Verify Everything Works

### Check Backend Console
```
✅ Database connected successfully
✅ Server running on port 5000
Processing document upload: sample_diabetes_guideline.txt
File checksum: [hash]
Extracting text from document...
Extracted [N] characters, [M] pages
Chunking text...
Created [X] chunks
Initializing embedding model...
Generating embeddings for [X] chunks...
Successfully generated [X] embeddings
Upserting [X] chunks to ChromaDB...
Document saved to MongoDB with ID: [uuid]
```

### Check Frontend
- ✅ Success message with doc_id
- ✅ Chunks created count
- ✅ Document in list on right side

### Check Database
```javascript
// MongoDB
use Diavise
db.documents.find().pretty()

// Should see your uploaded document
```

## 🎯 Quick Reference

### Supported File Types
✅ PDF  
✅ DOCX  
✅ DOC  
✅ TXT  
✅ MD  
✅ CSV  

### Required Metadata
- ✅ Title
- ✅ Source
- ✅ Country
- ✅ Document Type

### Document Types
- Guideline
- Research Paper
- Diet Chart
- Exercise Recommendation
- Clinical Material
- Other

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Run `npm install` in backend/ |
| MongoDB error | Run `net start MongoDB` |
| Slow first upload | Normal - downloading model (~80MB) |
| Access denied | Login as super_admin |
| File rejected | Check file type and size (<50MB) |

## 📚 Full Documentation

- **System Details**: `DOCUMENT_INGESTION_README.md`
- **Complete Testing**: `TESTING_GUIDE.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`

## 🎉 That's It!

You're ready to start ingesting diabetes-related documents into your system!

---

**Need Help?** Check the full documentation files or backend console logs.
