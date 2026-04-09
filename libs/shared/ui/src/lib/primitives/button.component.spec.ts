import { render, screen } from '@testing-library/angular';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  it('renders projected content', async () => {
    await render(`<app-button>Click me</app-button>`, {
      imports: [ButtonComponent],
    });
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('applies primary variant classes by default', async () => {
    const { container } = await render(`<app-button>OK</app-button>`, {
      imports: [ButtonComponent],
    });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('bg-primary-gradient');
  });

  it('applies danger variant classes', async () => {
    const { container } = await render(`<app-button variant="danger">Del</app-button>`, {
      imports: [ButtonComponent],
    });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('border-danger-border');
  });

  it('disables the button when disabled=true', async () => {
    const { container } = await render(`<app-button [disabled]="true">No</app-button>`, {
      imports: [ButtonComponent],
    });
    const btn = container.querySelector('button')!;
    expect(btn.disabled).toBe(true);
  });

  it('applies full width class', async () => {
    const { container } = await render(`<app-button [fullWidth]="true">Wide</app-button>`, {
      imports: [ButtonComponent],
    });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('w-full');
  });
});
