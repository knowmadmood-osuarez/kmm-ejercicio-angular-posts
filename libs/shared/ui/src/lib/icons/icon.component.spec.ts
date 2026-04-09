import { render, screen } from '@testing-library/angular';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  it('renders an SVG for a known icon name', async () => {
    const { container } = await render(IconComponent, {
      inputs: { name: 'search' },
    });
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 14 14');
  });

  it('sets aria-hidden="true" by default', async () => {
    const { fixture } = await render(IconComponent, { inputs: { name: 'logout' } });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('sets aria-hidden="false" when label is provided', async () => {
    const { fixture } = await render(IconComponent, {
      inputs: { name: 'edit', label: 'Edit post' },
    });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('false');
  });

  it('includes aria-label on svg when label is set', async () => {
    const { container } = await render(IconComponent, {
      inputs: { name: 'delete', label: 'Delete' },
    });
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-label')).toBe('Delete');
  });
});
