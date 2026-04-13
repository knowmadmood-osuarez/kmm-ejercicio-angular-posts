import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import {
  ConfirmDialogComponent,
  EmptyStateComponent,
  ErrorStateComponent,
  LoadingComponent,
  SectionHeaderComponent,
} from '@app/shared/ui';
import { AuthFacade } from '@app/core';
import type { Comment } from '@app/posts/data-access';
import { CommentsFacade, PostsFacade } from '@app/posts/data-access';

import { CommentCardComponent } from './comment-card.component';
import { CommentFormComponent } from './comment-form.component';

@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [
    TranslocoPipe,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingComponent,
    SectionHeaderComponent,
    ConfirmDialogComponent,
    CommentCardComponent,
    CommentFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-comments.component.html',
})
export class PostCommentsComponent {
  readonly postId = input.required<string>();

  private readonly commentsFacade = inject(CommentsFacade);
  private readonly postsFacade = inject(PostsFacade);
  private readonly authFacade = inject(AuthFacade);
  private readonly transloco = inject(TranslocoService);

  readonly isLoading = this.commentsFacade.isLoading;
  readonly error = this.commentsFacade.error;
  readonly comments = this.commentsFacade.comments;
  readonly isEmpty = this.commentsFacade.isEmpty;

  readonly currentUser = this.authFacade.currentUser;
  readonly users = this.postsFacade.users;
  readonly lang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  readonly editingComment = signal<Comment | null>(null);
  readonly confirmDeleteId = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  constructor() {
    effect(() => {
      this.commentsFacade.loadForPost(this.postId());
    });
  }

  getAuthor(userId: string) {
    return this.users().find((u) => String(u.id) === String(userId));
  }

  isCommentOwner(userId: string): boolean {
    const user = this.currentUser();
    return user ? String(user.id) === String(userId) : false;
  }

  async onAddComment(body: string): Promise<void> {
    const user = this.currentUser();
    if (!user) return;
    this.isSubmitting.set(true);
    try {
      await this.commentsFacade.createComment({
        postId: String(this.postId()),
        userId: String(user.id),
        body,
        createdAt: new Date().toISOString(),
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onEditComment(comment: Comment): void {
    this.editingComment.set(comment);
  }

  onCancelEdit(): void {
    this.editingComment.set(null);
  }

  async onUpdateComment(body: string): Promise<void> {
    const editing = this.editingComment();
    if (!editing) return;
    this.isSubmitting.set(true);
    try {
      await this.commentsFacade.updateComment(editing.id, { body });
      this.editingComment.set(null);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onDeleteRequest(id: string): void {
    this.confirmDeleteId.set(id);
  }

  onDeleteCancelled(): void {
    this.confirmDeleteId.set(null);
  }

  async onDeleteConfirmed(): Promise<void> {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.isSubmitting.set(true);
    try {
      await this.commentsFacade.deleteComment(id);
      this.confirmDeleteId.set(null);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onRetry(): void {
    this.commentsFacade.reload();
  }
}
