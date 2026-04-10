import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Router } from '@angular/router';

import { API_URL } from '../http/api.config';
import { SafeUser, User } from './user.model';

const STORAGE_TOKEN_KEY = 'auth_token';

interface LoginCredentials {
  name: string;
  password: string;
}

interface TokenPayload extends SafeUser {
  iat: number;
}

export function generateToken(user: SafeUser): string {
  const payload: TokenPayload = { ...user, iat: Date.now() };
  return btoa(JSON.stringify(payload));
}

function parseToken(token: string): SafeUser | null {
  try {
    const payload = JSON.parse(atob(token)) as TokenPayload;
    const { iat: _iat, ...user } = payload;
    return user;
  } catch {
    return null;
  }
}

function loadTokenFromStorage(isBrowser: boolean): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

function persistToken(token: string, isBrowser: boolean): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
}

function clearStorage(isBrowser: boolean): void {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_TOKEN_KEY);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_URL);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _loginRequest = signal<LoginCredentials | undefined>(undefined);

  readonly loginResource: HttpResourceRef<User[] | undefined> = httpResource<User[]>(() => {
    const creds = this._loginRequest();
    if (!creds) return undefined;
    return {
      url: `${this.apiUrl}/users`,
      params: { name: creds.name, password: creds.password },
    };
  });

  private readonly _token = signal<string | null>(loadTokenFromStorage(this.isBrowser));

  readonly token = this._token.asReadonly();
  readonly currentUser = computed<SafeUser | null>(() => {
    const t = this._token();
    return t ? parseToken(t) : null;
  });
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  private _loginResolve: ((user: SafeUser) => void) | null = null;
  private _loginReject: ((error: Error) => void) | null = null;

  constructor() {
    effect(() => this.handleLoginResult());
  }

  login(name: string, password: string): Promise<SafeUser> {
    return new Promise<SafeUser>((resolve, reject) => {
      this._loginResolve = resolve;
      this._loginReject = reject;
      this._loginRequest.set({ name, password });
    });
  }

  logout(): void {
    this._token.set(null);
    this._loginRequest.set(undefined);
    clearStorage(this.isBrowser);
    void this.router.navigate(['/login']);
  }

  private handleLoginResult(): void {
    const status = this.loginResource.status();

    if (status === 'error') {
      const error = this.loginResource.error();
      this._loginReject?.(error instanceof Error ? error : new Error('Login failed'));
      this.resetLoginTracking();
      return;
    }

    if (status !== 'resolved') return;

    const users = this.loginResource.value();
    if (users && users.length > 0) {
      const { password: _pwd, ...safeUser } = users[0];
      const token = generateToken(safeUser);
      this._token.set(token);
      persistToken(token, this.isBrowser);
      this._loginResolve?.(safeUser);
    } else if (users && users.length === 0) {
      this._loginReject?.(new Error('Invalid credentials'));
    }
    this.resetLoginTracking();
  }

  private resetLoginTracking(): void {
    this._loginResolve = null;
    this._loginReject = null;
  }
}
