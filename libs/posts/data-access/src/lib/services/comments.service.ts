import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_URL } from '@app/core';
import { Comment } from '../models/comment.model';

const DEFAULT_PER_PAGE = 10;

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  // ---------------------------------------------------------------------------
  // Comments list resource (GET /comments?postId=N&_page=P&_per_page=M)
  // ---------------------------------------------------------------------------
  private readonly _postId = signal<number | undefined>(undefined);
  private readonly _page = signal(1);

  readonly commentsResource: HttpResourceRef<Comment[] | undefined> = httpResource<Comment[]>(
    () => {
      const postId = this._postId();
      if (!postId) return undefined;
      return {
        url: `${this.apiUrl}/comments`,
        params: {
          postId,
          _page: this._page(),
          _per_page: DEFAULT_PER_PAGE,
        },
      };
    },
  );

  /** Load comments for a specific post. */
  loadForPost(postId: number): void {
    this._postId.set(postId);
    this._page.set(1);
  }

  /** Load next page (for infinite scroll). */
  loadNextPage(): void {
    this._page.update((p) => p + 1);
  }

  // ---------------------------------------------------------------------------
  // Mutations (POST / PUT / DELETE)
  // ---------------------------------------------------------------------------

  async createComment(comment: Omit<Comment, 'id'>): Promise<Comment> {
    return firstValueFrom(this.http.post<Comment>(`${this.apiUrl}/comments`, comment));
  }

  async updateComment(id: number, comment: Partial<Comment>): Promise<Comment> {
    return firstValueFrom(this.http.put<Comment>(`${this.apiUrl}/comments/${id}`, comment));
  }

  async deleteComment(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/comments/${id}`));
  }
}
