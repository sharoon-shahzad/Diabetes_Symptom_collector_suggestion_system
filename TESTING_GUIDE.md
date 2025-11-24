# Testing Guide - Document Ingestion System

## Prerequisites

Before testing, ensure you have:

1. ✅ MongoDB running on `mongodb://localhost:27017/Diavise`
2. ✅ Backend server dependencies installed (`npm install` in backend/)
3. ✅ Frontend dependencies installed (`npm install` in frontend/)
4. ✅ A user account with `super_admin` role

## Setup Steps

### 1. Start MongoDB

```powershell
# Start MongoDB service (if not running)
net start MongoDB
```

### 2. Start Backend Server

```powershell
cd backend
npm start
```

Expected output:
```
✅ Database connected successfully
✅ Server running on port 5000
```

### 3. Start Frontend Development Server

```powershell
cd frontend
npm run dev
```

Expected output:
```
VITE ready in XXX ms
Local: http://localhost:5173
```

## Test Scenarios

### Test 1: Login as Super Admin

1. Navigate to `http://localhost:5173`
2. Click "Sign In"
3. Login with super_admin credentials
4. Verify you're redirected to Dashboard

**Expected Result:** ✅ Successful login with super_admin role

### Test 2: Access Document Upload Page

1. From Dashboard, click "Admin Dashboard" or navigate to `/admin-dashboard`
2. In the sidebar, find and click "Document Upload" (with cloud upload icon)
3. Verify the upload page loads

**Expected Result:** ✅ Document upload interface visible with:
- Drag & drop area
- Metadata form fields
- Upload button
- Document list on the right

### Test 3: Upload TXT Document

1. In the upload area, click to browse or drag the sample file:
   `backend/uploads/sample_diabetes_guideline.txt`
2. Fill in metadata:
   - **Title**: "Sample Diabetes Guideline"
   - **Source**: "Test Document"
   - **Country**: "Global"
   - **Doc Type**: "Guideline"
   - **Version**: "1.0"
   - **Force Override**: Leave unchecked
3. Click "Upload & Ingest"
4. Watch the progress bar

**Expected Result:** ✅ 
- Progress bar shows upload progress
- Success message appears with:
  - Document ID (UUID)
  - Status: "ingested"
  - Chunks created (should be 10-15 chunks)
- Document appears in the list on the right

**Processing Time:** 30-60 seconds (first run downloads embedding model)

### Test 4: Verify Duplicate Detection

1. Try uploading the same file again
2. **Do not** enable "Force Override"
3. Click "Upload & Ingest"

**Expected Result:** ✅ 
- Error message: "Document already exists (duplicate checksum)"
- HTTP 409 conflict status
- Existing doc_id shown

### Test 5: Force Override Duplicate

1. Upload the same file again
2. **Enable** "Force Override" toggle
3. Click "Upload & Ingest"

**Expected Result:** ✅ 
- Document uploaded successfully
- New doc_id generated
- New entry in document list

### Test 6: Test PDF Upload

Create a simple PDF file or use any diabetes-related PDF, then:

1. Upload the PDF file
2. Fill metadata appropriately
3. Click "Upload & Ingest"

**Expected Result:** ✅ 
- PDF text extracted successfully
- Chunks created based on content
- Document appears in list

### Test 7: Test DOCX Upload

Create or use a DOCX file, then:

1. Upload the DOCX file
2. Fill metadata
3. Click "Upload & Ingest"

**Expected Result:** ✅ 
- DOCX text extracted successfully
- Chunks created
- Document appears in list

### Test 8: Test Invalid File Type

1. Try uploading an image file (.jpg, .png) or unsupported format
2. Click "Upload & Ingest"

**Expected Result:** ✅ 
- Error message: "Invalid file type"
- Upload rejected before processing

### Test 9: Test Missing Metadata

1. Upload a valid file
2. Leave one or more required fields empty (title, source, country)
3. Click "Upload & Ingest"

**Expected Result:** ✅ 
- Error message: "Please fill in all required fields"
- Upload blocked

### Test 10: View Uploaded Documents

1. Check the document list on the right side
2. Verify all uploaded documents appear
3. Check document details:
   - Title
   - Original filename
   - Doc type chip
   - Country chip
   - Chunk count
   - Upload date

**Expected Result:** ✅ 
- All documents visible
- Metadata displayed correctly
- Sorted by upload date (newest first)

### Test 11: Delete Document

1. Click the delete icon (trash) on any document
2. Confirm deletion

**Expected Result:** ✅ 
- Confirmation dialog appears
- Document removed from list
- Success toast notification
- Document removed from MongoDB
- Chunks removed from ChromaDB
- Files deleted from uploads/

### Test 12: Test Large File

1. Create or find a large document (20-40 MB)
2. Upload the file

**Expected Result:** ✅ 
- File uploads successfully (if < 50MB)
- Progress bar shows incremental progress
- Processing completes successfully

### Test 13: Test Role-Based Access Control

1. Logout from super_admin account
2. Login with regular user or admin (not super_admin)
3. Try to access `/admin/upload`

