# 09 · Manual de instalación y despliegue

## Prerrequisitos
- Sistema operativo Windows 10/11, macOS o Linux con soporte Docker.
- Docker Desktop (>= 4.30) o Docker Engine + Docker Compose Plugin.
- Node.js 20.x y npm 10.x (solo si se desea ejecutar sin contenedores).
- Acceso a internet para descargar imágenes en el primer arranque.

## Configuración del entorno
1. Clonar el repositorio o descargar el paquete `iae-blog-main`.
2. Duplicar `.env` en la raíz si se requieren variables personalizadas (por defecto se usan valores de ejemplo).
3. En `backend/.env` definir `JWT_SECRET` y `DB_URL` si se despliega fuera de Docker.

## Despliegue con Docker (recomendado)
1. Abrir consola en la raíz del proyecto.
2. Ejecutar el script según sistema:
   - Windows: `run-iae-blog.bat`
   - macOS/Linux: `./run-iae.sh`
3. El script compila imágenes `iae-blog-main-frontend` y `iae-blog-main-backend`, y levanta `mongo:4.4`.
4. Verificar con `docker ps` que los contenedores `iae_frontend`, `iae_backend` e `iae_mongo` estén **Up**.
5. Acceder a:
   - Frontend: http://localhost:8080/#/
   - API backend: http://localhost:5000/api/health
6. Para detener servicios: `docker compose down`.

### Mantenimiento de volúmenes
- MongoDB persiste en `iae-blog-main_mongo_data`.
- Uploads se guardan en `iae-blog-main_uploads_data`.
- Para reiniciar desde cero (borra datos):
  ```bash
  docker compose down
  docker volume rm iae-blog-main_mongo_data iae-blog-main_uploads_data
  docker compose up -d --build
  ```

## Ejecución local sin Docker (modo desarrollo)
1. Instalar dependencias:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. En `backend`, copiar `.env.demo` a `.env` y ajustar `DB_URL` a una instancia Mongo local.
3. Inicializar backend:
   ```bash
   cd backend
   npm run seed   # opcional, crea datos de ejemplo
   npm run dev
   ```
4. Inicializar frontend:
   ```bash
   cd frontend
   npm run dev
   ```
5. El frontend usará por defecto `VITE_API_URL=http://localhost:5000`.

## Pruebas posteriores a la instalación
- Backend: `cd backend && npm test`
- Frontend: ejecutar `npm run lint` y pruebas manuales (checklist documento 08).

## Despliegue en producción
- Ajustar `NODE_ENV=production` y `DEMO_MODE=false` en backend.
- Configurar `JWT_SECRET` robusto y `UPLOAD_MAX_MB` adecuado.
- Habilitar HTTPS mediante proxy inverso (Nginx, Traefik) delante del frontend.
- Configurar copias de seguridad de Mongo (`mongodump` diario) y almacenamiento de uploads (S3, Azure Blob, etc.).

## Troubleshooting
| Síntoma | Posible causa | Acción |
|---------|---------------|--------|
| Backend cae con `ENOTFOUND mongo` | Contenedor Mongo no levanta o se corrompió volumen | Revisar logs `docker logs iae_mongo`, recrear volumen. |
| Error `JWT_SECRET no está definida` | Falta variable en `backend/.env` | Establecer valor y reiniciar backend. |
| No carga multimedia | Ruta `uploads/` no expuesta o archivo supera tamaño | Verificar volumen `uploads_data` y `UPLOAD_MAX_MB`. |
| Frontend en blanco | Variables `VITE_API_URL` incorrectas | Revisar `.env.development` y reiniciar `npm run dev`. |
