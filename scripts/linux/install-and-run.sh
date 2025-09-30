#!/usr/bin/env bash

# IAE Blog: One-click installer/runner for Linux (Docker-based)
# - Installs Docker (if missing)
# - Builds & starts the stack with docker compose
# - Seeds admin user (admin@iae.com / admin123)
# - Opens the app in default browser

set -euo pipefail
IFS=$'\n\t'

RED="\033[0;31m"; GREEN="\033[0;32m"; YELLOW="\033[1;33m"; NC="\033[0m"

on_error() {
  echo -e "${RED}[ERROR]${NC} Ha ocurrido un error. Revisa el log anterior."
  if require_cmd docker; then
    echo -e "${YELLOW}[INFO]${NC} Estado actual de los contenedores (si alguno quedó levantado):"
    compose ps || true
    echo -e "${YELLOW}[INFO]${NC} Últimos logs del backend (si existe):"
    compose logs --tail=50 backend || true
  fi
  read -rp "Presiona Enter para cerrar esta ventana..." _ || true
}
trap on_error ERR

require_cmd() { command -v "$1" >/dev/null 2>&1; }

has_sudo() { command -v sudo >/dev/null 2>&1; }

run_sudo() {
  if has_sudo; then
    sudo "$@"
  else
    echo -e "${RED}[ERROR]${NC} Se requiere 'sudo' para instalar dependencias. Instálalo y vuelve a intentar."
    exit 1
  fi
}

choose_compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
  else
    echo "" # missing
  fi
}

install_docker() {
  echo -e "${YELLOW}[INFO]${NC} Instalando Docker..."
  if [ -f /etc/os-release ]; then
    . /etc/os-release
  fi
  # Attempt official convenience script first (covers most distros)
  if require_cmd curl; then
    run_sudo sh -c 'curl -fsSL https://get.docker.com -o /tmp/get-docker.sh && sh /tmp/get-docker.sh && rm -f /tmp/get-docker.sh'
  else
    echo -e "${YELLOW}[INFO]${NC} 'curl' no está instalado; intentando con el gestor de paquetes..."
    if [ "${ID_LIKE:-}" = "debian" ] || [ "${ID:-}" = "debian" ] || [ "${ID:-}" = "ubuntu" ]; then
      run_sudo apt-get update
      run_sudo apt-get install -y curl
      run_sudo sh -c 'curl -fsSL https://get.docker.com -o /tmp/get-docker.sh && sh /tmp/get-docker.sh && rm -f /tmp/get-docker.sh'
    else
      echo -e "${RED}[ERROR]${NC} No se pudo instalar Docker automáticamente. Instálalo manualmente y vuelve a ejecutar."
      exit 1
    fi
  fi

  echo -e "${GREEN}[OK]${NC} Docker instalado."
}

ensure_docker() {
  if ! require_cmd docker; then
    install_docker
  fi
  # Start/enable daemon if systemd
  if command -v systemctl >/dev/null 2>&1; then
    if ! systemctl is-active --quiet docker; then
      echo -e "${YELLOW}[INFO]${NC} Iniciando servicio docker..."
      run_sudo systemctl enable --now docker || true
    fi
  fi
}

ensure_compose() {
  local cmd
  cmd=$(choose_compose_cmd)
  if [ -z "$cmd" ]; then
    echo -e "${YELLOW}[INFO]${NC} Instalando Docker Compose plugin..."
    # With the convenience script, compose plugin should be present.
    # If not, try package manager for docker-compose v1 as fallback (Debian/Ubuntu)
    if [ -f /etc/os-release ]; then . /etc/os-release; fi
    if [ "${ID_LIKE:-}" = "debian" ] || [ "${ID:-}" = "debian" ] || [ "${ID:-}" = "ubuntu" ]; then
      run_sudo apt-get update
      run_sudo apt-get install -y docker-compose-plugin || run_sudo apt-get install -y docker-compose
    fi
  fi
  cmd=$(choose_compose_cmd)
  if [ -z "$cmd" ]; then
    echo -e "${RED}[ERROR]${NC} No se encontró Docker Compose. Instálalo y reintenta."
    exit 1
  fi
}

