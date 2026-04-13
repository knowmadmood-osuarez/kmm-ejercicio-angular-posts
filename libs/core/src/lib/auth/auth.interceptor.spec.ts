import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { authInterceptor } from './auth.interceptor';
import { API_URL } from '../http/api.config';
import type { SafeUser } from './user.model';

const STORAGE_TOKEN_KEY = 'auth_token';

const mockSafeUser: SafeUser = {
  id: '1',
  name: 'alice',
  email: 'alice@example.com',
  avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
};

function makeToken(user: SafeUser): string {
  return btoa(JSON.stringify({ ...user, iat: Date.now() }));
}

function setup(opts: { authenticated?: boolean } = {}) {
  localStorage.clear();

  if (opts.authenticated) {
    const token = makeToken(mockSafeUser);
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
  }

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
      provideRouter([{ path: 'login', children: [] }]),
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: API_URL, useValue: 'http://localhost:3000' },
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    httpTesting: TestBed.inject(HttpTestingController),
    router: TestBed.inject(Router),
  };
}

describe('authInterceptor', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('adds Authorization header when authenticated', () => {
    const { http, httpTesting } = setup({ authenticated: true });

    http.get('http://localhost:3000/posts').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/posts');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toMatch(/^Bearer /);
    req.flush([]);
  });

  it('redirects to /login and aborts request when not authenticated', () => {
    const { http, httpTesting, router } = setup({ authenticated: false });
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('http://localhost:3000/posts').subscribe();

    httpTesting.expectNone('http://localhost:3000/posts');
    expect(spy).toHaveBeenCalledWith(['/login']);
  });

  it('skips Authorization header for login requests', () => {
    const { http, httpTesting } = setup({ authenticated: true });

    http
      .get('http://localhost:3000/users', {
        params: { name: 'alice', password: 'alice123' },
      })
      .subscribe();

    const req = httpTesting.expectOne((r) => r.url === 'http://localhost:3000/users');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('allows login request through even when not authenticated', () => {
    const { http, httpTesting, router } = setup({ authenticated: false });
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http
      .get('http://localhost:3000/users', {
        params: { name: 'alice', password: 'alice123' },
      })
      .subscribe();

    const req = httpTesting.expectOne((r) => r.url === 'http://localhost:3000/users');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('adds header to non-login requests to /users', () => {
    const { http, httpTesting } = setup({ authenticated: true });

    http.get('http://localhost:3000/users').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/users');
    expect(req.request.headers.has('Authorization')).toBe(true);
    req.flush([]);
  });

  it('calls logout on 401 server response', () => {
    const { http, httpTesting } = setup({ authenticated: true });

    http.get('http://localhost:3000/posts').subscribe({ error: () => undefined });

    const req = httpTesting.expectOne('http://localhost:3000/posts');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
  });
});
