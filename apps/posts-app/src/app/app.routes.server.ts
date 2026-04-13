import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    /**
     * All routes use Server-Side Rendering.
     *
     * Auth session persistence works on the server because the auth token
     * is stored as a browser cookie (see AuthService). During SSR, Angular 21
     * provides the incoming `Request` via the `REQUEST` injection token
     * from `@angular/core`, allowing `AuthService` to read the cookie from
     * the `Cookie` header and restore the user session before guards run.
     */
    path: '**',
    renderMode: RenderMode.Server,
  },
];
