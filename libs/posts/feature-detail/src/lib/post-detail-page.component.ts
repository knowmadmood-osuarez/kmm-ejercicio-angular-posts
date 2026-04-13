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
import { AuthService } from '@app/core';
import { PostsService } from '@app/posts/data-access';

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
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsService);
  private readonly transloco = inject(TranslocoService);

  readonly postId = computed(() => {
    const raw = this.id();
    return raw || null;
  });

  readonly isLoading = computed(() => this.postsService.postDetailResource.isLoading());
  readonly error = computed(() => this.postsService.postDetailResource.error());
  readonly post = computed(() => this.postsService.postDetailResource.value());

  readonly currentUser = this.authService.currentUser;
  readonly users = computed(() => this.postsService.safeUsers());

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
      if (id) this.postsService.loadDetail(id);
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
      await this.postsService.deletePost(id);
      void this.router.navigate(['/posts']);
    } finally {
      this.isDeleting.set(false);
      this.showDeleteDialog.set(false);
    }
  }

  onRetry(): void {
    this.postsService.postDetailResource.reload();
  }

  onBack(): void {
    void this.router.navigate(['/posts']);
  }
}
