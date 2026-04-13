import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import {
  ConfirmDialogComponent,
  EmptyStateComponent,
  ErrorStateComponent,
  LoadingComponent,
  SectionHeaderComponent,
} from '@app/shared/ui';
import { AuthService, ToastService } from '@app/core';
import { CommentsService, PostsService, sortByNewest } from '@app/posts/data-access';
import type { Comment } from '@app/posts/data-access';

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

  private readonly commentsService = inject(CommentsService);
  private readonly postsService = inject(PostsService);
  private readonly authService = inject(AuthService);
  private readonly transloco = inject(TranslocoService);
  private readonly toast = inject(ToastService);

  readonly isLoading = computed(() => this.commentsService.commentsResource.isLoading());
  readonly error = computed(() => this.commentsService.commentsResource.error());

  /** Merge optimistic (pending) comments on top of server comments, sorted newest-first. */
  readonly comments = computed(() => {
    const server = this.commentsService.commentsResource.value() ?? [];
    const optimistic = this.commentsService.optimistic();
    return [...optimistic, ...sortByNewest(server)];
  });

  readonly isEmpty = computed(
    () => !this.isLoading() && !this.error() && this.comments().length === 0,
  );
  readonly currentUser = this.authService.currentUser;
  readonly users = computed(() => this.postsService.safeUsers());
  readonly lang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  readonly editingComment = signal<Comment | null>(null);
  readonly confirmDeleteId = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  constructor() {
    effect(() => {
      this.commentsService.loadForPost(this.postId());
    });
  }

  getAuthor(userId: string) {
    return this.users().find((u) => String(u.id) === String(userId));
  }

  isCommentOwner(userId: string): boolean {
    return String(this.currentUser()?.id) === String(userId);
  }

  async onAddComment(body: string): Promise<void> {
    const user = this.currentUser();
    if (!user) return;
    this.isSubmitting.set(true);
    try {
      await this.commentsService.createComment({
        postId: String(this.postId()),
        userId: String(user.id),
        body,
        createdAt: new Date().toISOString(),
      });
      this.toast.success('toast.commentCreated');
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
      await this.commentsService.updateComment(editing.id, { body });
      this.editingComment.set(null);
      this.toast.success('toast.commentUpdated');
      this.commentsService.commentsResource.reload();
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
      await this.commentsService.deleteComment(id);
      this.confirmDeleteId.set(null);
      this.toast.success('toast.commentDeleted');
      this.commentsService.commentsResource.reload();
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onRetry(): void {
    this.commentsService.commentsResource.reload();
  }
}
