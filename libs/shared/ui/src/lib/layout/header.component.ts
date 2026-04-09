import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '@app/core';

import { LanguageSwitcherComponent } from './language-switcher.component';
import { IconComponent } from '../icons/icon.component';

/** Pure function: extract first character uppercase from a name. */
function getInitial(name: string | undefined): string {
  return name ? name.charAt(0).toUpperCase() : '';
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe, LanguageSwitcherComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="sticky top-0 z-40 w-full border-b border-input-border bg-header-bg backdrop-blur-md"
    >
      <nav
        class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        <!-- Left: Logo + nav links -->
        <div class="flex items-center gap-8">
          <a routerLink="/posts" class="text-lg font-bold tracking-[-0.9px] text-text">
            Posts<span class="text-primary">App</span>
          </a>

          <div class="hidden items-center gap-6 md:flex">
            <a
              routerLink="/posts"
              routerLinkActive="text-primary"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-sm font-semibold text-text-secondary transition-colors hover:text-text"
            >
              {{ 'header.posts' | transloco }}
            </a>
            <a
              routerLink="/posts/new"
              routerLinkActive="text-primary"
              class="text-sm font-semibold text-text-secondary transition-colors hover:text-text"
            >
              {{ 'header.newPost' | transloco }}
            </a>
          </div>
        </div>

        <!-- Right: Search, lang switcher, user, logout -->
        <div class="flex items-center gap-4">
          <!-- Search bar (desktop) -->
          <div class="relative hidden lg:block">
            <div class="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <app-icon name="search" class="h-3.5 w-3.5 text-text-secondary" />
            </div>
            <input
              type="search"
              class="h-10 w-64 rounded bg-surface-alt border border-input-border pl-9 pr-3 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              [placeholder]="'posts.list.search' | transloco"
              (keydown.enter)="onSearch($event)"
              [attr.aria-label]="'shared.search' | transloco"
            />
          </div>

          <app-language-switcher />

          <!-- User info -->
          @if (user(); as user) {
            <div class="hidden items-center gap-3 md:flex">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-avatar-bg"
                [attr.aria-label]="user.name"
              >
                <span class="text-xs font-bold text-primary">
                  {{ userInitial() }}
                </span>
              </div>
              <span class="text-sm font-semibold text-text">
                {{ user.name }}
              </span>
            </div>
          }

          <!-- Logout -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt hover:text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
            (click)="onLogout()"
            [attr.aria-label]="'header.logout' | transloco"
          >
            <app-icon name="logout" class="h-4 w-4" />
            <span class="hidden sm:inline">{{ 'header.logout' | transloco }}</span>
          </button>

          <!-- Mobile hamburger -->
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary hover:bg-surface-alt md:hidden"
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-controls="mobile-menu"
            [attr.aria-label]="'shared.toggleMenu' | transloco"
          >
            <app-icon [name]="mobileMenuOpen() ? 'close' : 'menu'" class="h-5 w-5" />
          </button>
        </div>
      </nav>

      <!-- Mobile menu -->
      @if (mobileMenuOpen()) {
        <div id="mobile-menu" class="border-t border-input-border px-6 pb-4 md:hidden">
          <div class="flex flex-col gap-3 pt-3">
            <a
              routerLink="/posts"
              routerLinkActive="text-primary"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-sm font-semibold text-text-secondary transition-colors hover:text-text"
              (click)="mobileMenuOpen.set(false)"
            >
              {{ 'header.posts' | transloco }}
            </a>
            <a
              routerLink="/posts/new"
              routerLinkActive="text-primary"
              class="text-sm font-semibold text-text-secondary transition-colors hover:text-text"
              (click)="mobileMenuOpen.set(false)"
            >
              {{ 'header.newPost' | transloco }}
            </a>

            @if (user(); as user) {
              <div class="flex items-center gap-3 border-t border-input-border pt-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-avatar-bg">
                  <span class="text-xs font-bold text-primary">{{ userInitial() }}</span>
                </div>
                <span class="text-sm font-semibold text-text">{{ user.name }}</span>
              </div>
            }
          </div>
        </div>
      }
    </header>
  `,
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);

  readonly searchQuery = output<string>();
  readonly user = this.authService.currentUser;
  readonly mobileMenuOpen = signal(false);
  readonly userInitial = computed(() => getInitial(this.user()?.name));

  onLogout(): void {
    this.authService.logout();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.emit(input.value);
  }
}
