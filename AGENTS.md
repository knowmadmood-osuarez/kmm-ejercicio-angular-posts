# Agent Guidelines — Angular Posts App

## Contexto del proyecto

SPA de gestión de **posts** y **comments** con Angular 21 sobre un backend mock (`json-server`).  
Repositorio: `git@github.com:knowmadmood-osuarez/kmm-ejercicio-angular-posts.git` (rama `main`).  
Diseño de referencia (Figma): https://www.figma.com/design/7en10Y86YbN3QYZMmBy0AQ

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | **Node.js 24.14.1** (LTS) |
| Package manager | **pnpm 10** |
| Framework | **Angular 21** (última estable) |
| Monorepo | **Nx** (integrated) |
| UI / CSS | **TailwindCSS 4** · mobile first |
| State | **Angular Signals** · `signal()`, `computed()`, `effect()`, `linkedSignal()` |
| Forms | **Signal Forms** (`@angular/forms` signal-based) |
| HTTP | **`httpResource`** (experimental, obligatorio) |
| Routing | Lazy loading con `loadComponent` / `loadChildren` |
| i18n | **Transloco** (runtime, `es` + `en`) |
| Testing unitario | **Vitest** + **Testing Library** (`@testing-library/angular`) |
| Testing e2e | **Playwright** |
| Linting | **ESLint** (flat config con `@angular-eslint`) |
| Formato | **Prettier** |
| Git hooks | **Husky** + **lint-staged** |
| Commits | **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `style:`, `ci:`) |
| Backend mock | **json-server** con `db.json` |
| Change detection | **Zoneless** (`provideZonelessChangeDetection()`) |

---

## Modelo de datos (db.json)

### User
```ts
interface User {
  id: number;
  name: string;       // también es el username para login
  password: string;   // plaintext mock
  email: string;
  avatar: string;     // URL dicebear
}
```

### Post
```ts
interface Post {
  id: number;
  userId: number;     // FK → User
  title: string;
  body: string;
  tags: string[];
  createdAt: string;  // ISO 8601
}
```

### Comment
```ts
interface Comment {
  id: number;
  postId: number;     // FK → Post
  userId: number;     // FK → User
  body: string;
  createdAt: string;  // ISO 8601
}
```

### Credenciales mock
| usuario | contraseña |
|---------|-----------|
| alice   | alice123  |
| bruno   | bruno123  |
| carla   | carla123  |
| diego   | diego123  |

---

## Reglas de desarrollo

### General
- **Standalone components** siempre — no usar `NgModule`.
- **Zoneless** — usar `provideZonelessChangeDetection()` en el bootstrap. No importar `zone.js`.
- **Signals** en todo el estado reactivo. Minimizar `subscribe()`. Preferir `computed()` y `effect()`.
- **httpResource** para toda petición HTTP declarativa (GET). Usar `HttpClient` solo para mutaciones (POST/PUT/DELETE).
- **Signal Forms** en todos los formularios (login, crear/editar post, crear/editar comment).
- Nunca usar `any`. Tipar siempre con interfaces/types.
- No hardcodear strings de UI. Usar siempre claves de Transloco.

### Arquitectura — Screaming Architecture con Nx libs

```
apps/
  posts-app/                          ← App shell: bootstrap, routing, layout
    src/
      index.html
      main.ts
      styles.css                      ← TailwindCSS 4 (@import "tailwindcss")
      app/
        app.component.ts
        app.config.ts
        app.routes.ts
      assets/i18n/
        en.json
        es.json

  api/                                ← Backend mock: json-server (proyecto Nx)
    db.json                           ← Base de datos mock
    routes.json                       ← (opcional) rewrite rules
    project.json                      ← targets: serve, reset

libs/
  core/                               ← type:util — AuthService, AuthGuard, AuthInterceptor
    src/lib/auth/
    src/lib/http/api.config.ts

  shared/ui/                          ← type:ui — Loading, Empty, Error, Forbidden, Pagination, Header, Layout
    src/lib/

  auth/feature-login/                 ← type:feature — LoginPage (container), LoginForm (presentacional)
    src/lib/auth.routes.ts

  posts/data-access/                  ← type:data-access — PostsService, CommentsService, modelos, PostOwnerGuard
    src/lib/models/
    src/lib/services/
    src/lib/guards/

  posts/feature-list/                 ← type:feature — PostListPage, PostList, PostCard, PostFilters
    src/lib/list.routes.ts

  posts/feature-detail/               ← type:feature — PostDetailPage, PostDetail, PostComments (@defer), CommentCard, CommentForm
    src/lib/detail.routes.ts

  posts/feature-form/                 ← type:feature — PostFormPage, PostForm (new + edit)
    src/lib/form.routes.ts
```

