import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { EmptyStateComponent, ErrorStateComponent, LoadingComponent } from '@app/shared/ui';
import { type PostFilters, PostsFacade } from '@app/posts/data-access';
import { AuthFacade } from '@app/core';

import { PostFiltersComponent } from './post-filters.component';
import { PostListComponent } from './post-list.component';

@Component({
  selector: 'app-post-list-page',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoPipe,
    LoadingComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    PostFiltersComponent,
    PostListComponent,
  ],
  templateUrl: './post-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostListPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly postsFacade = inject(PostsFacade);
  private readonly authFacade = inject(AuthFacade);

  private readonly queryParams = toSignal(this.route.queryParamMap);

  readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');

  readonly isLoading = this.postsFacade.isLoading;
  readonly error = this.postsFacade.error;
  readonly posts = this.postsFacade.posts;
  readonly totalItems = this.postsFacade.totalItems;
  readonly isEmpty = this.postsFacade.isEmpty;
  readonly users = this.postsFacade.users;
  readonly tags = this.postsFacade.uniqueTags;
  readonly filters = this.postsFacade.filters;
  readonly hasMore = this.postsFacade.hasMore;
  readonly isLoadingMore = this.postsFacade.isLoadingMore;
  readonly currentUser = this.authFacade.currentUser;
  readonly lang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  private readonly observer = signal<IntersectionObserver | undefined>(undefined);

  constructor() {
    // Sync route query params → facade (linkedSignal source)
    effect(() => {
      const params = this.queryParams();
      if (!params) return;
      this.postsFacade.syncFiltersFromRoute({
        q: params.get('q') ?? '',
        author: params.get('author') ?? '',
        tag: params.get('tag') ?? '',
      });
    });

    // Create IntersectionObserver after first render
    afterNextRender(() => {
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            this.postsFacade.loadNextPage();
          }
        },
        { rootMargin: '200px' },
      );
      this.observer.set(obs);
      this.destroyRef.onDestroy(() => obs.disconnect());
    });

    // Observe sentinel element reactively
    effect(() => {
      const obs = this.observer();
      const el = this.sentinel()?.nativeElement;
      if (obs && el) {
        obs.disconnect();
        obs.observe(el);
      }
    });
  }

  onFiltersChange(filters: PostFilters): void {
    this.postsFacade.filters.set(filters);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: filters.q || null,
        author: filters.author || null,
        tag: filters.tag || null,
      },
      queryParamsHandling: 'replace',
    });
  }

  onRetry(): void {
    this.postsFacade.reload();
  }

  onPostHovered(id: string): void {
    this.postsFacade.prefetch(id);
  }
}
