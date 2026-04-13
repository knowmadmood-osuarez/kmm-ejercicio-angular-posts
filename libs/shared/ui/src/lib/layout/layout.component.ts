import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, HeaderComponent, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col bg-surface">
      <!-- Skip to content (a11y) -->
      <a
        href="#main-content"
        class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-primary"
      >
        {{ 'shared.skipToContent' | transloco }}
      </a>

      <app-header />

      <main
        id="main-content"
        class="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-8 sm:px-6"
        role="main"
      >
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {}
