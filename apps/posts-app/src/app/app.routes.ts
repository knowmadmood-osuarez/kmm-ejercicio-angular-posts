import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  // TODO: Uncomment routes as features are implemented
  // {
  //   path: 'login',
  //   loadChildren: () =>
  //     import('@app/auth/feature-login').then((m) => m.AUTH_ROUTES),
  // },
  // {
  //   path: 'posts',
  //   canActivate: [authGuard],
  //   children: [ ... ],
  // },
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: '**', redirectTo: 'posts' },
];
