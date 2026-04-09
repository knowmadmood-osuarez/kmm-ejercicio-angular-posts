import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Button variant types matching the Figma design system.
 *
 * - `primary`   → gradient bg (#0053DC → #3E76FE), white text
 * - `secondary` → transparent bg, text-secondary, hover surface-alt
 * - `danger`    → outline with danger border, danger text color
 * - `ghost`     → no bg, text-secondary, hover surface-alt
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * Button size matching Figma specs.
 *
 * - `sm`  → 30px height (Edit/Delete in detail)
 * - `md`  → 44px height (Comment submit)
 * - `lg`  → 48px height (Form submit/cancel)
 * - `xl`  → 56px height (Login submit)
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="buttonClasses()"
      class="inline-flex items-center justify-center gap-2 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly fullWidth = input(false);

  readonly buttonClasses = computed(() => {
    const v = this.variant();
    const s = this.size();

    const base = this.fullWidth() ? 'w-full' : '';

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-1 text-sm rounded',
      md: 'px-6 py-2.5 text-base rounded',
      lg: 'px-8 py-3 text-base rounded-md',
      xl: 'px-8 py-4 text-base rounded-lg',
    };

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-primary-gradient text-white font-bold shadow-primary hover:opacity-90 focus:ring-primary/50',
      secondary: 'bg-transparent text-text-secondary hover:bg-surface-alt focus:ring-primary/30',
      danger:
        'bg-transparent border border-danger-border text-danger-text hover:bg-danger/5 focus:ring-danger/30',
      ghost:
        'bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text focus:ring-primary/30',
    };

    return `${base} ${sizeClasses[s]} ${variantClasses[v]}`.trim();
  });
}
