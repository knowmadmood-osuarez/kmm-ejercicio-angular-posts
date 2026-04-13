import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ButtonComponent } from '@app/shared/ui';
import type { Comment } from '@app/posts/data-access';
import type { User } from '@app/core';

/** Pure: returns a locale-relative date string using Intl.RelativeTimeFormat. */
function relativeDate(iso: string, lang: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

  if (mins < 2) return rtf.format(0, 'minute');
  if (mins < 60) return rtf.format(-mins, 'minute');
  if (hours < 24) return rtf.format(-hours, 'hour');
  if (days < 7) return rtf.format(-days, 'day');

  return new Date(iso).toLocaleDateString(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function capitalizeName(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [TranslocoPipe, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-card.component.html',
})
export class CommentCardComponent {
  readonly comment = input.required<Comment>();
  readonly author = input<User | undefined>(undefined);
  readonly isOwner = input(false);
  readonly lang = input<string>('es');

  readonly editClicked = output<Comment>();
  readonly deleteClicked = output<string>();

  readonly relativeDate = computed(() => relativeDate(this.comment().createdAt, this.lang()));
  readonly authorName = computed(() => capitalizeName(this.author()?.name ?? 'Unknown'));
}
