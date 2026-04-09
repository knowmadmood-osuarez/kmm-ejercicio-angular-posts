import { render, fireEvent } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { ConfirmDialogComponent } from './confirm-dialog.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en'], defaultLang: 'en', prodMode: true },
});

describe('ConfirmDialogComponent', () => {
  it('does not render dialog when open is false', async () => {
    const { container } = await render(ConfirmDialogComponent, {
      inputs: { open: false },
      providers: [translocoProviders],
    });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders dialog when open is true', async () => {
    const { container } = await render(ConfirmDialogComponent, {
      inputs: { open: true, title: 'shared.confirm', message: 'shared.deleteConfirm' },
      providers: [translocoProviders],
    });
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('renders a title heading', async () => {
    const { container } = await render(ConfirmDialogComponent, {
      inputs: { open: true, title: 'shared.confirm', message: 'shared.deleteConfirm' },
      providers: [translocoProviders],
    });
    expect(container.querySelector('h2')).toBeTruthy();
  });

  it('renders cancel and confirm buttons', async () => {
    const { container } = await render(ConfirmDialogComponent, {
      inputs: { open: true, title: 'shared.confirm', message: 'shared.msg' },
      providers: [translocoProviders],
    });
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('emits confirmed when confirm button is clicked', async () => {
    const confirmedSpy = vi.fn();
    const { container } = await render(ConfirmDialogComponent, {
      inputs: { open: true, title: 'shared.confirm', message: 'shared.msg' },
      providers: [translocoProviders],
      on: { confirmed: confirmedSpy },
    });
    const buttons = container.querySelectorAll('button');
    const confirmBtn = buttons[buttons.length - 1];
    fireEvent.click(confirmBtn);
    expect(confirmedSpy).toHaveBeenCalled();
  });

  it('emits cancelled when cancel button is clicked', async () => {
    const cancelledSpy = vi.fn();
    const { container } = await render(ConfirmDialogComponent, {
      inputs: { open: true, title: 'shared.confirm', message: 'shared.msg' },
      providers: [translocoProviders],
      on: { cancelled: cancelledSpy },
    });
    const buttons = container.querySelectorAll('button');
    const cancelBtn = buttons[0];
    fireEvent.click(cancelBtn);
    expect(cancelledSpy).toHaveBeenCalled();
  });

  it('has aria-modal="true"', async () => {
    const { container } = await render(ConfirmDialogComponent, {
      inputs: { open: true, title: 'shared.confirm', message: 'shared.msg' },
      providers: [translocoProviders],
    });
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
  });
});
