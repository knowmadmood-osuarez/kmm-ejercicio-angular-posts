import { render } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { ForbiddenStateComponent } from './forbidden-state.component';
import { IconComponent } from '../icons/icon.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en'], defaultLang: 'en', prodMode: true },
});

describe('ForbiddenStateComponent', () => {
  it('renders with role="alert"', async () => {
    const { container } = await render(ForbiddenStateComponent, {
      imports: [IconComponent],
      providers: [translocoProviders],
    });
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('renders the icon', async () => {
    const { container } = await render(ForbiddenStateComponent, {
      imports: [IconComponent],
      providers: [translocoProviders],
    });
    expect(container.querySelector('app-icon')).toBeTruthy();
  });

  it('renders a heading element', async () => {
    const { container } = await render(ForbiddenStateComponent, {
      imports: [IconComponent],
      providers: [translocoProviders],
    });
    expect(container.querySelector('h3')).toBeTruthy();
  });

  it('renders a description paragraph', async () => {
    const { container } = await render(ForbiddenStateComponent, {
      imports: [IconComponent],
      providers: [translocoProviders],
    });
    expect(container.querySelector('p')).toBeTruthy();
  });
});
