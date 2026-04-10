import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { form, required } from '@angular/forms/signals';

import {
  ButtonComponent,
  IconComponent,
  InputComponent,
  LabelComponent,
  LinearProgressComponent,
} from '@app/shared/ui';

export interface LoginCredentials {
  name: string;
  password: string;
}

interface LoginModel {
  name: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  imports: [
    TranslocoPipe,
    ButtonComponent,
    IconComponent,
    InputComponent,
    LabelComponent,
    LinearProgressComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-form.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class LoginFormComponent {
  readonly loading = input(false);
  readonly error = input<unknown>(null);

  readonly submitted = output<LoginCredentials>();

  readonly loginModel = signal<LoginModel>({ name: '', password: '' });

  readonly loginForm = form(this.loginModel, (schema) => {
    required(schema.name);
    required(schema.password);
  });

  readonly isValid = computed(
    () => this.loginForm.name().valid() && this.loginForm.password().valid(),
  );

  onSubmit(event?: Event): void {
    event?.preventDefault();
    if (!this.isValid()) return;
    const { name, password } = this.loginModel();
    this.submitted.emit({ name: name.trim(), password });
  }
}
