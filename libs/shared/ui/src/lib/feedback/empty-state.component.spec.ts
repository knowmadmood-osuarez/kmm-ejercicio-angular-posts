import { render } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { EmptyStateComponent } from './empty-state.component';
import { IconComponent } from '../icons/icon.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en'], defaultLang: 'en', prodMode: true },
});

describe('EmptyStateComponent', () => {
  it('renders with role="status"', async () => {
    const { container } = await render(EmptyStateComponent, {
      imports: [IconComponent],
      providers: [translocoProviders],
    });
    expect(container.querySelector('[role="status"]')).toBeTruthy();
  });

  it('renders the icon', async () => {
    const { container } = await render(EmptyStateComponent, {
      imports: [IconComponent],
      providers: [translocoProviders],
    });
    expect(container.querySelector('app-icon')).toBeTruthy();
  });

  it('renders heading element', async () => {
    const { container } = await render(EmptyStateComponent, {
      imports: [IconComponent],
      providers: [translocoProviders],
    });
    expect(container.querySelector('h3')).toBeTruthy();
  });
});
