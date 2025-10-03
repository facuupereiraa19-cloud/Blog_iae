# 10 · Manual de usuario

## Perfiles contemplados
- **Administrador**: gestiona publicaciones y configuración.
- **Visitante**: consume contenido público e interactúa con likes.

## Acceso de administradores
1. Entrar a http://localhost:9000/#/login.
2. Introducir correo y contraseña.
3. Presionar "Iniciar sesión". Si las credenciales son correctas, se redirige al Dashboard.
4. Recuperación de acceso: coordinar con otro admin para crear un nuevo usuario (no hay recuperación por correo en MVP).

## Panel de control (Dashboard)
### Crear publicación
1. Hacer clic en "Crear publicación".
2. Completar campos:
   - **Título**: obligatorio, máximo recomendado 80 caracteres.
   - **Contenido**: resumen o cuerpo principal.
   - **Tamaño**: define ancho de tarjeta en home (grande, mediana, pequeña).
   - **Archivo**: imagen o video (opcional, <=10 MB en UI; backend soporta hasta 100 MB).
3. Presionar "CREAR". Si es exitoso, la publicación aparece en la lista inferior.

### Editar publicación existente
1. Ubicar la publicación y presionar "Editar".
2. Ajustar campos necesarios.
3. Pulsar "Guardar". Para cancelar, usar el botón "Cancelar".

### Eliminar publicación
1. Presionar "Eliminar".
2. Confirmar la acción. El registro desaparece de la lista y del portal público.

### Destacar publicaciones
- Cada publicación tiene atributo `size`. Para controlar cuántas se muestran en la franja de destacados, ir a la tarjeta "Configuración del sitio".
- Seleccionar 1, 2 o 4 destacados y guardar.

### Ajustar colores institucionales
1. Expandir la sección "Colores de marca".
2. Seleccionar los tonos para `primary`, `secondary`, etc.
3. Guardar la configuración para persistirla.

## Portal público (Home)
- **Ordenar publicaciones**: usar combo "Ordenar por" (fecha o popularidad).
- **Recargar**: botón que vuelve a consultar la API.
- **Ver detalle**: clicar cualquier tarjeta abre la vista detallada con descripción extendida y multimedia.
- **Dar like**: botón con ícono de pulgar; el contador aumenta al instante.
- **Vistas**: se incrementan automáticamente al abrir una publicación.

## Buenas prácticas para contenido
- Usar títulos descriptivos y concisos.
- Incluir imágenes en formato JPG/PNG optimizadas (<1 MB) cuando sea posible.
- Para videos pesados, considerar subir a un servicio externo y embeber mediante URL (feature planificada).
- Mantener consistencia de estilo con plantilla editorial.

## Mensajes de error frecuentes
| Mensaje | Significado | Acción recomendada |
|---------|-------------|--------------------|
| "Email y password son requeridos" | Faltan datos en login/registro | Completar ambos campos. |
| "El email ya está registrado" | Registro duplicado | Usar opción de login o pedir al admin existente compartir acceso. |
| "No se pudo guardar la configuración" | Error al persistir settings | Revisar conexión backend/Mongo; reintentar. |
| "No se pudo registrar" (banner rojo) | Falla en backend o BD | Revisar logs, asegurar que `mongo` esté en ejecución. |

## Soporte y contacto
- Registrar incidencias en el tablero del equipo (GitHub Issues / Trello).
- Adjuntar capturas de pantalla y hora exacta del problema.
