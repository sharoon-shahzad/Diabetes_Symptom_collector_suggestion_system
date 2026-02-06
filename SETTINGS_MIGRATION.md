# Settings Migration - Single Document Structure

## Overview
Converted the Settings collection from **multiple documents (key-value pairs)** to **a single document** with all settings as fields.

---

## Changes Made

### 1. Backend Model (`backend/models/Settings.js`)
**Before:** Each setting was stored as a separate document with `key`, `value`, `category`, `description`, `is_editable` fields.

**After:** Single document with direct fields:
```javascript
{
  site_title: String (default: 'DiabetesCare'),
  site_description: String,
  contact_email: String,
  admin_email: String,
  date_format: String (default: 'DD MMMM, YYYY'),
  updated_by: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

**New Methods:**
- `Settings.getSettings()` - Get or create the single settings document
- `Settings.updateSettings(updates, updatedBy)` - Update settings fields

---

### 2. Backend Controller (`backend/controllers/settingsController.js`)
**Updated Functions:**
- `getAllSettings()` - Returns single settings document instead of array
- `getSettingByKey(key)` - Returns specific field from single document
- `updateSetting(key, value)` - Updates single field in document
- `bulkUpdateSettings(updates)` - Updates multiple fields at once

**Removed:**
- `getSettingsByCategory()` - No longer needed with single document

---

### 3. Backend Routes (`backend/routes/settingsRoutes.js`)
**Removed Route:**
- `GET /admin/settings/category/:category`

**Existing Routes:**
- `GET /admin/settings` - Returns single document
- `GET /admin/settings/:key` - Returns specific field
- `PUT /admin/settings/:key` - Updates specific field
- `PUT /admin/settings` - Bulk update

---

### 4. Seed Script (`backend/seed-settings.js`)
**Before:** Created multiple documents (one per setting)

**After:** Creates/checks single settings document with all fields

---

### 5. Frontend API (`frontend/src/utils/api.js`)
**Updated:**
- `fetchAllSettings()` - Expects single document
- `updateSetting(key, value)` - Handles 'bulk' key for bulk updates
- `bulkUpdateSettings(settings)` - Sends entire object

**Removed:**
- `fetchSettingsByCategory()` - No longer needed

---

### 6. Frontend Settings Component (`frontend/src/admin/Settings.jsx`)
**Updated:**
- `loadSettings()` - Extracts fields from single document
- `handleSave()` - Sends bulk update with all form data
- `handleReset()` - Resets from single settings object

---

### 7. Frontend Settings Context (`frontend/src/context/SettingsContext.jsx`)
**Updated:**
- `refreshSettings()` - Single API call instead of 4 separate calls
- Uses `fetchAllSettings()` and extracts fields from response

---

## Migration Steps

### Step 1: Run Migration Script
```bash
cd backend
node migrate-settings-to-single-document.js
```

This script will:
1. Read all existing key-value setting documents
2. Convert them to single document structure
3. Delete old documents
4. Create new single document with all fields

### Step 2: Verify Database
Check MongoDB to ensure:
- Only **1 document** exists in the `settings` collection
- Document has fields: `site_title`, `site_description`, `contact_email`, `admin_email`, `date_format`

### Step 3: Test Frontend
1. Login as Super Admin
2. Navigate to Settings page
3. Verify all fields load correctly
4. Update settings and save
5. Refresh page to verify changes persist
6. Check sidebar displays site title from database

---

## Database Structure Comparison

### Before (Multiple Documents):
```javascript
// Document 1
{
  _id: ObjectId("..."),
  key: "site_title",
  value: "DiabetesCare",
  category: "general",
  description: "Site name",
  is_editable: true,
  createdAt: Date,
  updatedAt: Date
}

// Document 2
{
  _id: ObjectId("..."),
  key: "contact_email",
  value: "support@diavise.com",
  category: "general",
  description: "Contact email",
  is_editable: true,
  createdAt: Date,
  updatedAt: Date
}
// ... more documents
```

### After (Single Document):
```javascript
{
  _id: ObjectId("..."),
  site_title: "DiabetesCare",
  site_description: "Comprehensive diabetes management...",
  contact_email: "support@diavise.com",
  admin_email: "admin@diavise.com",
  date_format: "DD MMMM, YYYY",
  updated_by: ObjectId("..."),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Benefits

### Performance
- **Before:** 4-5 database queries to fetch all settings
- **After:** 1 database query for entire settings

### Simplicity
- **Before:** Loop through array, find by key
- **After:** Direct field access (`settings.site_title`)

### Maintainability
- **Before:** Complex schema with key-value pairs
- **After:** Clear, typed fields with defaults

### Type Safety
- **Before:** `value` field could be any type
- **After:** Each field has explicit type definition

---

## Testing Checklist

- [ ] Run migration script successfully
- [ ] Verify only 1 document in settings collection
- [ ] Login to admin dashboard
- [ ] Settings page loads without errors
- [ ] All fields display current values
- [ ] Can update site_title
- [ ] Can update site_description
- [ ] Can update contact_email
- [ ] Can update admin_email
- [ ] Can update date_format
- [ ] Changes persist after page refresh
- [ ] Sidebar shows site_title from database
- [ ] SettingsContext loads correctly
- [ ] No console errors in browser
- [ ] No errors in backend logs

---

## Rollback Plan (If Needed)

If you need to revert to the old structure:

1. Restore the old files from git:
   ```bash
   git checkout HEAD -- backend/models/Settings.js
   git checkout HEAD -- backend/controllers/settingsController.js
   git checkout HEAD -- backend/routes/settingsRoutes.js
   git checkout HEAD -- backend/seed-settings.js
   git checkout HEAD -- frontend/src/utils/api.js
   git checkout HEAD -- frontend/src/admin/Settings.jsx
   git checkout HEAD -- frontend/src/context/SettingsContext.jsx
   ```

2. Run the old seed script:
   ```bash
   node seed-settings.js
   ```

---

## Files Modified

### Backend:
1. `backend/models/Settings.js`
2. `backend/controllers/settingsController.js`
3. `backend/routes/settingsRoutes.js`
4. `backend/seed-settings.js`

### Frontend:
1. `frontend/src/utils/api.js`
2. `frontend/src/admin/Settings.jsx`
3. `frontend/src/context/SettingsContext.jsx`

### New Files:
1. `backend/migrate-settings-to-single-document.js` (Migration script)
2. `SETTINGS_MIGRATION.md` (This documentation)

---

## Next Steps

1. **Run Migration:** Execute the migration script
2. **Test Thoroughly:** Use the testing checklist above
3. **Update Production:** When ready, run migration on production database
4. **Monitor:** Watch for any errors in production logs
5. **Clean Up:** Remove old migration scripts after successful deployment

---

## Support

If you encounter issues:
1. Check MongoDB has exactly 1 document in settings collection
2. Verify all fields exist in the document
3. Check browser console for frontend errors
4. Check backend logs for API errors
5. Ensure all modified files were saved correctly
