# 01 · Propuesta inicial

## Nombre del proyecto
**IAE Blog** – Plataforma de comunicación institucional para el Instituto de alta especializacion.

##Equipo

Facundo Pereira – Coordinación Técnica y Desarrollo Backend
Participó activamente en la programación del backend y colaboró en la coordinación general del proyecto.

Martín Araujo – Desarrollo Frontend
Encargado del desarrollo del frontend y la implementación de funcionalidades de la interfaz.

Marcelo Fernández – Documentación y UX / Escritura de Contenidos
Responsable de la documentación del proyecto, revisión de procesos y diseño de la experiencia de usuario.

Aseguramiento de Calidad y Base de Datos – Facundo Pereira y Martín Araujo
Control de la calidad del software, pruebas y mantenimiento de la base de datos del proyecto.

## Visión
Crear una experiencia digital centralizada donde el IAE publique noticias, agenda cultural y material audiovisual en tiempo real, con control editorial y analítica básica de engagement.

## Objetivos SMART
1. Publicar el MVP con autenticación y gestión de publicaciones en 6 semanas.
2. Permitir que al menos 3 usuarios administradores gestionen contenido sin soporte técnico adicional.
3. Aumentar en 40% la visibilidad de eventos frente al canal tradicional (hojas impresas) durante el primer mes de uso.
4. Garantizar un tiempo de carga menor a 3 segundos en conexiones 4G para la página principal.

## Alcance del MVP
- Autenticación de administradores (registro, login, JWT, recuperación manual).
- Panel para crear, editar, eliminar y destacar publicaciones con imagen o video.
- Portal público con listado, filtros por popularidad/fecha y vistas detalladas.
- Configuración visual básica (colores, layout de destacados) aplicada desde el panel.
- API REST y canal WebSocket para notificaciones en tiempo real de nuevos likes/vistas.
- Despliegue en contenedores Docker (frontend, backend, base de datos).

## Supuestos clave
- El IAE cuenta con hosting para ejecutar Docker (servidor on-premise o nube). 
- Los contenidos audiovisuales no exceden 100 MB por archivo.
- El equipo de comunicación asume la curaduría y calidad de los textos.
- No se requiere multidioma en la primera versión.

## Entregables planeados
1. Documentación de ingeniería de software (requerimientos, casos de uso, cronograma).
2. SPA con Quasar (Vue 3) consumiendo API Express.
3. Servicio Node.js con autenticación Passport.js + JWT conectado a MongoDB.
4. Suite de pruebas (API con Supertest + pruebas manuales guiadas en frontend).
5. Paquete Docker Compose listo para despliegue.
6. Manuales de instalación y usuario final.
7. Presentación ejecutiva para defensa oral.

## Criterios de éxito
- Los usuarios administradores pueden autenticar, crear y publicar contenidos multimedia sin errores críticos.
- El portal público refleja inmediatamente las publicaciones y permite interacción (likes, vistas) estable.
- El backend expone endpoints protegidos y pasa las pruebas automatizadas existentes (`backend/tests/api.test.js`).
- El despliegue dockerizado arranca con un solo comando (`run-iae-blog.bat` / `docker compose up`).
