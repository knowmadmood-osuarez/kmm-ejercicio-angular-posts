import { render } from '@testing-library/angular';
import { DividerComponent } from './divider.component';

describe('DividerComponent', () => {
  it('renders an hr with role="separator"', async () => {
    const { container } = await render(DividerComponent);
    const hr = container.querySelector('hr[role="separator"]');
    expect(hr).toBeTruthy();
  });

  it('applies md spacing by default', async () => {
    const { container } = await render(DividerComponent);
    const hr = container.querySelector('hr')!;
    expect(hr.className).toContain('my-6');
  });

  it('applies sm spacing', async () => {
    const { container } = await render(DividerComponent, {
      inputs: { spacing: 'sm' },
    });
    const hr = container.querySelector('hr')!;
    expect(hr.className).toContain('my-4');
  });

  it('applies lg spacing', async () => {
    const { container } = await render(DividerComponent, {
      inputs: { spacing: 'lg' },
    });
    const hr = container.querySelector('hr')!;
    expect(hr.className).toContain('my-8');
  });
});
