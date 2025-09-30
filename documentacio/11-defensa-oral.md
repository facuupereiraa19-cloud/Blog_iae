# 11 · Guion para defensa oral

## Objetivo de la presentación
Demostrar el valor del proyecto IAE Blog, la solidez técnica de la solución y el cumplimiento de los entregables académicos en un pitch de 12–15 minutos frente al tribunal.

## Estructura sugerida de la exposición
1. **Introducción (1 min)**
   - Presentar al equipo y roles.
   - Contextualizar el problema de comunicación del IAE.
2. **Problema y oportunidad (2 min)**
   - Datos clave de entrevistas y encuestas.
   - Impacto actual de la falta de plataforma centralizada.
3. **Solución propuesta (3 min)**
   - Demo rápida de la SPA (Home + Dashboard).
   - Principales beneficios para cada actor.
4. **Arquitectura y decisiones técnicas (3 min)**
   - Explicar diagrama de componentes (frontend, backend, Mongo, Docker).
   - Seguridad (Passport + JWT) y manejo de multimedia.
5. **Proceso de ingeniería (2 min)**
   - Requerimientos, casos de uso, cronograma y gestión de riesgos.
   - Estrategia de pruebas y cobertura.
6. **Resultados y métricas (2 min)**
   - Mostrar logs/pruebas exitosas (`npm test`).
   - Potenciales mejoras y roadmap.
7. **Cierre y preguntas (2 min)**
   - Resumen de logros.
   - Invitación a preguntas / feedback.

## Materiales de apoyo
- Presentación (10–12 diapositivas) basada en los documentos 01–10.
- Video corto o demo en vivo desde entorno Docker.
- Capturas de Lighthouse y resultados de pruebas.

## Distribución de participación
- **Coordinador/a:** Introducción, cronograma, riesgos.
- **Frontend:** Demo del portal y UX.
- **Backend:** Arquitectura, seguridad, API.
- **Base de datos / QA:** Modelo de datos, pruebas, métricas.
- **Todos:** sesión de preguntas.

## Preguntas frecuentes del tribunal y respuestas guía
| Pregunta | Respuesta sugerida |
|----------|-------------------|
| ¿Cómo garantizan la integridad de los datos multimedia? | Volúmenes Docker dedicados + política de backups `mongodump` y almacenamiento externo en roadmap. |
| ¿Por qué MongoDB y no SQL? | Flexibilidad para contenido variado, velocidad de iteración; se documenta estrategia para aplicar índices según popularidad. |
| ¿Cómo escalaría la solución? | Backend sin estado escalable horizontalmente, CDN para assets, instancias replicadas de Mongo (Replica Set). |
| ¿Qué riesgos detectaron y cómo los mitigaron? | Detallar tabla de documento 06 (volúmenes Mongo, XSS, límites de archivo). |

## Checklist previo a la defensa
- Ejecutar `docker compose up` para la demo y verificar que Mongo arranque sin errores.
- Confirmar datos de usuario demo (`admin@iae.com / admin123`).
- Preparar backup de la presentación en USB y nube.
- Ensayar con temporizador para ajustar duración.
- Designar a una persona como responsable del control del tiempo.

## Seguimiento post-defensa
- Recoger feedback del tribunal.
- Registrar acciones de mejora en backlog.
- Preparar versión final del repositorio con etiquetas (tag `v1.0-demo`).
