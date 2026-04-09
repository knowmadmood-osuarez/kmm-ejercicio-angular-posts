import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_URL } from '@app/core';
import { PaginatedPosts, Post } from '../models/post.model';

export interface PostFilters {
  page: number;
  q: string;
  author: string;
  tag: string;
}

const DEFAULT_PER_PAGE = 6;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  // ---------------------------------------------------------------------------
  // Filters state (driven by query params in container)
  // ---------------------------------------------------------------------------
  readonly filters = signal<PostFilters>({
    page: 1,
    q: '',
    author: '',
    tag: '',
  });

  // ---------------------------------------------------------------------------
  // Posts list resource (GET /posts with pagination + filters)
  // ---------------------------------------------------------------------------
  readonly postsResource: HttpResourceRef<PaginatedPosts | undefined> =
    httpResource<PaginatedPosts>(() => {
      const f = this.filters();
      const params: Record<string, string | number> = {
        _page: f.page,
        _per_page: DEFAULT_PER_PAGE,
      };

      if (f.q) {
        params['q'] = f.q;
      }
      if (f.author) {
        params['userId'] = f.author;
      }
      if (f.tag) {
        params['tags_like'] = f.tag;
      }

      return { url: `${this.apiUrl}/posts`, params };
    });

  // ---------------------------------------------------------------------------
  // Single post detail resource
  // ---------------------------------------------------------------------------
  private readonly _detailId = signal<number | undefined>(undefined);

  readonly postDetailResource: HttpResourceRef<Post | undefined> = httpResource<Post>(() => {
    const id = this._detailId();
    if (!id) return undefined;
    return `${this.apiUrl}/posts/${id}`;
  });

  /** Set the post ID to load detail for. */
  loadDetail(id: number): void {
    this._detailId.set(id);
  }

  // ---------------------------------------------------------------------------
  // Prefetch cache (hover → preload detail)
  // ---------------------------------------------------------------------------
  private readonly _prefetchedIds = new Set<number>();

  prefetch(id: number): void {
    if (this._prefetchedIds.has(id)) return;
    this._prefetchedIds.add(id);
    // Fire-and-forget; result is cached by browser / json-server
    firstValueFrom(this.http.get<Post>(`${this.apiUrl}/posts/${id}`)).catch(() => {
      this._prefetchedIds.delete(id);
    });
  }

  // ---------------------------------------------------------------------------
  // Mutations (POST / PUT / DELETE)
  // ---------------------------------------------------------------------------

  async createPost(post: Omit<Post, 'id'>): Promise<Post> {
    return firstValueFrom(this.http.post<Post>(`${this.apiUrl}/posts`, post));
  }

  async updatePost(id: number, post: Partial<Post>): Promise<Post> {
    return firstValueFrom(this.http.put<Post>(`${this.apiUrl}/posts/${id}`, post));
  }

  async deletePost(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/posts/${id}`));
  }
}
