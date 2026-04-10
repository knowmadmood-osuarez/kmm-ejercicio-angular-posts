# System Prompt & Development Guidelines — Angular 21 Posts App

## 🎯 1. Core Directives (Absolute Rules)
As an AI assistant, you MUST STRICTLY adhere to these rules when generating or modifying code for this project. **There are no exceptions.**

* **Modern Angular 21:** EXCLUSIVELY use new APIs. USE `input()`, `output()`, `viewChild()`, `model()`, `@defer`, `@if`, `@for`. NEVER USE `@Input()`, `@Output()`, `@ViewChild()`, `*ngIf`, `*ngFor`.
* **State Management (Signals):** All reactive state must use Signals (`signal`, `computed`, `effect`, `linkedSignal`). Minimize RxJS usage (`subscribe()`).
* **HTTP Communications:** Use `httpResource` (experimental) for all GET requests. Use classic `HttpClient` only for mutations (POST, PUT, DELETE).
* **Zoneless & Standalone:** The project operates WITHOUT `zone.js` (`provideZonelessChangeDetection()`). All components are `standalone: true`. Using `NgModule` is strictly forbidden.
* **Forms:** Use **Signal Forms** exclusively. Classic `FormGroup`, `FormControl`, or `FormBuilder` are strictly forbidden.
* **Strict Typing:** The use of `any` is forbidden. Everything must be strongly typed with interfaces or types.
* **KISS & Pure Functions:** Keep code simple. Avoid over-engineering. Use pure functions for data transformation (outside the component class if possible). Apply Early Returns (Bouncer pattern).
* **Size Limits:** If a file is going to exceed 150 lines of code, split it logically before continuing.

---

## 🏗️ 2. Context & Tech Stack
Single Page Application for managing posts and comments. Mobile First design with TailwindCSS.

* **Environment:** Node.js 24.14.1 LTS | pnpm 10.x
* **Framework:** Angular 21 | Nx Monorepo (Integrated)
* **UI/Styles:** TailwindCSS 4 | i18n with Transloco (`en`, `es`)
* **Testing:** Vitest + Testing Library (Unit) | Playwright (e2e)
* **Backend:** Mock with `json-server` (`db.json`)

---

## 📐 3. Architecture & Structure (Screaming Architecture)
The project uses an Nx monorepo. Strictly respect module boundaries:

```text
apps/posts-app/               # App Shell: bootstrap (main.ts), global routing, layout.
apps/api/                     # Mock backend (json-server with db.json).

libs/
 ├─ core/                     # type:util - Auth, Guards, HTTP Interceptors.
 ├─ shared/ui/                # type:ui - Design System (Dumb components. DO NOT MODIFY).
 ├─ auth/feature-login/       # type:feature - Login pages and flows.
 ├─ posts/data-access/        # type:data-access - Services (Posts/Comments), Models, Domain Guards.
 ├─ posts/feature-list/       # type:feature - Post list, filters.
 ├─ posts/feature-detail/     # type:feature - Post detail, comments (@defer).
 └─ posts/feature-form/       # type:feature - Post creation and edition.
```

**Import Rules (Import Aliases):**
* A `feature` can ONLY import from `data-access`, `ui`, or `core`.
* A `feature` can NEVER import another `feature`.
* Always use aliases: `@app/core`, `@app/shared/ui`, `@app/posts/data-access`, etc.

**Feature Component Structure:**
* **Container (Page):** Injects services, manages state with signals, passes data down.
* **Presentational:** Receives `input()`, emits `output()`. Zero service injections.
* **Files:** `my-component.ts` (logic) + `my-component.html` (mandatory separated template) + `.css` (if applicable). (Note: `shared/ui` uses inline templates, but you must not modify them).

---

## 🗄️ 4. Data Model & Mock API (db.json)

```typescript
interface User {
  id: number;
  name: string;       // Used as username for login
  password: string;   // Plain text mock
  email: string;
  avatar: string;     // External URL (e.g., dicebear)
}

interface Post {
  id: number;
  userId: number;     // FK -> User
  title: string;
  body: string;
  tags: string[];
  createdAt: string;  // ISO 8601
}

interface Comment {
  id: number;
  postId: number;     // FK -> Post
  userId: number;     // FK -> User
  body: string;
  createdAt: string;  // ISO 8601
}
```

* **Mock Login:** GET `/users?name={user}&password={pass}`. Valid credentials: `alice/alice123`, `bruno/bruno123`, `carla/carla123`, `diego/diego123`.
* **Auth:** Generate a static base64 token (`btoa`). Persist in `localStorage`. Use a functional `authInterceptor` to send `Authorization: Bearer <token>`.

---

## 🚦 5. Routing & UI States

**Routes:**
* `/login` (Public)
* `/posts` (Protected - `authGuard`)
* `/posts/new` (Protected)
* `/posts/:id` (Protected)
* `/posts/:id/edit` (Protected + `postOwnerGuard`)

**Mandatory View States:**
When generating code for a page, ALWAYS explicitly handle these 4 states using `@if` / `@switch` / `@defer`:
1. **Loading:** Skeletons or spinners.
2. **Empty:** Illustrated message if there is no data.
3. **Error:** Clear error message with a retry button.
4. **Forbidden:** Lack of permissions (e.g., editing someone else's post).

---

## 🛠️ 6. Workflow & Quality

* **Documentation:** ONLY comment the public API of complex utilities using TSDoc. Code must be self-explanatory. Avoid obvious comments inside functions.
* **Internationalization:** Do not hardcode strings. Use Transloco keys (e.g., `{{ 'POSTS.TITLE' | transloco }}`).
* **Scripts (ALWAYS pnpm):** `pnpm start`, `pnpm start:api`, `pnpm test`, `pnpm build`.
* **Commits:** Follow strict Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.).
```