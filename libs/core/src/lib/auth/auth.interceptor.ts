import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, tap } from 'rxjs';

import { AuthService } from './auth.service';

function isPublicRequest(url: string, hasPassword: boolean): boolean {
  if (hasPassword && url.includes('/users')) return true;
  return url.includes('/assets/');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (isPublicRequest(req.url, req.params.has('password'))) {
    return next(req);
  }

  const token = authService.token();

  if (!token) {
    void router.navigate(['/login']);
    return EMPTY;
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(cloned).pipe(
    tap({
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          authService.logout();
        }
      },
    }),
  );
};
