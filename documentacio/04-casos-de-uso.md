# 04 · Casos de uso

## Casos de uso de alto nivel
| ID | Nombre | Actor principal | Descripción breve |
|----|--------|-----------------|-------------------|
| CUH1 | Autenticar administrador | Administrador | Iniciar sesión para acceder al dashboard de gestión. |
| CUH2 | Gestionar publicaciones | Administrador | Crear, editar, eliminar y destacar publicaciones con multimedia. |
| CUH3 | Configurar apariencia del portal | Administrador | Ajustar layout de destacados y colores de la marca. |
| CUH4 | Consultar contenido público | Visitante | Navegar el home, filtrar publicaciones y ver detalles. |
| CUH5 | Interactuar con contenido | Visitante | Registrar vistas y likes sobre una publicación. |

## Casos de uso detallados

### CU1 · Autenticar administrador
- **Actor principal:** Administrador
- **Precondiciones:** El usuario está registrado con correo válido y contraseña hash almacenada.
- **Flujo principal:**
  1. El administrador accede a `/login` en el frontend.
  2. Ingresa correo y contraseña y hace clic en "Iniciar sesión".
  3. El frontend envía `POST /api/auth/login` con las credenciales.
  4. El backend valida credenciales (modelo `User`, hash con `bcrypt`).
  5. Si es válido, responde con token JWT (expira en 1 hora).
  6. El frontend guarda el token en almacenamiento seguro y redirige al dashboard.
- **Postcondición:** El usuario queda autenticado y puede consumir endpoints protegidos.
- **Flujos alternos:**
  - 3A. Credenciales inválidas → backend devuelve 401 y mensaje de error.
  - 3B. Falla de red/BBD → se muestra mensaje genérico "No se pudo iniciar sesión".

### CU2 · Registrar nuevo administrador
- **Actor principal:** Administrador responsable de alta.
- **Precondiciones:** Existe al menos un admin activo.
- **Flujo principal:**
  1. Desde `/login`, un admin actual comparte el formulario de registro (módulo `auth.js`).
  2. El usuario completa correo y contraseña.
  3. Request `POST /api/auth/register` crea el documento `User` con rol `admin`.
  4. El backend devuelve token JWT y datos básicos del nuevo usuario.
- **Postcondición:** Nuevo administrador puede autenticarse de inmediato.
- **Reglas:** Correos duplicados retornan 409.

### CU3 · Gestionar publicación
- **Actor principal:** Administrador
- **Precondiciones:** Usuario autenticado (JWT válido).
- **Flujo principal:**
  1. En el dashboard (`DashboardView.vue`), el admin llena formulario con título, contenido, tamaño y archivo.
  2. El frontend llama `POST /api/posts` con datos y multipart file.
  3. El backend almacena metadata en `Post` y el archivo en `/uploads`.
  4. El dashboard recarga listado y muestra la nueva tarjeta.
  5. Admin puede seleccionar "Editar" → `PUT /api/posts/:id` o "Eliminar" → `DELETE /api/posts/:id`.
- **Postcondición:** La publicación aparece en home según layout seleccionado.
- **Flujos alternos:**
  - 2A. Archivo supera 10 MB → respuesta 400.
  - 3A. Error de almacenamiento → mensaje y log en servidor.

### CU4 · Configurar apariencia
- **Actor principal:** Administrador
- **Precondiciones:** Usuario autenticado.
- **Flujo principal:**
  1. En el dashboard, el admin modifica `featuredLayout` (1, 2 o 4) y colores.
  2. Hace clic en "Guardar configuración".
  3. El frontend invoca `PUT /api/settings` con el DTO `Settings`.
  4. El backend persiste en `Settings` y responde con datos actualizados.
  5. El frontend aplica colores globales y re-renderiza home con layout nuevo.
- **Postcondición:** Configuración persistida y aplicada a visitantes.

### CU5 · Consultar contenido
- **Actor principal:** Visitante (no autenticado)
- **Precondiciones:** Existe al menos una publicación aprobada.
- **Flujo principal:**
  1. Usuario ingresa a `/` (Home).
  2. El frontend llama `GET /api/posts` y obtiene arreglo de publicaciones.
  3. El visitante ordena por fecha o popularidad usando `HomeView`.
  4. Selecciona una tarjeta → navega a `/post/:id` y ve detalles (`PostDetailView`).
- **Postcondición:** Publicación marcada como vista (ver CU6).

### CU6 · Registrar vista/like
- **Actor principal:** Visitante
- **Flujo principal:**
  1. Al abrir un post, el frontend invoca `POST /api/posts/:id/view`.
  2. Si el usuario hace click en "Like", envía `POST /api/posts/:id/like`.
  3. El backend incrementa contadores en MongoDB y devuelve totales.
  4. El frontend actualiza cifras en tiempo real; Socket.IO puede avisar a otros clientes.

## Supuestos de diagramación
- Roles: `Administrador` y `Visitante`.
- Todos los casos de uso autenticados comparten middleware Passport (`passportConfig.js`).
