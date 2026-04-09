import { render } from '@testing-library/angular';
import { LabelComponent } from './label.component';

describe('LabelComponent', () => {
  it('renders a label element', async () => {
    const { container } = await render(`<app-label>Username</app-label>`, {
      imports: [LabelComponent],
    });
    expect(container.querySelector('label')).toBeTruthy();
  });

  it('renders projected content', async () => {
    const { container } = await render(`<app-label>Username</app-label>`, {
      imports: [LabelComponent],
    });
    expect(container.textContent).toContain('Username');
  });

  it('sets the for attribute', async () => {
    const { container } = await render(`<app-label for="email">Email</app-label>`, {
      imports: [LabelComponent],
    });
    const label = container.querySelector('label')!;
    expect(label.getAttribute('for')).toBe('email');
  });

  it('applies default variant classes', async () => {
    const { container } = await render(`<app-label>Name</app-label>`, {
      imports: [LabelComponent],
    });
    const label = container.querySelector('label')!;
    expect(label.className).toContain('text-xs');
    expect(label.className).toContain('uppercase');
  });

  it('applies compact variant classes', async () => {
    const { container } = await render(`<app-label variant="compact">Name</app-label>`, {
      imports: [LabelComponent],
    });
    const label = container.querySelector('label')!;
    expect(label.className).toContain('text-[10px]');
  });
});
