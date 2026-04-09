import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * Input component following the Figma design system.
 *
 * Two visual variants from the Figma screens:
 * - `editor`  → solid #D9E4EA bg, 4px radius, larger text (post editor)
 * - `login`   → transparent bg with subtle border, 8px radius, icon padding (login form)
 */
export type InputVariant = 'editor' | 'login';

@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      @if (icon()) {
        <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <ng-content select="[slot=icon]" />
        </div>
      }
      <input
        [id]="id()"
        [type]="type()"
        [name]="name()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="value()"
        [class]="inputClasses()"
        [attr.aria-label]="ariaLabel() || null"
        class="w-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        (input)="onInput($event)"
        (blur)="blurred.emit()"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class InputComponent {
  readonly id = input<string>('');
  readonly type = input<string>('text');
  readonly name = input<string>('');
  readonly placeholder = input<string>('');
  readonly value = input<string>('');
  readonly disabled = input(false);
  readonly variant = input<InputVariant>('editor');
  /** Whether an icon slot is projected */
  readonly icon = input(false);
  /** Accessible label for screen readers */
  readonly ariaLabel = input<string>('');

  readonly valueChange = output<string>();
  readonly blurred = output<void>();

  readonly inputClasses = computed(() => {
    const v = this.variant();
    const hasIcon = this.icon();

    const base = hasIcon ? 'pl-12 pr-6' : 'px-6';

    if (v === 'login') {
      return `${hasIcon ? 'pl-12 pr-4' : 'px-4'} py-[18px] bg-input-bg border border-input-border rounded-lg text-base text-text placeholder:text-placeholder/60`;
    }

    // editor (default)
    return `${base} py-[17px] bg-field-bg rounded text-base text-text placeholder:text-placeholder`;
  });

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }
}
