import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { SelectComponent } from '@app/shared/ui';
import type { PostFilters } from '@app/posts/data-access';
import type { SafeUser } from '@app/core';

@Component({
  selector: 'app-post-filters',
  standalone: true,
  imports: [TranslocoPipe, SelectComponent],
  templateUrl: './post-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostFiltersComponent {
  readonly filters = input.required<PostFilters>();
  readonly authors = input<SafeUser[]>([]);
  readonly tags = input<string[]>([]);

  readonly filtersChange = output<PostFilters>();

  onAuthorChange(author: string): void {
    this.filtersChange.emit({ ...this.filters(), author });
  }

  onTagChange(tag: string): void {
    this.filtersChange.emit({ ...this.filters(), tag });
  }
}
