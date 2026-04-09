import { render } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { PageHeaderComponent } from './page-header.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en'], defaultLang: 'en', prodMode: true },
});

describe('PageHeaderComponent', () => {
  it('renders an h1 element', async () => {
    const { container } = await render(PageHeaderComponent, {
      inputs: { title: 'posts.title' },
      providers: [translocoProviders],
    });
    expect(container.querySelector('h1')).toBeTruthy();
  });

  it('renders the title text', async () => {
    const { container } = await render(PageHeaderComponent, {
      inputs: { title: 'posts.title' },
      providers: [translocoProviders],
    });
    const h1 = container.querySelector('h1')!;
    expect(h1.textContent?.trim()).toBeTruthy();
  });

  it('does not render subtitle by default', async () => {
    const { container } = await render(PageHeaderComponent, {
      inputs: { title: 'posts.title' },
      providers: [translocoProviders],
    });
    expect(container.querySelector('p')).toBeNull();
  });

  it('renders subtitle when provided', async () => {
    const { container } = await render(PageHeaderComponent, {
      inputs: { title: 'posts.title', subtitle: 'posts.subtitle' },
      providers: [translocoProviders],
    });
    expect(container.querySelector('p')).toBeTruthy();
  });
});
