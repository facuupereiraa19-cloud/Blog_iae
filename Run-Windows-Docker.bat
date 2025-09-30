@echo off
setlocal
REM IAE Blog - Instalacion y arranque con Docker (1-click)

REM Cambiar a la carpeta donde está este .bat (raíz del repo)
pushd "%~dp0"

echo Verificando Docker Desktop e iniciando stack con PowerShell...
powershell -ExecutionPolicy Bypass -File "scripts\windows\install-docker.ps1" -StartAfterInstall
if errorlevel 1 (
  echo.
  echo Hubo un problema ejecutando PowerShell.
  echo Puedes ejecutar manualmente: scripts\windows\install-docker.ps1 -StartAfterInstall
  echo (Clic derecho, "Run with PowerShell").
  pause
)

popd
endlocal

