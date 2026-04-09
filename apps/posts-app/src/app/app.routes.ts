import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('@app/auth/feature-login').then((m) => m.AUTH_ROUTES),
  },
  // TODO: Uncomment routes as features are implemented
  // {
  //   path: 'posts',
  //   canActivate: [authGuard],
  //   children: [ ... ],
  // },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
