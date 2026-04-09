# Arquitectura — Angular Posts App

## Visión general

Aplicación SPA monorepo con **Nx** y **Angular 21** que gestiona posts y comentarios sobre un backend mock (`json-server`). Sigue una **Screaming Architecture** donde la estructura de carpetas refleja los dominios de negocio, no capas técnicas.

### Requisitos de entorno

| Herramienta | Versión |
|-------------|---------|
| **Node.js** | `24.14.1` |
| **pnpm** | `10.x` (package manager por defecto) |

---

## Diagrama de alto nivel

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Auth Feature │  │ Posts Feature │  │   Shared UI  │  │
│  │              │  │              │  │              │  │
│  │  LoginPage   │  │  ListPage    │  │  Loading     │  │
│  │  LoginForm   │  │  DetailPage  │  │  Empty       │  │
│  │              │  │  FormPage    │  │  Error       │  │
│  │              │  │  Comments    │  │  Forbidden   │  │
│  └──────┬───────┘  └──────┬───────┘  │  Pagination  │  │
│         │                 │          └──────────────┘  │
│  ┌──────┴─────────────────┴──────────────────────────┐  │
│  │                    Core Layer                      │  │
│  │  AuthService · AuthGuard · AuthInterceptor        │  │
│  │  PostsService · CommentsService · PostOwnerGuard  │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │ httpResource / HttpClient      │
└─────────────────────────┼───────────────────────────────┘
                          │
                   ┌──────┴──────┐
                   │ json-server │
                   │  :3000      │
                   │  db.json    │
                   └─────────────┘
