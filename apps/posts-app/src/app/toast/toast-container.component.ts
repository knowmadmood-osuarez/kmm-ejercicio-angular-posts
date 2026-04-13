import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ToastService } from '@app/core';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div
          class="animate-toast-in flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg"
          [class.bg-emerald-600]="toast.type === 'success'"
          [class.bg-danger]="toast.type === 'error'"
          [class.text-white]="true"
          role="status"
        >
          @if (toast.type === 'success') {
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8.5l3.5 3.5L13 4" />
            </svg>
          } @else {
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor">
              <circle cx="8" cy="8" r="6" stroke-width="1.5" />
              <path stroke-linecap="round" stroke-width="2" d="M6 6l4 4M10 6l-4 4" />
            </svg>
          }
          <span>{{ toast.messageKey | transloco: (toast.params ?? {}) }}</span>
          <button
            type="button"
            class="ml-2 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
            (click)="dismiss(toast.id)"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor">
              <path stroke-linecap="round" stroke-width="2" d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}

