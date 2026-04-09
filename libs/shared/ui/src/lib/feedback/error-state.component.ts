import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-error-state',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col items-center justify-center py-16 px-4 text-center"
      role="alert"
      aria-live="polite"
    >
      <!-- Error icon -->
      <svg class="mb-6 h-20 w-20 text-danger" fill="none" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r="32" stroke="currentColor" stroke-width="2.5" fill="none" />
        <path d="M40 26v18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="40" cy="52" r="2" fill="currentColor" />
      </svg>

      <h3 class="text-lg font-bold tracking-tight text-text">
        {{ message() | transloco }}
      </h3>

      <button
        type="button"
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-gradient px-6 py-3 text-sm font-bold text-white shadow-primary transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        (click)="retry.emit()"
        [attr.aria-label]="'shared.retry' | transloco"
      >
        <!-- Retry icon -->
        <svg class="h-4 w-4" fill="none" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M2 8a6 6 0 0 1 10.3-4.1L14 2v4h-4l1.7-1.7A4.5 4.5 0 1 0 12.5 8h1.5A6 6 0 0 1 2 8z"
            fill="currentColor"
          />
        </svg>
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