```

---

## Estructura Nx monorepo

```
kmm-ejercicio-angular-posts/
├── apps/
│   ├── posts-app/                       ← Aplicación Angular principal
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/                ← Servicios singleton, interceptors, guards
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   │   ├── auth.service.spec.ts
│   │   │   │   │   │   ├── auth.interceptor.ts
│   │   │   │   │   │   ├── auth.interceptor.spec.ts
│   │   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   │   └── auth.guard.spec.ts
│   │   │   │   │   └── http/
│   │   │   │   │       └── api.config.ts
│   │   │   │   │
│   │   │   │   ├── features/            ← Features por dominio
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   └── login/
│   │   │   │   │   │       ├── login-page.component.ts
│   │   │   │   │   │       ├── login-page.component.html
│   │   │   │   │   │       ├── login-page.component.spec.ts
│   │   │   │   │   │       ├── login-form.component.ts
│   │   │   │   │   │       ├── login-form.component.html
│   │   │   │   │   │       └── auth.routes.ts
│   │   │   │   │   │
│   │   │   │   │   └── posts/
│   │   │   │   │       ├── post-list/
│   │   │   │   │       │   ├── post-list-page.component.ts
│   │   │   │   │       │   ├── post-list-page.component.html
│   │   │   │   │       │   ├── post-list-page.component.spec.ts
│   │   │   │   │       │   ├── post-list.component.ts
│   │   │   │   │       │   ├── post-list.component.html
│   │   │   │   │       │   ├── post-card.component.ts
│   │   │   │   │       │   ├── post-card.component.html
│   │   │   │   │       │   ├── post-filters.component.ts
│   │   │   │   │       │   └── post-filters.component.html
│   │   │   │   │       │
│   │   │   │   │       ├── post-detail/
│   │   │   │   │       │   ├── post-detail-page.component.ts
│   │   │   │   │       │   ├── post-detail-page.component.html
│   │   │   │   │       │   ├── post-detail-page.component.spec.ts
│   │   │   │   │       │   ├── post-detail.component.ts
│   │   │   │   │       │   ├── post-detail.component.html
│   │   │   │   │       │   ├── post-comments.component.ts      ← @defer
│   │   │   │   │       │   ├── post-comments.component.html
│   │   │   │   │       │   ├── comment-card.component.ts
│   │   │   │   │       │   ├── comment-card.component.html
│   │   │   │   │       │   ├── comment-form.component.ts
│   │   │   │   │       │   └── comment-form.component.html
│   │   │   │   │       │
│   │   │   │   │       ├── post-form/
│   │   │   │   │       │   ├── post-form-page.component.ts
│   │   │   │   │       │   ├── post-form-page.component.html
│   │   │   │   │       │   ├── post-form-page.component.spec.ts
│   │   │   │   │       │   ├── post-form.component.ts
│   │   │   │   │       │   └── post-form.component.html
│   │   │   │   │       │
│   │   │   │   │       ├── services/
│   │   │   │   │       │   ├── posts.service.ts
│   │   │   │   │       │   ├── posts.service.spec.ts
│   │   │   │   │       │   ├── comments.service.ts
│   │   │   │   │       │   └── comments.service.spec.ts
│   │   │   │   │       │
│   │   │   │   │       ├── guards/
│   │   │   │   │       │   ├── post-owner.guard.ts
│   │   │   │   │       │   └── post-owner.guard.spec.ts
│   │   │   │   │       │
│   │   │   │   │       ├── models/
│   │   │   │   │       │   ├── post.model.ts
│   │   │   │   │       │   └── comment.model.ts
│   │   │   │   │       │
│   │   │   │   │       └── posts.routes.ts
│   │   │   │   │
│   │   │   │   ├── shared/              ← Componentes UI reutilizables
│   │   │   │   │   ├── ui/
│   │   │   │   │   │   ├── loading.component.ts
│   │   │   │   │   │   ├── empty-state.component.ts
│   │   │   │   │   │   ├── error-state.component.ts
│   │   │   │   │   │   ├── forbidden-state.component.ts
│   │   │   │   │   │   ├── pagination.component.ts
│   │   │   │   │   │   ├── confirm-dialog.component.ts
│   │   │   │   │   │   └── language-switcher.component.ts
│   │   │   │   │   ├── layout/
│   │   │   │   │   │   ├── header.component.ts
│   │   │   │   │   │   ├── header.component.html
│   │   │   │   │   │   └── layout.component.ts
│   │   │   │   │   ├── pipes/
│   │   │   │   │   └── directives/
│   │   │   │   │
│   │   │   │   ├── app.component.ts
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.routes.ts
│   │   │   │
│   │   │   ├── assets/
│   │   │   │   └── i18n/
│   │   │   │       ├── en.json
│   │   │   │       └── es.json
│   │   │   │
│   │   │   ├── environments/
│   │   │   │   ├── environment.ts
│   │   │   │   └── environment.prod.ts
│   │   │   │
│   │   │   ├── styles.css               ← TailwindCSS imports
│   │   │   └── main.ts
│   │   │
│   │   ├── project.json
│   │   └── tsconfig.app.json
│   │
│   └── posts-app-e2e/                   ← Playwright e2e
│       ├── src/
│       │   ├── auth.spec.ts
│       │   ├── posts-crud.spec.ts
│       │   └── fixtures/
│       ├── playwright.config.ts
│       └── project.json
│
├── db.json                              ← Base de datos mock
├── .nvmrc                               ← Node 24.14.1
├── .node-version                        ← Node 24.14.1
├── nx.json
├── package.json                         ← packageManager: pnpm@10.x
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tailwind.config.js
├── .eslintrc.json
├── .prettierrc
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── commitlint.config.js
├── agent.md
├── architecture.md
└── README.md
```

---

## Decisiones de arquitectura

### 1. Nx Monorepo (integrated)

**Decisión**: Usar Nx como herramienta de monorepo.  
**Razón**: Proporciona:
- Cache de builds y tests inteligente.
- Generadores de código (`nx generate`).
- Grafo de dependencias.
- Ejecución paralela de tareas.
- Arquitectura preparada para escalar a librerías compartidas si crece el proyecto.

### 2. Screaming Architecture

**Decisión**: Organizar por features/dominio, no por capas técnicas.  
**Razón**: Al abrir `features/posts/` se entiende inmediatamente qué hace la app. Los archivos relacionados viven juntos. Reduce el salto cognitivo entre archivos.

```
❌ components/post-list.ts, services/posts.ts, guards/post-owner.ts
✅ features/posts/post-list/..., features/posts/services/..., features/posts/guards/...
```

### 3. Container vs Presentacional

**Decisión**: Separar componentes en containers (pages) y presentacionales puros.

| Aspecto | Container (Page) | Presentacional |
|---------|------------------|----------------|
| Inyecta servicios | ✅ | ❌ |
| Gestiona estado | ✅ (signals) | ❌ |
| Recibe datos | Via servicios/router | Via `input()` |
| Emite eventos | Ejecuta acciones | Via `output()` |
| Testabilidad | Integration tests | Unit tests simples |

### 4. Zoneless + Signals

**Decisión**: Eliminar `zone.js` y manejar todo el estado con signals.  
**Razón**: Mejor rendimiento, change detection granular, y es la dirección oficial de Angular.

```typescript
// app.config.ts
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

