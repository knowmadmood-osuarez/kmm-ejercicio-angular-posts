import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-pagination',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      class="flex items-center justify-between pt-4"
      role="navigation"
      [attr.aria-label]="
        'pagination.page' | transloco: { current: currentPage(), total: totalPages() }
      "
    >
      <!-- Previous -->
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-bold text-text-secondary transition-colors hover:text-text disabled:opacity-40 disabled:cursor-not-allowed"
        [disabled]="isFirst()"
        (click)="pageChange.emit(currentPage() - 1)"
        [attr.aria-label]="'pagination.previous' | transloco"
      >
        <svg class="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 10 10" aria-hidden="true">
          <path
            d="M7 1L3 5l4 4"
            stroke="currentColor"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ 'pagination.previous' | transloco }}
      </button>

      <!-- Page numbers -->
      <div class="flex items-center gap-1">
        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="w-10 text-center text-sm text-text-muted">…</span>
          } @else {
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold transition-colors"
              [class]="
                page === currentPage()
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-surface-alt'
              "
              (click)="pageChange.emit(page)"
              [attr.aria-label]="
                'pagination.page' | transloco: { current: page, total: totalPages() }
              "
              [attr.aria-current]="page === currentPage() ? 'page' : null"
            >
              {{ page }}
            </button>
          }
        }
      </div>

      <!-- Next -->
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-bold text-text-secondary transition-colors hover:text-text disabled:opacity-40 disabled:cursor-not-allowed"
        [disabled]="isLast()"
        (click)="pageChange.emit(currentPage() + 1)"
        [attr.aria-label]="'pagination.next' | transloco"
      >
        {{ 'pagination.next' | transloco }}
        <svg class="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 10 10" aria-hidden="true">
          <path
            d="M3 1l4 4-4 4"
            stroke="currentColor"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </nav>
  `,
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  readonly isFirst = computed(() => this.currentPage() <= 1);
  readonly isLast = computed(() => this.currentPage() >= this.totalPages());

  readonly visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];

    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push(-1); // ellipsis
    }

    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push(-1); // ellipsis
    }

    // Always show last page
    pages.push(total);

    return pages;
  });
}
