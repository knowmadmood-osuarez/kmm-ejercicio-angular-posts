# Arquitectura — Angular Posts App
## Vision general
Aplicacion SPA monorepo con **Nx** y **Angular 21** que gestiona posts y comentarios sobre un backend mock
(`json-server`). Sigue una **Screaming Architecture** con **Nx libraries** donde cada dominio de negocio es una
libreria independiente con cache, tests y boundaries propios.
### Requisitos de entorno
| Herramienta | Version                              |
|-------------|--------------------------------------|
| **Node.js** | `24.14.1`                            |
| **pnpm**    | `10.x` (package manager por defecto) |
---
## Diagrama de alto nivel
```
+--------------------------------------------------------------+
|                         Browser                              |
|                                                              |
|  +----------------+  +----------------+  +----------------+  |
|  |  Auth Feature   |  |  Posts Features |  |  Shared UI     |  |
|  |  (login lib)    |  |  (3 feature     |  |  (Design Sys.) |  |
|  |                 |  |   libs)         |  |                |  |
|  |  LoginPage      |  |  ListPage       |  |  icons/        |  |
|  |  LoginForm      |  |  DetailPage     |  |  primitives/   |  |
|  |                 |  |  FormPage       |  |  forms/        |  |
|  |                 |  |  Comments       |  |  feedback/     |  |
|  +------+----------+  +------+----------+  |  layout/       |  |
|         |                    |             |  overlays/     |  |
|         |  Facade layer      |             +----------------+  |
|         v                    v                                |
|  +------+--------------------+----------------------------+   |
|  |  AuthFacade        PostsFacade       CommentsFacade    |   |
|  |  (readonly signals + domain orchestration)             |   |
|  +------+--------------------+----------------------------+   |
|         |                    |                                |
|  +------+--------------------+----------------------------+   |
|  |              Core lib + Data-access lib                |   |
|  |  AuthService . AuthGuard . AuthInterceptor             |   |
|  |  PostsService . PostDetailService . CommentsService     |   |
|  |  PostOwnerGuard . ToastService                         |   |
|  +------------------------+-------------------------------+   |
|                           | httpResource / HttpClient          |
+---------------------------+----------------------------------+
                            |
                     +------+------+
                     | apps/api    |
                     | json-server |
                     |  :3000      |
                     |  db.json    |
                     +-------------+
```
---
## Estructura Nx monorepo — con libs
```
kmm-ejercicio-angular-posts/
|
+-- apps/
|   +-- posts-app/                           <- App shell: bootstrap, routing, layout, SSR
|   |   +-- public/
|   |   |   +-- favicon.ico
|   |   |   +-- assets/
|   |   |       +-- i18n/
|   |   |           +-- en.json              <- Traducciones ingles (Transloco)
|   |   |           +-- es.json              <- Traducciones espanol (Transloco)
|   |   +-- src/
|   |   |   +-- index.html
|   |   |   +-- main.ts                      <- Bootstrap client
|   |   |   +-- main.server.ts               <- Bootstrap server (SSR)
|   |   |   +-- styles.css                   <- TailwindCSS 4 (@import "tailwindcss")
|   |   |   +-- app/
|   |   |       +-- app.ts                   <- Root component (Angular 21: sin sufijo .component)
|   |   |       +-- app.spec.ts
|   |   |       +-- app.config.ts            <- provideZonelessChangeDetection, router, http, transloco
|   |   |       +-- app.config.server.ts     <- Configuracion SSR server
|   |   |       +-- app.routes.ts            <- Routing principal (lazy loading de features)
|   |   |       +-- app.routes.server.ts     <- Rutas SSR server
|   |   |       +-- transloco-loader.ts      <- TranslocoHttpLoader para i18n
|   |   |       +-- layout/
|   |   |       |   +-- app-layout.component.ts    <- Layout shell (header + router-outlet)
|   |   |       |   +-- app-layout.component.html
|   |   |       +-- toast/
|   |   |           +-- toast-container.component.ts <- Contenedor global de toasts
|   |   +-- server.ts                        <- Entry point SSR (Express/Node)
|   |   +-- project.json
|   |   +-- tsconfig.json                    <- extends tsconfig.base.json
|   |   +-- tsconfig.app.json
|   |   +-- tsconfig.server.json             <- Config TypeScript para SSR
|   |   +-- tsconfig.spec.json
|   |
|   +-- api/                                 <- Backend mock: json-server
|   |   +-- db.json                          <- Base de datos mock (copia de trabajo)
|   |   +-- project.json                     <- Nx project con targets: serve, reset
|   |
|   +-- posts-app-e2e/                       <- Playwright e2e
|       +-- src/
|       |   +-- app.spec.ts
|       +-- playwright.config.ts
|       +-- project.json
|
+-- libs/
|   +-- core/                                <- Singleton: auth, interceptors, API config, facades
|   |   +-- src/
|   |   |   +-- index.ts                     <- barrel export
|   |   |   +-- test-setup.ts
|   |   |   +-- lib/
|   |   |       +-- auth/
|   |   |       |   +-- auth.service.ts
|   |   |       |   +-- auth.service.spec.ts
|   |   |       |   +-- auth.facade.ts             <- Facade: readonly signals + login/logout
|   |   |       |   +-- auth.interceptor.ts
|   |   |       |   +-- auth.interceptor.spec.ts
|   |   |       |   +-- auth.guard.ts
|   |   |       |   +-- auth.guard.spec.ts
|   |   |       |   +-- auth-storage.ts            <- Pure functions: token gen/parse/persist
|   |   |       |   +-- user.model.ts
|   |   |       +-- http/
|   |   |       |   +-- api.config.ts
|   |   |       +-- toast/
|   |   |           +-- toast.service.ts
|   |   |           +-- toast.service.spec.ts
|   |   +-- project.json
|   |   +-- eslint.config.mjs
|   |   +-- vite.config.mts
|   |   +-- tsconfig.json
|   |   +-- tsconfig.lib.json
|   |   +-- tsconfig.spec.json
|   |
|   +-- shared/
|   |   +-- ui/                              <- Componentes UI reutilizables (Design System)
|   |       +-- src/
|   |       |   +-- index.ts                 <- barrel export (todas las categorias)
|   |       |   +-- test-setup.ts
|   |       |   +-- lib/
|   |       |       +-- icons/               <- Sistema de iconos SVG inline
|   |       |       |   +-- icon-registry.ts          <- Registro de iconos (IconName, IconDef, ICON_DEFS)
|   |       |       |   +-- icon.component.ts
|   |       |       |   +-- icon.component.spec.ts
|   |       |       +-- primitives/          <- Atomos UI base reutilizables
|   |       |       |   +-- avatar.component.ts
|   |       |       |   +-- avatar.component.spec.ts
|   |       |       |   +-- badge.component.ts
|   |       |       |   +-- badge.component.spec.ts
|   |       |       |   +-- button.component.ts       <- ButtonVariant, ButtonSize
|   |       |       |   +-- button.component.spec.ts
|   |       |       |   +-- card.component.ts          <- CardVariant
|   |       |       |   +-- card.component.spec.ts
|   |       |       +-- forms/               <- Controles de formulario
|   |       |       |   +-- input.component.ts         <- InputVariant
|   |       |       |   +-- input.component.spec.ts
|   |       |       |   +-- label.component.ts
|   |       |       |   +-- label.component.spec.ts
|   |       |       |   +-- select.component.ts
|   |       |       |   +-- select.component.spec.ts
|   |       |       |   +-- textarea.component.ts
|   |       |       |   +-- textarea.component.spec.ts
|   |       |       +-- feedback/            <- Estados de UI (loading, empty, error, forbidden)
|   |       |       |   +-- loading.component.ts
|   |       |       |   +-- loading.component.spec.ts
|   |       |       |   +-- empty-state.component.ts
|   |       |       |   +-- empty-state.component.spec.ts
|   |       |       |   +-- error-state.component.ts
|   |       |       |   +-- error-state.component.spec.ts
|   |       |       |   +-- forbidden-state.component.ts
|   |       |       |   +-- forbidden-state.component.spec.ts
|   |       |       |   +-- linear-progress.component.ts
|   |       |       |   +-- linear-progress.component.spec.ts
|   |       |       +-- layout/              <- Selectores de idioma, headers de pagina/seccion
|   |       |       |   +-- language-switcher.component.ts
|   |       |       |   +-- language-switcher.component.spec.ts
|   |       |       |   +-- page-header.component.ts
|   |       |       |   +-- page-header.component.spec.ts
|   |       |       |   +-- section-header.component.ts
|   |       |       |   +-- section-header.component.spec.ts
|   |       |       +-- overlays/            <- Dialogs y modales
|   |       |           +-- confirm-dialog.component.ts
|   |       |           +-- confirm-dialog.component.spec.ts
|   |       +-- project.json
|   |       +-- eslint.config.mjs
|   |       +-- vite.config.mts
|   |       +-- tsconfig.json
|   |       +-- tsconfig.lib.json
|   |       +-- tsconfig.spec.json
|   |
|   +-- auth/
|   |   +-- feature-login/                   <- Feature: pagina de login
|   |       +-- src/
|   |       |   +-- index.ts
|   |       |   +-- test-setup.ts
|   |       |   +-- lib/
|   |       |       +-- login-page.component.ts       <- container
|   |       |       +-- login-page.component.html
|   |       |       +-- login-page.component.spec.ts
|   |       |       +-- login-form.component.ts       <- presentacional
|   |       |       +-- login-form.component.html
|   |       |       +-- login-form.component.spec.ts
|   |       |       +-- auth.routes.ts
|   |       +-- project.json
|   |       +-- eslint.config.mjs
|   |       +-- vite.config.mts
|   |       +-- tsconfig.json
|   |       +-- tsconfig.lib.json
|   |       +-- tsconfig.spec.json
|   |
|   +-- posts/
|       +-- data-access/                     <- Servicios, modelos, guards, facades de posts
|       |   +-- src/
|       |   |   +-- index.ts
|       |   |   +-- test-setup.ts
|       |   |   +-- lib/
|       |   |       +-- models/
|       |   |       |   +-- post.model.ts
|       |   |       |   +-- comment.model.ts
|       |   |       +-- services/
|       |   |       |   +-- posts.service.ts
|       |   |       |   +-- posts.service.spec.ts
|       |   |       |   +-- post-detail.service.ts
|       |   |       |   +-- post-detail.service.spec.ts
|       |   |       |   +-- comments.service.ts
|       |   |       |   +-- comments.service.spec.ts
|       |   |       |   +-- post-filters.utils.ts
|       |   |       +-- facades/
|       |   |       |   +-- posts.facade.ts          <- Domain orchestration: state + mutations + toast
|       |   |       |   +-- comments.facade.ts       <- Domain orchestration: state + mutations + toast
|       |   |       +-- guards/
|       |   |           +-- post-owner.guard.ts
|       |   |           +-- post-owner.guard.spec.ts
|       |   +-- project.json
|       |   +-- eslint.config.mjs
|       |   +-- vite.config.mts
|       |   +-- tsconfig.json
|       |   +-- tsconfig.lib.json
|       |   +-- tsconfig.spec.json
|       |
|       +-- feature-list/                    <- Feature: listado de posts + filtros
|       |   +-- src/
|       |   |   +-- index.ts
|       |   |   +-- test-setup.ts
|       |   |   +-- lib/
|       |   |       +-- post-list-page.component.ts   <- container
|       |   |       +-- post-list-page.component.html
|       |   |       +-- post-list-page.component.spec.ts
|       |   |       +-- post-list.component.ts        <- presentacional
|       |   |       +-- post-list.component.html
|       |   |       +-- post-list.component.spec.ts
|       |   |       +-- post-card.component.ts        <- presentacional
|       |   |       +-- post-card.component.html
|       |   |       +-- post-card.component.spec.ts
|       |   |       +-- post-filters.component.ts     <- presentacional
|       |   |       +-- post-filters.component.html
|       |   |       +-- post-filters.component.spec.ts
|       |   |       +-- list.routes.ts
|       |   +-- project.json
|       |   +-- eslint.config.mjs
|       |   +-- vite.config.mts
|       |   +-- tsconfig.json
|       |   +-- tsconfig.lib.json
|       |   +-- tsconfig.spec.json
|       |
|       +-- feature-detail/                  <- Feature: detalle + comentarios
|       |   +-- src/
|       |   |   +-- index.ts
|       |   |   +-- test-setup.ts
|       |   |   +-- lib/
|       |   |       +-- post-detail-page.component.ts   <- container
|       |   |       +-- post-detail-page.component.html
|       |   |       +-- post-detail-page.component.spec.ts
|       |   |       +-- post-detail.component.ts        <- presentacional
|       |   |       +-- post-detail.component.html
|       |   |       +-- post-detail.component.spec.ts
|       |   |       +-- post-comments.component.ts      <- presentacional (@defer)
|       |   |       +-- post-comments.component.html
|       |   |       +-- post-comments.component.spec.ts
|       |   |       +-- comment-card.component.ts       <- presentacional
|       |   |       +-- comment-card.component.html
|       |   |       +-- comment-card.component.spec.ts
|       |   |       +-- comment-form.component.ts       <- presentacional
|       |   |       +-- comment-form.component.html
|       |   |       +-- comment-form.component.spec.ts
|       |   |       +-- detail.routes.ts
|       |   +-- project.json
|       |   +-- eslint.config.mjs
|       |   +-- vite.config.mts
|       |   +-- tsconfig.json
|       |   +-- tsconfig.lib.json
|       |   +-- tsconfig.spec.json
|       |
|       +-- feature-form/                    <- Feature: crear/editar post
|           +-- src/
|           |   +-- index.ts
|           |   +-- test-setup.ts
|           |   +-- lib/
|           |       +-- post-form-page.component.ts     <- container (new + edit)
|           |       +-- post-form-page.component.html
|           |       +-- post-form-page.component.spec.ts
|           |       +-- post-form.component.ts          <- presentacional
|           |       +-- post-form.component.html
|           |       +-- post-form.component.spec.ts
|           |       +-- form.routes.ts
|           +-- project.json
|           +-- eslint.config.mjs
|           +-- vite.config.mts
|           +-- tsconfig.json
|           +-- tsconfig.lib.json
|           +-- tsconfig.spec.json
|
+-- .github/
|   +-- workflows/
|       +-- ci.yml                           <- CI pipeline (GitHub Actions)
+-- .husky/
|   +-- pre-commit
|   +-- commit-msg
+-- db.json                                  <- Copia de referencia (enunciado). Copia de trabajo en apps/api/
+-- .nvmrc                                   <- 24.14.1
+-- .node-version                            <- 24.14.1
+-- .gitignore
+-- .postcssrc.json                          <- Config PostCSS (TailwindCSS 4)
+-- nx.json
+-- package.json                             <- packageManager: pnpm@10.x
+-- pnpm-lock.yaml
+-- tsconfig.base.json                       <- paths aliases para libs
+-- eslint.config.mjs                        <- ESLint 9+ flat config (root)
+-- eslint.base.config.mjs                   <- ESLint base config compartida por libs
+-- .prettierrc
+-- .prettierignore
+-- commitlint.config.mjs
+-- vitest.shared.ts                         <- Configuracion compartida Vitest
+-- vitest.shared.mts                        <- Configuracion compartida Vitest (ESM)
+-- vitest.workspace.ts                      <- Workspace config Vitest (multi-proyecto)
+-- AGENTS.md
+-- ARCHITECTURE.md
+-- IMPLEMENTATION_PLAN.md
+-- README.md
```

