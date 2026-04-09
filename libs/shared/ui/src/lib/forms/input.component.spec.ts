import { render, fireEvent } from '@testing-library/angular';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  it('renders an input element', async () => {
    const { container } = await render(InputComponent);
    expect(container.querySelector('input')).toBeTruthy();
  });

  it('sets the type attribute', async () => {
    const { container } = await render(InputComponent, {
      inputs: { type: 'password' },
    });
    const input = container.querySelector('input')!;
    expect(input.type).toBe('password');
  });

  it('sets the placeholder', async () => {
    const { container } = await render(InputComponent, {
      inputs: { placeholder: 'Enter email' },
    });
    const input = container.querySelector('input')!;
    expect(input.placeholder).toBe('Enter email');
  });

  it('sets the disabled state', async () => {
    const { container } = await render(InputComponent, {
      inputs: { disabled: true },
    });
    const input = container.querySelector('input')!;
    expect(input.disabled).toBe(true);
  });

  it('applies editor variant by default', async () => {
    const { container } = await render(InputComponent);
    const input = container.querySelector('input')!;
    expect(input.className).toContain('bg-field-bg');
  });

  it('applies login variant classes', async () => {
    const { container } = await render(InputComponent, {
      inputs: { variant: 'login' },
    });
    const input = container.querySelector('input')!;
    expect(input.className).toContain('bg-input-bg');
  });

  it('emits valueChange on input', async () => {
    const valueChangeSpy = vi.fn();
    const { container } = await render(InputComponent, {
      on: { valueChange: valueChangeSpy },
    });
    const input = container.querySelector('input')!;
    fireEvent.input(input, { target: { value: 'hello' } });
    expect(valueChangeSpy).toHaveBeenCalledWith('hello');
  });

  it('emits blurred on blur', async () => {
    const blurredSpy = vi.fn();
    const { container } = await render(InputComponent, {
      on: { blurred: blurredSpy },
    });
    const input = container.querySelector('input')!;
    fireEvent.blur(input);
    expect(blurredSpy).toHaveBeenCalled();
  });

  it('sets aria-label when provided', async () => {
    const { container } = await render(InputComponent, {
      inputs: { ariaLabel: 'Search field' },
    });
    const input = container.querySelector('input')!;
    expect(input.getAttribute('aria-label')).toBe('Search field');
  });
});
