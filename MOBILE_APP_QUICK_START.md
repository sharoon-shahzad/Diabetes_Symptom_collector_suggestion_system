# 🚀 Mobile App Quick Start Guide

## Prerequisites

Before running the mobile app, ensure you have:

1. ✅ Node.js installed (v16 or higher)
2. ✅ Expo CLI installed globally: `npm install -g expo-cli`
3. ✅ Expo Go app on your phone (download from App Store/Play Store)
4. ✅ Backend server running

---

## Step 1: Start the Backend Server

```bash
cd backend
npm start
```

The backend should start on `http://localhost:8000`

---

## Step 2: Configure API URL (Important!)

### For Android Emulator:
The default URL `http://10.0.2.2:8000/api/v1` should work.

### For iOS Simulator:
Use `http://localhost:8000/api/v1`

### For Physical Device:
1. Find your computer's local IP address:
   - **Windows**: Run `ipconfig` in terminal, look for IPv4 Address
   - **Mac/Linux**: Run `ifconfig` in terminal
   
2. Update the API URL in `mobile-app/utils/api.js`:
   ```javascript
   const BASE_URL = 'http://YOUR_IP_ADDRESS:8000/api/v1';
   // Example: 'http://192.168.1.100:8000/api/v1'
   ```

---

## Step 3: Install Dependencies

```bash
cd mobile-app
npm install
```

---

## Step 4: Start the Mobile App

```bash
npm start
```

This will open the Expo development server in your browser.

---

## Step 5: Run on Device/Emulator

### Option A: Physical Device (Recommended)
1. Open **Expo Go** app on your phone
2. Scan the QR code shown in the terminal/browser
3. App will load on your device

### Option B: Android Emulator
```bash
npm run android
```

### Option C: iOS Simulator (Mac only)
```bash
npm run ios
```

---

## 🎯 Testing the Personalized System

1. **Login/Signup** to the app
2. Navigate to **Dashboard**
3. Tap the **"Personalized"** button (green button in Quick Actions)
4. Explore the features:
   - **Personal & Medical Info**: Complete the 4-step form
   - **Diet Plan**: Generate an AI-powered diet plan
   - **Exercise Plan**: Get customized exercises
   - **Lifestyle Tips**: View daily wellness recommendations
   - **Chat Assistant**: Try the chat interface

---

## 🐛 Troubleshooting

### Issue: "Network Error" or API not connecting

**Solution 1**: Check backend is running
```bash
curl http://localhost:8000/api/v1/
```

**Solution 2**: Update API URL for your device type (see Step 2)

**Solution 3**: Ensure phone and computer are on same WiFi network

### Issue: "Metro bundler has encountered an error"

**Solution**: Clear cache and restart
```bash
npm start -- --reset-cache
```

### Issue: App crashes on launch

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules
npm install
npm start
```

### Issue: Date picker not working

**Solution**: The DateTimePicker is already installed. If issues persist:
```bash
npm install @react-native-community/datetimepicker
```

---

## 📱 App Navigation

```
Login/Signup
    ↓
Dashboard
    ↓
[Personalized Button]
    ↓
Personalized Dashboard
    ↓
├── Personal & Medical Info (4 steps)
├── Diet Plan (Generate/View)
├── Exercise Plan (Generate/View)
├── Lifestyle Tips (Generate/View)
└── Chat Assistant
```

---

## 🎨 Features to Test

### ✅ Personal & Medical Information
- [ ] Step 1: Enter basic info
- [ ] Step 2: Enter lifestyle data
- [ ] Step 3: Enter medical history
- [ ] Step 4: Review and save

### ✅ Diet Plan
- [ ] Generate new plan
- [ ] View nutritional summary
- [ ] See meal details
- [ ] Pull to refresh

### ✅ Exercise Plan
- [ ] Generate new plan
- [ ] View exercises
- [ ] See duration/sets/reps
- [ ] Pull to refresh

### ✅ Lifestyle Tips
- [ ] Generate tips
- [ ] View by category
- [ ] Read action steps
- [ ] Pull to refresh

### ✅ Chat Assistant
- [ ] Send messages
- [ ] Receive responses
- [ ] View timestamp

---

## 🔑 Test Credentials

You can use existing credentials or create a new account through the signup flow.

---

## 📝 Notes

- **First Time**: Complete the Personal & Medical Info form first for best results
- **Generation**: AI plan generation may take 10-30 seconds
- **Internet**: Active internet connection required
- **Backend**: Backend must be running for all features to work

---

## 🆘 Need Help?

Check the logs:
1. **App Logs**: Visible in the terminal running `npm start`
2. **Backend Logs**: Check the backend terminal
3. **Device Logs**: Shake device and tap "Show Dev Menu" → "Debug"

---

## ✨ Enjoy Your Personalized Health Journey!

The app is now ready to use. Start by completing your Personal & Medical Information, then explore the AI-powered recommendations tailored just for you! 🎉
