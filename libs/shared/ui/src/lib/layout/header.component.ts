import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '@app/core';

import { LanguageSwitcherComponent } from './language-switcher.component';
import { IconComponent } from '../icons/icon.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslocoPipe, LanguageSwitcherComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="sticky top-0 z-40 w-full border-b border-input-border bg-header-bg backdrop-blur-[6px]"
      role="banner"
    >
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
        <!-- Logo -->
        <a
          routerLink="/posts"
          class="shrink-0 text-lg font-bold tracking-[-0.9px] text-text"
          aria-label="PostsApp home"
        >
          Posts<span class="text-primary">App</span>
        </a>

        <!-- Search — crece y se centra -->
        <div class="relative mx-auto flex-1 max-w-xl">
          <div class="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <app-icon name="search" class="h-3.5 w-3.5 text-text-secondary" />
          </div>
          <input
            #searchInput
            type="search"
            class="h-10 w-full rounded-lg border border-input-border bg-surface-alt pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            [placeholder]="'posts.list.search' | transloco"
            [value]="searchValue()"
            (keydown.enter)="onSearch(searchInput.value)"
            [attr.aria-label]="'shared.search' | transloco"
          />
        </div>

        <!-- Right actions -->
        <div class="flex shrink-0 items-center gap-3">
          <app-language-switcher />

          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
            (click)="onLogout()"
            [attr.aria-label]="'header.logout' | transloco"
          >
            <app-icon name="logout" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly searchValue = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('q') ?? '')), {
    initialValue: '',
  });

  onSearch(value: string): void {
    void this.router.navigate([], {
      queryParams: { q: value.trim() || null, page: null },
      queryParamsHandling: 'merge',
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
