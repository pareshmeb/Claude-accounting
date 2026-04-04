@echo off
REM Start the AccuBooks app and open it in the browser.
cd /d "%~dp0"
start "AccuBooks Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"
