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

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe, LanguageSwitcherComponent],
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
          <!-- Logo -->
          <a routerLink="/posts" class="text-lg font-bold tracking-[-0.9px] text-text">
            Posts<span class="text-primary">App</span>
          </a>

          <!-- Desktop nav links -->
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
              <svg
                class="h-3.5 w-3.5 text-text-secondary"
                fill="none"
                viewBox="0 0 14 14"
                aria-hidden="true"
              >
                <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M10 10l3 3"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <input
              type="search"
              class="h-10 w-64 rounded bg-surface-alt border border-input-border pl-9 pr-3 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              [placeholder]="'posts.list.search' | transloco"
              (keydown.enter)="onSearch($event)"
              [attr.aria-label]="'shared.search' | transloco"
            />
          </div>

          <!-- Language switcher -->
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
            <svg class="h-4 w-4" fill="none" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M5 8h9"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
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
            @if (mobileMenuOpen()) {
              <svg class="h-5 w-5" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            } @else {
              <svg class="h-5 w-5" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M3 5h14M3 10h14M3 15h14"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            }
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

  /** Emits when search is triggered */
  readonly searchQuery = output<string>();

  readonly user = this.authService.currentUser;
  readonly mobileMenuOpen = signal(false);

  readonly userInitial = computed(() => {
    const name = this.user()?.name;
    return name ? name.charAt(0).toUpperCase() : '';
  });

  onLogout(): void {
    this.authService.logout();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.emit(input.value);
  }
}
