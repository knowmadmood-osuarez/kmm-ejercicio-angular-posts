import { Routes } from '@angular/router';
import { authGuard } from '@app/core';
import { LayoutComponent } from '@app/shared/ui';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('@app/auth/feature-login').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'posts',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@app/posts/feature-list').then((m) => m.LIST_ROUTES),
      },
      {
        path: 'new',
        loadChildren: () => import('@app/posts/feature-form').then((m) => m.FORM_ROUTES),
      },
      {
        path: ':id/edit',
        loadChildren: () => import('@app/posts/feature-form').then((m) => m.FORM_ROUTES),
      },
      {
        path: ':id',
        loadChildren: () => import('@app/posts/feature-detail').then((m) => m.DETAIL_ROUTES),
      },
    ],
  },
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: '**', redirectTo: 'posts' },
];
