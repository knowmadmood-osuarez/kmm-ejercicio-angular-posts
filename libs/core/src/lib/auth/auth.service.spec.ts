import { ApplicationRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService, generateToken } from './auth.service';
import { API_URL } from '../http/api.config';
import { User } from './user.model';

const mockUser: User = {
  id: 1,
  name: 'alice',
  password: 'alice123',
  email: 'alice@example.com',
  avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
};

// ---------------------------------------------------------------------------
// Pure function tests
// ---------------------------------------------------------------------------
describe('generateToken', () => {
  it('returns a base64 string containing user id and name', () => {
    const token = generateToken(mockUser);
    const decoded = atob(token);
    expect(decoded).toMatch(/^1:alice:\d+$/);
  });
});

function setup(platform = 'browser') {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: PLATFORM_ID, useValue: platform },
      { provide: API_URL, useValue: 'http://localhost:3000' },
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
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_token', 'tok');
    const { service } = setup();
    expect(service.currentUser()).toEqual(mockUser);
    expect(service.token()).toBe('tok');
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
    expect(user).toEqual(mockUser);
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('auth_user')).toBeTruthy();

    const decoded = atob(service.token()!);
    expect(decoded).toMatch(/^1:alice:\d+$/);
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
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_token', 'tok');
    const { service, router } = setup();
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });

  it('ignores localStorage on server platform', () => {
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_token', 'tok');
    const { service } = setup('server');
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
