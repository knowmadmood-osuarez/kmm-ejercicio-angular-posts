import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { form, required, submit } from '@angular/forms/signals';

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

  readonly postForm = form(this.postModel, (schema) => {
    required(schema.title);
    required(schema.body);
  });

  readonly titleTooShort = computed(() => {
    const val = this.postModel().title;
    return val.length > 0 && val.length < 3;
  });

  readonly bodyTooShort = computed(() => {
    const val = this.postModel().body;
    return val.length > 0 && val.length < 10;
  });

  readonly canSubmit = computed(() => {
    const model = this.postModel();
    return (
      !this.loading() &&
      !this.postForm().invalid() &&
      model.title.length >= 3 &&
      model.body.length >= 10
    );
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
    if (!this.canSubmit()) return;
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
