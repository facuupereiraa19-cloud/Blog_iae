@echo off
setlocal enabledelayedexpansion
REM IAE Blog - Arranque completo (Windows)
REM Usa el stack Docker definido en docker-compose.yml (MongoDB 4.4)

pushd "%~dp0" >nul

set PS_SCRIPT=scripts\windows\install-docker.ps1
if not exist "%PS_SCRIPT%" (
  echo [ERROR] No se encontro "%PS_SCRIPT%". Ejecuta desde la raiz del repositorio.
  popd >nul
  endlocal
  exit /b 1
)

findstr /C:"image: mongo:4.4" docker-compose.yml >nul 2>&1
if errorlevel 1 (
  echo [WARN] docker-compose.yml no apunta a MongoDB 4.4. Revisa la configuracion antes de continuar.
) else (
  echo [INFO] docker-compose.yml usa la imagen mongo:4.4
)

echo ================================
echo Iniciando instalacion/arranque via PowerShell...
echo (Se requerira Docker Desktop; el script lo instalara si falta)
echo ================================

powershell -NoExit -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -StartAfterInstall -KeepWindowOpen -FollowLogs
if errorlevel 1 (
  echo.
  echo Hubo un problema con PowerShell.
  echo Puedes ejecutar manualmente: %PS_SCRIPT% -StartAfterInstall
  echo (Clic derecho, "Run with PowerShell").
)

popd >nul
endlocal
