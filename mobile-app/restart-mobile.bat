@echo off
echo ========================================
echo   Mobile App Quick Restart
echo ========================================
echo.

echo [1/4] Stopping Expo server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo [3/4] Clearing Metro cache...
cd ..\mobile-app
rmdir /s /q .expo 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo [4/4] Starting Mobile App with cleared cache...
start "Mobile App" cmd /k "npx expo start --clear"

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo   Backend: http://192.168.1.5:5000
echo   Mobile: Check the Expo window
echo ========================================
echo.
echo Press any key to open this in browser...
pause >nul

start http://192.168.1.5:5000

echo.
echo All done! You can close this window.
timeout /t 5
