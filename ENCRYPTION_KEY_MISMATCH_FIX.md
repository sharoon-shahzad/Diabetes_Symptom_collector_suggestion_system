# ENCRYPTION KEY MISMATCH - CRITICAL ISSUE

## Problem Summary

Your application is experiencing encryption key mismatch errors:
```
Decryption error: error:1C800064:Provider routines::bad decrypt
```

This means the `ENCRYPTION_KEY` in your `.env` file **does not match** the key that was used to originally encrypt the data in your database.

## Root Cause

The data in your MongoDB database was encrypted with a **different encryption key** than what's currently in your `.env` file:

**Current Key in .env:**
```
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

This is clearly a test/placeholder key (`0123456789abcdef` repeated). Your production data was likely encrypted with a different key that has been lost or changed.

## Immediate Fixes Applied

✅ **Audit Log Validation Error** - FIXED
- Modified `auditMiddleware.js` to handle missing `user_email`
- Now falls back to `req.user` data when `auditContext` is not available
- Added validation to skip audit logging gracefully if required fields are missing

✅ **Decryption Graceful Fallback** - FIXED
- Added try-catch blocks around all decryption calls in:
  - `UserPersonalInfo.js` model
  - `UserMedicalInfo.js` model
- When decryption fails, the system now:
  - Logs a warning instead of crashing
  - Keeps the encrypted value (better than losing data)
  - Continues processing other fields

## Long-Term Solutions

### Option 1: Find the Original Encryption Key (RECOMMENDED)

1. **Search for backup `.env` files:**
   ```powershell
   Get-ChildItem -Path "D:\FYP\" -Filter ".env*" -Recurse -File
   ```

2. **Check Git history** (if `.env` was accidentally committed):
   ```bash
   git log -p --all -S "ENCRYPTION_KEY" -- .env
   ```

3. **Check your password manager or secure notes** where you might have saved it

4. **Once found, update `.env`:**
   ```env
   ENCRYPTION_KEY=<your_actual_64_character_hex_key>
   ```

### Option 2: Re-encrypt All Data with New Key

If the original key is permanently lost, you'll need to:

1. **Export all encrypted data** (while still encrypted)
2. **Generate a new encryption key:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Update `.env` with new key**
4. **Manually decrypt using old logic** (if possible) and re-encrypt with new key
5. **This is complex and risky** - backup database first!

### Option 3: Clear and Re-collect Data (LAST RESORT)

⚠️ **WARNING: This deletes all encrypted user data!**

Only if data is not critical or this is development:

```bash
cd backend
node clear-encrypted-data.js
```

Then users will need to re-enter their personal and medical information.

## How to Prevent This in the Future

1. **Store encryption key securely:**
   - Use environment variable management (Azure Key Vault, AWS Secrets Manager)
   - Never commit `.env` to version control
   - Keep encrypted backups of `.env` file

2. **Add to `.env.example`:**
   ```env
   # CRITICAL: Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # This key MUST remain constant - changing it will make all encrypted data unreadable
   ENCRYPTION_KEY=generate_your_own_64_character_hex_key_here
   ```

3. **Document key generation** in README:
   ```markdown
   ## First Time Setup - CRITICAL
   
   Generate your encryption key (DO THIS ONCE AND SAVE IT SECURELY):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   Add this to `.env` and **NEVER CHANGE IT** or all encrypted data becomes unreadable.
   ```

## Current Status

✅ **Application won't crash** - Graceful fallbacks are in place
✅ **Audit logs work** - Validation errors are handled
⚠️ **Encrypted data remains encrypted** - You need to find/set the correct key

## Next Steps

1. ✅ Backend server updated with fixes
2. 🔍 **Search for original ENCRYPTION_KEY** using methods above
3. 📝 Update `.env` with correct key once found
4. ♻️ Restart backend server
5. ✅ Test that decryption works

## Testing Decryption

Once you think you have the correct key:

```bash
cd backend
node test-decryption-live.js
```

You should see:
```
✅ Gender decrypted: Male
✅ Height decrypted: 170
✅ Weight decrypted: 70
```

Instead of:
```
❌ Gender decryption failed: Failed to decrypt data: error:1C800064
```

---

**Last Updated:** December 27, 2025
**Status:** Partial Fix - Graceful fallbacks implemented, original key still needed
