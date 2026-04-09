import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Page header following the Figma section headers.
 *
 * Renders an H1 title + optional subtitle.
 *
 * Figma H1 spec: Inter 36px/40px extrabold, tracking -0.9px, color #2A3439.
 * Subtitle: Inter 16px/24-26px regular, color #566166.
 */
@Component({
  selector: 'app-page-header',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-2">
      <h1 class="text-4xl font-extrabold leading-10 tracking-[-0.9px] text-text">
        {{ title() | transloco }}
      </h1>
      @if (subtitle()) {
        <p class="text-base leading-relaxed text-text-secondary">
          {{ subtitle()! | transloco }}
        </p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PageHeaderComponent {
  /** Transloco key for the page title */
  readonly title = input.required<string>();

  /** Optional Transloco key for subtitle */
  readonly subtitle = input<string | undefined>(undefined);
}
