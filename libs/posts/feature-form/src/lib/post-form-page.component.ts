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
import { TranslocoPipe } from '@jsverse/transloco';

import {
  ButtonComponent,
  ErrorStateComponent,
  ForbiddenStateComponent,
  IconComponent,
  LoadingComponent,
  PageHeaderComponent,
} from '@app/shared/ui';
import { AuthService, ToastService } from '@app/core';
import { PostsService } from '@app/posts/data-access';
import type { PostCreate, PostUpdate } from '@app/posts/data-access';

import { PostFormComponent } from './post-form.component';
import type { PostFormData } from './post-form.component';

@Component({
  selector: 'app-post-form-page',
  standalone: true,
  imports: [
    TranslocoPipe,
    ButtonComponent,
    IconComponent,
    LoadingComponent,
    ErrorStateComponent,
    ForbiddenStateComponent,
    PageHeaderComponent,
    PostFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-form-page.component.html',
})
export class PostFormPageComponent {
  readonly id = input<string | undefined>(undefined);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsService);
  private readonly toast = inject(ToastService);

  readonly isEditMode = computed(() => !!this.id());
  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'posts.form.titleEdit' : 'posts.form.titleNew',
  );

  readonly isLoading = computed(
    () => this.isEditMode() && this.postsService.postDetailResource.isLoading(),
  );
  readonly error = computed(() =>
    this.isEditMode() ? this.postsService.postDetailResource.error() : null,
  );
  readonly post = computed(() =>
    this.isEditMode() ? this.postsService.postDetailResource.value() : undefined,
  );

  readonly isForbidden = computed(() => {
    const post = this.post();
    const user = this.authService.currentUser();
    if (!this.isEditMode() || !post || !user) return false;
    return String(post.userId) !== String(user.id);
  });

  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.postsService.loadDetail(id);
    });
  }

  async onSubmit(data: PostFormData): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    try {
      if (this.isEditMode()) {
        const changes: PostUpdate = { title: data.title, body: data.body, tags: data.tags };
        await this.postsService.updatePost(this.id()!, changes);
        this.toast.success('toast.postUpdated');
      } else {
        const payload: PostCreate = {
          userId: String(user.id),
          title: data.title,
          body: data.body,
          tags: data.tags,
          createdAt: new Date().toISOString(),
        };
        await this.postsService.createPost(payload);
        this.toast.success('toast.postCreated');
      }
      this.postsService.reload();
      void this.router.navigate(['/posts']);
    } catch {
      this.saveError.set('shared.error');
      this.toast.error('shared.error');
    } finally {
      this.isSaving.set(false);
    }
  }

  onCancel(): void {
    const id = this.id();
    if (id) {
      void this.router.navigate(['/posts', id]);
    } else {
      void this.router.navigate(['/posts']);
    }
  }

  onRetry(): void {
    this.postsService.postDetailResource.reload();
  }
}
