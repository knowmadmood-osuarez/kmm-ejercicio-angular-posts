import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { SafeUser, User } from '@app/core';
import { API_URL } from '@app/core';
import { PaginatedPosts, Post, PostCreate, PostUpdate } from '../models/post.model';

export interface PostFilters {
  page: number;
  q: string;
  author: string;
  tag: string;
}

/** Pure: deep equality for PostFilters — avoids spurious resource re-fetches. */
function filtersEqual(a: PostFilters, b: PostFilters): boolean {
  return a.page === b.page && a.q === b.q && a.author === b.author && a.tag === b.tag;
}

const DEFAULT_PER_PAGE = 6;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  readonly filters = signal<PostFilters>(
    { page: 1, q: '', author: '', tag: '' },
    { equal: filtersEqual },
  );

  readonly postsResource: HttpResourceRef<PaginatedPosts | undefined> =
    httpResource<PaginatedPosts>(() => {
      const f = this.filters();
      const params: Record<string, string | number> = {
        _page: f.page,
        _per_page: DEFAULT_PER_PAGE,
      };

      if (f.q) params['q'] = f.q;
      if (f.author) params['userId'] = f.author;
      if (f.tag) params['tags_like'] = f.tag;

      return { url: `${this.apiUrl}/posts`, params };
    });

  readonly usersResource: HttpResourceRef<User[] | undefined> = httpResource<User[]>(
    () => `${this.apiUrl}/users`,
  );

  /** Users without password — safe to pass to any component. */
  readonly safeUsers = computed<SafeUser[]>(() =>
    (this.usersResource.value() ?? []).map(({ password: _p, ...safe }) => safe),
  );

  readonly uniqueTags = computed<string[]>(() => {
    const posts = this.postsResource.value()?.data ?? [];
    return [...new Set(posts.flatMap((p) => p.tags))].sort();
  });

  private readonly _detailId = signal<string | undefined>(undefined);

  readonly postDetailResource: HttpResourceRef<Post | undefined> = httpResource<Post>(() => {
    const id = this._detailId();
    if (!id) return undefined;
    return `${this.apiUrl}/posts/${id}`;
  });

  loadDetail(id: string): void {
    this._detailId.set(id);
  }

  private readonly _prefetchedIds = new Set<string>();

  prefetch(id: string): void {
    if (this._prefetchedIds.has(id)) return;
    this._prefetchedIds.add(id);
    firstValueFrom(this.http.get<Post>(`${this.apiUrl}/posts/${id}`)).catch(() => {
      this._prefetchedIds.delete(id);
    });
  }

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