### Cambios respecto a la version anterior del documento
| Cambio                                       | Detalle                                                                                              |
|----------------------------------------------|------------------------------------------------------------------------------------------------------|
| `app.component.ts` → `app.ts`               | Angular 21 elimina el sufijo `.component` en el root component                                      |
| Archivos SSR añadidos                        | `server.ts`, `main.server.ts`, `app.config.server.ts`, `app.routes.server.ts`, `tsconfig.server.json` |
| `src/assets/` → `public/assets/`             | Nueva convencion Angular: assets estaticos en `public/` (fuera de `src/`)                           |
| `layout/` y `toast/` en app shell            | `app-layout.component.ts/html` y `toast-container.component.ts` movidos al shell                    |
| `transloco-loader.ts` añadido                | Loader HTTP para Transloco en el shell                                                               |
| `routes.json` eliminado de `apps/api/`       | No existe — json-server funciona solo con `db.json`                                                  |
| E2E simplificado                             | Solo `app.spec.ts` actualmente (no `auth.spec.ts`, `posts-crud.spec.ts`, `fixtures/`)                |
| `shared/ui`: `navigation/` eliminado         | `pagination.component` no existe. Sin carpeta `navigation/`                                          |
| `shared/ui`: `divider` eliminado             | `divider.component` no existe en `primitives/`                                                       |
| `shared/ui`: `header`/`layout` eliminados    | `header.component` y `layout.component` no existen en `layout/`. El layout real vive en el app shell |
| `test-setup.ts` en cada lib                  | Todas las libs incluyen `test-setup.ts` (configuracion Vitest)                                       |
| `eslint.config.mjs` + `vite.config.mts` por lib | Cada lib tiene su propia config ESLint y Vite                                                    |
| `post-detail.service.spec.ts` añadido        | Existia pero no estaba documentado                                                                   |
| Specs añadidos en features                   | `post-list.component.spec.ts`, `post-form.component.spec.ts`, `login-form.component.spec.ts` etc.   |
| `eslint.base.config.mjs` añadido en raiz     | Config ESLint base compartida (no documentado antes)                                                 |
| `.postcssrc.json` añadido                    | Configuracion PostCSS para TailwindCSS 4                                                             |
| `.github/workflows/ci.yml` añadido           | Pipeline CI con GitHub Actions                                                                       |
| `vitest.shared.ts/mts` + `vitest.workspace.ts` | Configuracion Vitest multi-proyecto compartida                                                    |
| `IMPLEMENTATION_PLAN.md` añadido             | Plan de implementacion del proyecto                                                                  |

