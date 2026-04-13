import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { form, minLength, required, submit } from '@angular/forms/signals';

import {
  ButtonComponent,
  IconComponent,
  InputComponent,
  LabelComponent,
  TextareaComponent,
} from '@app/shared/ui';
import type { Post } from '@app/posts/data-access';

export interface PostFormData {
  title: string;
  body: string;
  tags: string[];
}

interface PostFormModel {
  title: string;
  body: string;
  tags: string;
}

/** Pure: split a comma-separated string into trimmed, non-empty tags. */
function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Pure: join tags array into comma-separated string. */
function joinTags(tags: string[]): string {
  return tags.join(', ');
}

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [
    TranslocoPipe,
    ButtonComponent,
    IconComponent,
    InputComponent,
    LabelComponent,
    TextareaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-form.component.html',
})
export class PostFormComponent {
  readonly post = input<Post | undefined>(undefined);
  readonly loading = input(false);

  readonly submitted = output<PostFormData>();
  readonly cancelled = output<void>();

  readonly postModel = signal<PostFormModel>({ title: '', body: '', tags: '' });

  readonly postForm = form(this.postModel, (schemaPath) => {
    required(schemaPath.title, { message: 'posts.form.titleRequired' });
    minLength(schemaPath.title, 3, { message: 'posts.form.titleMinLength' });
    required(schemaPath.body, { message: 'posts.form.bodyRequired' });
    minLength(schemaPath.body, 10, { message: 'posts.form.bodyMinLength' });
  });

  constructor() {
    effect(() => {
      const existing = this.post();
      if (existing) {
        this.postModel.set({
          title: existing.title,
          body: existing.body,
          tags: joinTags(existing.tags),
        });
      }
    });
  }

  onSubmit(event?: Event): void {
    event?.preventDefault();
    submit(this.postForm, async () => {
      const model = this.postModel();
      this.submitted.emit({
        title: model.title.trim(),
        body: model.body.trim(),
        tags: parseTags(model.tags),
      });
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
