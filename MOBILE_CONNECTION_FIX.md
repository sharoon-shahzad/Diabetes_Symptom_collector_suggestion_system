# 🔧 Mobile App Connection Fix Guide

## Problem
The mobile app was timing out when trying to connect to the backend server because:
1. ❌ Wrong port: App was using port **8000**, but backend runs on **5000**
2. ❌ Wrong IP: App was using `192.168.1.11`, but correct IP is `192.168.1.19`
3. ❌ CORS issue: Backend wasn't configured to accept mobile app requests

## ✅ Solution Applied

### 1. Updated Mobile App API Configuration
**File: `mobile-app/utils/api.js`**

Changed from:
```javascript
const BASE_URL = 'http://10.0.2.2:8000/api/v1';
```

To:
```javascript
const BASE_URL = 'http://192.168.1.19:5000/api/v1';
```

Also changed:
- ✅ Reduced timeout from 60s to 30s (more reasonable)
- ✅ Set `withCredentials: false` (mobile apps don't need this)

### 2. Updated Backend CORS Configuration
**File: `backend/server.js`**

Added mobile app origins to CORS whitelist:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.1.19:8081', // Expo dev server
    'exp://192.168.1.19:8081',   // Expo protocol
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
```

---

## 🚀 Steps to Fix and Test

### Step 1: Restart Backend Server
```bash
# Stop any running backend process
cd backend
# Start the backend
node server.js
```

Backend should start on: `http://192.168.1.19:5000`

### Step 2: Restart Mobile App
```bash
# Stop the current Expo server (Ctrl+C)
cd mobile-app
# Clear cache and restart
npm start -- --clear
```

### Step 3: Test the Connection

#### Option A: Quick Test from Mobile App
1. Open the app on your phone
2. Try to login
3. Should connect successfully now

#### Option B: Test Backend is Running
Open browser and go to:
```
http://192.168.1.19:5000/api/v1/
```

You should see a response (not an error page).

---

## 📱 Important Notes for Different Devices

### For Android Emulator:
Use: `http://10.0.2.2:5000/api/v1`

### For iOS Simulator:
Use: `http://localhost:5000/api/v1`

### For Physical Device (Current Setup):
Use: `http://192.168.1.19:5000/api/v1`

**Note:** Both your phone and computer must be on the **same WiFi network**!

---

## 🔍 Troubleshooting

### If you still get timeout errors:

#### 1. Check Backend is Running
```bash
curl http://localhost:5000/api/v1/
```

Should return a response (not connection refused).

#### 2. Check Your IP Address
```bash
ipconfig
```

Look for "IPv4 Address" under your WiFi adapter. Update `mobile-app/utils/api.js` if different.

#### 3. Check Firewall
Make sure Windows Firewall allows Node.js:
- Open Windows Firewall settings
- Allow Node.js through firewall for both Private and Public networks

#### 4. Verify Same Network
- Your phone and computer must be on the **same WiFi**
- Don't use mobile data on phone
- Don't use VPN on computer

#### 5. Test with Postman/Browser
Try accessing the backend from your phone's browser:
```
http://192.168.1.19:5000/api/v1/
```

If this doesn't work, it's a network/firewall issue, not an app issue.

---

## 🎯 Quick Verification Checklist

Before testing the app:
- [ ] Backend server is running (check terminal output)
- [ ] Backend shows: `Server running on port 5000`
- [ ] You can access `http://localhost:5000` in browser on computer
- [ ] Your IP is correct (run `ipconfig` to verify)
- [ ] Phone and computer on same WiFi
- [ ] Mobile app has been restarted
- [ ] Expo cache cleared

---

## 📝 Configuration Summary

### Current Configuration:
- **Backend Port:** 5000
- **Backend IP:** 192.168.1.19
- **Full API URL:** http://192.168.1.19:5000/api/v1
- **Timeout:** 30 seconds
- **CORS:** Configured for mobile access

### If Your IP Changes:
If your computer's IP address changes (e.g., after reconnecting to WiFi), you'll need to:
1. Run `ipconfig` to get new IP
2. Update `mobile-app/utils/api.js` with new IP
3. Update `backend/server.js` CORS origins with new IP
4. Restart both backend and mobile app

---

## ✅ Expected Result

After applying these fixes:
- ✅ Login should work within 2-3 seconds
- ✅ No more timeout errors
- ✅ All API calls should succeed
- ✅ Full app functionality restored

---

## 🆘 Still Having Issues?

If problems persist, check:
1. **Backend logs** - Look for errors in the terminal running `node server.js`
2. **Mobile logs** - Check Expo console for detailed error messages
3. **Network connectivity** - Try accessing any website on phone to verify internet
4. **Antivirus/Firewall** - Temporarily disable to test if blocking

---

**Status:** ✅ Configuration Updated - Ready to Test!

**Next Step:** Restart backend server and mobile app, then try logging in.
