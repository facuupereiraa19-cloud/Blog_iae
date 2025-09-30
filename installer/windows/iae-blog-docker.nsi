; IAE Blog - Instalador Docker (NSIS)
; Requisitos: NSIS para compilar, winget disponible en el PC de destino.

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "x64.nsh"

Name "IAE Blog (Docker)"
OutFile "iae-blog-docker-setup.exe"
InstallDir "$PROGRAMFILES64\IAE Blog Docker"
RequestExecutionLevel admin
ShowInstDetails show

!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN_TEXT "Iniciar IAE Blog (Docker) ahora"
!define MUI_FINISHPAGE_RUN_CHECKED
!define MUI_FINISHPAGE_RUN "$INSTDIR\\scripts\\windows\\start-docker.bat"
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "Spanish"

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"

  ; Copiar proyecto necesario para docker compose
  File /r /x "node_modules" "backend\*"
  File /r /x "node_modules" "frontend\*"
  File /r "docker-compose.yml"
  File /r "scripts\windows\start-docker.bat"
  File /r "scripts\windows\install-docker.ps1"

  ; Escribir .env con secreto (si no existe)
  IfFileExists "$INSTDIR\.env" 0 +3
    Goto afterEnv
  FileOpen $0 "$INSTDIR\.env" w
  FileWrite $0 "JWT_SECRET=supersecreto_cambia_esto$\r$\n"
  FileClose $0
  afterEnv:

  ; Intentar instalar y arrancar Docker con PowerShell
  DetailPrint "Verificando Docker Desktop e iniciando stack..."
  nsExec::ExecToLog 'powershell -ExecutionPolicy Bypass -File "$INSTDIR\scripts\windows\install-docker.ps1" -StartAfterInstall'

  ; Atajos
  CreateShortCut "$SMPROGRAMS\IAE Blog Docker\Iniciar.lnk" "$INSTDIR\scripts\windows\start-docker.bat"
  CreateShortCut "$DESKTOP\IAE Blog Docker.lnk" "$INSTDIR\scripts\windows\start-docker.bat"
SectionEnd

Section "Uninstall"
  Delete "$SMPROGRAMS\IAE Blog Docker\Iniciar.lnk"
  RMDir  "$SMPROGRAMS\IAE Blog Docker"
  Delete "$DESKTOP\IAE Blog Docker.lnk"
  RMDir /r "$INSTDIR"
SectionEnd