### Archivos eliminados respecto a la version original del scaffold
| Archivo              | Razon                                                                            |
|----------------------|----------------------------------------------------------------------------------|
| `tailwind.config.js` | TailwindCSS 4 usa configuracion CSS (`@theme` en `styles.css`), no archivo JS   |
| `.eslintrc.json`     | Reemplazado por `eslint.config.mjs` (flat config, requerido por ESLint 9+)       |
| `pnpm-workspace.yaml`| Eliminado — No necesario en Nx integrated monorepo, Nx gestiona proyectos via `project.json`|
| `commitlint.config.js`| Renombrado a `.mjs` para compatibilidad ESM                                    |
---
## Librerias — Resumen
| Lib                    | Import alias                | Tipo          | Responsabilidad                                                               |
|------------------------|-----------------------------|---------------|-------------------------------------------------------------------------------|
| `core`                 | `@app/core`                 | `util`        | AuthService, **AuthFacade**, AuthGuard, AuthInterceptor, ToastService, API config |
| `shared-ui`            | `@app/shared/ui`            | `ui`          | **icons/** Icon · **primitives/** Button, Card, Badge, Avatar · **forms/** Input, Label, Select, Textarea · **feedback/** Loading, Empty, Error, Forbidden, LinearProgress · **layout/** LanguageSwitcher, PageHeader, SectionHeader · **overlays/** ConfirmDialog |
| `auth-feature-login`   | `@app/auth/feature-login`   | `feature`     | LoginPage, LoginForm, auth routes                                             |
| `posts-data-access`    | `@app/posts/data-access`    | `data-access` | PostsService, PostDetailService, CommentsService, **PostsFacade**, **CommentsFacade**, modelos, PostOwnerGuard |
| `posts-feature-list`   | `@app/posts/feature-list`   | `feature`     | PostListPage, PostList, PostCard, PostFilters, list routes                    |
| `posts-feature-detail` | `@app/posts/feature-detail` | `feature`     | PostDetailPage, PostDetail, PostComments, CommentCard, CommentForm            |
| `posts-feature-form`   | `@app/posts/feature-form`   | `feature`     | PostFormPage, PostForm, form routes                                           |
### Path aliases (tsconfig.base.json)
```json
{
  "compilerOptions": {
    "paths": {
      "@app/core": ["libs/core/src/index.ts"],
      "@app/shared/ui": ["libs/shared/ui/src/index.ts"],
      "@app/auth/feature-login": ["libs/auth/feature-login/src/index.ts"],
      "@app/posts/data-access": ["libs/posts/data-access/src/index.ts"],
      "@app/posts/feature-list": ["libs/posts/feature-list/src/index.ts"],
      "@app/posts/feature-detail": ["libs/posts/feature-detail/src/index.ts"],
      "@app/posts/feature-form": ["libs/posts/feature-form/src/index.ts"]
    }
  }
}
```
---
## Grafo de dependencias
```
                         posts-app (shell)
                        +-------+--------------------+
                        |       |                    |
                        v       v                    v
              auth/             posts/               posts/
           feature-login     feature-list          feature-detail
                |               |                    |
                |               |                    |           posts/
                |               |                    |        feature-form
                |               |                    |            |
                v               v                    v            v
              AuthFacade     PostsFacade          CommentsFacade
              (core)        (data-access)        (data-access)
                |               |                    |
                v               v                    v
              core          posts/data-access <------+
              AuthService   PostsService, PostDetailService,
                            CommentsService, PostOwnerGuard
                ^               |
                |               |
                +---------------+
        --- shared/ui (cualquier lib/app puede importarla) ---
```
### Reglas de module boundaries (eslint.config.mjs)
```javascript
// Dentro de eslint.config.mjs
{
  rules: {
    '@nx/enforce-module-boundaries': ['error', {
      depConstraints: [
        { sourceTag: 'type:app',         onlyDependOnLibsWithTags: ['type:feature', 'type:ui', 'type:util'] },
        { sourceTag: 'type:feature',     onlyDependOnLibsWithTags: ['type:data-access', 'type:ui', 'type:util'] },
        { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:util'] },
        { sourceTag: 'type:ui',          onlyDependOnLibsWithTags: ['type:util'] },
        { sourceTag: 'type:util',        onlyDependOnLibsWithTags: [] },
      ],
    }],
  },
}
```
### Tags por proyecto (project.json)
| Proyecto                | Tags                          |
|-------------------------|-------------------------------|
| `posts-app`             | `type:app`, `scope:app`       |
| `api`                   | `type:app`, `scope:api`       |
| `core`                  | `type:util`, `scope:core`     |
| `shared-ui`             | `type:ui`, `scope:shared`     |
| `auth-feature-login`    | `type:feature`, `scope:auth`  |
| `posts-data-access`     | `type:data-access`, `scope:posts` |
| `posts-feature-list`    | `type:feature`, `scope:posts` |
| `posts-feature-detail`  | `type:feature`, `scope:posts` |
| `posts-feature-form`    | `type:feature`, `scope:posts` |
---
## Decisiones de arquitectura
### 1. Nx Monorepo (integrated) con libs
**Decision**: Usar Nx con librerias independientes por dominio.
**Razon**:
- **Cache granular** — Un cambio en `posts/feature-list` no invalida la cache de `shared/ui` ni `core`.
- **Module boundaries** — Nx impide que una `feature` importe directamente otra `feature`. Solo a traves de `data-access`.
- **Test isolation** — `nx test posts-data-access` ejecuta solo los tests de esa lib.
- **Escalabilidad** — Si el proyecto crece (ej: backoffice), las libs se reutilizan.
### 2. Screaming Architecture con tipos Nx
**Decision**: Organizar libs por dominio (scope) y tipo (type), siguiendo la convencion Nx.
```
NO: libs/services/, libs/components/, libs/guards/         <- por capa tecnica
SI: libs/posts/data-access/, libs/posts/feature-list/      <- por dominio + tipo
```
Los tipos siguen la convencion estandar Nx:
- **feature** — Smart components (pages) + rutas. Orquestan la UI.
- **data-access** — Servicios, modelos, guards. Acceso a API.
- **ui** — Componentes presentacionales puros reutilizables.
- **util** — Helpers, constantes, configuracion transversal.
### 3. Container vs Presentacional
**Decision**: Separar componentes en containers (pages) y presentacionales puros.
| Aspecto           | Container (Page)           | Presentacional          |
|-------------------|----------------------------|-------------------------|
| Inyecta servicios | **Facades** (no servicios) | NO                      |
| Gestiona estado   | UI local (signals)         | NO                      |
| Recibe datos      | Via facades/router         | Via `input()`           |
| Emite eventos     | Ejecuta acciones           | Via `output()`          |
| Testabilidad      | Integration tests          | Unit tests simples      |
| Ubicacion         | `feature-*` libs           | `feature-*` o `ui` libs |

> **Nota**: Los containers inyectan **facades** (`AuthFacade`, `PostsFacade`, `CommentsFacade`), nunca servicios de datos directamente. Esto garantiza que toda mutacion pase por la orquestacion de dominio (invalidar cache + notificar).
### 4. Zoneless + Signals
**Decision**: Eliminar `zone.js` y manejar todo el estado con signals.
**Razon**: Mejor rendimiento, change detection granular, direccion oficial de Angular.
```typescript
// apps/posts-app/src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTransloco({ ... }),
  ],
};
```
### 5. httpResource para lectura
**Decision**: Usar `httpResource` para todas las peticiones GET declarativas.
**Razon**: Se integra nativamente con signals, maneja estados de loading/error, API recomendada de Angular 21.
```typescript
// libs/posts/data-access/src/lib/services/posts.service.ts
postsResource = httpResource<Post[]>({
  url: computed(() => `${this.apiUrl}/posts`),
  defaultValue: [],
});
```
Para mutaciones (POST, PUT, DELETE) se usa `HttpClient` con `firstValueFrom()`.
### 6. Signal Forms
**Decision**: Usar Signal Forms en todos los formularios.
**Razon**: API moderna de formularios en Angular 21. Integracion nativa con signals.
### 7. @defer para comentarios
**Decision**: Los comentarios en el detalle de un post se cargan lazy con `@defer`.
**Razon**: No bloquear el render del detalle. Comentarios se cargan al ser visibles en viewport.
```html
<!-- libs/posts/feature-detail/src/lib/post-detail-page.component.html -->
@defer (on viewport) {
  <app-post-comments [postId]="postId()" />
} @placeholder {
  <div class="h-32 animate-pulse bg-gray-200 rounded"></div>
} @loading (minimum 300ms) {
  <app-loading />
}
```
### 8. Transloco para i18n
**Decision**: Usar Transloco sobre `ngx-translate`.
**Razon**: API mas moderna, mejor lazy loading de traducciones, tipado robusto, mantenimiento activo.
### 9. Autenticacion mock con interceptor
**Decision**: Login contra `json-server` buscando por `name` + `password`. Token estatico en `localStorage`.
**Flujo**:
1. `GET /users?name=X&password=Y`
2. Si existe -> generar token base64 -> guardar en `localStorage`
3. `authInterceptor` anade `Authorization: Bearer <token>` a cada request
4. `authGuard` verifica token y redirige a `/login` si no existe
### 10. Ownership — editar/borrar solo lo propio
**Decision**: Doble proteccion UI + guard.
- **UI**: No mostrar botones editar/borrar si `post.userId !== currentUser.id`.
- **Guard** (`postOwnerGuard`): En `/posts/:id/edit`, verificar ownership. Si no -> forbidden.
### 11. Query params para filtros y paginacion
**Decision**: Sincronizar filtros con URL via `queryParams`.
**Razon**: URLs compartibles, navegacion atras/adelante consistente, bookmarking.
```
/posts?page=2&q=angular&author=alice&tag=signals
```
### 12. TailwindCSS 4 — configuracion CSS
**Decision**: Usar TailwindCSS 4 con configuracion via CSS (no JS).
```css
/* apps/posts-app/src/styles.css */
@import "tailwindcss";
@theme {
  --color-primary: #3b82f6;
  --color-danger: #ef4444;
}
```
> TailwindCSS 4 elimino `tailwind.config.js`. Toda personalizacion va dentro del CSS.
### 13. Testing strategy
| Nivel       | Herramienta              | Alcance                                                  |
|-------------|--------------------------|----------------------------------------------------------|
| Unit        | Vitest + Testing Library | Libs: services, guards, interceptors, presentacionales   |
| Integration | Vitest + Testing Library | Libs feature: containers con mocks de servicios          |
| E2E         | Playwright               | Flujo completo: login -> CRUD posts -> comments -> logout|
### 14. json-server como proyecto Nx (`apps/api`)
**Decision**: Mover `db.json` a `apps/api/` y registrar el backend mock como proyecto Nx con su propio `project.json`.

> **Nota**: Se mantiene una copia de `db.json` en la raiz del repositorio como referencia del enunciado original (el README enlaza a `./db.json`). La copia de trabajo que usa `json-server` es `apps/api/db.json`.
**Razon**:
- **Consistencia monorepo** — Todo lo que se ejecuta vive bajo `apps/`. `db.json` suelto en la raiz rompe la convencion.
- **Grafo de tareas Nx** — `nx serve api` permite que Nx gestione el proceso. Los e2e (`posts-app-e2e`) pueden declarar dependencia implicita en `api`, asegurando que la API este arriba antes de ejecutar tests.
- **Cache y targets** — Se pueden definir targets como `reset` (restaurar `db.json` a estado inicial) o `seed` (poblar datos de prueba).
- **`nx run-many`** — El script `dev` puede usar `nx run-many --targets=serve --projects=posts-app,api` en lugar de `concurrently`.

**`apps/api/project.json`**:
```json
{
  "name": "api",
  "tags": ["type:app", "scope:api"],
  "targets": {
    "serve": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx json-server apps/api/db.json --port 3000"
      }
    },
    "reset": {
      "executor": "nx:run-commands",
      "options": {
        "command": "git checkout -- apps/api/db.json"
      }
    }
  }
}
```

**Dependencia implicita en `posts-app-e2e`**:
```json
{
  "name": "posts-app-e2e",
  "implicitDependencies": ["posts-app", "api"]
}
```
### 15. Prefetch de datos al hover
**Decision**: Al hacer hover sobre un `PostCard`, se precarga el detalle del post.
**Razon**: Reduce la latencia percibida al navegar al detalle. El dato ya esta en cache cuando el usuario hace click.
**Implementacion**: `PostsService.prefetch(id)` con `HttpClient` + cache en memoria. Se mantiene un `Set<number>` de IDs precargados para evitar llamadas duplicadas.

### 16. Cache con hidratacion (stale-while-revalidate)
**Decision**: Implementar cache en memoria con TTL en los servicios de datos.
**Razon**: Evita refetches innecesarios al navegar atras/adelante. Mejora percepcion de velocidad.
**Patron**: `signal(Map<string, { data, timestamp }>)` con TTL de 30-60s. Se sirve desde cache y se revalida en background. Se invalida cache tras mutaciones.
**SSR**: Con `TransferState`, el estado renderizado en server se transfiere al client sin doble fetch.

### 17. Optimistic updates
**Decision**: Las mutaciones CRUD actualizan la UI inmediatamente antes de confirmacion del server.
**Razon**: UX mas rapida y fluida. El usuario no espera al roundtrip para ver el resultado.
**Rollback**: Se guarda estado previo. Si la peticion falla, se restaura y se muestra notification/toast de error.

### 18. Scroll infinito en comentarios
**Decision**: Reemplazar paginacion clasica de comentarios por scroll infinito.
**Razon**: Sugerido en el enunciado. Mejor UX para listas de contenido generado por usuarios.
**Implementacion**: `IntersectionObserver` en un sentinel element al final de la lista. Al ser visible, se carga la siguiente pagina. Signal acumulativo que concatena resultados.

### 19. Animaciones
**Decision**: Incluir animaciones de transicion entre rutas y micro-animaciones en la UI.
**Razon**: Mejora la experiencia visual. Angular tiene `@angular/animations` nativo.
**Alcance**: Route transitions (fade/slide), fade-in en cards, slide-in en comentarios, entrada/salida de dialogs, hover effects en cards.

### 20. Accesibilidad (WCAG AA)
**Decision**: Implementar accesibilidad como requisito transversal.
**Alcance**: ARIA labels, roles, focus management, keyboard navigation, focus trap en modales, skip-to-content, contraste WCAG AA, alt text, live regions para estados.

### 21. SSR con `@angular/ssr`
**Decision**: Habilitar Server-Side Rendering.
**Razon**: Mejora SEO y FCP (First Contentful Paint). Angular 21 tiene soporte SSR maduro.
**Consideraciones**:
- `localStorage` solo accesible en browser → usar `isPlatformBrowser` guard.
- `authGuard` y `authInterceptor` deben ser SSR-safe (no acceder a `window`/`localStorage` en server).
- Hidratacion de datos via `TransferState` para evitar doble fetch.

### 22. State management avanzado — Facade con Signals
**Decision**: Introducir una capa de **facades** entre los componentes (features) y los servicios de datos.

**Razon**: Centralizar el estado reactivo, separar lectura (signals readonly) de escritura (metodos de mutacion), y orquestar la logica de dominio (mutacion + invalidacion + notificacion) en un solo lugar.

**Arquitectura en 3 capas**:
```
Component (UI)          Facade (Domain)           Service (Data)
┌──────────────┐        ┌──────────────────┐      ┌─────────────────┐
│ UI state     │ inject  │ readonly signals  │ inject│ httpResource    │
│ (isDeleting, │───────>│ (posts, isLoading │────->│ HttpClient      │
│  showDialog) │        │  error, filters)  │      │ signal state    │
│              │        │                  │      │                 │
│ navigation   │ await   │ domain methods   │ await │ CRUD methods    │
│ (router)     │<───────│ (create, update,  │<─────│ (firstValueFrom)│
│              │        │  delete + reload  │      │                 │
│              │        │  + toast)         │      │                 │
└──────────────┘        └──────────────────┘      └─────────────────┘
```

**Regla de separacion de responsabilidades**:
| Responsabilidad                         | Donde                      |
|-----------------------------------------|----------------------------|
| Estado reactivo readonly (signals)      | **Facade**                 |
| Orquestacion de dominio (mutacion + invalidacion de cache + toast) | **Facade** |
| Estado UI local (isDeleting, showDialog, isSubmitting) | **Componente** |
| Navegacion post-accion (router.navigate)| **Componente**             |
| Fetching HTTP bajo nivel                | **Service**                |

**Facades implementadas**:

| Facade           | Ubicacion                              | Readonly signals                                                | Metodos de mutacion                                   |
|------------------|----------------------------------------|-----------------------------------------------------------------|-------------------------------------------------------|
| `AuthFacade`     | `libs/core/src/lib/auth/`              | `currentUser`, `token`, `userId`                                | `login()`, `logout()`                                 |
| `PostsFacade`    | `libs/posts/data-access/src/lib/facades/` | `posts`, `isLoading`, `isLoadingMore`, `error`, `totalItems`, `hasMore`, `users`, `uniqueTags`, `isEmpty`, `pagination`, `selectedPost`, `selectedPostLoading`, `selectedPostError`, `filters` (linkedSignal) | `createPost()`, `updatePost()`, `deletePost()`, `loadNextPage()`, `reload()`, `loadDetail()`, `reloadDetail()`, `prefetch()`, `syncFiltersFromRoute()` |
| `CommentsFacade` | `libs/posts/data-access/src/lib/facades/` | `comments` (merged optimistic+server), `isLoading`, `error`, `isEmpty`, `hasMore`, `loadingMore` | `createComment()`, `updateComment()`, `deleteComment()`, `loadForPost()`, `reload()` |

**`linkedSignal()` para sync query params ↔ filtros** (`PostsFacade`):
```typescript
// Source: signal alimentado por el componente desde los query params de la ruta
private readonly _routeFilters = signal<PostFilters>(
  { q: '', author: '', tag: '' },
  { equal: filtersEqual },
);

