import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardVariant = 'white' | 'tonal';
type CardPadding = 'default' | 'compact';

const BG_CLASSES: Record<CardVariant, string> = {
  white: 'bg-card shadow-card',
  tonal: 'bg-surface-alt',
};

const PAD_CLASSES: Record<CardPadding, string> = {
  default: 'p-8',
  compact: 'p-6',
};

/** Pure function: resolve card classes. */
function resolveCardClasses(variant: CardVariant, padding: CardPadding): string {
  return `${BG_CLASSES[variant]} ${PAD_CLASSES[padding]}`;
}

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
  readonly variant = input<CardVariant>('white');
  readonly padding = input<CardPadding>('default');

  readonly cardClasses = computed(() => resolveCardClasses(this.variant(), this.padding()));
}
