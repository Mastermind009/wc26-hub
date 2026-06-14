@echo off
echo === WC26 Hub - One-click public share ===
echo.
echo Starting production server...
start "wc26-server" cmd /c "set PATH=%ProgramFiles%\nodejs;%PATH% && cd /d %~dp0 && npm start"

timeout /t 3 /nobreak >nul

echo.
echo Starting public tunnel (share the URL with friends)...
echo Keep this window open while friends use the site.
echo.
npx --yes localtunnel --port 3001
