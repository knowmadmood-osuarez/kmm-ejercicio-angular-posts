import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Form field label following the Figma typography system.
 *
 * - Editor labels: 12px, bold, uppercase, tracking 1.2px
 * - Login labels: 10px, bold, uppercase, tracking 0.5px
 */
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
  readonly variant = input<'default' | 'compact'>('default');

  readonly labelClasses = computed(() => {
    const v = this.variant();
    return v === 'compact'
      ? 'block pl-1 text-[10px] font-bold uppercase tracking-[0.5px] leading-[15px] text-text-secondary'
      : 'block text-xs font-bold uppercase tracking-[1.2px] leading-4 text-text-secondary';
  });
}
