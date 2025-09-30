# iae-blog

Instalador DEMO para Windows
- Opción 1 (recomendada): Compilar el instalador EXE con NSIS y compartir un único archivo.
  - Instala NSIS en Windows.
  - Abre `installer/windows/iae-blog-demo.nsi` y compílalo.
  - Comparte el `iae-blog-demo-setup.exe` resultante. La persona solo hace doble clic y listo.
    - El instalador intentará instalar Node LTS con winget si no está instalado.
    - Instala dependencias en `backend` y `frontend`.
    - Escribe `backend/.env` en modo demo (DEMO_MODE=true, JWT_SECRET).
    - Crea accesos directos para iniciar la demo.

- Opción 2 (rápida para pruebas): Enviar el repo en ZIP + script PowerShell.
  - Enviar este repositorio (ZIP) a Windows.
  - En Windows, descomprimir y ejecutar: `scripts/windows/install-demo.ps1 -StartAfterInstall` (clic derecho, Run with PowerShell).
  - O 1‑click: doble clic en `Run-Windows-Demo.bat` (llama al script anterior automáticamente).
  - Se instalará Node LTS (si falta), las dependencias y arrancará automáticamente.

Modo DEMO
- No requiere MongoDB. Los Posts se guardan en memoria durante la sesión.
- Credenciales DEMO: `admin@iae.com` / `admin123`.
- Frontend: `http://localhost:9000` (Quasar dev). Backend: `http://localhost:5000`.

Persistencia real (opcional)
- Editar `backend/.env` y poner `DEMO_MODE=false` y `DB_URL` con MongoDB.
- Ejecutar `node backend/seed.js` para crear admin y posts.
- Iniciar backend con `node backend/server.js` y frontend con `cd frontend && npx quasar dev`.

Despliegue con Docker (producción)
- Requisitos: Docker y Docker Compose.
- Variables importantes:
  - `JWT_SECRET` (obligatoria en producción). Puedes exportarla en el entorno o crear un archivo `.env` en la raíz junto a `docker-compose.yml` con `JWT_SECRET=tu_secreto`.
- Construir y levantar:
  - `docker compose up -d --build`
  - Servicios:
    - Frontend (Nginx): `http://<IP_DEL_SERVIDOR>:8080`
    - Backend (Express): `http://<IP_DEL_SERVIDOR>:5000`
    - MongoDB (interno a la red de Docker)
- La app frontend está configurada para llamar al backend vía proxy Nginx en la misma URL: el frontend consume `/api` que Nginx redirige a `backend:5000/api` en la red de Docker.

Instalador para Windows (Docker)
- Compila el instalador: abre NSIS y compila `installer/windows/iae-blog-docker.nsi` (o `makensis installer\windows\iae-blog-docker.nsi`).
- Ejecuta el `iae-blog-docker-setup.exe` en Windows (Administrador).
  - Instala Docker Desktop con winget si no está.
  - Escribe `.env` con `JWT_SECRET` si falta.
  - Ejecuta `docker compose up -d --build`, corre el seed, y abre `http://localhost:8080`.
- Accesos directos: crea enlaces para iniciar con Docker.

Alternativa sin compilar (Docker)
- Doble clic en `Run-Windows-Docker.bat` para verificar/instalar Docker Desktop y levantar el stack con `docker compose` (abre `http://localhost:8080`).

EXE 1‑click con GitHub Actions
- Ya hay un workflow para compilar los `.exe` automáticamente en Windows.
- Pasos:
  - Sube el repo a GitHub.
  - Ve a Actions y ejecuta manualmente “Build Windows Installers” (o crea un tag `vX.Y.Z` para publicar un Release con los `.exe`).
  - Descarga los artefactos (`iae-blog-docker-setup.exe` y `iae-blog-demo-setup.exe`).
  - En la PC destino: doble clic al `.exe` (Administrador) y listo.

Probar instalación en otra PC
- Desde otra PC en la misma red, abre `http://<IP_DEL_SERVIDOR>:8080`.
- Credenciales DEMO (si usas modo demo): `admin@iae.com` / `admin123`.
- Si usas producción (sin demo), primero crea el admin ejecutando `node backend/seed.js` o vía colección `users` en MongoDB.

Salud del backend y verificación de variables
- Endpoint de salud: `GET http://<IP_DEL_SERVIDOR>:5000/api/health`
  - Responde con `env.demoMode`, `env.jwtSecretPresent` y `env.dbStatus`.
- Si `JWT_SECRET` no está definida, el backend no inicia en producción.

Pruebas rápidas (curl)
- Ping: `curl http://<IP_DEL_SERVIDOR>:5000/api/ping`
- Salud: `curl http://<IP_DEL_SERVIDOR>:5000/api/health`
- Login DEMO: `curl -X POST http://<IP_DEL_SERVIDOR>:5000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@iae.com","password":"admin123"}'`
- Listar posts: `curl http://<IP_DEL_SERVIDOR>:5000/api/posts`

## Arranque 1‑click en Linux

Archivo: `run-iae.sh` (raíz del repo). Alternativa: lanzador `installer/linux/iae-blog.desktop`.

Qué hace:
- Verifica/instala Docker y Docker Compose (requiere contraseña de sudo).
- Construye y levanta `mongo`, `backend`, `frontend` con `docker compose up -d --build`.
- Ejecuta el seed del admin (admin@iae.com / admin123) y posts de ejemplo.
- Abre el navegador en `http://localhost:8080`.

Cómo usar:
1) Marcar como ejecutable (una vez):
   - `chmod +x ./run-iae.sh ./scripts/linux/install-and-run.sh ./installer/linux/run.sh`
   - O en GUI: clic derecho > Propiedades > Permisos > “Permitir ejecutar”.
2) Doble clic en `run-iae.sh` (o en `installer/linux/iae-blog.desktop`).

Notas:
- Si tu usuario no está en el grupo `docker`, el script usará `sudo` y te añade al grupo para próximas ejecuciones (tendrás que cerrar sesión para que surta efecto).
- Logs: `docker compose logs -f`
- Parar: `docker compose down`
