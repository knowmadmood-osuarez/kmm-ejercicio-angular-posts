import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/** Pure function: zero-pad a count for display (e.g. 3 → "03"). */
function formatCount(count: number | undefined): string {
  return count !== undefined ? String(count).padStart(2, '0') : '';
}
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
  readonly formattedCount = computed(() => formatCount(this.count()));
}
