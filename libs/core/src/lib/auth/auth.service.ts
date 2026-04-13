import { computed, effect, inject, Injectable, PLATFORM_ID, REQUEST, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Router } from '@angular/router';

import { API_URL } from '../http/api.config';
import { User } from './user.model';
import {
  clearStorage,
  generateToken,
  loadTokenFromBrowser,
  loadTokenFromRequest,
  parseToken,
  persistToken,
} from './auth-storage';

export { generateToken } from './auth-storage';

interface LoginCredentials {
  name: string;
  password: string;
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
  readonly currentUser = computed<User | null>(() => {
    const t = this._token();
    return t ? parseToken(t) : null;
  });
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

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
    if (status === 'error') return this.rejectLogin(this.loginResource.error());
    if (status !== 'resolved') return;

    const users = this.loginResource.value();
    if (!users?.length) return this.rejectLogin(new Error('Invalid credentials'));

    this.completeLogin({ ...users[0], id: String(users[0].id) });
  }

  private completeLogin(user: User): void {
    const token = generateToken(user);
    this._token.set(token);
    if (this.isBrowser) persistToken(token);
    this._loginResolve?.(user);
    this.resetLoginTracking();
  }

  private rejectLogin(error: unknown): void {
    this._loginReject?.(error instanceof Error ? error : new Error('Login failed'));
    this.resetLoginTracking();
  }

  private resetLoginTracking(): void {
    this._loginResolve = null;
    this._loginReject = null;
  }
}
