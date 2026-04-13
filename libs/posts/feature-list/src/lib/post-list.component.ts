import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { PostCardComponent } from './post-card.component';
import type { Post } from '@app/posts/data-access';
import type { User } from '@app/core';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [PostCardComponent],
  templateUrl: './post-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostListComponent {
  readonly posts = input.required<Post[]>();
  readonly users = input<User[]>([]);
  readonly lang = input<string>('es');

  readonly postHovered = output<string>();
  readonly currentUser = input<User | null>(null);

  /** Join posts with their authors in a single computed — reactive to both signals. */
  readonly postsWithAuthors = computed(() => {
    const usersMap = new Map(this.users().map((u) => [String(u.id), u]));
    const currentUserId = String(this.currentUser()?.id ?? '');
    return this.posts().map((post, index) => ({
      post,
      author: usersMap.get(String(post.userId)),
      isCurrentUser: String(post.userId) === currentUserId,
      index,
    }));
  });
}
