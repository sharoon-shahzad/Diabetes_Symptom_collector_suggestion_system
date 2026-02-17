# Quick Start Guide - Mobile App Testing

## Prerequisites Checklist
- [ ] Node.js installed
- [ ] Expo CLI installed globally: `npm install -g expo-cli eas-cli`
- [ ] Backend server running on port 5000
- [ ] Android device or emulator ready

## Step 1: Install Dependencies
```bash
cd mobile-app
npm install
```

## Step 2: Configure Backend Connection
Edit `mobile-app/config.js`:
```javascript
export default {
  BACKEND_IP: '192.168.x.x',  // Replace with your computer's IP
  BACKEND_PORT: 5000,
  // ...
};
```

**How to find your IP:**
- Windows: `ipconfig` → Look for "IPv4 Address"
- Mac/Linux: `ifconfig` → Look for "inet"

## Step 3: Start Development
```bash
npm start
```
**Note:** Expo Go will work for most features, but Google Fit OAuth requires a signed build.

## Step 4: Test Core Features (Local Dev)
Open app in Expo Go:
1. ✅ Welcome screen → Two buttons visible
2. ✅ Tap "Let's Get Started" → Diagnosis screen
3. ✅ Complete onboarding without login
4. ✅ Login → Answers saved automatically
5. ✅ Close & reopen app → Auto-login to Dashboard

## Step 5: Build for Testing (Google Fit + Full Features)
```bash
# Install EAS CLI if not already
npm install -g eas-cli

# Login to Expo
eas login

# Build preview APK
npm run build:android:preview

# Or use EAS directly
eas build --platform android --profile preview
```

When build completes:
1. Download APK from EAS dashboard
2. Install on Android device
3. Test Google Fit connection (Profile → Connect Google Fit)

## Google Fit Setup (Production Only)
Before going to production, you must:

### 1. Google Cloud Console Setup
1. Go to: https://console.cloud.google.com
2. Create/select project
3. Enable **Fitness API**
4. Create **OAuth 2.0 Client ID** (Android type)
5. Add package name: `com.diabetes.symptomcollector`

### 2. Get EAS Build SHA-1
```bash
eas credentials
```
Select: Android → Production → Keystore → View SHA-1
Copy the SHA-1 fingerprint

### 3. Add SHA-1 to Google Cloud
In OAuth client configuration, add the SHA-1 certificate fingerprint

### 4. Configure Redirect URI
Add authorized redirect URI:
```
com.diabetes.symptomcollector://oauth
```

### 5. Update Client ID
Edit `mobile-app/services/GoogleFitService.js`:
```javascript
const CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com';
```

## Build Profiles Explained

### Development (`development`)
- Development client (for debugging)
- APK output
- Internal distribution
```bash
npm run build:android:dev
```

### Preview (`preview`)
- **Use this for supervisor testing**
- APK output
- Internal distribution
- Google Fit OAuth works
```bash
npm run build:android:preview
```

### Production (`production`)
- AAB output (for Play Store)
- Optimized build
```bash
npm run build:android:production
```

### Production APK (`production-apk`)
- Same as production but APK instead of AAB
- For manual distribution/testing
```bash
eas build --platform android --profile production-apk
```

## Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:**
1. Check backend is running: `http://YOUR_IP:5000/api/v1/server-info`
2. Verify firewall allows port 5000
3. Ensure both devices on same WiFi network

### Issue: "Google Fit OAuth doesn't work"
**Solution:**
- Expo Go does NOT support OAuth redirects
- Must use EAS build (preview/production)
- Verify redirect URI matches in both app.json and Google Cloud

### Issue: "Welcome screen still shows web landing page style"
**Solution:**
- Implementation is complete, but you need to run the new code
- Do a fresh `npm start` or rebuild

### Issue: "Auto-login not working"
**Solution:**
1. Check AuthContext is properly initialized
2. Verify token exists in AsyncStorage
3. Check `/auth/profile` endpoint returns user data

## Testing Checklist

### Core Flow
- [ ] Fresh install → Welcome screen (clean, 2 buttons)
- [ ] "Let's Get Started" → Diagnosis → Onboarding
- [ ] Complete onboarding without login
- [ ] Login → Pending answers saved
- [ ] Close app → Reopen → Auto-login (no Welcome)

### Authentication
- [ ] Login as existing user
- [ ] Logout → Redirected to Welcome
- [ ] Diagnosed user sees Suggestions tab
- [ ] Undiagnosed user does NOT see Suggestions tab

### UI Check
- [ ] Buttons have solid colors (not heavy gradients)
- [ ] Welcome screen looks mobile-native
- [ ] No "web landing page" feel

### Google Fit (Signed Build Only)
- [ ] Profile → Connect Google Fit
- [ ] OAuth flow completes
- [ ] Real step count displayed
- [ ] Disconnect works

## Next Steps
1. ✅ Test in Expo Go (most features)
2. ✅ Build preview APK for full testing
3. ✅ Share preview build with supervisor
4. ✅ Configure Google Fit for production
5. ✅ Build production AAB
6. ✅ Submit to Play Store

## Need Help?
Refer to: `MOBILE_APP_IMPLEMENTATION_GUIDE.md` for detailed documentation.

---

**Quick Commands Reference:**
```bash
# Local dev
npm start

# Preview build (for supervisor)
npm run build:android:preview

# Production AAB (for Play Store)
npm run build:android:production

# Check build status
eas build:list

# View credentials (for SHA-1)
eas credentials
```
