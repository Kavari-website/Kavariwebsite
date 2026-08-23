@echo off
REM ============================================================
REM  KAVARI - Arranca los 2 servidores locales necesarios
REM  1) Sitio web estatico .... http://localhost:5501
REM  2) API del chatbot ....... http://localhost:3007
REM ============================================================
title KAVARI - Servidores Locales

echo [1/2] Iniciando sitio web en puerto 5501...
start "KAVARI Sitio Web (5501)" cmd /k "cd /d C:\Users\usuario\Downloads\Kavari1.4\Kavariwebsite && node scripts/dev-server.js 5501"

echo [2/2] Iniciando API del chatbot en puerto 3007...
start "KAVARI Chat API (3007)" cmd /k "cd /d C:\Users\usuario\Downloads\Kavari1.4\Kavariwebsite\server && node index.js"

timeout /t 3 /nobreak >nul
start http://localhost:5501/index.html
echo.
echo [OK] Listo. Se abrieron 2 ventanas (una por servidor).
echo      - Sitio:  http://localhost:5501
echo      - API:    http://localhost:3007/api/health
echo.
echo Cierra esas ventanas para detener los servidores.
pause
