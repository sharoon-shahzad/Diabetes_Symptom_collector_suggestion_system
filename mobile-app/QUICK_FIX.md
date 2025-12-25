# Quick Fix Script for Network Error

## 🚀 Instant Fix

Run this command in PowerShell:

```powershell
# Kill all Node processes and restart
taskkill /F /IM node.exe; Start-Sleep 2; cd backend; Start-Process powershell -ArgumentList "npm run dev"; Start-Sleep 2; cd ..\mobile-app; npx expo start --clear
```

## OR use the batch file:

Double-click: `restart-mobile.bat`

---

## ✅ What This Does:

1. ✅ Stops all Node.js processes
2. ✅ Starts backend server on port 5000
3. ✅ Clears Metro bundler cache
4. ✅ Starts Expo with fresh state
5. ✅ Opens backend URL in browser to verify

---

## 🔍 Verify Connection

After restarting, test in your phone's browser:

```
http://192.168.1.5:5000
```

You should see the backend response!

---

## 📱 On Your Phone

1. Open Expo Go app
2. Scan QR code from Expo window
3. Wait for bundle to load
4. Try logging in again

The app will now use the correct IP: **192.168.1.5**

---

## Still Having Issues?

### Check Backend is Running:
```powershell
netstat -an | findstr 5000
```
Should show: `0.0.0.0:5000` or `192.168.1.5:5000`

### Check Your IP:
```powershell
ipconfig | findstr IPv4
```
Should show: `192.168.1.5`

### Test Backend:
Open in browser: http://192.168.1.5:5000

### View Logs:
Look at the terminal windows for any errors

---

## 🎯 Quick Commands

```powershell
# Start Backend Only
cd backend
npm run dev

# Start Mobile App Only  
cd mobile-app
npx expo start --clear

# Kill Everything
taskkill /F /IM node.exe

# Check if Backend is Running
curl http://192.168.1.5:5000
```

---

**IP Address:** 192.168.1.5  
**Backend Port:** 5000  
**API URL:** http://192.168.1.5:5000/api/v1
