import { ApplicationRef, PLATFORM_ID, REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService, generateToken } from './auth.service';
import { API_URL } from '../http/api.config';
import { SafeUser, User } from './user.model';

const mockUser: User = {
  id: '1',
  name: 'alice',
  password: 'alice123',
  email: 'alice@example.com',
  avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
};

const mockSafeUser: SafeUser = {
  id: '1',
  name: 'alice',
  email: 'alice@example.com',
  avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
};

function makeToken(user: SafeUser): string {
  const payload = { ...user, iat: Date.now() };
  return btoa(JSON.stringify(payload));
}

// ---------------------------------------------------------------------------
// Pure function tests
// ---------------------------------------------------------------------------
describe('generateToken', () => {
  it('returns a base64 JSON token with user fields and iat', () => {
    const token = generateToken(mockSafeUser);
    const decoded = JSON.parse(atob(token)) as { id: string; name: string; iat: number };
    expect(decoded.id).toBe('1');
    expect(decoded.name).toBe('alice');
    expect(typeof decoded.iat).toBe('number');
  });
});

function setup(platform = 'browser', request: Request | null = null) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: PLATFORM_ID, useValue: platform },
      { provide: API_URL, useValue: 'http://localhost:3000' },
      { provide: REQUEST, useValue: request },
    ],
  });
  return {
    service: TestBed.inject(AuthService),
    httpTesting: TestBed.inject(HttpTestingController),
    router: TestBed.inject(Router),
    appRef: TestBed.inject(ApplicationRef),
  };
}

describe('AuthService', () => {
  afterEach(() => localStorage.clear());

  it('starts unauthenticated', () => {
    localStorage.clear();
    const { service } = setup();
    expect(service.currentUser()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('restores session from localStorage', () => {
    const token = makeToken(mockSafeUser);
    localStorage.setItem('auth_token', token);
    const { service } = setup();
    expect(service.currentUser()).toEqual(mockSafeUser);
    expect(service.token()).toBe(token);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('login success: sets user, token, localStorage', async () => {
    localStorage.clear();
    const { service, httpTesting, appRef } = setup();

    const promise = service.login('alice', 'alice123');
    appRef.tick();

    const req = httpTesting.expectOne((r) => r.url === 'http://localhost:3000/users');
    expect(req.request.params.get('name')).toBe('alice');
    expect(req.request.params.get('password')).toBe('alice123');
    req.flush([mockUser]);
    appRef.tick();

    const user = await promise;
    expect(user).toEqual(mockSafeUser);
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('auth_token')).toBeTruthy();

    const tokenDecoded = JSON.parse(atob(service.token()!)) as { id: string; name: string };
    expect(tokenDecoded.id).toBe('1');
    expect(tokenDecoded.name).toBe('alice');
  });

  it('login with empty result rejects', async () => {
    localStorage.clear();
    const { service, httpTesting, appRef } = setup();

    const promise = service.login('alice', 'wrong');
    appRef.tick();

    httpTesting.expectOne((r) => r.url === 'http://localhost:3000/users').flush([]);
    appRef.tick();

    await expect(promise).rejects.toThrow('Invalid credentials');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('login with server error rejects', async () => {
    localStorage.clear();
    const { service, httpTesting, appRef } = setup();

    const promise = service.login('alice', 'alice123');
    appRef.tick();

    httpTesting
      .expectOne((r) => r.url === 'http://localhost:3000/users')
      .flush('fail', { status: 500, statusText: 'Error' });
    appRef.tick();

    await expect(promise).rejects.toThrow();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('logout clears state and navigates', async () => {
    const token = makeToken(mockSafeUser);
    localStorage.setItem('auth_token', token);
    const { service, router } = setup();
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });

  it('ignores localStorage on server platform without cookie', () => {
    const token = makeToken(mockSafeUser);
    localStorage.setItem('auth_token', token);
    const { service } = setup('server');
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('restores session from request cookie on server platform', () => {
    const token = makeToken(mockSafeUser);
    const request = new Request('http://localhost:4000/posts', {
      headers: { cookie: `auth_token=${encodeURIComponent(token)}` },
    });
    const { service } = setup('server', request);
    expect(service.currentUser()).toEqual(mockSafeUser);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('returns null user when token in localStorage is invalid base64', () => {
    localStorage.setItem('auth_token', '%%%invalid%%%');
    const { service } = setup();
    expect(service.currentUser()).toBeNull();
  });

  it('returns null on server when request has no cookie header', () => {
    const request = new Request('http://localhost:4000/posts');
    const { service } = setup('server', request);
    expect(service.currentUser()).toBeNull();
  });

  it('returns null on server when cookie header has no auth_token', () => {
    const request = new Request('http://localhost:4000/posts', {
      headers: { cookie: 'other_cookie=value' },
    });
    const { service } = setup('server', request);
    expect(service.currentUser()).toBeNull();
  });
});
