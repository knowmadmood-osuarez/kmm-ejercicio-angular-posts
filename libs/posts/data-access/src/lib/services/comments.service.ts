import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_URL } from '@app/core';
import { Comment, CommentCreate, CommentUpdate } from '../models/comment.model';

/** Pure: sort comments newest-first by createdAt (ISO string comparison). */
function sortByNewest(comments: Comment[]): Comment[] {
  return [...comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

@Injectable()
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  private readonly _postId = signal<string | undefined>(undefined);

  readonly commentsResource: HttpResourceRef<Comment[] | undefined> = httpResource<Comment[]>(
    () => {
      const postId = this._postId();
      if (!postId) return undefined;
      return {
        url: `${this.apiUrl}/comments`,
        params: { postId },
      };
    },
  );

  /** Optimistic comments added locally before server confirms. */
  readonly optimistic = signal<Comment[]>([]);

  loadForPost(postId: string): void {
    this._postId.set(postId);
    this.optimistic.set([]);
  }

  async createComment(comment: CommentCreate): Promise<Comment> {
    const tempId = `__temp_${Date.now()}`;
    const optimisticComment: Comment = { ...comment, id: tempId };
    this.optimistic.update((list) => [optimisticComment, ...list]);

    try {
      const created = await firstValueFrom(
        this.http.post<Comment>(`${this.apiUrl}/comments`, comment),
      );
      this.optimistic.update((list) => list.filter((c) => c.id !== tempId));
      this.commentsResource.reload();
      return created;
    } catch (err) {
      this.optimistic.update((list) => list.filter((c) => c.id !== tempId));
      throw err;
    }
  }

  async updateComment(id: string, changes: CommentUpdate): Promise<Comment> {
    return firstValueFrom(this.http.patch<Comment>(`${this.apiUrl}/comments/${id}`, changes));
  }

  async deleteComment(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/comments/${id}`));
  }
}

export { sortByNewest };
