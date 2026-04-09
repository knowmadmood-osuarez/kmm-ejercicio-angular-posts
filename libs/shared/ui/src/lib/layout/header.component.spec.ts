import { render } from '@testing-library/angular';
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

describe('HeaderComponent', () => {
  it('renders the navigation', async () => {
    const { container } = await render(HeaderComponent, {
      imports: [LanguageSwitcherComponent],
      providers: [
        translocoProviders,
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
    expect(container.querySelector('[role="navigation"]')).toBeTruthy();
  });

  it('renders the logo link', async () => {
    const { container } = await render(HeaderComponent, {
      imports: [LanguageSwitcherComponent],
      providers: [
        translocoProviders,
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
    const logo = container.querySelector('a[href="/posts"]');
    expect(logo).toBeTruthy();
    expect(logo?.textContent).toContain('Posts');
  });

  it('renders the logout button', async () => {
    const { container } = await render(HeaderComponent, {
      imports: [LanguageSwitcherComponent],
      providers: [
        translocoProviders,
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
    const logoutBtn = container.querySelector('button[aria-label]');
    expect(logoutBtn).toBeTruthy();
  });

  it('renders user initial when user is present', async () => {
    const { container } = await render(HeaderComponent, {
      imports: [LanguageSwitcherComponent],
      providers: [
        translocoProviders,
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('alice');
  });

  it('renders language switcher', async () => {
    const { container } = await render(HeaderComponent, {
      imports: [LanguageSwitcherComponent],
      providers: [
        translocoProviders,
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
    expect(container.querySelector('app-language-switcher')).toBeTruthy();
  });
});
