# 05 · Diagramas

## Diagrama de casos de uso (alto nivel)
```mermaid
flowchart TD
  Admin([Administrador])
  Visit([Visitante])

  Admin --> A[Autenticar]
  Admin --> B[Gestionar publicaciones]
  Admin --> C[Configurar apariencia]
  Admin --> D[Monitorear métricas]

  Visit --> E[Consultar contenido]
  Visit --> F[Registrar vista]
  Visit --> G[Dar like]

  B -.-> A
  C -.-> A


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