ensure_user_in_docker_group() {
  if groups "$USER" | grep -q docker; then
    return 0
  fi
  echo -e "${YELLOW}[INFO]${NC} Agregando usuario '$USER' al grupo 'docker'..."
  run_sudo usermod -aG docker "$USER" || true
  echo -e "${YELLOW}[INFO]${NC} Debes cerrar sesión y volver a entrar para usar docker sin sudo. Se usará 'sudo' por ahora."
}

USE_SUDO=0

compose() {
  local cmd
  cmd=$(choose_compose_cmd)
  if [ "$cmd" = "docker compose" ]; then
    if [ "$USE_SUDO" = "1" ]; then run_sudo docker compose "$@"; else docker compose "$@"; fi
  else
    if [ "$USE_SUDO" = "1" ]; then run_sudo docker-compose "$@"; else docker-compose "$@"; fi
  fi
}

open_browser() {
  local url="$1"
  if command -v xdg-open >/dev/null 2>&1; then
    nohup xdg-open "$url" >/dev/null 2>&1 &
  elif command -v gio >/dev/null 2>&1; then
    nohup gio open "$url" >/dev/null 2>&1 &
  else
    echo -e "${YELLOW}[INFO]${NC} Abre tu navegador y visita: $url"
  fi
}

show_status() {
  echo -e "${YELLOW}[INFO]${NC} Servicios activos:" 
  compose ps || true
}

wait_http() {
  local url="$1"; local tries=120; local delay=2
  echo -e "${YELLOW}[INFO]${NC} Esperando a que esté disponible $url ..."
  for i in $(seq 1 "$tries"); do
    if command -v curl >/dev/null 2>&1 && curl -fsS -m 2 "$url" >/dev/null 2>&1; then
      echo -e "${GREEN}[OK]${NC} Servicio disponible."
      return 0
    fi
    sleep "$delay"
  done
  echo -e "${YELLOW}[WARN]${NC} No se pudo verificar el servicio, podría tardar más en construir."
  return 0
}

seed_admin() {
  echo -e "${YELLOW}[INFO]${NC} Ejecutando seed de admin y posts..."
  if compose ps backend >/dev/null 2>&1; then
    compose exec -T backend node seed.js || true
  else
    # Fallback if ps not supported by plugin version
    compose exec -T backend node seed.js || true
  fi
}

main() {
  local REPO_ROOT
  REPO_ROOT="$(cd -- "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  cd "$REPO_ROOT"

  echo -e "${GREEN}== IAE Blog Installer (Linux) ==${NC}"
  echo -e "${YELLOW}[INFO]${NC} Verificando Docker y Docker Compose..."
  ensure_docker
  ensure_compose
  # Detect if docker requires sudo
  if docker info >/dev/null 2>&1; then
    USE_SUDO=0
  else
    echo -e "${YELLOW}[INFO]${NC} Ejecutando Docker con sudo (añadiendo grupo docker para uso futuro)..."
    USE_SUDO=1
    ensure_user_in_docker_group || true
  fi

  echo -e "${YELLOW}[INFO]${NC} Construyendo y levantando contenedores (esto puede tardar)..."
  compose up -d --build

  # Semilla de datos (modo producción por defecto en compose)
  seed_admin

  # Esperar frontend y abrir navegador
  wait_http "http://localhost:8080"
  open_browser "http://localhost:8080"

  echo -e "${GREEN}[OK]${NC} Todo listo. Credenciales de demo (si no cambiaste): admin@iae.com / admin123"
  echo -e "${YELLOW}[INFO]${NC} Para ver logs: 'docker compose logs -f'"
  show_status
  read -rp "Presiona Enter para cerrar esta ventana..." _ || true
}

main "$@"
