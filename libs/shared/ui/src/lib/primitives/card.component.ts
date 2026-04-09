import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Card component matching the Figma tonal card system.
 *
 * Cards alternate between white (`bg-card`) and tonal (`bg-surface-alt`) backgrounds
 * with 8px border-radius and 32px padding.
 */
export type CardVariant = 'white' | 'tonal';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article [class]="cardClasses()" class="rounded-lg">
      <ng-content />
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class CardComponent {
  /** Card background style: 'white' (default) or 'tonal' (surface-alt) */
  readonly variant = input<CardVariant>('white');

  /** Padding preset: 'default' (32px) or 'compact' (24px) */
  readonly padding = input<'default' | 'compact'>('default');

  readonly cardClasses = computed(() => {
    const v = this.variant();
    const p = this.padding();

    const bg = v === 'tonal' ? 'bg-surface-alt' : 'bg-card shadow-card';
    const pad = p === 'compact' ? 'p-6' : 'p-8';

    return `${bg} ${pad}`;
  });
}