// linkedSignal: se resetea cuando _routeFilters cambia; tambien es writable manualmente
readonly filters = linkedSignal({
  source: () => this._routeFilters(),
  computation: (source: PostFilters) => source,
  equal: filtersEqual,
});

// effect() sincroniza facade → PostsService (que dispara el fetch)
constructor() {
  effect(() => {
    const f = this.filters();
    untracked(() => this.postsService.filters.set(f));
  });
}
```
Flujo completo:
1. URL cambia → componente lee `queryParams` → llama `facade.syncFiltersFromRoute(params)` → `_routeFilters` se actualiza → `linkedSignal` se resetea → `effect()` sincroniza a `PostsService` → datos se recargan.
2. Usuario cambia filtro en UI → componente hace `facade.filters.set(newFilters)` + `router.navigate(queryParams)` → respuesta inmediata + URL actualizada.

**`effect()` para side effects** (`AuthFacade`):
```typescript
// Logging reactivo de cambios de sesion (solo en dev)
constructor() {
  if (isDevMode()) {
    effect(() => {
      const user = this.currentUser();
      const action = user ? `authenticated as "${user.name}"` : 'logged out';
      console.debug(`[AuthFacade] ${action}`);
    });
  }
}
```

**Ejemplo de mutacion orquestada** (`PostsFacade.deletePost`):
```typescript
// Facade: orquesta dominio (mutacion + invalidacion + notificacion)
async deletePost(id: string): Promise<void> {
  await this.postDetailService.deletePost(id);   // 1. Mutacion
  this.postsService.reload();                     // 2. Invalidar cache
  this.toast.success('toast.postDeleted');         // 3. Notificar exito
}

