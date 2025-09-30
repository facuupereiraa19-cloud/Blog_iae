# 08 · Pruebas, resultados y documentación

## Estrategia de pruebas
1. **Pruebas unitarias/integración backend (automatizadas)**
   - Framework: Mocha + Supertest (`backend/tests/api.test.js`).
   - Cobertura: autenticación demo, CRUD de posts, endpoints de likes/vistas y health check.
2. **Pruebas funcionales frontend (manuales guiadas)**
   - Checklists por vista (`LoginView`, `DashboardView`, `HomeView`, `PostDetailView`).
   - Validación responsive en anchos 375px, 768px y 1280px.
3. **Pruebas de despliegue**
   - Arranque completo mediante `docker compose up --build`.
   - Verificación de logs (`docker logs iae_backend`, `iae_mongo`, `iae_frontend`).
4. **Pruebas de seguridad básica**
   - Confirmar que rutas protegidas retornan 401 sin token.
   - Validar expiración del JWT (1 hora) y manejo de token inválido.
5. **Pruebas de rendimiento ligero**
   - Lighthouse en Home (objetivo >80 performance, >90 accessibility).
   - Smoke test de carga usando `autocannon` (opcional) para `/api/posts`.

## Evidencia actual
- `npm test` en `backend` ejecuta `backend/tests/api.test.js` y cubre flujo principal.
- Logs de error controlan fallas de conexión a Mongo; se documenta en README.
- Los componentes Quasar incluyen validaciones de formulario (`required`, `max-file-size`).

## Resultados esperados del MVP
| Tipo de prueba | Resultado esperado |
|----------------|--------------------|
| `POST /api/auth/login` con credenciales válidas | Respuesta 200 + token JWT |
| `POST /api/auth/register` con email duplicado | Respuesta 409 + mensaje contextual |
| `POST /api/posts` sin JWT | Respuesta 401 |
| `POST /api/posts/:id/view` | Respuesta 200 + incremento de vistas |
| `HomeView` mobile | Layout responsivo sin desbordes |
| `DashboardView` subir archivo >10 MB | Mensaje de error preventivo |
| Docker compose | Tres contenedores `running` (frontend/backend/mongo) |

## Registro de incidentes conocidos
- **INC-001:** Volumen Mongo creado con versión superior a 4.4 impide levantar contenedor (ver logs `UnsupportedFormat`). Solución: reinstanciar volumen o migrar versión.
- **INC-002:** JWT almacenado en `localStorage`; se recomienda evaluar `HttpOnly` cookie para producción.

## Documentación complementaria
- Scripts de seed (`backend/seed.js`).
- Archivo `.env.demo` para ejecutar backend en modo demo sin persistencia.
- Manuales de instalación y usuario (ver documentos 09 y 10).

## Próximos pasos en QA
- Integrar pruebas end-to-end (Cypress/Playwright) centradas en flujo publicar→ver.
- Automatizar análisis estático (ESLint, TypeScript) dentro del pipeline.
- Configurar métricas de cobertura (Istanbul/nyc) y umbrales mínimos (80%).
