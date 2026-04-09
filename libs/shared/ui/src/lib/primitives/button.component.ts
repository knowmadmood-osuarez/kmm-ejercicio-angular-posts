import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-sm rounded',
  md: 'px-6 py-2.5 text-base rounded',
  lg: 'px-8 py-3 text-base rounded-md',
  xl: 'px-8 py-4 text-base rounded-lg',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-gradient text-white font-bold shadow-primary hover:opacity-90 focus:ring-primary/50',
  secondary: 'bg-transparent text-text-secondary hover:bg-surface-alt focus:ring-primary/30',
  danger:
    'bg-transparent border border-danger-border text-danger-text hover:bg-danger/5 focus:ring-danger/30',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text focus:ring-primary/30',
};

/** Pure function: resolve Tailwind classes for a button config. */
function resolveButtonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
): string {
  const base = fullWidth ? 'w-full' : '';
  return `${base} ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]}`.trim();
}

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

  readonly buttonClasses = computed(() =>
    resolveButtonClasses(this.variant(), this.size(), this.fullWidth()),
  );
}
