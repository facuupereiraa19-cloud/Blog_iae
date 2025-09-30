# IAE Blog - Instalacion y arranque con Docker Desktop (Windows)
# Ejecutar con clic derecho "Run with PowerShell" (como Administrador)

param(
  [switch]$StartAfterInstall,
  [switch]$KeepWindowOpen,
  [switch]$FollowLogs
)

$ErrorActionPreference = 'Stop'

function Ensure-Admin {
  $id = [System.Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object System.Security.Principal.WindowsPrincipal($id)
  if (-not $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host 'Reiniciando PowerShell como Administrador...' -ForegroundColor Yellow
    $argumentList = @('-NoExit', '-ExecutionPolicy', 'Bypass', '-File', $PSCommandPath)
    if ($StartAfterInstall) { $argumentList += '-StartAfterInstall' }
    if ($KeepWindowOpen) { $argumentList += '-KeepWindowOpen' }
    if ($FollowLogs) { $argumentList += '-FollowLogs' }
    Start-Process -FilePath 'powershell' -ArgumentList $argumentList -Verb RunAs
    exit 0
  }
}

function Ensure-Winget {
  if (Get-Command winget -ErrorAction SilentlyContinue) { return }
  Write-Host 'winget no esta disponible. Instala App Installer desde Microsoft Store y vuelve a ejecutar.' -ForegroundColor Red
  throw 'winget no encontrado'
}

function Ensure-DockerDesktop {
  try {
    docker info | Out-Null
    Write-Host 'Docker ya esta disponible.' -ForegroundColor Green
    return
  } catch {}

  Write-Host 'Instalando Docker Desktop (winget)...' -ForegroundColor Cyan
  Ensure-Winget
  & winget install -e --id Docker.DockerDesktop --silent --accept-package-agreements --accept-source-agreements

  Write-Host 'Intentando iniciar Docker Desktop...' -ForegroundColor Yellow
  $dockerExe = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
  if (Test-Path $dockerExe) {
    Start-Process -FilePath $dockerExe | Out-Null
  }

  Write-Host 'Esperando a que Docker este listo (esto puede tardar)...' -ForegroundColor Yellow
  $deadline = (Get-Date).AddMinutes(5)
  do {
    Start-Sleep -Seconds 3
    try { docker info | Out-Null; $ready = $true } catch { $ready = $false }
  } while (-not $ready -and (Get-Date) -lt $deadline)

  if (-not $ready) {
    Write-Host 'No se pudo verificar Docker. Abre Docker Desktop manualmente y vuelve a intentar.' -ForegroundColor Red
    throw 'Docker no disponible'
  }
}

function Ensure-Env($repoRoot) {
  $envFile = Join-Path $repoRoot '.env'
  if (-not (Test-Path $envFile)) {
    @('JWT_SECRET=supersecreto_cambia_esto') | Set-Content -Path $envFile -Encoding UTF8
    Write-Host 'Escrito .env junto a docker-compose.yml' -ForegroundColor Green
  }
}

function Compose-Up($repoRoot) {
  Push-Location $repoRoot
  try {
    Write-Host 'Construyendo y levantando contenedores...' -ForegroundColor Cyan
    docker compose up -d --build
  } finally {
    Pop-Location
  }
}

function Seed-Admin($repoRoot) {
  Push-Location $repoRoot
  try {
    Write-Host 'Ejecutando seed del admin y posts...' -ForegroundColor Cyan
    docker compose exec -T backend node seed.js
  } catch {
    Write-Host 'No se pudo ejecutar el seed dentro del contenedor. Esta corriendo backend?' -ForegroundColor Yellow
  } finally {
    Pop-Location
  }
}

function Follow-BackendLogs($repoRoot) {
  Push-Location $repoRoot
  try {
    Write-Host ''
    Write-Host 'Mostrando logs del backend en tiempo real (Ctrl+C para salir)...' -ForegroundColor Cyan
    docker compose logs -f backend
  } finally {
    Pop-Location
  }
}

function Open-App {
  Start-Process 'http://localhost:8080'
}

# --- Main ---
Ensure-Admin
Ensure-DockerDesktop

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
if (-not (Test-Path (Join-Path $repoRoot 'docker-compose.yml'))) {
  throw 'No se encontro docker-compose.yml en la raiz del repositorio.'
}

Ensure-Env $repoRoot
Compose-Up $repoRoot
Seed-Admin $repoRoot

Write-Host 'Listo: IAE Blog (Docker) en http://localhost:8080' -ForegroundColor Green
if ($StartAfterInstall) {
  Open-App
} else {
  Write-Host 'Abra: http://localhost:8080' -ForegroundColor Cyan
}

if ($FollowLogs) {
  Follow-BackendLogs $repoRoot
}

if ($KeepWindowOpen) {
  Write-Host ''
  Write-Host 'La ventana permanece abierta. Cierra esta ventana manualmente cuando termines.' -ForegroundColor Yellow
}

