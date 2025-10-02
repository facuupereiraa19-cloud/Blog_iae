# 05 · Diagramas

## Diagrama de casos de uso (alto nivel)
```mermaid
%% Diagrama de casos de uso principal
usecaseDiagram
  actor Administrador
  actor Visitante

  Administrador --> (Autenticar)
  Administrador --> (Gestionar publicaciones)
  Administrador --> (Configurar apariencia)
  Administrador --> (Monitorear métricas)

  Visitante --> (Consultar contenido)
  Visitante --> (Registrar vista)
  Visitante --> (Dar like)

  (Gestionar publicaciones) ..> (Autenticar) : «include»
  (Configurar apariencia) ..> (Autenticar) : «include»
```

## Diagrama de clases (modelo de dominio simplificado)
```mermaid
classDiagram
  class User {
    ObjectId _id
    String email
    String passwordHash
    String role
    Date createdAt
    Date updatedAt
  }

  class Post {
    ObjectId _id
    String title
    String content
    String image
    String video
    String filePath
    Number views
    Number likes
    String size
    Date createdAt
    Date updatedAt
  }

  class Settings {
    ObjectId _id
    Number featuredLayout
    Colors colors
    Date createdAt
    Date updatedAt
  }

  class Colors {
    String primary
    String secondary
    String accent
    String positive
    String negative
    String info
    String warning
  }

  User "1" -- "*" Post : crea
  Post "*" --> "1" User : pertenece
  Settings "1" --> Colors : posee
```

## Arquitectura lógica (vista de componentes)
```mermaid
flowchart LR
  subgraph Frontend [SPA Quasar]
    UI[HomeView.vue]
    Dash[DashboardView.vue]
    Store[Pinia Stores]
  end

  subgraph Backend [API Express]
    Auth[/auth.js/]
    Posts[/posts.js/]
    SettingsAPI[/settings.js/]
    Socket[Socket.IO]
  end

  subgraph DB [MongoDB]
    Users[(users)]
    PostsCol[(posts)]
    SettingsCol[(settings)]
  end

  UI -- REST --> Posts
  Dash -- REST --> Auth
  Dash -- REST --> Posts
  Dash -- REST --> SettingsAPI
  Store <-- WebSocket --> Socket
  Auth -- ODM --> Users
  Posts -- ODM --> PostsCol
  SettingsAPI -- ODM --> SettingsCol
```

> Los diagramas usan sintaxis Mermaid para permitir su exportación a SVG desde herramientas compatibles (e.g. GitHub, Live Editor).
