import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideRouter,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { authGuard } from './auth.guard';
import { API_URL } from '../http/api.config';
import { User } from './user.model';

const STORAGE_USER_KEY = 'auth_user';
const STORAGE_TOKEN_KEY = 'auth_token';

const mockUser: User = {
  id: 1,
  name: 'alice',
  password: 'alice123',
  email: 'alice@example.com',
  avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
};

function setup(opts: { authenticated?: boolean } = {}) {
  localStorage.clear();

  if (opts.authenticated) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(mockUser));
    localStorage.setItem(STORAGE_TOKEN_KEY, 'test-token');
  }

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: API_URL, useValue: 'http://localhost:3000' },
    ],
  });

  return {
    router: TestBed.inject(Router),
  };
}

const dummyRoute = {} as ActivatedRouteSnapshot;
const dummyState = { url: '/posts' } as RouterStateSnapshot;

describe('authGuard', () => {
  afterEach(() => localStorage.clear());

  it('allows access when authenticated', () => {
    setup({ authenticated: true });

    const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));

    expect(result).toBe(true);
  });

  it('redirects to /login when not authenticated', () => {
    const { router } = setup({ authenticated: false });
    const spy = vi.spyOn(router, 'createUrlTree');

    const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));

    expect(spy).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
