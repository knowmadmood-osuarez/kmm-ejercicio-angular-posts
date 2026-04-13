import { render } from '@testing-library/angular';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  it('shows initial letter from name', async () => {
    const { getByText } = await render(AvatarComponent, {
      inputs: { name: 'alice' },
    });
    // Single-word names show first two chars uppercased
    expect(getByText('AL')).toBeTruthy();
  });

  it('shows "?" when name is empty', async () => {
    const { getByText } = await render(AvatarComponent, {
      inputs: { name: '' },
    });
    expect(getByText('?')).toBeTruthy();
  });

  it('renders an image when src is provided', async () => {
    const { container } = await render(AvatarComponent, {
      inputs: { name: 'bob', src: 'https://example.com/bob.png' },
    });
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('alt')).toBe('bob');
  });

  it('has role="img" and aria-label', async () => {
    const { container } = await render(AvatarComponent, {
      inputs: { name: 'carla' },
    });
    const div = container.querySelector('[role="img"]');
    expect(div).toBeTruthy();
    expect(div?.getAttribute('aria-label')).toBe('carla');
  });

  it('applies correct size classes', async () => {
    const { container } = await render(AvatarComponent, {
      inputs: { name: 'x', size: 'lg' },
    });
    const div = container.querySelector('[role="img"]');
    expect(div?.className).toContain('h-10');
    expect(div?.className).toContain('w-10');
  });
});
