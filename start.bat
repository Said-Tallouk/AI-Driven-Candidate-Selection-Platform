@echo off
title Skills Matcher Pro — Lanceur

set ROOT=%~dp0

echo.
echo  ===================================================
echo    Skills Matcher Pro — Demarrage des serveurs
echo  ===================================================
echo.
echo  [1/2] Demarrage du backend FastAPI (port 8000)...
start "Backend FastAPI" cmd /k "cd /d "%ROOT%" && uvicorn backend.main:app --reload --port 8000"

echo  [2/2] Demarrage du frontend React (port 5173)...
timeout /t 2 /nobreak >nul
start "Frontend React" cmd /k "cd /d "%ROOT%frontend" && npm run dev"

echo.
echo  Les deux serveurs demarrent dans des fenetres separees.
echo.
echo  Attendez quelques secondes puis ouvrez :
echo     http://localhost:5173
echo.
echo  Identifiants : admin / rh2024
echo.
pause
