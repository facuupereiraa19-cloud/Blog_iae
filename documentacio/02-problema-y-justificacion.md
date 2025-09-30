# 02 · Presentación del problema y justificación técnica

## Contexto
El Instituto de alta especializacion  (IAE) mantiene múltiples actividades culturales y académicas, pero la difusión depende de boletines impresos y publicaciones dispersas en redes sociales manejadas por voluntarios. Los alumnos y público externo reportan dificultades para mantenerse informados y consumir contenidos posteriores a los eventos.

## Problema / Necesidad
- No existe un repositorio oficial y actualizado de noticias, funciones y material multimedia del IAE.
- Los administradores carecen de una herramienta sencilla para publicar y destacar contenidos desde cualquier dispositivo.
- La dirección necesita métricas de alcance (vistas, likes) para sustentar nuevas actividades.

## Público objetivo
- **Administradores internos**: personal de comunicación y docentes responsables de publicaciones.
- **Visitantes externos**: estudiantes, familias y público en general que consultan el portal.

## Oportunidad
Centralizar la comunicación en una SPA moderna permitirá reducir costos de impresión, mejorar la consistencia del branding y habilitar analítica básica en tiempo real sin depender de redes sociales externas.

## Justificación técnica
1. **SPA con Quasar (Vue 3)** por su ecosistema de componentes responsive y soporte SSR opcional.
2. **Backend Express + Passport.js** por la facilidad para implementar JWT, middlewares flexibles y ecosistema maduro.
3. **MongoDB** se alinea con la naturaleza semiestructurada de las publicaciones (texto, media, metadatos, configuraciones dinámicas).
4. **Docker Compose** facilita el despliegue replicable en entornos de laboratorio o nube.
5. **Socket.IO** habilita notificaciones en tiempo real para métricas sin complejidad adicional.
6. **Stack full JS/TS** simplifica la curva de aprendizaje del equipo y reduce costos de integración.

## Criterios de selección tecnológica
- Licencias libres/compatibles con proyectos académicos.
- Comunidad activa y abundante documentación.
- Compatibilidad con despliegue en servidores Windows/Linux.
- Integración sencilla con pipelines de CI/CD futuros.

## Impacto esperado
- Disminución de 70% en tiempo de publicación frente al flujo actual (documento + diseño + impresión).
- Mayor cohesión de la imagen institucional al centralizar colores y destacados.
- Recopilación de métricas básicas para informes mensuales sin depender de herramientas pagadas.
