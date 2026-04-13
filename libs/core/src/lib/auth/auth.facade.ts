import { computed, effect, inject, Injectable, isDevMode, Signal } from '@angular/core';

import { AuthService } from './auth.service';
import type { User } from './user.model';

/**
 * Facade that centralizes auth state as readonly signals.
 * Components should inject this instead of AuthService directly.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authService = inject(AuthService);

  /** Readonly signal with the current authenticated user, or null. */
  readonly currentUser: Signal<User | null> = this.authService.currentUser;

  /** Readonly signal with the current auth token, or null. */
  readonly token: Signal<string | null> = this.authService.token;
  /** User id as string for quick comparisons. */
  readonly userId: Signal<string | null> = computed(() => {
    const user = this.currentUser();
    return user ? String(user.id) : null;
  });

  constructor() {
    if (isDevMode()) {
      effect(() => {
        const user = this.currentUser();
        const action = user ? `authenticated as "${user.name}"` : 'logged out';
        console.debug(`[AuthFacade] ${action}`);
      });
    }
  }

  login(name: string, password: string): Promise<User> {
    return this.authService.login(name, password);
  }

  logout(): void {
    this.authService.logout();
  }
}