// Componente: solo UI local + navegacion
async onDeleteConfirmed(): Promise<void> {
  this.isDeleting.set(true);                      // UI: spinner
  try {
    await this.postsFacade.deletePost(id);        // Delegar al dominio
    void this.router.navigate(['/posts']);         // Navegacion post-accion
  } finally {
    this.isDeleting.set(false);                   // UI: reset spinner
    this.showDeleteDialog.set(false);             // UI: cerrar dialog
  }
}
```
---
## Routing Map
```typescript
// apps/posts-app/src/app/app.routes.ts
export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('@app/auth/feature-login').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'posts',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@app/posts/feature-list').then(m => m.LIST_ROUTES),
      },
      {
        path: 'new',
        loadChildren: () =>
          import('@app/posts/feature-form').then(m => m.FORM_ROUTES),
      },
      {
        path: ':id',
        loadChildren: () =>
          import('@app/posts/feature-detail').then(m => m.DETAIL_ROUTES),
      },
      {
        path: ':id/edit',
        canActivate: [postOwnerGuard],
        loadChildren: () =>
          import('@app/posts/feature-form').then(m => m.FORM_ROUTES),
      },
    ],
  },
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: '**', redirectTo: 'posts' },
];
```
Cada lib feature exporta sus rutas desde el barrel (`index.ts`):
```typescript
// libs/auth/feature-login/src/lib/auth.routes.ts
export const AUTH_ROUTES: Routes = [
  { path: '', component: LoginPageComponent },
];
// libs/posts/feature-list/src/lib/list.routes.ts
export const LIST_ROUTES: Routes = [
  { path: '', component: PostListPageComponent },
];
// libs/posts/feature-detail/src/lib/detail.routes.ts
export const DETAIL_ROUTES: Routes = [
  { path: '', component: PostDetailPageComponent },
];
// libs/posts/feature-form/src/lib/form.routes.ts
export const FORM_ROUTES: Routes = [
  { path: '', component: PostFormPageComponent },
];
```
---
## API Endpoints (json-server)
| Metodo | Endpoint                                  | Descripcion                        |
|--------|-------------------------------------------|------------------------------------|
| GET    | `/users?name=X&password=Y`                | Login (busqueda de usuario)        |
| GET    | `/posts?_page=N&_per_page=M`              | Listar posts paginados             |
| GET    | `/posts?q=texto`                          | Buscar posts por texto             |
| GET    | `/posts?userId=N`                         | Filtrar posts por autor            |
| GET    | `/posts?tags_like=tag`                    | Filtrar posts por etiqueta         |
| GET    | `/posts/:id`                              | Detalle de un post                 |
| POST   | `/posts`                                  | Crear post                         |
| PUT    | `/posts/:id`                              | Actualizar post                    |
| DELETE | `/posts/:id`                              | Eliminar post                      |
| GET    | `/comments?postId=N&_page=P&_per_page=M`  | Comentarios de un post (paginados) |
| POST   | `/comments`                               | Crear comentario                   |
| PUT    | `/comments/:id`                           | Actualizar comentario              |
| DELETE | `/comments/:id`                           | Eliminar comentario                |
| GET    | `/users`                                  | Listar usuarios (para filtros)     |
---
## Flujo de estados en UI
```
            +----------+
            |  IDLE     |
            +----+-----+
                 | trigger request
            +----v-----+
            | LOADING   |--------------+
            +----+-----+              |
                 |                    |
          +------+------+      +-----v-----+
          |  SUCCESS    |      |   ERROR    |
          +------+------+      +-----------+
                 |                    |
          +------+------+            | retry
          | data.length |            |
          +-------------+      +-----+-----+
          |  > 0  | = 0 |      |  trigger   |
          |       |     |      +-----------+
          |  DATA |EMPTY|
          +-------+-----+