**Decisión**: Usar `httpResource` para todas las peticiones GET declarativas.  
**Razón**: Se integra nativamente con signals, maneja estados de loading/error automáticamente, y es la API recomendada de Angular 21.

```typescript
// Ejemplo en PostsService
postsResource = httpResource<Post[]>({
  url: () => `${this.apiUrl}/posts`,
  params: () => ({
    _page: this.page(),
    _per_page: this.pageSize(),
    q: this.searchQuery(),
  }),
});
```

Para mutaciones (POST, PUT, DELETE) se usa `HttpClient` clásico con `.subscribe()` o `firstValueFrom()`.

### 6. Signal Forms

**Decisión**: Usar Signal Forms en todos los formularios.  
**Razón**: Es el requisito del ejercicio y la API moderna de formularios en Angular 21. Integración nativa con signals.

### 7. @defer para comentarios

**Decisión**: Los comentarios en el detalle de un post se cargan de forma lazy con `@defer`.  
**Razón**: No bloquear el render del detalle del post. Los comentarios solo se solicitan cuando el usuario scrollea hasta ellos (o al ser visibles en viewport).

```html
<!-- post-detail-page.component.html -->
@defer (on viewport) {
  <app-post-comments [postId]="postId()" />
} @placeholder {
  <div class="h-32 animate-pulse bg-gray-200 rounded"></div>
} @loading (minimum 300ms) {
  <app-loading />
}
```

### 8. Transloco para i18n

**Decisión**: Usar Transloco sobre `ngx-translate`.  
**Razón**: API más moderna, mejor soporte para lazy loading de traducciones, tipado más robusto, y mejor mantenimiento activo.

### 9. Autenticación mock con interceptor

**Decisión**: Login contra `json-server` buscando por `name` + `password`. Token estático en `localStorage`.  
**Flujo**:
1. `POST` simulado → `GET /users?name=X&password=Y`
2. Si existe → generar token base64 → guardar en `localStorage`
3. `authInterceptor` añade `Authorization: Bearer <token>` a cada request
4. `authGuard` verifica existencia de token y redirige a `/login` si no existe

### 10. Ownership — editar/borrar solo lo propio

**Decisión**: Doble protección UI + guard.
- **UI**: No mostrar botones de editar/borrar si `post.userId !== currentUser.id`.
- **Guard** (`postOwnerGuard`): En la ruta `/posts/:id/edit`, verificar ownership antes de permitir acceso. Si no es propietario → redirigir y mostrar estado `forbidden`.

### 11. Query params para filtros y paginación

**Decisión**: Sincronizar estado de filtros con la URL via `queryParams`.  
**Razón**: Permite compartir URLs con filtros aplicados, navegación atrás/adelante consistente, y bookmarking.

```
/posts?page=2&q=angular&author=alice&tag=signals
```

### 12. Testing strategy

| Nivel | Herramienta | Alcance |
|-------|-------------|---------|
| Unit | Vitest + Testing Library | Services, guards, interceptors, componentes presentacionales |
| Integration | Vitest + Testing Library | Componentes container con mocks de servicios |
| E2E | Playwright | Flujo completo: login → CRUD posts → comments → logout |

---

## Routing Map

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'posts',
    canActivate: [authGuard],
    loadChildren: () => import('./features/posts/posts.routes').then(m => m.POSTS_ROUTES),
  },
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: '**', redirectTo: 'posts' },
];

// features/auth/auth.routes.ts
export const AUTH_ROUTES: Routes = [
  { path: '', component: LoginPageComponent },
];

// features/posts/posts.routes.ts
export const POSTS_ROUTES: Routes = [
  { path: '', component: PostListPageComponent },
  { path: 'new', component: PostFormPageComponent },
  { path: ':id', component: PostDetailPageComponent },
  { path: ':id/edit', component: PostFormPageComponent, canActivate: [postOwnerGuard] },
];
```

---

## API Endpoints (json-server)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users?name=X&password=Y` | Login (búsqueda de usuario) |
| GET | `/posts?_page=N&_per_page=M` | Listar posts paginados |
| GET | `/posts?q=texto` | Buscar posts por texto |
| GET | `/posts?userId=N` | Filtrar posts por autor |
| GET | `/posts?tags_like=tag` | Filtrar posts por etiqueta |
| GET | `/posts/:id` | Detalle de un post |
| POST | `/posts` | Crear post |
| PUT | `/posts/:id` | Actualizar post |
| DELETE | `/posts/:id` | Eliminar post |
| GET | `/comments?postId=N&_page=P&_per_page=M` | Comentarios de un post (paginados) |
| POST | `/comments` | Crear comentario |
| PUT | `/comments/:id` | Actualizar comentario |
| DELETE | `/comments/:id` | Eliminar comentario |
| GET | `/users` | Listar usuarios (para filtro de autor) |

