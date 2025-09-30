# 07 · Cronograma y planificación

> Plan de trabajo estimado para 6 semanas (Sprint de 1 semana).

| Semana | Objetivos clave | Entregables |
|--------|-----------------|-------------|
| 1 | Levantamiento detallado, definir backlog, configurar repositorio y CI básico | Documentos RF/RNF, tablero Kanban, pipeline lint/test inicial |
| 2 | Implementar autenticación (login/registro) y base de datos | Endpoints `/api/auth/*`, modelo `User`, pruebas Supertest, pantalla de login |
| 3 | CRUD de publicaciones y subida de archivos | Rutas `/api/posts`, `DashboardView` (crear/editar), manejo de uploads y validaciones |
| 4 | Home público, métricas (views/likes), Socket.IO | `HomeView`, `PostDetailView`, eventos en tiempo real, pruebas manuales |
| 5 | Configuración visual, ajustes responsive, hardening seguridad | `SettingsStore`, `PUT /api/settings`, políticas CORS, manejo de errores UI |
| 6 | Documentación final, pruebas integrales, despliegue Docker y defensa | Manuales, guía de pruebas, `docker compose` listo, slides de defensa |

## Hitos y check-points
- **H1 (fin semana 2):** MVP backend autenticación funcionando con pruebas automáticas verdes.
- **H2 (fin semana 4):** Flujo completo de publicaciones (crear → ver → like) operativo.
- **H3 (fin semana 6):** Demo final ejecutándose en entorno dockerizado y documentación entregada.

## Roles y responsabilidades
- **Coordinador/a:** Seguimiento de cronograma, reuniones con stakeholders.
- **Frontend:** Desarrollo de vistas Quasar, UX y pruebas manuales.
- **Backend:** API Express, seguridad, integración con Mongo.
- **Base de datos:** Modelado, migraciones, monitoreo de volúmenes.
- **QA/DevOps:** Automatización de pruebas, pipelines, despliegue Docker.

## Gestión de riesgos en el tiempo
- Revisión semanal del backlog con priorización MoSCoW.
- Buffer de 2 días en semana 6 para contingencias técnicas o re-trabajo.
- Uso de issues etiquetados para bloqueadores críticos.
