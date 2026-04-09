import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

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

  name = '';
  password = '';

  isValid(): boolean {
    return this.name.trim().length > 0 && this.password.trim().length > 0;
  }

  onSubmit(event?: Event): void {
    event?.preventDefault();
    if (!this.isValid()) return;
    this.submitted.emit({ name: this.name.trim(), password: this.password });
  }
}
