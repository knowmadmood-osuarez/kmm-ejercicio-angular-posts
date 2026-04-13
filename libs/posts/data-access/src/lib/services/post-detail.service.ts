import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_URL } from '@app/core';
import { Post, PostCreate, PostUpdate } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostDetailService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  // --- Detail ---

  private readonly _detailId = signal<string | undefined>(undefined);

  readonly postDetailResource: HttpResourceRef<Post | undefined> = httpResource<Post>(() => {
    const id = this._detailId();
    if (!id) return undefined;
    return `${this.apiUrl}/posts/${id}`;
  });

  loadDetail(id: string): void {
    if (this._detailId() === id) {
      this.postDetailResource.reload();
    } else {
      this._detailId.set(id);
    }
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
    return firstValueFrom(this.http.post<Post>(`${this.apiUrl}/posts`, post));
  }

  async updatePost(id: string, changes: PostUpdate): Promise<Post> {
    return firstValueFrom(this.http.patch<Post>(`${this.apiUrl}/posts/${id}`, changes));
  }

  async deletePost(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/posts/${id}`));
  }
}
