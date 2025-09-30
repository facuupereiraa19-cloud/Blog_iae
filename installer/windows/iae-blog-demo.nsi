; IAE Blog - Instalador DEMO (NSIS)
; Requisitos para compilar: NSIS (https://nsis.sourceforge.io/Download)
; Compilar este .nsi desde la raiz del repo o ajuste las rutas File /r

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "x64.nsh"

Name "IAE Blog DEMO"
OutFile "iae-blog-demo-setup.exe"
InstallDir "$PROGRAMFILES64\IAE Blog DEMO"
RequestExecutionLevel admin
ShowInstDetails show

!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Mostrar opción de "Iniciar ahora" al finalizar
!define MUI_FINISHPAGE_RUN_TEXT "Iniciar IAE Blog DEMO ahora"
!define MUI_FINISHPAGE_RUN_CHECKED
!define MUI_FINISHPAGE_RUN "$INSTDIR\\scripts\\windows\\start-demo.bat"
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "Spanish"

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"

  ; Copiar proyecto (ajuste rutas si compila desde otra carpeta)
  File /r /x "node_modules" "backend\*"
  File /r /x "node_modules" "frontend\*"
  File /r "scripts\windows\start-demo.bat"
  File /r "scripts\windows\install-demo.ps1"

  ; Escribir .env DEMO
  CopyFiles /SILENT "$INSTDIR\backend\.env.demo" "$INSTDIR\backend\.env"

  ; Instalar Node LTS (winget) si no existe
  nsExec::ExecToStack 'cmd /c node -v'
  Pop $0
  Pop $1
  StrCmp $0 '0' hasNode noNode
  noNode:
    DetailPrint "Instalando Node.js LTS via winget"
    nsExec::ExecToLog 'powershell -ExecutionPolicy Bypass -Command "winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements"'
    Goto afterNode
  hasNode:
    DetailPrint "Node encontrado"
  afterNode:

  ; npm install en backend (evita fallos por lock desincronizado)
  DetailPrint "Instalando dependencias (backend)"
  nsExec::ExecToLog 'cmd /c "cd /d \"$INSTDIR\\backend\" && npm install"'

  ; npm install en frontend (evita fallos por lock desincronizado)
  DetailPrint "Instalando dependencias (frontend)"
  nsExec::ExecToLog 'cmd /c "cd /d \"$INSTDIR\\frontend\" && npm install"'

  ; Acceso directo en menu inicio
  CreateShortCut "$SMPROGRAMS\IAE Blog DEMO\Iniciar Demo.lnk" "$INSTDIR\scripts\windows\start-demo.bat"
  CreateShortCut "$DESKTOP\IAE Blog DEMO.lnk" "$INSTDIR\scripts\windows\start-demo.bat"

  DetailPrint "Instalacion completada. Cree accesos directos."
SectionEnd

Section "Uninstall"
  Delete "$SMPROGRAMS\IAE Blog DEMO\Iniciar Demo.lnk"
  RMDir  "$SMPROGRAMS\IAE Blog DEMO"
  Delete "$DESKTOP\IAE Blog DEMO.lnk"
  RMDir /r "$INSTDIR"
SectionEnd
