@echo off
setlocal enabledelayedexpansion
REM IAE Blog - Arrancar Docker (Windows)

REM Encontrar raíz del repo
set SCRIPT_DIR=%~dp0
for %%I in ("%SCRIPT_DIR%..\..") do set REPO_ROOT=%%~fI
cd /d "%REPO_ROOT%"

if not exist ".env" (
  echo JWT_SECRET=supersecreto_cambia_esto> .env
)

echo Construyendo y levantando contenedores...
docker compose up -d --build
if errorlevel 1 (
  echo Error: No se pudo ejecutar docker compose. ^(¿Docker Desktop esta iniciado?^)
  pause
  exit /b 1
)

echo Abriendo http://localhost:8080
start http://localhost:8080

echo ======================================
echo IAE Blog (Docker) en ejecucion
echo Frontend: http://localhost:8080
echo Backend:  http://localhost:5000
echo Para detener: docker compose down
echo ======================================

endlocal
