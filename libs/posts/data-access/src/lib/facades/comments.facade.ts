import { computed, inject, Injectable, signal, Signal } from '@angular/core';

import { ToastService } from '@app/core';
import { CommentsService, sortByNewest } from '../services/comments.service';
import type { Comment, CommentCreate, CommentUpdate } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsFacade {
  private readonly commentsService = inject(CommentsService);
  private readonly toast = inject(ToastService);

  /** Merged optimistic + server comments, sorted newest-first. */
  readonly comments: Signal<Comment[]> = computed(() => {
    const server = this.commentsService.commentsResource.value() ?? [];
    const optimistic = this.commentsService.optimistic();
    return [...optimistic, ...sortByNewest(server)];
  });

  readonly isLoading: Signal<boolean> = computed(() =>
    this.commentsService.commentsResource.isLoading(),
  );

  readonly error: Signal<unknown> = computed(() => this.commentsService.commentsResource.error());

  readonly isEmpty: Signal<boolean> = computed(
    () => !this.isLoading() && !this.error() && this.comments().length === 0,
  );
  /** Whether more comments are available for infinite scroll (future use). */
  readonly hasMore: Signal<boolean> = computed(() => false);

  // --- Actions (domain orchestration: mutate → invalidate → notify) ---

  loadForPost(postId: string): void {
    this.commentsService.loadForPost(postId);
  }

  async createComment(comment: CommentCreate): Promise<Comment> {
    const created = await this.commentsService.createComment(comment);
    this.toast.success('toast.commentCreated');
    return created;
  }

  async updateComment(id: string, changes: CommentUpdate): Promise<Comment> {
    const updated = await this.commentsService.updateComment(id, changes);
    this.commentsService.commentsResource.reload();
    this.toast.success('toast.commentUpdated');
    return updated;
  }

  async deleteComment(id: string): Promise<void> {
    await this.commentsService.deleteComment(id);
    this.commentsService.commentsResource.reload();
    this.toast.success('toast.commentDeleted');
  }

  reload(): void {
    this.commentsService.commentsResource.reload();
  }
}
