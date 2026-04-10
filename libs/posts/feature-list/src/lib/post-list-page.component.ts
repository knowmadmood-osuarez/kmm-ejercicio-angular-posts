import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';

import {
  EmptyStateComponent,
  ErrorStateComponent,
  LoadingComponent,
  PaginationComponent,
} from '@app/shared/ui';
import { PostsService, type PostFilters } from '@app/posts/data-access';
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
    PaginationComponent,
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
  private readonly authService = inject(AuthService);
  protected readonly postsService = inject(PostsService);

  private readonly queryParams = toSignal(this.route.queryParamMap);

  readonly isLoading = computed(() => this.postsService.postsResource.isLoading());
  readonly error = computed(() => this.postsService.postsResource.error());
  readonly posts = computed(() => this.postsService.postsResource.value()?.data ?? []);
  readonly totalPages = computed(() => this.postsService.postsResource.value()?.pages ?? 1);
  readonly totalItems = computed(() => this.postsService.postsResource.value()?.items ?? 0);
  readonly isEmpty = computed(
    () => !this.isLoading() && !this.error() && this.posts().length === 0,
  );

  readonly users = computed(() => this.postsService.safeUsers());
  readonly tags = computed(() => this.postsService.uniqueTags());
  readonly filters = computed(() => this.postsService.filters());
  readonly lang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });
  readonly currentUser = this.authService.currentUser;

  constructor() {
    effect(() => {
      const params = this.queryParams();
      if (!params) return;
      this.postsService.filters.set({
        page: parseInt(params.get('page') ?? '1', 10),
        q: params.get('q') ?? '',
        author: params.get('author') ?? '',
        tag: params.get('tag') ?? '',
      });
    });
  }

  onFiltersChange(filters: PostFilters): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: filters.page > 1 ? filters.page : null,
        q: filters.q || null,
        author: filters.author || null,
        tag: filters.tag || null,
      },
      queryParamsHandling: 'replace',
    });
  }

  onPageChange(page: number): void {
    this.onFiltersChange({ ...this.postsService.filters(), page });
  }

  onRetry(): void {
    this.postsService.postsResource.reload();
  }

  onPostHovered(id: number): void {
    this.postsService.prefetch(id);
  }
}
