import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { PostCardComponent } from './post-card.component';
import type { Post } from '@app/posts/data-access';
import type { SafeUser } from '@app/core';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [PostCardComponent],
  templateUrl: './post-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostListComponent {
  readonly posts = input.required<Post[]>();
  readonly users = input<SafeUser[]>([]);
  readonly lang = input<string>('es');

  readonly postHovered = output<number>();
  readonly currentUser = input<SafeUser | null>(null);

  /** Join posts with their authors in a single computed — reactive to both signals. */
  readonly postsWithAuthors = computed(() => {
    const usersMap = new Map(this.users().map((u) => [Number(u.id), u]));
    const currentUserId = Number(this.currentUser()?.id);
    return this.posts().map((post, index) => ({
      post,
      author: usersMap.get(Number(post.userId)),
      isCurrentUser: Number(post.userId) === currentUserId,
      index,
    }));
  });
}
