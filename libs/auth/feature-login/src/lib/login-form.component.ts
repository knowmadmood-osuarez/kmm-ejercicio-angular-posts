import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { form, required, submit } from '@angular/forms/signals';

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
  readonly error = input<Error | null>(null);

  readonly submitted = output<LoginCredentials>();

  readonly loginModel = signal<LoginModel>({ name: '', password: '' });

  readonly loginForm = form(this.loginModel, (schema) => {
    required(schema.name);
    required(schema.password);
  });

  onSubmit(event?: Event): void {
    event?.preventDefault();

    submit(this.loginForm, async () => {
      const { name, password } = this.loginModel();
      this.submitted.emit({ name: name.trim(), password });
    });
  }
}
