# 03 · Levantamiento y análisis de requerimientos

## Metodología
- **Entrevistas semiestructuradas** con el área de comunicación del IAE (2 sesiones de 45 min).
- **Cuestionarios online** a 30 estudiantes para validar expectativas de consumo.
- **Revisión de proceso actual** (documentos impresos, redes sociales) para identificar puntos de fricción.
- **Análisis del repositorio `iae-blog-main`** para mapear funcionalidades actuales y vacíos.

## Resumen de hallazgos
- El personal necesita publicar desde PC o laptop sin depender de un diseñador.
- Los usuarios externos consumen principalmente desde móviles (68%).
- Se requiere controlar qué publicaciones aparecen como "destacadas" en portada.
- Los assets multimedia provienen de cámaras y celulares, con tamaños hasta 80 MB.

## Requerimientos funcionales (RF)
| ID | Descripción | Prioridad | Fuente |
|----|-------------|-----------|--------|
| RF01 | Registrar y autenticar administradores mediante correo y contraseña | Alta | Comunicación IAE |
| RF02 | Consultar publicaciones públicas con filtros por fecha y popularidad | Alta | Estudiantes |
| RF03 | Crear, editar y eliminar publicaciones con texto y archivo multimedia | Alta | Comunicación IAE |
| RF04 | Destacar publicaciones en portada con layouts configurables | Media | Dirección IAE |
| RF05 | Incrementar y mostrar métricas de vistas/likes en tiempo real | Media | Dirección IAE |
| RF06 | Configurar la paleta de colores institucional desde el dashboard | Baja | Comunicación IAE |
| RF07 | Exponer endpoints de salud y ping para monitoreo | Baja | Equipo técnico |

## Requerimientos no funcionales (RNF)
| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF01 | Rendimiento | El home debe cargar en < 3 s con conexión 4G promedio (medido con Lighthouse >= 80/100). |
| RNF02 | Seguridad | Contraseñas con hash `bcrypt` y tokens JWT expiran en ≤ 1 h. |
| RNF03 | Disponibilidad | La aplicación debe ejecutarse 24/7 en infraestructura Docker con auto-restart. |
| RNF04 | Escalabilidad | El backend debe permitir agregar réplicas detrás de un balanceador usando sesiones sin estado. |
| RNF05 | Mantenibilidad | El código seguirá estándares ESLint/Prettier y pruebas automáticas para rutas críticas. |
| RNF06 | Portabilidad | El despliegue debe funcionar en Windows y Linux con `docker compose up`. |
| RNF07 | Observabilidad | Endpoint `/api/health` debe incluir estado de BD y versión. |

## Reglas de negocio
- Solo usuarios con rol `admin` pueden crear o eliminar publicaciones.
- Las publicaciones marcadas como destacadas aparecen en la sección "Destacados" según `featuredLayout`.
- Una misma pieza multimedia se asocia a una publicación; modificaciones reemplazan el archivo anterior.
- El sistema evita registros duplicados de correo electrónico (modelo `User`).

## Priorización y alcance de iteración 1
- Implementar RF01–RF05 y RNF01–RNF06 en el MVP.
- RF06–RF07 y RNF07 pueden incorporarse en iteraciones posteriores si el cronograma lo permite.

## Dependencias técnicas
- Servicios Docker (`mongo`, `backend`, `frontend`) definidos en `docker-compose.yml`.
- Variables de entorno (`JWT_SECRET`, `DB_URL`) administradas en archivos `.env`.
- Seed inicial (`backend/seed.js`) para generar un usuario administrador y publicaciones de ejemplo.
