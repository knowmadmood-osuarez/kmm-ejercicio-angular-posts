import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { form, required, submit } from '@angular/forms/signals';

import { ButtonComponent, IconComponent, LabelComponent, TextareaComponent } from '@app/shared/ui';

interface CommentModel {
  body: string;
}

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [TranslocoPipe, ButtonComponent, IconComponent, LabelComponent, TextareaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-form.component.html',
})
export class CommentFormComponent {
  readonly initialBody = input<string>('');
  readonly loading = input(false);

  readonly submitted = output<string>();
  readonly cancelled = output<void>();

  readonly commentModel = signal<CommentModel>({ body: '' });

  readonly commentForm = form(this.commentModel, (schema) => {
    required(schema.body);
  });

  constructor() {
    effect(() => {
      const initial = this.initialBody();
      this.commentModel.set({ body: initial });
    });
  }

  onSubmit(event?: Event): void {
    event?.preventDefault();
    submit(this.commentForm, async () => {
      const body = this.commentModel().body.trim();
      this.submitted.emit(body);
      if (!this.initialBody()) {
        this.commentModel.set({ body: '' });
      }
    });
  }

  onCancel(): void {
    this.commentModel.set({ body: this.initialBody() });
    this.cancelled.emit();
  }
}
