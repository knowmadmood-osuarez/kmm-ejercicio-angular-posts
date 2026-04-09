import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { authInterceptor } from './auth.interceptor';
import { API_URL } from '../http/api.config';

const STORAGE_USER_KEY = 'auth_user';
const STORAGE_TOKEN_KEY = 'auth_token';

const mockUser = {
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
    localStorage.setItem(STORAGE_TOKEN_KEY, 'test-token-123');
  }

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: API_URL, useValue: 'http://localhost:3000' },
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    httpTesting: TestBed.inject(HttpTestingController),
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
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    req.flush([]);
  });

  it('does NOT add Authorization header when not authenticated', () => {
    const { http, httpTesting } = setup({ authenticated: false });

    http.get('http://localhost:3000/posts').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/posts');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
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
    req.flush([mockUser]);
  });

  it('adds header to non-login requests to /users', () => {
    const { http, httpTesting } = setup({ authenticated: true });

    // GET /users without password param → should have auth header
    http.get('http://localhost:3000/users').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    req.flush([]);
  });
});