---

## Flujo de estados en UI

```
            ┌──────────┐
            │  IDLE     │
            └────┬─────┘
                 │ trigger request
            ┌────▼─────┐
            │ LOADING   │──────────────┐
            └────┬─────┘              │
                 │                    │
          ┌──────┴──────┐      ┌─────▼─────┐
          │  SUCCESS    │      │   ERROR    │
          └──────┬──────┘      └───────────┘
                 │                    │
          ┌──────┴──────┐            │ retry
          │ data.length │            │
          ├─────────────┤      ┌─────┴─────┐
          │  > 0  │ = 0 │      │  trigger   │
          │       │     │      └───────────┘
          │  DATA │EMPTY│
          └───────┴─────┘
```

Cada `httpResource` expone `.value()`, `.isLoading()`, `.error()` que se mapean directamente a estos estados con `@if` / `@else`.

---

## Dependencias principales

> Gestión de paquetes con **pnpm 10**. Lockfile: `pnpm-lock.yaml`.  
> Instalar: `pnpm install` · Ejecutar scripts: `pnpm <script>`

```json
{
  "packageManager": "pnpm@10.8.1",
  "engines": {
    "node": ">=24.14.1",
    "pnpm": ">=10.0.0"
  }
}
```

### Runtime
{
  "@angular/core": "^21.0.0",
  "@angular/router": "^21.0.0",
  "@angular/common": "^21.0.0",
  "@angular/forms": "^21.0.0",
  "@angular/platform-browser": "^21.0.0",
  "@jsverse/transloco": "^7.x",
  "tailwindcss": "^4.x",
  "json-server": "^1.0.0-beta.x"
}
```

### Dev dependencies
```json
{
  "@nx/angular": "^21.x",
  "@angular-eslint/eslint-plugin": "^19.x",
  "eslint": "^9.x",
  "prettier": "^3.x",
  "vitest": "^3.x",
  "@testing-library/angular": "^17.x",
  "@playwright/test": "^1.x",
  "husky": "^9.x",
  "lint-staged": "^15.x",
  "@commitlint/cli": "^19.x",
  "@commitlint/config-conventional": "^19.x",
  "concurrently": "^9.x"
}
```

---

## Responsive & Mobile First

- **TailwindCSS 4**: utilidades mobile-first (`sm:`, `md:`, `lg:`, `xl:`).
- Breakpoints clave:
  - **Mobile** (default, < 640px): lista de posts en una columna, navegación tipo hamburger.
  - **Tablet** (`sm`, 640px+): grid 2 columnas para posts.
  - **Desktop** (`lg`, 1024px+): grid 3 columnas, sidebar de filtros visible.
- El header incluye: logo, selector de idioma, nombre de usuario, botón de logout.
- En mobile: menú colapsable con hamburger icon.

---

## Checklist de implementación

- [ ] Configurar Node 24.14.1 (.nvmrc, .node-version) + pnpm 10 (packageManager)
- [ ] Inicializar Nx workspace con Angular 21 (`pnpm dlx create-nx-workspace`)
- [ ] Configurar zoneless + standalone
- [ ] Configurar TailwindCSS 4
- [ ] Configurar Transloco (es + en)
- [ ] Configurar ESLint + Prettier
- [ ] Configurar Husky + lint-staged + commitlint
- [ ] Configurar Vitest + Testing Library
- [ ] Configurar Playwright
- [ ] Implementar core/auth (service, guard, interceptor)
- [ ] Implementar feature/auth/login
- [ ] Implementar shared/ui (loading, empty, error, forbidden, pagination)
- [ ] Implementar shared/layout (header, layout)
- [ ] Implementar feature/posts/models
- [ ] Implementar feature/posts/services
- [ ] Implementar feature/posts/post-list (page + presentacionales + filtros)
- [ ] Implementar feature/posts/post-detail (page + presentacionales + @defer comments)
- [ ] Implementar feature/posts/post-form (new + edit)
- [ ] Implementar feature/posts/guards (post-owner)
- [ ] Implementar CRUD comments
- [ ] Implementar query params sync para filtros
- [ ] Tests unitarios
- [ ] Tests e2e (Playwright)
- [ ] Revisión responsive
- [ ] Revisión i18n completa
- [ ] README final con instrucciones