**Import aliases** (definidos en `tsconfig.base.json`):
- `@app/core`, `@app/shared/ui`, `@app/auth/feature-login`
- `@app/posts/data-access`, `@app/posts/feature-list`, `@app/posts/feature-detail`, `@app/posts/feature-form`

**Module boundaries** (`eslint.config.js`):
- `feature` → solo puede importar `data-access`, `ui`, `util`
- `data-access` → solo puede importar `util`
- `ui` → solo puede importar `util`
- Una `feature` **NO** puede importar otra `feature` directamente

### Separación container vs presentacional
- **Container** (page): inyecta servicios, gestiona estado con signals, pasa datos como `input()` signals.
- **Presentacional**: recibe datos via `input()`, emite eventos con `output()`. Sin lógica de negocio ni inyección de servicios de dominio.

### Routing
```
/login                → LoginPageComponent (público)           ← @app/auth/feature-login
/posts                → PostListPageComponent (protegido)      ← @app/posts/feature-list
/posts/new            → PostFormPageComponent (protegido)      ← @app/posts/feature-form
/posts/:id            → PostDetailPageComponent (protegido)    ← @app/posts/feature-detail
/posts/:id/edit       → PostFormPageComponent (protegido + ownership guard) ← @app/posts/feature-form
```
- Todas las rutas excepto `/login` protegidas con `authGuard` (de `@app/core`).
- `/posts/:id/edit` protegida además con `postOwnerGuard` (de `@app/posts/data-access`).
- Query params para filtros y paginación: `?page=1&q=angular&author=alice&tag=signals`.
- Lazy loading: cada lib feature se carga con `loadChildren` desde su barrel (`@app/posts/feature-list`, etc.).

### Autenticación
- Login: POST-like contra `json-server` buscando en `/users?name=X&password=Y`.
- Si match → generar token estático (e.g. `btoa(user.id + ':' + user.name + ':' + Date.now())`).
- Persistir token + user en `localStorage`.
- `authInterceptor` (functional): añade header `Authorization: Bearer <token>` a todas las peticiones salvo login.
- `authGuard` (functional): redirige a `/login` si no hay sesión.
- Logout: limpiar `localStorage` + navigate a `/login`.

### Internacionalización (Transloco)
- Archivos `en.json` y `es.json` en `assets/i18n/`.
- Selector de idioma visible en header/navbar.
- Cambio en runtime sin reload.
- Toda cadena visible en UI usa clave de traducción.

### Estados de UI
Cada vista principal debe manejar explícitamente:
- **loading**: skeleton o spinner mientras se cargan datos.
- **empty**: mensaje + ilustración cuando no hay resultados.
- **error**: mensaje de error con opción de reintentar.
- **forbidden**: cuando se intenta acceder a un recurso sin permisos.

### Testing
- **Vitest**: tests unitarios de services, guards, interceptors, y componentes.
- **Testing Library**: renderizado y assertions de componentes.
- **Playwright**: al menos un flujo e2e completo (login → listar → crear post → ver detalle → editar → eliminar).
- Cobertura mínima esperada: auth, guards, listado con filtros, detalle diferido, ownership, CRUD.

### Calidad de código
- ESLint con `@angular-eslint` + reglas estrictas (`@typescript-eslint/strict`).
- Prettier: `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`, `semi: true`.
- Husky: hooks `pre-commit` (lint-staged) y `commit-msg` (commitlint).
- lint-staged: `eslint --fix` + `prettier --write` sobre archivos staged.

---

## Convención de commits (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Tipos permitidos
| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Formato, sin cambio de lógica |
| `refactor` | Refactor sin cambio funcional |
| `test` | Añadir o corregir tests |
| `chore` | Tareas de mantenimiento, deps, config |
| `ci` | Cambios en CI/CD |
| `perf` | Mejora de rendimiento |

