import { render, RenderResult } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '@app/core';
import { LayoutComponent } from './layout.component';

const mockAuthService = {
  currentUser: signal(null),
  logout: vi.fn(),
};

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en', 'es'], defaultLang: 'en', prodMode: true },
});

function renderLayout(): Promise<RenderResult<LayoutComponent>> {
  return render(LayoutComponent, {
    providers: [
      translocoProviders,
      provideRouter([]),
      { provide: AuthService, useValue: mockAuthService },
    ],
  });
}

describe('LayoutComponent', () => {
  it('renders the header', async () => {
    const { container } = await renderLayout();
    expect(container.querySelector('app-header')).toBeTruthy();
  });

  it('renders the main content area', async () => {
    const { container } = await renderLayout();
    const main = container.querySelector('main#main-content');
    expect(main).toBeTruthy();
    expect(main?.getAttribute('role')).toBe('main');
  });

  it('renders the skip-to-content link', async () => {
    const { container } = await renderLayout();
    const skipLink = container.querySelector('a[href="#main-content"]');
    expect(skipLink).toBeTruthy();
  });
});
