import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent, SelectComponent } from '@app/shared/ui';
import type { PostFilters } from '@app/posts/data-access';
import type { User } from '@app/core';

@Component({
  selector: 'app-post-filters',
  standalone: true,
  imports: [TranslocoPipe, SelectComponent, IconComponent],
  templateUrl: './post-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostFiltersComponent {
  readonly filters = input.required<PostFilters>();
  readonly authors = input<User[]>([]);
  readonly tags = input<string[]>([]);

  readonly filtersChange = output<PostFilters>();
  readonly filtersOpen = signal(false);

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  onAuthorChange(author: string): void {
    this.filtersChange.emit({ ...this.filters(), author });
  }

  onTagChange(tag: string): void {
    this.filtersChange.emit({ ...this.filters(), tag });
  }
}
