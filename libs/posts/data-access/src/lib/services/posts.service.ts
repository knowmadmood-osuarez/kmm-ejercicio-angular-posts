import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { SafeUser, User } from '@app/core';
import { API_URL } from '@app/core';
import { PaginatedPosts, Post, PostCreate, PostUpdate } from '../models/post.model';

export interface PostFilters {
  q: string;
  author: string;
  tag: string;
}

function filtersEqual(a: PostFilters, b: PostFilters): boolean {
  return a.q === b.q && a.author === b.author && a.tag === b.tag;
}

const PAGE_SIZE = 6;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  readonly filters = signal<PostFilters>({ q: '', author: '', tag: '' }, { equal: filtersEqual });

  // --- Infinite-scroll state ---
  private readonly _posts = signal<Post[]>([]);
  private readonly _displayLimit = signal(PAGE_SIZE);
  private readonly _hasMoreServer = signal(false);
  private _currentPage = 1;
  private _filterSnap: PostFilters = { q: '', author: '', tag: '' };

  readonly isLoading = signal(true);
  readonly isLoadingMore = signal(false);
  readonly error = signal<unknown>(null);
  readonly totalItems = signal(0);

  private readonly _useClientFilterMode = computed(
    () => !!this.filters().tag || !!this.filters().q,
  );

  readonly visiblePosts = computed<Post[]>(() => {
    const posts = this._posts();
    return this._useClientFilterMode() ? posts.slice(0, this._displayLimit()) : posts;
  });

  readonly hasMore = computed(() =>
    this._useClientFilterMode()
      ? this._displayLimit() < this._posts().length
      : this._hasMoreServer(),
  );

  // --- Tags & Users (httpResource — simple GETs) ---
  private readonly allPostsForTags: HttpResourceRef<Post[] | undefined> = httpResource<Post[]>(
    () => `${this.apiUrl}/posts`,
  );

  readonly uniqueTags = computed<string[]>(() => {
    const posts = this.allPostsForTags.value() ?? [];
    return [...new Set(posts.flatMap((p) => p.tags))].sort();
  });

  readonly usersResource: HttpResourceRef<User[] | undefined> = httpResource<User[]>(
    () => `${this.apiUrl}/users`,
  );

  readonly safeUsers = computed<SafeUser[]>(() =>
    (this.usersResource.value() ?? []).map(({ password: _p, ...safe }) => safe),
  );

  constructor() {
    effect(() => {
      this.filters();
      untracked(() => this.resetAndLoad());
    });
  }

  // --- Public API ---

  loadNextPage(): void {
    if (!this.hasMore() || this.isLoading() || this.isLoadingMore()) return;

    if (this._useClientFilterMode()) {
      this._displayLimit.update((l) => l + PAGE_SIZE);
    } else {
      this._currentPage++;
      this.fetchPage(false);
    }
  }

  reload(): void {
    this.resetAndLoad();
  }

  // --- Private fetching ---

  private resetAndLoad(): void {
    this._filterSnap = this.filters();
    this._currentPage = 1;
    this._posts.set([]);
    this._hasMoreServer.set(true);
    this._displayLimit.set(PAGE_SIZE);
    this.totalItems.set(0);
    this.error.set(null);

    if (this._filterSnap.tag || this._filterSnap.q) {
      this.fetchAllWithClientFilter();
    } else {
      this.fetchPage(true);
    }
  }

  private fetchPage(isFirst: boolean): void {
    if (isFirst) this.isLoading.set(true);
    else this.isLoadingMore.set(true);

    const params: Record<string, string | number> = {
      _page: this._currentPage,
      _per_page: PAGE_SIZE,
      _sort: '-createdAt',
    };
    if (this._filterSnap.author) params['userId'] = this._filterSnap.author;

    const snap = this._filterSnap;

    firstValueFrom(this.http.get<PaginatedPosts>(`${this.apiUrl}/posts`, { params }))
      .then((result) => {
        if (!filtersEqual(snap, this.filters())) return;
        if (isFirst) this._posts.set(result.data);
        else this._posts.update((prev) => [...prev, ...result.data]);
        this.totalItems.set(result.items);
        this._hasMoreServer.set(result.next !== null);
      })
      .catch((err) => {
        if (!filtersEqual(snap, this.filters())) return;
        this.error.set(err);
      })
      .finally(() => {
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      });
  }

  private fetchAllWithClientFilter(): void {
    this.isLoading.set(true);

    const params: Record<string, string> = { _sort: '-createdAt' };
    if (this._filterSnap.author) params['userId'] = this._filterSnap.author;

    const snap = this._filterSnap;

    firstValueFrom(this.http.get<Post[]>(`${this.apiUrl}/posts`, { params }))
      .then((posts) => {
        if (!filtersEqual(snap, this.filters())) return;
        let filtered = posts;
        if (snap.tag) {
          filtered = filtered.filter((p) => p.tags.includes(snap.tag));
        }
        if (snap.q) {
          const query = snap.q.toLowerCase();
          filtered = filtered.filter(
            (p) => p.title.toLowerCase().includes(query) || p.body.toLowerCase().includes(query),
          );
        }
        this._posts.set(filtered);
        this.totalItems.set(filtered.length);
      })
      .catch((err) => {
        if (!filtersEqual(snap, this.filters())) return;
        this.error.set(err);
      })
      .finally(() => this.isLoading.set(false));
  }

  // --- Detail ---

  private readonly _detailId = signal<string | undefined>(undefined);

  readonly postDetailResource: HttpResourceRef<Post | undefined> = httpResource<Post>(() => {
    const id = this._detailId();
    if (!id) return undefined;
    return `${this.apiUrl}/posts/${id}`;
  });

  loadDetail(id: string): void {
    this._detailId.set(id);
  }

  // --- Prefetch ---

  private readonly _prefetchedIds = new Set<string>();

  prefetch(id: string): void {
    if (this._prefetchedIds.has(id)) return;
    this._prefetchedIds.add(id);
    firstValueFrom(this.http.get<Post>(`${this.apiUrl}/posts/${id}`)).catch(() => {
      this._prefetchedIds.delete(id);
    });
  }

  // --- Mutations ---

  async createPost(post: PostCreate): Promise<Post> {
    const payload = { ...post, userId: Number(post.userId) };
    return firstValueFrom(this.http.post<Post>(`${this.apiUrl}/posts`, payload));
  }

  async updatePost(id: string, changes: PostUpdate): Promise<Post> {
    return firstValueFrom(this.http.patch<Post>(`${this.apiUrl}/posts/${id}`, changes));
  }

  async deletePost(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/posts/${id}`));
  }
}
