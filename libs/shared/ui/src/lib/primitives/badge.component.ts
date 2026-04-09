import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type BadgeVariant = 'default' | 'primary' | 'danger';
type BadgeSize = 'sm' | 'md';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-tag-bg text-text-secondary',
  primary: 'bg-primary/10 text-primary',
  danger: 'bg-danger/10 text-danger-text',
};

const PADDING_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5',
  md: 'px-3 py-1',
};

/** Pure function: resolve badge classes. */
function resolveBadgeClasses(variant: BadgeVariant, size: BadgeSize): string {
  return `${PADDING_CLASSES[size]} ${VARIANT_CLASSES[variant]}`;
}
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      [class]="badgeClasses()"
      class="inline-flex items-center rounded-full text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px]"
    >
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
  readonly size = input<BadgeSize>('md');

  readonly badgeClasses = computed(() => resolveBadgeClasses(this.variant(), this.size()));
}
