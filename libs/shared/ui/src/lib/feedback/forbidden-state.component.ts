import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent } from '../icons/icon.component';

@Component({
  selector: 'app-forbidden-state',
  imports: [TranslocoPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center" role="alert">
      <app-icon name="shield-lock" class="mb-6 h-24 w-24 text-text-muted" />

      <h3 class="text-lg font-bold tracking-tight text-text">
        {{ 'shared.forbidden' | transloco }}
      </h3>

      <p class="mt-2 max-w-sm text-sm text-text-secondary">
        {{ 'shared.forbiddenDetail' | transloco }}
      </p>
    </div>
  `,
})
export class ForbiddenStateComponent {}
