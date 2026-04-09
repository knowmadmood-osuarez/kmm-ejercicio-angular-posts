import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type LabelVariant = 'default' | 'compact';

const LABEL_CLASSES: Record<LabelVariant, string> = {
  default: 'block text-xs font-bold uppercase tracking-[1.2px] leading-4 text-text-secondary',
  compact:
    'block pl-1 text-[10px] font-bold uppercase tracking-[0.5px] leading-[15px] text-text-secondary',
};
@Component({
  selector: 'app-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label [attr.for]="for()" [class]="labelClasses()">
      <ng-content />
    </label>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class LabelComponent {
  /** Linked input id */
  readonly for = input<string | undefined>(undefined);

  /** Label style variant matching Figma context */
  readonly variant = input<LabelVariant>('default');

  readonly labelClasses = computed(() => LABEL_CLASSES[this.variant()]);
}
