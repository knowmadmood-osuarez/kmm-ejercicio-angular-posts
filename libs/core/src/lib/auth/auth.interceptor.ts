import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

/**
 * Functional interceptor that adds `Authorization: Bearer <token>` header
 * to every outgoing request except login-related calls.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip auth header for login requests (GET /users?name=…&password=…)
  const isLoginRequest = req.url.includes('/users') && req.params.has('password');
  if (isLoginRequest) {
    return next(req);
  }

  const token = authService.token();
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
