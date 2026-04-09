import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Badge / Tag component matching the Figma tag pills.
 *
 * Figma spec: bg-tag-bg (#E8EFF3), rounded-full (12px), px-3 py-1,
 * text 10px bold uppercase tracking 0.5px, text-text-secondary (#566166).
 */
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
  /** Visual style variant */
  readonly variant = input<'default' | 'primary' | 'danger'>('default');

  /** Size preset */
  readonly size = input<'sm' | 'md'>('md');

  readonly badgeClasses = computed(() => {
    const v = this.variant();
    const s = this.size();

    const paddings = s === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

    const variants: Record<string, string> = {
      default: 'bg-tag-bg text-text-secondary',
      primary: 'bg-primary/10 text-primary',
      danger: 'bg-danger/10 text-danger-text',
    };

    return `${paddings} ${variants[v]}`;
  });
}
