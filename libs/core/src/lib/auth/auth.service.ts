import { computed, effect, inject, Injectable, PLATFORM_ID, REQUEST, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Router } from '@angular/router';

import { API_URL } from '../http/api.config';
import { SafeUser, User } from './user.model';

const STORAGE_TOKEN_KEY = 'auth_token';
/** 7 days in seconds — keeps the cookie alive across browser restarts. */
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

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
    return { ...user, id: String(user.id) };
  } catch {
    return null;
  }
}

/** Extracts a named cookie value from a `Cookie` header string. */
function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.substring(name.length + 1));
}

/** Browser: reads token from localStorage. */
function loadTokenFromBrowser(): string | null {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

/** Server: reads token from the incoming HTTP request cookie header. */
function loadTokenFromRequest(request: Request | null): string | null {
  if (!request) return null;
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  return parseCookie(cookieHeader, STORAGE_TOKEN_KEY);
}

function persistToken(token: string): void {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  document.cookie = `${STORAGE_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearStorage(): void {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  document.cookie = `${STORAGE_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_URL);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly request = inject(REQUEST, { optional: true });

  private readonly _loginRequest = signal<LoginCredentials | undefined>(undefined);

  readonly loginResource: HttpResourceRef<User[] | undefined> = httpResource<User[]>(() => {
    const creds = this._loginRequest();
    if (!creds) return undefined;
    return {
      url: `${this.apiUrl}/users`,
      params: { name: creds.name, password: creds.password },
    };
  });

  private readonly _token = signal<string | null>(this.loadInitialToken());

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
    if (this.isBrowser) clearStorage();
    void this.router.navigate(['/login']);
  }

  private loadInitialToken(): string | null {
    if (this.isBrowser) return loadTokenFromBrowser();
    return loadTokenFromRequest(this.request);
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
      const { password: _pwd, ...rawUser } = users[0];
      const safeUser: SafeUser = { ...rawUser, id: String(rawUser.id) };
      const token = generateToken(safeUser);
      this._token.set(token);
      if (this.isBrowser) persistToken(token);
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
