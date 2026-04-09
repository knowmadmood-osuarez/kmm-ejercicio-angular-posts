import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Divider component for visual separation between content sections.
 *
 * Figma uses `border-top: 1px solid rgba(169, 180, 185, 0.1|0.15)` for section breaks.
 */
@Component({
  selector: 'app-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hr
      [class]="spacing() === 'lg' ? 'my-8' : spacing() === 'md' ? 'my-6' : 'my-4'"
      class="border-t border-input-border"
      role="separator"
    />
  `,
})
export class DividerComponent {
  /** Vertical spacing around the divider */
  readonly spacing = input<'sm' | 'md' | 'lg'>('md');
}