**Expected Result:** ✅ 
- Access denied (403 Forbidden)
- Or redirect to dashboard
- Document upload not visible in sidebar

## Verification Steps

### Verify MongoDB Storage

```javascript
// In MongoDB shell or Compass
use Diavise

// Check documents collection
db.documents.find().pretty()

// Expected fields:
// - doc_id
// - checksum
// - title
// - source
// - country
// - doc_type
// - chunk_count
// - status: "ingested"
```

### Verify ChromaDB Storage

```powershell
# Check ChromaDB directory
cd backend\chroma_db
dir

# Should contain database files
```

### Verify File Storage

```powershell
# Check uploaded files
cd backend\uploads\original_files
dir

# Check extracted text
cd ..\extracted_text
dir
```

### Test Backend API Directly (Optional)

Using Postman or curl:

```powershell
# Get all documents
$token = "your_jwt_token_here"
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/docs" -Headers $headers -Method Get

# Upload document
$formData = @{
    file = Get-Item "path\to\file.txt"
    title = "Test Document"
    source = "Test"
    country = "USA"
    doc_type = "guideline"
    version = "1.0"
    force = "false"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/docs/upload" -Headers $headers -Method Post -Form $formData
```

## Expected Performance

| Operation | Expected Time |
|-----------|--------------|
| File Upload (10MB) | 2-5 seconds |
| Text Extraction | 1-3 seconds |
| Embedding Generation (first time) | 30-60 seconds* |
| Embedding Generation (subsequent) | 5-15 seconds |
| ChromaDB Upsert | 1-2 seconds |
| Total (first document) | 40-80 seconds |
| Total (subsequent documents) | 10-25 seconds |

*First run downloads the embedding model (~80MB)

## Troubleshooting

### Issue: Backend won't start

**Check:**
```powershell
cd backend
npm install
node server.js
```

Look for error messages about missing dependencies.

### Issue: "Cannot connect to MongoDB"

**Solution:**
1. Check MongoDB is running: `net start MongoDB`
2. Verify connection string in `.env`
3. Test connection: `mongo mongodb://localhost:27017/Diavise`

### Issue: Embedding generation fails

**Check:**
- First run takes longer (downloads model)
- Check internet connection for model download
- Verify disk space for model cache
- Check console for detailed error

### Issue: ChromaDB initialization fails

**Solution:**
1. Check `chroma_db` directory exists
2. Verify write permissions
3. Delete `chroma_db` and restart (will recreate)

### Issue: "Access token expired"

**Solution:**
1. Logout and login again
2. Check JWT_SECRET in backend `.env`
3. Verify token in localStorage

### Issue: File upload fails

**Check:**
- File size < 50MB
- File type is supported
- `uploads` directory exists with write permissions
- Check backend console for detailed error

### Issue: Chunks not created

**Check:**
- File contains extractable text
- PDF is not scanned/image-only
- Check extracted text in `uploads/extracted_text/`

## Success Criteria

All tests should pass with the following outcomes:

✅ Super admin can access upload page  
✅ Documents upload successfully  
✅ Text extracted from all file types  
✅ Embeddings generated correctly  
✅ ChromaDB stores chunks  
✅ MongoDB stores metadata  
✅ Duplicate detection works  
✅ Force override functions  
✅ Document list displays correctly  
✅ Delete removes all traces  
✅ Non-super-admin users blocked  
✅ Error handling works properly  

## Post-Testing Checklist

After completing all tests:

- [ ] All uploads successful
- [ ] MongoDB populated correctly
- [ ] ChromaDB contains embeddings
- [ ] File system organized properly
- [ ] No memory leaks observed
- [ ] Error messages user-friendly
- [ ] UI responsive and intuitive
- [ ] Security measures working
- [ ] Logs show no critical errors

## Clean Up (Optional)

To reset the system for fresh testing:

```powershell
# Stop backend and frontend
# Delete test data
cd backend

# Clear MongoDB
mongo Diavise --eval "db.documents.deleteMany({})"

# Clear ChromaDB
Remove-Item -Recurse -Force chroma_db
New-Item -ItemType Directory -Path chroma_db

# Clear uploads
Remove-Item -Recurse -Force uploads\original_files\*
Remove-Item -Recurse -Force uploads\extracted_text\*

# Keep README
# Restart servers
```

## Reporting Issues

If you encounter issues:

1. **Check Console Logs**
   - Backend: Terminal running `npm start`
   - Frontend: Browser Developer Tools → Console
   - MongoDB: Check MongoDB logs

2. **Document the Error**
   - Error message
   - Steps to reproduce
   - Browser console output
   - Backend console output

3. **Verify Environment**
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - MongoDB version: `mongo --version`

## Next Steps

After successful testing:

1. ✅ Document ingestion pipeline working
2. ⏭️ Implement document retrieval system
3. ⏭️ Integrate with Diabetica-7B model
4. ⏭️ Build suggestion generation endpoint
5. ⏭️ Create user-facing suggestion interface

---

**Testing Status**: Ready for testing  
**Last Updated**: 2025-11-15  
**Testing Duration**: ~30-45 minutes
