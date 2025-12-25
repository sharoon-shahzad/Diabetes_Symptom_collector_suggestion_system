# 🎯 Quick Start - Dynamic IP Mobile App

## Start Your App (Simple Version)

### Step 1: Start Backend
```bash
cd backend
npm start
```
**Look for:** `🌐 Local IP: 192.168.1.X`

### Step 2: Start Mobile App
```bash
cd mobile-app
npm start
```
**Look for:** `✅ Backend URL set to: http://192.168.1.X:5000/api/v1`

### Step 3: Use the App
Just login - the IP is automatically detected! 🎉

---

## That's It!

No more:
- ❌ Manually finding your IP
- ❌ Editing .env files
- ❌ Updating multiple configuration files
- ❌ Connection errors after IP changes

Your app now:
- ✅ Finds the backend automatically
- ✅ Caches the working IP
- ✅ Works on any WiFi network
- ✅ Updates when IP changes

---

## Troubleshooting One-Liner

**"Can't connect"?**
1. Backend running? ✓
2. Same WiFi? ✓
3. Firewall off? ✓
4. Restart app ✓

---

For detailed info, see [DYNAMIC_IP_SETUP.md](DYNAMIC_IP_SETUP.md)
