import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent, LanguageSwitcherComponent } from '@app/shared/ui';
import { AuthService } from '@app/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslocoPipe, IconComponent, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly menuOpen = signal(false);

  readonly searchValue = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('q') ?? '')),
    { initialValue: '' },
  );

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  onSearch(value: string): void {
    void this.router.navigate([], {
      queryParams: { q: value.trim() || null, page: null },
      queryParamsHandling: 'merge',
    });
    this.menuOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout();
  }
}

