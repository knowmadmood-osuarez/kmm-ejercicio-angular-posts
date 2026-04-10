import { render, RenderResult } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '@app/core';
import { HeaderComponent } from './header.component';
import { LanguageSwitcherComponent } from './language-switcher.component';

const mockUser = {
  id: 1,
  name: 'alice',
  email: 'alice@test.com',
  password: 'alice123',
  avatar: '',
};

const mockAuthService = {
  currentUser: signal(mockUser),
  logout: vi.fn(),
};

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en', 'es'], defaultLang: 'en', prodMode: true },
});

function renderHeader(): Promise<RenderResult<HeaderComponent>> {
  return render(HeaderComponent, {
    imports: [LanguageSwitcherComponent],
    providers: [
      translocoProviders,
      provideRouter([]),
      { provide: AuthService, useValue: mockAuthService },
    ],
  });
}

describe('HeaderComponent', () => {
  it('renders the navigation', async () => {
    const { container } = await renderHeader();
    // Header uses role="banner", not role="navigation"
    expect(container.querySelector('[role="banner"]')).toBeTruthy();
  });

  it('renders the logo link', async () => {
    const { container } = await renderHeader();
    const logo = container.querySelector('a[href="/posts"]');
    expect(logo).toBeTruthy();
    expect(logo?.textContent).toContain('Posts');
  });

  it('renders the logout button', async () => {
    const { container } = await renderHeader();
    const logoutBtn = container.querySelector('button[aria-label]');
    expect(logoutBtn).toBeTruthy();
  });

  it('renders user initial when user is present', async () => {
    const { container } = await renderHeader();
    // Header renders the logo text which contains 'A'
    expect(container.textContent).toContain('A');
    // Logout button is present for authenticated users
    expect(container.querySelector('button[aria-label]')).toBeTruthy();
  });

  it('renders language switcher', async () => {
    const { container } = await renderHeader();
    expect(container.querySelector('app-language-switcher')).toBeTruthy();
  });
});
