import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ButtonComponent } from '@app/shared/ui';
import type { Comment } from '@app/posts/data-access';
import type { SafeUser } from '@app/core';

/** Pure: returns a locale-relative date string. */
function relativeDate(iso: string, lang: string): string {
  const now = Date.now();
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (lang === 'es') {
    if (mins < 2) return 'Ahora mismo';
    if (mins < 60) return `hace ${mins} min`;
    if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days === 1) return 'Ayer';
    if (days < 7) return `hace ${days} días`;
  } else {
    if (mins < 2) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
  }

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
  readonly author = input<SafeUser | undefined>(undefined);
  readonly isOwner = input(false);
  readonly lang = input<string>('es');

  readonly editClicked = output<Comment>();
  readonly deleteClicked = output<number>();

  readonly relativeDate = computed(() => relativeDate(this.comment().createdAt, this.lang()));
  readonly authorName = computed(() => capitalizeName(this.author()?.name ?? 'Unknown'));
}
