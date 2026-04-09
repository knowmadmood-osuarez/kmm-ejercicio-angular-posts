import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Linear progress bar matching the Figma "Visual Polish: Subtle Linear Loading Bar".
 *
 * Figma spec: full-width, 3px height, bg #D9E4EA with animated primary gradient fill.
 */
@Component({
  selector: 'app-linear-progress',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="fixed left-0 right-0 top-0 z-50 h-[3px] overflow-hidden bg-field-bg"
        role="progressbar"
        [attr.aria-label]="'shared.loadingProgress' | transloco"
      >
        <div
          class="h-full w-1/3 animate-[shimmer_1.5s_ease-in-out_infinite] bg-primary-gradient rounded-full"
        ></div>
      </div>
    }
  `,
  styles: `
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(400%);
      }
    }
  `,
})
export class LinearProgressComponent {
  /** Whether the progress bar is visible */
  readonly visible = input(true);
}
