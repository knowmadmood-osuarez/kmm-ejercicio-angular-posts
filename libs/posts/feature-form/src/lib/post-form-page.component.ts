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
import { AuthFacade } from '@app/core';
import { PostsFacade } from '@app/posts/data-access';
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
  private readonly authFacade = inject(AuthFacade);
  private readonly postsFacade = inject(PostsFacade);

  private readonly currentUser = this.authFacade.currentUser;

  readonly isEditMode = computed(() => !!this.id());
  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'posts.form.titleEdit' : 'posts.form.titleNew',
  );

  readonly isLoading = computed(() => this.isEditMode() && this.postsFacade.selectedPostLoading());
  readonly error = computed(() =>
    this.isEditMode() ? this.postsFacade.selectedPostError() : null,
  );
  readonly post = computed(() => (this.isEditMode() ? this.postsFacade.selectedPost() : undefined));

  readonly isForbidden = computed(() => {
    const post = this.post();
    const user = this.currentUser();
    if (!this.isEditMode() || !post || !user) return false;
    return String(post.userId) !== String(user.id);
  });

  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.postsFacade.loadDetail(id);
    });
  }

  async onSubmit(data: PostFormData): Promise<void> {
    const user = this.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    try {
      if (this.isEditMode()) {
        const changes: PostUpdate = { title: data.title, body: data.body, tags: data.tags };
        await this.postsFacade.updatePost(this.id()!, changes);
      } else {
        const payload: PostCreate = {
          userId: String(user.id),
          title: data.title,
          body: data.body,
          tags: data.tags,
          createdAt: new Date().toISOString(),
        };
        await this.postsFacade.createPost(payload);
      }
      void this.router.navigate(['/posts']);
    } catch {
      this.saveError.set('shared.error');
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
    this.postsFacade.reloadDetail();
  }
}
