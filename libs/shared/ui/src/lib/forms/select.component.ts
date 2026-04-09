import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Select dropdown following the Figma filter dropdowns.
 *
 * Figma spec: bg-surface-alt (#F0F4F7), rounded, text-sm 500, text-text-secondary (#566166),
 * chevron icon right side.
 */
@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <select
        [id]="id()"
        [name]="name()"
        [disabled]="disabled()"
        [value]="value()"
        [attr.aria-label]="ariaLabel() || null"
        class="w-full appearance-none rounded bg-surface-alt py-2 pl-4 pr-9 text-sm font-medium text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        (change)="onChange($event)"
      >
        <ng-content />
      </select>

      <!-- Chevron icon -->
      <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg class="h-3 w-3 text-text-secondary" fill="none" viewBox="0 0 10 10" aria-hidden="true">
          <path
            d="M2 3.5l3 3 3-3"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class SelectComponent {
  readonly id = input<string>('');
  readonly name = input<string>('');
  readonly value = input<string>('');
  readonly disabled = input(false);
  /** Accessible label for screen readers */
  readonly ariaLabel = input<string>('');

  readonly valueChange = output<string>();

  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.valueChange.emit(select.value);
  }
}
