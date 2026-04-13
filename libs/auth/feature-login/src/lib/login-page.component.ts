import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthFacade } from '@app/core';
import { LanguageSwitcherComponent } from '@app/shared/ui';

import { LoginFormComponent, type LoginCredentials } from './login-form.component';

@Component({
  selector: 'app-login-page',
  imports: [TranslocoPipe, LanguageSwitcherComponent, LoginFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class LoginPageComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<Error | null>(null);

  async onLogin(credentials: LoginCredentials): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authFacade.login(credentials.name, credentials.password);
      await this.router.navigate(['/posts']);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err : new Error('Login failed'));
    } finally {
      this.loading.set(false);
    }
  }
}