```
Cada `httpResource` expone `.value()`, `.isLoading()`, `.error()` que se mapean a estos estados con `@if` / `@else`.
---
## Dependencias principales
> Gestion de paquetes con **pnpm 10**. Lockfile: `pnpm-lock.yaml`.
> Instalar: `pnpm install` . Ejecutar scripts: `pnpm <script>`
```json
{
  "packageManager": "pnpm@10.33.0",
  "engines": {
    "node": ">=24.14.1",
    "pnpm": ">=10.0.0"
  }
}
```
### Runtime
```json
{
  "@angular/core": "^21.0.0",
  "@angular/router": "^21.0.0",
  "@angular/common": "^21.0.0",
  "@angular/forms": "^21.0.0",
  "@angular/platform-browser": "^21.0.0",
  "@angular/animations": "^21.0.0",
  "@angular/ssr": "^21.0.0",
  "@jsverse/transloco": "^8.x",
  "tailwindcss": "^4.x"
}
```
### Dev dependencies
```json
{
  "@nx/angular": "^21.3.12",
  "@angular-eslint/eslint-plugin": "^21.x",
  "eslint": "^10.x",
  "prettier": "^3.x",
  "vitest": "^4.x",
  "@testing-library/angular": "^19.x",
  "@playwright/test": "^1.x",
  "husky": "^9.x",
  "lint-staged": "^16.x",
  "@commitlint/cli": "^20.x",
  "@commitlint/config-conventional": "^20.x",
  "json-server": "^1.0.0-beta.15",
  "@analogjs/vite-plugin-angular": "^2.x"
}
```
---
## Responsive & Mobile First
- **TailwindCSS 4**: utilidades mobile-first (`sm:`, `md:`, `lg:`, `xl:`).
- Breakpoints clave:
  - **Mobile** (default, < 640px): posts en 1 columna, menu hamburger.
  - **Tablet** (`sm`, 640px+): grid 2 columnas para posts.
  - **Desktop** (`lg`, 1024px+): grid 3 columnas, sidebar de filtros visible.
- Header: logo, selector de idioma, nombre de usuario, boton de logout.
- En mobile: menu colapsable con hamburger icon.
---
## Generacion de libs con Nx CLI
```bash
# Core
pnpm nx g @nx/angular:library core \
  --directory=libs/core --standalone --prefix=app \
  --tags="type:util,scope:core"
# Shared UI
pnpm nx g @nx/angular:library shared-ui \
  --directory=libs/shared/ui --standalone --prefix=app \
  --tags="type:ui,scope:shared"
# Auth feature
pnpm nx g @nx/angular:library auth-feature-login \
  --directory=libs/auth/feature-login --standalone --prefix=app \
  --tags="type:feature,scope:auth"
# Posts data-access
pnpm nx g @nx/angular:library posts-data-access \
  --directory=libs/posts/data-access --standalone --prefix=app \
  --tags="type:data-access,scope:posts"
# Posts features
pnpm nx g @nx/angular:library posts-feature-list \
  --directory=libs/posts/feature-list --standalone --prefix=app \
  --tags="type:feature,scope:posts"
pnpm nx g @nx/angular:library posts-feature-detail \
  --directory=libs/posts/feature-detail --standalone --prefix=app \
  --tags="type:feature,scope:posts"
pnpm nx g @nx/angular:library posts-feature-form \
  --directory=libs/posts/feature-form --standalone --prefix=app \
  --tags="type:feature,scope:posts"
```
