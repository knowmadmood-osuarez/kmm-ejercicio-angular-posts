import { render, fireEvent } from '@testing-library/angular';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from './language-switcher.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en', 'es'], defaultLang: 'en', prodMode: true },
});

describe('LanguageSwitcherComponent', () => {
  it('renders with role="radiogroup"', async () => {
    const { container } = await render(LanguageSwitcherComponent, {
      providers: [translocoProviders],
    });
    expect(container.querySelector('[role="radiogroup"]')).toBeTruthy();
  });

  it('renders a button for each language', async () => {
    const { container } = await render(LanguageSwitcherComponent, {
      providers: [translocoProviders],
    });
    const buttons = container.querySelectorAll('button[role="radio"]');
    expect(buttons.length).toBe(2);
  });

  it('marks the active language as checked', async () => {
    const { container } = await render(LanguageSwitcherComponent, {
      providers: [translocoProviders],
    });
    const buttons = container.querySelectorAll('button[role="radio"]');
    const enButton = Array.from(buttons).find((b) => b.textContent?.trim() === 'en');
    expect(enButton?.getAttribute('aria-checked')).toBe('true');
  });

  it('switches language on click', async () => {
    const { container, debugElement } = await render(LanguageSwitcherComponent, {
      providers: [translocoProviders],
    });
    const buttons = container.querySelectorAll('button[role="radio"]');
    const esButton = Array.from(buttons).find((b) => b.textContent?.trim() === 'es')!;
    fireEvent.click(esButton);

    const transloco = debugElement.injector.get(TranslocoService);
    expect(transloco.getActiveLang()).toBe('es');
  });
});
