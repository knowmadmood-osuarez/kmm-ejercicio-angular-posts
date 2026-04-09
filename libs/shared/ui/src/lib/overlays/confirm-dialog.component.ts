import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-confirm-dialog',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        (click)="onBackdropClick($event)"
        (keydown.escape)="cancelled.emit()"
        (keydown.tab)="trapFocus($any($event))"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title() | transloco"
      >
        <!-- Dialog panel -->
        <div
          #dialogPanel
          class="mx-4 w-full max-w-md rounded-lg bg-card p-8 shadow-card"
          tabindex="-1"
        >
          <h2 class="text-xl font-bold tracking-tight text-text">
            {{ title() | transloco }}
          </h2>

          <p class="mt-3 text-base leading-relaxed text-text-secondary">
            {{ message() | transloco }}
          </p>

          <div class="mt-8 flex items-center justify-end gap-3">
            <button
              #cancelBtn
              type="button"
              class="rounded-lg px-5 py-2.5 text-sm font-bold text-text-secondary transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/30"
              (click)="cancelled.emit()"
            >
              {{ 'shared.cancel' | transloco }}
            </button>

            <button
              #confirmBtn
              type="button"
              class="rounded-lg bg-danger px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-danger/50 focus:ring-offset-2"
              (click)="confirmed.emit()"
            >
              {{ 'shared.confirm' | transloco }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('shared.confirm');
  readonly message = input('');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly cancelBtn = viewChild<ElementRef<HTMLButtonElement>>('cancelBtn');
  private readonly confirmBtn = viewChild<ElementRef<HTMLButtonElement>>('confirmBtn');

  constructor() {
    // Focus the cancel button when opened (first focusable element)
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => {
          this.cancelBtn()?.nativeElement?.focus();
        });
      }
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelled.emit();
    }
  }

  /** Trap focus within the dialog (cycle between cancel and confirm). */
  trapFocus(event: KeyboardEvent): void {
    const cancel = this.cancelBtn()?.nativeElement;
    const confirm = this.confirmBtn()?.nativeElement;
    if (!cancel || !confirm) return;

    const focusableElements = [cancel, confirm];
    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    }
  }
}
