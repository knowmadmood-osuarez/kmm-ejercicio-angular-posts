import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Router } from '@angular/router';

import { API_URL } from '../http/api.config';
import { User } from './user.model';

const STORAGE_USER_KEY = 'auth_user';
const STORAGE_TOKEN_KEY = 'auth_token';

interface LoginCredentials {
  name: string;
  password: string;
}

export function generateToken(user: User): string {
  return btoa(`${user.id}:${user.name}:${Date.now()}`);
}

function loadUserFromStorage(isBrowser: boolean): User | null {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function loadTokenFromStorage(isBrowser: boolean): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

function persistToStorage(user: User, token: string, isBrowser: boolean): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
}

function clearStorage(isBrowser: boolean): void {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_USER_KEY);
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

  private readonly _currentUser = signal<User | null>(loadUserFromStorage(this.isBrowser));
  private readonly _token = signal<string | null>(loadTokenFromStorage(this.isBrowser));

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null && this._token() !== null);

  private _loginResolve: ((user: User) => void) | null = null;
  private _loginReject: ((error: Error) => void) | null = null;

  constructor() {
    effect(() => this.handleLoginResult());
  }

  login(name: string, password: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this._loginResolve = resolve;
      this._loginReject = reject;
      this._loginRequest.set({ name, password });
    });
  }

  logout(): void {
    this._currentUser.set(null);
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
      const user = users[0];
      const token = generateToken(user);
      this._currentUser.set(user);
      this._token.set(token);
      persistToStorage(user, token, this.isBrowser);
      this._loginResolve?.(user);
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
