import { render } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { LoadingComponent } from './loading.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en'], defaultLang: 'en', prodMode: true },
});

describe('LoadingComponent', () => {
  it('renders 3 skeleton items by default', async () => {
    const { container } = await render(LoadingComponent, {
      providers: [translocoProviders],
    });
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(3);
  });

  it('renders custom number of skeleton items', async () => {
    const { container } = await render(LoadingComponent, {
      inputs: { lines: 5 },
      providers: [translocoProviders],
    });
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(5);
  });

  it('has role="status" for a11y', async () => {
    const { container } = await render(LoadingComponent, {
      providers: [translocoProviders],
    });
    expect(container.querySelector('[role="status"]')).toBeTruthy();
  });

  it('has sr-only loading text', async () => {
    const { container } = await render(LoadingComponent, {
      providers: [translocoProviders],
    });
    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
  });
});
