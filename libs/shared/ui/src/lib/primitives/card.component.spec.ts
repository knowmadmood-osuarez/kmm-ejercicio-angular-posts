import { render } from '@testing-library/angular';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  it('renders projected content', async () => {
    const { getByText } = await render(`<app-card>Hello</app-card>`, {
      imports: [CardComponent],
    });
    expect(getByText('Hello')).toBeTruthy();
  });

  it('applies white variant with shadow by default', async () => {
    const { container } = await render(`<app-card>X</app-card>`, {
      imports: [CardComponent],
    });
    const article = container.querySelector('article')!;
    expect(article.className).toContain('bg-card');
    expect(article.className).toContain('shadow-card');
  });

  it('applies tonal variant', async () => {
    const { container } = await render(`<app-card variant="tonal">T</app-card>`, {
      imports: [CardComponent],
    });
    const article = container.querySelector('article')!;
    expect(article.className).toContain('bg-surface-alt');
  });

  it('applies compact padding', async () => {
    const { container } = await render(`<app-card padding="compact">C</app-card>`, {
      imports: [CardComponent],
    });
    const article = container.querySelector('article')!;
    expect(article.className).toContain('p-6');
  });
});
