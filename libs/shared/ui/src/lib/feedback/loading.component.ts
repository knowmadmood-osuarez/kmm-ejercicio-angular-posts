import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-loading',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col gap-4 w-full"
      role="status"
      [attr.aria-label]="'shared.loading' | transloco"
    >
      @for (_ of linesArray(); track $index) {
        <div class="animate-pulse rounded-lg bg-surface-alt p-8">
          <div class="flex flex-col gap-4">
            <div class="h-6 w-3/4 rounded bg-toggle-bg/40"></div>
            <div class="h-4 w-full rounded bg-toggle-bg/30"></div>
            <div class="h-4 w-5/6 rounded bg-toggle-bg/30"></div>
            <div class="mt-2 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-6 w-6 rounded-full bg-toggle-bg/40"></div>
                <div class="h-4 w-20 rounded bg-toggle-bg/30"></div>
              </div>
              <div class="flex gap-2">
                <div class="h-5 w-16 rounded-full bg-toggle-bg/30"></div>
                <div class="h-5 w-12 rounded-full bg-toggle-bg/30"></div>
              </div>
            </div>
          </div>
        </div>
      }
      <span class="sr-only">{{ 'shared.loading' | transloco }}</span>
    </div>
  `,
})
export class LoadingComponent {
  /** Number of skeleton lines to display */
  readonly lines = input(3);

  /** Array derived from lines count for @for iteration */
  readonly linesArray = computed(() => Array.from({ length: this.lines() }));
}
