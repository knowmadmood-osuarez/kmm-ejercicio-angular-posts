import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent } from '../icons/icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [TranslocoPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center" role="status">
      <app-icon name="empty-box" class="mb-6 h-24 w-24 text-text-muted" />

      <h3 class="text-lg font-bold tracking-tight text-text">
        {{ message() | transloco }}
      </h3>

      @if (subtitle()) {
        <p class="mt-2 text-sm text-text-secondary">
          {{ subtitle() | transloco }}
        </p>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  /** Main message key for Transloco */
  readonly message = input('shared.empty');

  /** Optional subtitle key for Transloco */
  readonly subtitle = input<string | undefined>(undefined);
}
