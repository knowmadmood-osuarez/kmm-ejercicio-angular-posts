import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';

import { AuthService } from '@app/core';
import type { User } from '@app/core';
import { LoginPageComponent } from './login-page.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['es', 'en'], defaultLang: 'es', prodMode: true },
});

function setup() {
  TestBed.configureTestingModule({
    imports: [LoginPageComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([{ path: 'posts', component: LoginPageComponent }]),
      translocoProviders,
    ],
  });

  const fixture: ComponentFixture<LoginPageComponent> = TestBed.createComponent(LoginPageComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  return {
    fixture,
    component,
    authService: TestBed.inject(AuthService),
    router: TestBed.inject(Router),
  };
}

describe('LoginPageComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should render the login form', () => {
    const { fixture } = setup();
    const form = fixture.nativeElement.querySelector('app-login-form');
    expect(form).toBeTruthy();
  });

  it('should render the header with language switcher', () => {
    const { fixture } = setup();
    const header = fixture.nativeElement.querySelector('header');
    expect(header).toBeTruthy();
    const switcher = fixture.nativeElement.querySelector('app-language-switcher');
    expect(switcher).toBeTruthy();
  });

  it('should call authService.login on form submit', async () => {
    const { component, authService, router } = setup();
    const loginSpy = vi.spyOn(authService, 'login').mockResolvedValue({
      id: '1',
      name: 'alice',
      email: 'alice@example.com',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
    });
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await component.onLogin({ name: 'alice', password: 'alice123' });

    expect(loginSpy).toHaveBeenCalledWith('alice', 'alice123');
    expect(navigateSpy).toHaveBeenCalledWith(['/posts']);
  });

  it('should set error on failed login', async () => {
    const { component, authService } = setup();
    vi.spyOn(authService, 'login').mockRejectedValue(new Error('Invalid credentials'));

    await component.onLogin({ name: 'alice', password: 'wrong' });

    expect(component.error()).toBeInstanceOf(Error);
    expect(component.loading()).toBe(false);
  });

  it('should set loading while login is in progress', async () => {
    const { component, authService } = setup();
    let resolveLogin!: (value: User | PromiseLike<User>) => void;
    vi.spyOn(authService, 'login').mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    const loginPromise = component.onLogin({ name: 'alice', password: 'alice123' });
    expect(component.loading()).toBe(true);

    resolveLogin({
      id: '1',
      name: 'alice',
      password: 'alice123',
      email: 'alice@example.com',
      avatar: '',
    });
    await loginPromise;
    expect(component.loading()).toBe(false);
  });

  it('should wrap non-Error rejection in a new Error', async () => {
    const { component, authService } = setup();
    vi.spyOn(authService, 'login').mockRejectedValue('string rejection');

    await component.onLogin({ name: 'alice', password: 'wrong' });

    expect(component.error()).toBeInstanceOf(Error);
    expect(component.error()?.message).toBe('Login failed');
    expect(component.loading()).toBe(false);
  });
});
