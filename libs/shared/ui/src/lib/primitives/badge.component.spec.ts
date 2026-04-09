import { render } from '@testing-library/angular';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  it('renders projected text', async () => {
    const { getByText } = await render(`<app-badge>angular</app-badge>`, {
      imports: [BadgeComponent],
    });
    expect(getByText('angular')).toBeTruthy();
  });

  it('applies default variant class', async () => {
    const { container } = await render(`<app-badge>tag</app-badge>`, {
      imports: [BadgeComponent],
    });
    const span = container.querySelector('span')!;
    expect(span.className).toContain('bg-tag-bg');
  });

  it('applies primary variant class', async () => {
    const { container } = await render(`<app-badge variant="primary">hot</app-badge>`, {
      imports: [BadgeComponent],
    });
    const span = container.querySelector('span')!;
    expect(span.className).toContain('bg-primary/10');
  });
});
