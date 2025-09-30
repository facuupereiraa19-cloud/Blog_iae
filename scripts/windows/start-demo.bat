@echo off
setlocal enabledelayedexpansion
REM IAE Blog - Iniciar DEMO (Windows)

REM Encontrar raíz del repo (dos niveles arriba de scripts\windows)
set SCRIPT_DIR=%~dp0
for %%I in ("%SCRIPT_DIR%..\..") do set REPO_ROOT=%%~fI
set BACKEND=%REPO_ROOT%\backend
set FRONTEND=%REPO_ROOT%\frontend

REM Comprobar Node
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js no está instalado. Por favor instala Node LTS y vuelve a intentar.
  pause
  exit /b 1
)

REM Asegurar .env DEMO
if exist "%BACKEND%\.env.demo" (
  copy /Y "%BACKEND%\.env.demo" "%BACKEND%\.env" >nul
)

REM Iniciar backend
start "IAE Backend" cmd /c "cd /d %BACKEND% && node server.js"
REM Dar un respiro al backend
timeout /t 2 >nul

REM Iniciar frontend (puerto 9000)
start "IAE Frontend" cmd /c "cd /d %FRONTEND% && npx quasar dev --port 9000"

REM Abrir navegador
start http://localhost:9000

echo ================================
echo IAE Blog DEMO en ejecucion.
echo Frontend: http://localhost:9000
echo Backend:  http://localhost:5000
echo Credenciales DEMO: admin@iae.com / admin123
echo Cierre estas ventanas para detener los servidores.
echo ================================

endlocal

