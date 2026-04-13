import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AvatarComponent, BadgeComponent, CardComponent } from '@app/shared/ui';
import type { Post } from '@app/posts/data-access';
import type { SafeUser } from '@app/core';

function excerpt(text: string): string {
  return text.length <= 130 ? text : text.slice(0, 130).trimEnd() + '…';
}

function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(lang, { year: 'numeric', month: 'short' }).toUpperCase();
}

function capitalizeName(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, AvatarComponent, BadgeComponent, CardComponent],
  templateUrl: './post-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class PostCardComponent {
  readonly post = input.required<Post>();
  readonly author = input<SafeUser | undefined>(undefined);
  readonly isCurrentUser = input<boolean>(false);
  readonly variant = input<'white' | 'tonal'>('white');
  readonly lang = input<string>('es');

  readonly hovered = output<string>();

  readonly bodyExcerpt = computed(() => excerpt(this.post().body));
  readonly formattedDate = computed(() => formatDate(this.post().createdAt, this.lang()));
  readonly authorName = computed(() => capitalizeName(this.author()?.name ?? ''));
  readonly authorAvatar = computed(() => this.author()?.avatar ?? '');
}
