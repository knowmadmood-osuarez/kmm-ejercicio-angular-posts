import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { BadgeComponent, ButtonComponent } from '@app/shared/ui';
import type { Post } from '@app/posts/data-access';
import type { User } from '@app/core';

/** Split body text into paragraphs by double newline or single newline. */
function toParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [TranslocoPipe, BadgeComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-detail.component.html',
})
export class PostDetailComponent {
  readonly post = input.required<Post>();
  readonly author = input<User | undefined>(undefined);
  readonly isOwner = input(false);
  readonly lang = input<string>('es');

  readonly editClicked = output<void>();
  readonly deleteClicked = output<void>();

  readonly paragraphs = computed(() => toParagraphs(this.post().body));
}
