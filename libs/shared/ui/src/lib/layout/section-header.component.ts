import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Section header for sub-sections (e.g. "Comentarios / 03").
 *
 * Figma spec: 12px bold uppercase, tracking 1.2px, text-text-secondary,
 * optional count suffix, border-top divider.
 */
@Component({
  selector: 'app-section-header',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center gap-3"
      [class.border-t]="divider()"
      [class.border-input-border]="divider()"
      [class.pt-12]="divider()"
    >
      <h2 class="text-xs font-bold uppercase tracking-[1.2px] leading-4 text-text-secondary">
        {{ title() | transloco }}
        @if (count() !== undefined) {
          <span class="ml-1">/ {{ formattedCount() }}</span>
        }
      </h2>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class SectionHeaderComponent {
  /** Transloco key for the section title */
  readonly title = input.required<string>();

  /** Optional count to display after the title */
  readonly count = input<number | undefined>(undefined);

  /** Whether to show a top border divider */
  readonly divider = input(false);

  /** Zero-padded count display (e.g. "03") */
  readonly formattedCount = computed(() => {
    const c = this.count();
    return c !== undefined ? String(c).padStart(2, '0') : '';
  });
}