### Scopes sugeridos
`auth`, `posts`, `comments`, `shared`, `core`, `api`, `i18n`, `config`, `deps`, `e2e`

### Ejemplos
```
feat(auth): add login page with signal forms
feat(posts): implement post list with pagination and filters
fix(comments): fix ownership check on edit flow
test(auth): add unit tests for auth guard and interceptor
chore(deps): update angular to 21.x
docs: add architecture decision records
```

---

## Flujo de ramas (Git Flow simplificado)

```
main ← producción estable
  └── develop ← integración continua
        ├── feature/auth-login
        ├── feature/posts-crud
        ├── feature/comments-crud
        ├── feature/i18n-setup
        ├── feature/post-filters
        └── ...
```

- Crear rama `develop` desde `main`.
- Cada feature se desarrolla en `feature/<scope>-<description>` desde `develop`.
- Merge a `develop` vía squash merge o merge commit.
- Merge a `main` cuando `develop` está estable (release).

---

## Requisitos de entorno

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| **Node.js** | `24.14.1` | Usar `.nvmrc` o `.node-version` para fijar versión |
| **pnpm** | `10.x` | Definido en `package.json > packageManager`. No usar npm ni yarn |

### Configuración en package.json
```json
{
  "packageManager": "pnpm@10.33.0",
  "engines": {
    "node": ">=24.14.1",
    "pnpm": ">=10.0.0"
  }
}
```

### Archivos de versión
- `.nvmrc` → `24.14.1`
- `.node-version` → `24.14.1`

> **Importante**: Todos los comandos del proyecto usan `pnpm` en lugar de `npm` o `yarn`.  
> Instalar dependencias: `pnpm install`  
> Ejecutar scripts: `pnpm run <script>` o `pnpm <script>`

---

## Scripts esperados (package.json / Nx)

```json
{
  "start": "nx serve posts-app",
  "start:api": "nx serve api",
  "dev": "nx run-many --targets=serve --projects=posts-app,api",
  "build": "nx build posts-app",
  "lint": "nx lint posts-app",
  "test": "nx test posts-app",
  "test:watch": "nx test posts-app --watch",
  "test:coverage": "nx test posts-app --coverage",
  "e2e": "nx e2e posts-app-e2e",
  "format": "prettier --write \"{apps,libs}/**/*.{ts,html,css,json}\"",
  "format:check": "prettier --check \"{apps,libs}/**/*.{ts,html,css,json}\"",
  "prepare": "husky"
}
```

---

## Valorables (todos planificados)

- ✅ Router state con query params para filtros y paginación
- ✅ Prefetch de datos al hover sobre un post
- ✅ Cache con hidratación
- ✅ Optimistic updates en CRUD
- ✅ Scroll infinito en comentarios
- ✅ Animaciones de transición entre rutas
- ✅ Accesibilidad (ARIA labels, focus management, keyboard navigation)
- ✅ Nx monorepo
- ✅ SSR con `@angular/ssr`

---

## Notas para el agente de IA

1. **Siempre** usar APIs de Angular 21: `input()`, `output()`, `viewChild()`, `model()`, `signal()`, `computed()`, `effect()`, `linkedSignal()`, `httpResource`, `@defer`.
2. **No** usar decoradores legacy (`@Input()`, `@Output()`, `@ViewChild()`).
3. **No** usar `NgModule`, `CommonModule`, `FormsModule`, `ReactiveFormsModule` como import de módulo completo.
4. Importar directivas/pipes individualmente cuando sea necesario (e.g. `NgFor` → usar `@for`, `NgIf` → usar `@if`).
5. Usar control flow moderno: `@if`, `@else`, `@for`, `@switch`, `@defer`, `@placeholder`, `@loading`, `@error`.
6. La aplicación debe compilar y funcionar sin `zone.js`.
7. Cada componente debe tener `changeDetection: ChangeDetectionStrategy.OnPush`.
8. Para formularios usar la API de Signal Forms (no `FormGroup`/`FormControl` clásicos).
9. Las traducciones se manejan con `TranslocoModule` / `TranslocoPipe` / `transloco` directive.
10. Respetar la estructura de Nx libs definida en la sección de arquitectura. Cada lib tiene su barrel (`index.ts`). Usar import aliases `@app/*`.

