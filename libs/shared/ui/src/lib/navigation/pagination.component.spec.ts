import { render, fireEvent } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { PaginationComponent } from './pagination.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en'], defaultLang: 'en', prodMode: true },
});

describe('PaginationComponent', () => {
  it('renders with role="navigation"', async () => {
    const { container } = await render(PaginationComponent, {
      inputs: { currentPage: 1, totalPages: 5 },
      providers: [translocoProviders],
    });
    expect(container.querySelector('[role="navigation"]')).toBeTruthy();
  });

  it('renders previous and next buttons', async () => {
    const { container } = await render(PaginationComponent, {
      inputs: { currentPage: 2, totalPages: 5 },
      providers: [translocoProviders],
    });
    const buttons = container.querySelectorAll('button');
    // previous + page buttons + next
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('disables previous button on first page', async () => {
    const { container } = await render(PaginationComponent, {
      inputs: { currentPage: 1, totalPages: 5 },
      providers: [translocoProviders],
    });
    const buttons = container.querySelectorAll('button');
    const prevButton = buttons[0];
    expect(prevButton.disabled).toBe(true);
  });

  it('disables next button on last page', async () => {
    const { container } = await render(PaginationComponent, {
      inputs: { currentPage: 5, totalPages: 5 },
      providers: [translocoProviders],
    });
    const buttons = container.querySelectorAll('button');
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton.disabled).toBe(true);
  });

  it('emits pageChange when a page button is clicked', async () => {
    const pageChangeSpy = vi.fn();
    const { container } = await render(PaginationComponent, {
      inputs: { currentPage: 1, totalPages: 5 },
      providers: [translocoProviders],
      on: { pageChange: pageChangeSpy },
    });
    // Click page 2 button
    const buttons = container.querySelectorAll('button');
    const page2Button = Array.from(buttons).find((b) => b.textContent?.trim() === '2');
    if (page2Button) {
      fireEvent.click(page2Button);
      expect(pageChangeSpy).toHaveBeenCalledWith(2);
    }
  });

  it('marks current page with aria-current="page"', async () => {
    const { container } = await render(PaginationComponent, {
      inputs: { currentPage: 3, totalPages: 5 },
      providers: [translocoProviders],
    });
    const currentBtn = container.querySelector('[aria-current="page"]');
    expect(currentBtn).toBeTruthy();
    expect(currentBtn?.textContent?.trim()).toBe('3');
  });

  it('shows all pages when totalPages <= 7', async () => {
    const { container } = await render(PaginationComponent, {
      inputs: { currentPage: 1, totalPages: 5 },
      providers: [translocoProviders],
    });
    const buttons = container.querySelectorAll('button');
    // 5 page buttons + prev + next = 7
    expect(buttons.length).toBe(7);
  });

  it('shows ellipsis for many pages', async () => {
    const { container } = await render(PaginationComponent, {
      inputs: { currentPage: 5, totalPages: 10 },
      providers: [translocoProviders],
    });
    const ellipsis = container.querySelectorAll('span');
    const dots = Array.from(ellipsis).filter((s) => s.textContent?.includes('…'));
    expect(dots.length).toBeGreaterThan(0);
  });
});
