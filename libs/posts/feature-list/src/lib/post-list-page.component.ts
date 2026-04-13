import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { type PostFilters, PostDetailService, PostsService } from '@app/posts/data-access';
import { AuthService } from '@app/core';

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
  private readonly authService = inject(AuthService);
  protected readonly postsService = inject(PostsService);
  private readonly postDetailService = inject(PostDetailService);

  private readonly queryParams = toSignal(this.route.queryParamMap);

  readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');

  readonly isLoading = computed(() => this.postsService.isLoading());
  readonly error = computed(() => this.postsService.error());
  readonly posts = computed(() => this.postsService.visiblePosts());
  readonly totalItems = computed(() => this.postsService.totalItems());
  readonly isEmpty = computed(
    () => !this.isLoading() && !this.error() && this.posts().length === 0,
  );

  readonly users = computed(() => this.postsService.users());
  readonly tags = computed(() => this.postsService.uniqueTags());
  readonly filters = computed(() => this.postsService.filters());
  readonly lang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });
  readonly currentUser = this.authService.currentUser;
  readonly hasMore = computed(() => this.postsService.hasMore());
  readonly isLoadingMore = computed(() => this.postsService.isLoadingMore());

  private readonly observer = signal<IntersectionObserver | undefined>(undefined);

  constructor() {
    // Sync query params → service filters
    effect(() => {
      const params = this.queryParams();
      if (!params) return;
      this.postsService.filters.set({
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
            this.postsService.loadNextPage();
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
    this.postsService.reload();
  }

  onPostHovered(id: string): void {
    this.postDetailService.prefetch(id);
  }
}
