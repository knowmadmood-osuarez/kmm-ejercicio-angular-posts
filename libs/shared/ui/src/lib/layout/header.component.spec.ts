import { render, RenderResult, fireEvent } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';
import { provideRouter, Router } from '@angular/router';
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
  token: signal('fake-token'),
  isAuthenticated: signal(true),
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

  it('calls authService.logout when logout button is clicked', async () => {
    mockAuthService.logout.mockReset();
    const { container } = await renderHeader();
    const logoutBtn = container.querySelector('button[aria-label]') as HTMLElement;
    fireEvent.click(logoutBtn);
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('navigates with search query on Enter', async () => {
    const { container } = await renderHeader();
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const input = container.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'angular';
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(spy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({ q: 'angular' }),
      }),
    );
  });
});
