import { Routes } from '@angular/router';
import { authGuard } from '@app/core';
import { AppLayoutComponent } from './layout/app-layout.component';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('@app/auth/feature-login').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'posts',
    canActivate: [authGuard],
    component: AppLayoutComponent,
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
        loadChildren: () => import('@app/posts/feature-form').then((m) => m.EDIT_FORM_ROUTES),
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
