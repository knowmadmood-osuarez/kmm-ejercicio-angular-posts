import {
  computed,
  effect,
  inject,
  Injectable,
  linkedSignal,
  signal,
  Signal,
  untracked,
} from '@angular/core';

import type { User } from '@app/core';
import { ToastService } from '@app/core';
import { PostsService } from '../services/posts.service';
import { PostDetailService } from '../services/post-detail.service';
import { filtersEqual, type PostFilters } from '../services/post-filters.utils';
import type { Post, PostCreate, PostUpdate } from '../models/post.model';

export interface PaginationState {
  total: number;
  hasMore: boolean;
}

@Injectable({ providedIn: 'root' })
export class PostsFacade {
  private readonly postsService = inject(PostsService);
  private readonly postDetailService = inject(PostDetailService);
  private readonly toast = inject(ToastService);

  // --- Filter state with linkedSignal ---

  private readonly _routeFilters = signal<PostFilters>(
    { q: '', author: '', tag: '' },
    { equal: filtersEqual },
  );

  /**
   * Writable signal linked to route query params.
   * Resets automatically when route params change; can also be set manually.
   */
  readonly filters = linkedSignal({
    source: () => this._routeFilters(),
    computation: (source: PostFilters) => source,
    equal: filtersEqual,
  });

  // --- List readonly signals ---

  readonly posts: Signal<Post[]> = computed(() => this.postsService.visiblePosts());
  readonly isLoading: Signal<boolean> = computed(() => this.postsService.isLoading());
  readonly isLoadingMore: Signal<boolean> = computed(() => this.postsService.isLoadingMore());
  readonly error: Signal<unknown> = computed(() => this.postsService.error());
  readonly totalItems: Signal<number> = computed(() => this.postsService.totalItems());
  readonly hasMore: Signal<boolean> = computed(() => this.postsService.hasMore());
  readonly users: Signal<User[]> = computed(() => this.postsService.users());
  readonly uniqueTags: Signal<string[]> = computed(() => this.postsService.uniqueTags());

  readonly isEmpty: Signal<boolean> = computed(
    () => !this.isLoading() && !this.error() && this.posts().length === 0,
  );

  readonly pagination: Signal<PaginationState> = computed(() => ({
    total: this.totalItems(),
    hasMore: this.hasMore(),
  }));

  // --- Detail readonly signals ---

  readonly selectedPost: Signal<Post | undefined> = computed(() =>
    this.postDetailService.postDetailResource.value(),
  );
  readonly selectedPostLoading: Signal<boolean> = computed(() =>
    this.postDetailService.postDetailResource.isLoading(),
  );
  readonly selectedPostError: Signal<unknown> = computed(() =>
    this.postDetailService.postDetailResource.error(),
  );

  constructor() {
    effect(() => {
      const f = this.filters();
      untracked(() => this.postsService.filters.set(f));
    });
  }

  // --- Route sync ---

  /** Called by the list component to push route query params into the facade. */
  syncFiltersFromRoute(params: PostFilters): void {
    this._routeFilters.set(params);
  }

  // --- List actions ---

  loadNextPage(): void {
    this.postsService.loadNextPage();
  }

  reload(): void {
    this.postsService.reload();
  }

  // --- Detail actions ---

  loadDetail(id: string): void {
    this.postDetailService.loadDetail(id);
  }

  reloadDetail(): void {
    this.postDetailService.postDetailResource.reload();
  }

  prefetch(id: string): void {
    this.postDetailService.prefetch(id);
  }

  // --- Mutations (domain orchestration: mutate → invalidate → notify) ---

  async createPost(post: PostCreate): Promise<Post> {
    const created = await this.postDetailService.createPost(post);
    this.postsService.reload();
    this.toast.success('toast.postCreated');
    return created;
  }

  async updatePost(id: string, changes: PostUpdate): Promise<Post> {
    const updated = await this.postDetailService.updatePost(id, changes);
    this.postsService.reload();
    this.toast.success('toast.postUpdated');
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    await this.postDetailService.deletePost(id);
    this.postsService.reload();
    this.toast.success('toast.postDeleted');
  }
}
