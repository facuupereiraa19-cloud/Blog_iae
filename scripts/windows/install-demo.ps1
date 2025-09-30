# IAE Blog - Instalador DEMO para Windows
# Uso: Ejecutar con clic derecho "Run with PowerShell" o desde PowerShell

param(
  [switch]$StartAfterInstall
)

$ErrorActionPreference = 'Stop'

function Ensure-Admin {
  $id = [System.Security.Principal.WindowsIdentity]::GetCurrent()
  $p = New-Object System.Security.Principal.WindowsPrincipal($id)
  if (-not $p.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host 'Reiniciando PowerShell como Administrador...' -ForegroundColor Yellow
    Start-Process powershell "-ExecutionPolicy Bypass -File `"$PSCommandPath`" $args" -Verb RunAs
    exit 0
  }
}

function Ensure-Node {
  try {
    $nodeVersion = (node -v) 2>$null
    if ($LASTEXITCODE -eq 0 -and $nodeVersion) {
      Write-Host "Node ya instalado: $nodeVersion" -ForegroundColor Green
      return
    }
  } catch {}

  Write-Host 'Instalando Node.js LTS (winget)...' -ForegroundColor Cyan
  $winget = (Get-Command winget -ErrorAction SilentlyContinue)
  if ($winget) {
    & winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
  } else {
    Write-Host 'winget no disponible. Descargando MSI de Node LTS...' -ForegroundColor Yellow
    $msiUrl = 'https://nodejs.org/dist/latest-v18.x/node-v18.20.4-x64.msi'
    $tmpMsi = Join-Path $env:TEMP 'node-lts.msi'
    Invoke-WebRequest -Uri $msiUrl -OutFile $tmpMsi
    Write-Host 'Instalando Node MSI (silencioso)...'
    Start-Process msiexec.exe -ArgumentList "/i `"$tmpMsi`" /qn" -Wait -NoNewWindow
  }

  $nodeVersion = (node -v)
  Write-Host "Node instalado: $nodeVersion" -ForegroundColor Green
}

function Run-NpmCi($dir) {
  Write-Host "Instalando dependencias en $dir ..." -ForegroundColor Cyan
  Push-Location $dir
  try {
    if (Test-Path package-lock.json) {
      npm ci
    } else {
      npm install
    }
  } finally {
    Pop-Location
  }
}

function Ensure-BackendEnv($backendDir) {
  $envFile = Join-Path $backendDir '.env'
  $demoEnv = Join-Path $backendDir '.env.demo'

  if (Test-Path $demoEnv) {
    Copy-Item -Force $demoEnv $envFile
    Write-Host "Escribiendo backend/.env (DEMO_MODE=true)" -ForegroundColor Green
  } else {
    @(
      'DEMO_MODE=true'
      'JWT_SECRET=supersecreto123'
      'DB_URL=mongodb://localhost:27017/iae_blog'
    ) | Set-Content -Path $envFile -Encoding UTF8
    Write-Host "Creado backend/.env (DEMO)" -ForegroundColor Green
  }
}

function Start-Demo {
  $startScript = Join-Path $PSScriptRoot 'start-demo.bat'
  if (-not (Test-Path $startScript)) {
    $startScript = Join-Path $PSScriptRoot '..\..\scripts\windows\start-demo.bat'
  }
  Write-Host 'Levantando Backend y Frontend...' -ForegroundColor Cyan
  Start-Process -FilePath $startScript -WorkingDirectory (Split-Path $startScript)
}

# --- Main ---
Ensure-Admin
Ensure-Node

# Asumimos que el script vive dentro del repo
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$backend = Join-Path $repoRoot 'backend'
$frontend = Join-Path $repoRoot 'frontend'

if (-not (Test-Path $backend) -or -not (Test-Path $frontend)) {
  throw 'No se encontraron carpetas backend/frontend. Ejecuta este script dentro del repositorio.'
}

Ensure-BackendEnv $backend
Run-NpmCi $backend
Run-NpmCi $frontend

Write-Host 'Instalación DEMO completada.' -ForegroundColor Green
Write-Host 'Credenciales DEMO: admin@iae.com / admin123' -ForegroundColor Yellow

if ($StartAfterInstall) {
  Start-Demo
  Start-Sleep -Seconds 3
  Start-Process 'http://localhost:9000'
} else {
  Write-Host 'Para iniciar: scripts\\windows\\start-demo.bat' -ForegroundColor Cyan
}

