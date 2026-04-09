import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent } from '../icons/icon.component';

@Component({
  selector: 'app-error-state',
  imports: [TranslocoPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col items-center justify-center py-16 px-4 text-center"
      role="alert"
      aria-live="polite"
    >
      <app-icon name="error-circle" class="mb-6 h-20 w-20 text-danger" />

      <h3 class="text-lg font-bold tracking-tight text-text">
        {{ message() | transloco }}
      </h3>

      <button
        type="button"
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-gradient px-6 py-3 text-sm font-bold text-white shadow-primary transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        (click)="retry.emit()"
        [attr.aria-label]="'shared.retry' | transloco"
      >
        <app-icon name="retry" class="h-4 w-4" />
        {{ 'shared.retry' | transloco }}
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  /** Error message key for Transloco */
  readonly message = input('shared.error');

  /** Emits when retry is clicked */
  readonly retry = output<void>();
}
