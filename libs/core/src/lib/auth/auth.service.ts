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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_URL);
  private readonly platformId = inject(PLATFORM_ID);

  // ---------------------------------------------------------------------------
  // Login request signal — drives httpResource
  // ---------------------------------------------------------------------------
  private readonly _loginRequest = signal<LoginCredentials | undefined>(undefined);

  /** httpResource for login GET /users?name=X&password=Y */
  readonly loginResource: HttpResourceRef<User[] | undefined> = httpResource<User[]>(() => {
    const creds = this._loginRequest();
    if (!creds) {
      return undefined;
    }
    return {
      url: `${this.apiUrl}/users`,
      params: { name: creds.name, password: creds.password },
    };
  });

  // ---------------------------------------------------------------------------
  // Auth state signals
  // ---------------------------------------------------------------------------
  private readonly _currentUser = signal<User | null>(this.loadUserFromStorage());
  private readonly _token = signal<string | null>(this.loadTokenFromStorage());

  /** Readonly signal — current authenticated user (or null). */
  readonly currentUser = this._currentUser.asReadonly();

  /** Readonly signal — JWT-like static token (or null). */
  readonly token = this._token.asReadonly();

  /** Readonly computed — whether the user is authenticated. */
  readonly isAuthenticated = computed(() => this._currentUser() !== null && this._token() !== null);

  /** Computed — login resource is currently loading. */
  readonly loginLoading = computed(() => this.loginResource.isLoading());

  /** Computed — login resource error (if any). */
  readonly loginError = computed(() => this.loginResource.error());

  // ---------------------------------------------------------------------------
  // Login promise tracking (for imperative callers)
  // ---------------------------------------------------------------------------
  private _loginResolve: ((user: User) => void) | null = null;
  private _loginReject: ((error: Error) => void) | null = null;

  constructor() {
    // Effect that processes loginResource results
    effect(() => {
      const status = this.loginResource.status();

      if (status === 'error') {
        const error = this.loginResource.error();
        this._loginReject?.(error instanceof Error ? error : new Error('Login failed'));
        this.resetLoginTracking();
      } else if (status === 'resolved') {
        // Only read .value() when status is 'resolved' (safe, won't throw)
        const users = this.loginResource.value();
        if (users && users.length > 0) {
          const user = users[0];
          const token = btoa(`${user.id}:${user.name}:${Date.now()}`);

          this._currentUser.set(user);
          this._token.set(token);
          this.persistToStorage(user, token);

          this._loginResolve?.(user);
        } else if (users && users.length === 0) {
          this._loginReject?.(new Error('Invalid credentials'));
        }
        this.resetLoginTracking();
      }
    });
  }

  /**
   * Attempt login against json-server via httpResource: `GET /users?name=X&password=Y`.
   * On success persists token + user in localStorage and updates signals.
   * Returns a Promise<User> for imperative callers (e.g. login page).
   */
  login(name: string, password: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this._loginResolve = resolve;
      this._loginReject = reject;
      this._loginRequest.set({ name, password });
    });
  }

  /** Clear session and navigate to `/login`. */
  logout(): void {
    this._currentUser.set(null);
    this._token.set(null);
    this._loginRequest.set(undefined);
    this.clearStorage();
    void this.router.navigate(['/login']);
  }

  // ---------------------------------------------------------------------------
  // Private helpers — localStorage (browser only, SSR-safe)
  // ---------------------------------------------------------------------------

  private resetLoginTracking(): void {
    this._loginResolve = null;
    this._loginReject = null;
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadUserFromStorage(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private loadTokenFromStorage(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  }

  private persistToStorage(user: User, token: string): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
  }

  private clearStorage(): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  }
}
