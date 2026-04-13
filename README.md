# Angular Posts App

SPA para gestión de posts y comentarios construida con **Angular 21**, **Nx monorepo**, **TailwindCSS 4** y **json-server** como backend mock.

## Requisitos previos

| Herramienta | Versión         |
|-------------|-----------------|
| **Node.js** | `>= 24.14.1`   |
| **pnpm**    | `>= 10.0.0`    |

## Instalación

```bash
pnpm install
```

## Scripts operativos

### Desarrollo

```bash
# App + API simultáneamente (recomendado)
pnpm dev

# Solo la app Angular (puerto 4200)
pnpm start

# Solo la API json-server (puerto 3000)
pnpm start:api

# SSR: compilar producción + servir con Express
pnpm start:ssr
```

### Lint & Formato

```bash
# ESLint en todas las libs y apps
pnpm lint

# Prettier — verificar formato
pnpm format:check

# Prettier — corregir formato
pnpm format
```

### Testing

```bash
# Ejecutar todos los tests unitarios (Vitest)
pnpm test

# Tests en modo watch
pnpm test:watch

# Tests con cobertura (libs)
pnpm test:libs:coverage

# Cobertura completa (app + libs)
pnpm test:coverage
```

### E2E

```bash
# Instalar browsers de Playwright (solo la primera vez)
npx playwright install chromium

# Playwright (levanta app + api automáticamente)
pnpm e2e
```

### Build

```bash
# Build de desarrollo
pnpm build

# Build de producción
pnpm build:prod
```

### Utilidades

```bash
# Resetear db.json a su estado inicial
pnpm nx reset api
```

## Credenciales mock

| Usuario | Contraseña |
|---------|------------|
| alice   | alice123   |
| bruno   | bruno123   |
| carla   | carla123   |
| diego   | diego123   |

## Rutas de la app

| Ruta              | Acceso                    | Descripción            |
|-------------------|---------------------------|------------------------|
| `/login`          | Público                   | Pantalla de login      |
| `/posts`          | Protegida (`authGuard`)   | Listado de posts       |
| `/posts/new`      | Protegida                 | Crear nuevo post       |
| `/posts/:id`      | Protegida                 | Detalle + comentarios  |
| `/posts/:id/edit` | Protegida + `postOwnerGuard` | Editar post propio  |

> 📐 Para el detalle completo de la arquitectura, estructura de libs, grafo de dependencias y reglas de boundaries, consulta [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Decisiones técnicas y tradeoffs

### Arquitectura

- **Nx monorepo integrado** con 7 libs organizadas por dominio y tipo (Screaming Architecture). Las module boundaries se aplican con `@nx/enforce-module-boundaries` en ESLint: un feature nunca importa otro feature.
- **Container vs Presentacional**: los componentes page (container) inyectan facades y gestionan estado UI local con signals; los presentacionales solo reciben `input()` y emiten `output()`.
- **Facade layer**: capa intermedia entre componentes y servicios de datos (`AuthFacade`, `PostsFacade`, `CommentsFacade`). Centraliza la orquestación de dominio (mutación → invalidación de cache → notificación toast) y expone señales readonly. Los componentes nunca inyectan servicios de datos directamente.

### Angular 21 moderno

- **Zoneless** (`provideZonelessChangeDetection`): sin `zone.js`, change detection basado 100% en signals.
- **Signals everywhere**: `signal()`, `computed()`, `effect()`, `linkedSignal()` para todo el estado reactivo. RxJS minimizado solo a `firstValueFrom()` para mutaciones HTTP.
- **`httpResource`** para todas las peticiones GET declarativas. `HttpClient` clásico solo para POST/PUT/DELETE.
- **Signal Forms** en todos los formularios (login, crear/editar post, comentarios).
- **`@defer`** para carga lazy de comentarios en el detalle de un post (trigger `on viewport`).
- **Template syntax moderno**: `@if`, `@for`, `@switch` — sin directivas legacy (`*ngIf`, `*ngFor`).

### State management

- **`linkedSignal()`** en `PostsFacade` para sincronizar query params de la URL con los filtros del listado, manteniendo URLs compartibles y navegación back/forward consistente.
- **Optimistic updates** en comentarios: la UI refleja el cambio antes de la confirmación del servidor, con rollback automático si falla.
- **Scoped providers**: `CommentsService` y `CommentsFacade` están escopados a la ruta de detalle (`/posts/:id`) en vez de ser singletons root. Se destruyen al salir de la ruta, evitando estado stale en memoria.

### UX

- **Mobile first** con TailwindCSS 4: 1 columna (mobile) → 2 columnas (tablet) → 3 columnas (desktop).
- **i18n runtime** con Transloco (español/inglés), cambio en caliente sin recargar.
- **4 estados de vista** gestionados explícitamente en cada página: loading (skeletons), empty, error (con retry), forbidden.
- **Prefetch al hover** en tarjetas de post: se precarga el detalle para reducir latencia al navegar.
- **View transitions** habilitadas para transiciones de ruta animadas.

### Testing

- **Vitest + Testing Library** para unit e integration tests en todas las libs.
- **Playwright** para E2E del flujo crítico (login → navegación → CRUD).
- Cada lib tiene su propio `vite.config.mts` y `tsconfig.spec.json` para ejecución aislada (`nx test <lib>`).

### Tradeoffs asumidos

| Decisión | Tradeoff |
|----------|----------|
| `httpResource` (experimental) | API puede cambiar en futuras versiones de Angular, pero es la dirección oficial y se integra nativamente con signals |
| Signal Forms (experimental) | Misma situación que `httpResource`; se priorizó alineamiento con el futuro del framework |
| `json-server` como backend | Limitaciones en filtros complejos (tags) requirieron filtrado client-side para búsqueda por texto y tags |
| Login mock con `GET /users?name&password` | Inseguro en producción, pero adecuado para el scope mock del ejercicio |
| Singletons root para `PostsFacade`/`PostsService` | El listado de posts comparte estado entre 3 features; escoparlo rompería la navegación back/forward. `CommentsService` sí se escopó a la ruta porque solo lo usa `feature-detail` |

---

## Uso de IA

Se utilizó **GitHub Copilot** (chat + agent mode) como herramienta de asistencia durante el desarrollo:

- **Generación mecánica**: scaffolding de tests unitarios, specs repetitivos, boilerplate de componentes presentacionales.
- **Revisión de testing**: generación de mocks y validación de que los providers estuvieran correctamente configurados en `TestBed` tras los cambios de scoping.
- **Documentación**: generación de este README a partir del contexto del proyecto (`ARCHITECTURE.md`, `AGENTS.md`, `package.json`, rutas, configuración).

Todas las decisiones arquitectónicas fueron revisadas y validadas manualmente antes de aplicarse.

