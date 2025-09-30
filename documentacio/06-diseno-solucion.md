# 06 · Diseño de la solución

## Arquitectura general
- **Frontend SPA** con Quasar (Vue 3, TypeScript) ubicado en `frontend/src`. Consume la API mediante `axios` (servicio `frontend/src/services/api.ts`) y maneja estado global con Pinia.
- **Backend REST** en Node.js/Express (`backend/server.js`) con estructura modular de controladores y rutas.
- **Base de datos MongoDB 4.4** con modelos Mongoose para `User`, `Post` y `Settings`.
- **Socket.IO** (`backend/socket.js`) para difundir métricas de interacción en tiempo real.
- **Docker Compose** (`docker-compose.yml`) orquesta contenedores `iae_frontend`, `iae_backend` y `iae_mongo` conectados por la red `iae_net`.

## Componentes clave
1. **Autenticación**
   - Rutas `POST /api/auth/login` y `POST /api/auth/register` (`backend/routes/auth.js`).
   - `passportConfig.js` configura estrategia JWT para proteger rutas (`/api/posts`, `/api/settings`).
   - Hashing con `bcrypt` y tokens firmados con `JWT_SECRET`.

2. **Gestión de publicaciones**
   - Modelo `Post` (`backend/models/Post.js`).
   - Controlador en `backend/routes/posts.js` expone CRUD, likes y vistas.
   - Subida de archivos a `/uploads` con límite 100 MB (configurable por `UPLOAD_MAX_MB`).
   - Frontend `DashboardView.vue` consume endpoints protegidos.

3. **Configuración del portal**
   - Modelo `Settings` (`backend/models/Settings.js`).
   - Store `frontend/src/stores/settingsStore.ts` sincroniza colores y layout.
   - Rutas `GET/PUT /api/settings` restringidas a administradores.

4. **Experiencia pública**
   - `HomeView.vue` muestra destacados y grid responsive con `size` (`large | medium | small`).
   - `PostDetailView.vue` combina contenido, video/imagen y métricas.
   - `router/index.ts` protege rutas internas mediante guardas que validan token.

## Diagramas de secuencia (texto)
1. **Creación de publicación**
   - Admin → Frontend: datos + archivo.
   - Frontend → Backend `/api/posts` (JWT).
   - Backend → Mongo `posts.insertOne`.
   - Backend → Frontend: respuesta 201 + payload.
   - Frontend → Store: mutación y notificación QNotify.

2. **Actualización de métricas**
   - Visitante abre post → Frontend llama `/api/posts/:id/view`.
   - Backend incrementa contador y emite evento `post:viewed` mediante Socket.IO.
   - Otros clientes suscritos reciben evento y actualizan UI en tiempo real.

## Seguridad
- JWT almacenado en `localStorage` y enviado vía encabezado `Authorization`.
- Middleware `passport.authenticate('jwt', { session: false })` en rutas protegidas.
- Sanitización básica de inputs (trim de título, validación de tamaño de archivo).
- CORS abierto en desarrollo; se recomienda restringir dominios en producción (`cors()` configurable).

## Estrategia de datos
- Colección `users` con índice único en `email`.
- Colección `posts` guarda metadatos y ruta física del archivo (no se usa GridFS).
- Colección `settings` mantiene un documento único (se puede forzar con `findOneAndUpdate` upsert).
- Semillas (`backend/seed.js`) crean usuario demo y publicaciones de ejemplo.

## Despliegue y operación
- Script `run-iae-blog.bat` construye imágenes y levanta `docker-compose.yml`.
- Volúmenes Docker: `mongo_data` (persistencia de BD) y `uploads_data` (archivos).
- Endpoints de monitoreo: `/api/ping` y `/api/health` para readiness.
- Se recomienda pipeline CI que ejecute `npm test` en backend y `quasar test` (cuando exista) antes de crear imágenes.

## Riesgos y mitigaciones
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Corrupción de volumen Mongo al cambiar de versión | Alto | Fijar versión 4.4 o planificar migración y respaldo (`mongodump`). |
| Subidas de archivos muy grandes | Medio | Validar tamaño en frontend y backend, usar CDN si escala. |
| Tokens robados mediante XSS | Alto | Sanitizar contenido, usar `Content-Security-Policy`, almacenar JWT en `HttpOnly` cookie si se endurece seguridad. |
| Caída de servicio | Medio | Configurar `restart: unless-stopped` (ya presente) y monitoreo externo. |

## Roadmap futuro
- Internacionalización (es/en).
- Roles adicionales (editor, revisor).
- Comentarios por publicación.
- Integración con analítica avanzada (Matomo/GA).
