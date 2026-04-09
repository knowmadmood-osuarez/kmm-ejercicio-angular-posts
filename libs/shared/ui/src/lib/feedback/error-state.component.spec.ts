import { render, fireEvent } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { ErrorStateComponent } from './error-state.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en'], defaultLang: 'en', prodMode: true },
});

describe('ErrorStateComponent', () => {
  it('renders with role="alert"', async () => {
    const { container } = await render(ErrorStateComponent, {
      providers: [translocoProviders],
    });
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('renders the error icon', async () => {
    const { container } = await render(ErrorStateComponent, {
      providers: [translocoProviders],
    });
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders a heading element', async () => {
    const { container } = await render(ErrorStateComponent, {
      providers: [translocoProviders],
    });
    expect(container.querySelector('h3')).toBeTruthy();
  });

  it('renders a retry button', async () => {
    const { container } = await render(ErrorStateComponent, {
      providers: [translocoProviders],
    });
    const button = container.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('emits retry when button is clicked', async () => {
    const retrySpy = vi.fn();
    const { container } = await render(ErrorStateComponent, {
      providers: [translocoProviders],
      on: { retry: retrySpy },
    });
    const button = container.querySelector('button')!;
    fireEvent.click(button);
    expect(retrySpy).toHaveBeenCalled();
  });
});
