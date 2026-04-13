import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import {
  ButtonComponent,
  ConfirmDialogComponent,
  ErrorStateComponent,
  IconComponent,
  LoadingComponent,
} from '@app/shared/ui';
import { AuthFacade } from '@app/core';
import { PostsFacade } from '@app/posts/data-access';

import { PostDetailComponent } from './post-detail.component';
import { PostCommentsComponent } from './post-comments.component';

@Component({
  selector: 'app-post-detail-page',
  standalone: true,
  imports: [
    TranslocoPipe,
    ButtonComponent,
    IconComponent,
    LoadingComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    PostDetailComponent,
    PostCommentsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-detail-page.component.html',
})
export class PostDetailPageComponent {
  // Bound automatically by withComponentInputBinding() from the :id route param
  readonly id = input<string>('');

  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);
  private readonly postsFacade = inject(PostsFacade);
  private readonly transloco = inject(TranslocoService);

  readonly postId = computed(() => {
    const raw = this.id();
    return raw || null;
  });

  readonly isLoading = this.postsFacade.selectedPostLoading;
  readonly error = this.postsFacade.selectedPostError;
  readonly post = this.postsFacade.selectedPost;

  readonly currentUser = this.authFacade.currentUser;
  readonly users = this.postsFacade.users;

  readonly author = computed(() => {
    const post = this.post();
    if (!post) return undefined;
    return this.users().find((u) => String(u.id) === String(post.userId));
  });

  readonly isOwner = computed(() => {
    const post = this.post();
    const user = this.currentUser();
    if (!post || !user) return false;
    return String(post.userId) === String(user.id);
  });

  readonly lang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  readonly showDeleteDialog = signal(false);
  readonly isDeleting = signal(false);

  constructor() {
    effect(() => {
      const id = this.postId();
      if (id) this.postsFacade.loadDetail(id);
    });
  }

  onEdit(): void {
    const id = this.postId();
    if (id) void this.router.navigate(['/posts', id, 'edit']);
  }

  onDeleteRequest(): void {
    this.showDeleteDialog.set(true);
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
  }

  async onDeleteConfirmed(): Promise<void> {
    const id = this.postId();
    if (!id) return;
    this.isDeleting.set(true);
    try {
      await this.postsFacade.deletePost(id);
      void this.router.navigate(['/posts']);
    } finally {
      this.isDeleting.set(false);
      this.showDeleteDialog.set(false);
    }
  }

  onRetry(): void {
    this.postsFacade.reloadDetail();
  }

  onBack(): void {
    void this.router.navigate(['/posts']);
  }
}
