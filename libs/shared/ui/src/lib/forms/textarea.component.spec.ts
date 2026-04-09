import { render, fireEvent } from '@testing-library/angular';
import { TextareaComponent } from './textarea.component';

describe('TextareaComponent', () => {
  it('renders a textarea element', async () => {
    const { container } = await render(TextareaComponent);
    expect(container.querySelector('textarea')).toBeTruthy();
  });

  it('sets the placeholder', async () => {
    const { container } = await render(TextareaComponent, {
      inputs: { placeholder: 'Write here...' },
    });
    const textarea = container.querySelector('textarea')!;
    expect(textarea.placeholder).toBe('Write here...');
  });

  it('sets the rows attribute', async () => {
    const { container } = await render(TextareaComponent, {
      inputs: { rows: 5 },
    });
    const textarea = container.querySelector('textarea')!;
    expect(textarea.rows).toBe(5);
  });

  it('defaults to 10 rows', async () => {
    const { container } = await render(TextareaComponent);
    const textarea = container.querySelector('textarea')!;
    expect(textarea.rows).toBe(10);
  });

  it('sets the disabled state', async () => {
    const { container } = await render(TextareaComponent, {
      inputs: { disabled: true },
    });
    const textarea = container.querySelector('textarea')!;
    expect(textarea.disabled).toBe(true);
  });

  it('emits valueChange on input', async () => {
    const valueChangeSpy = vi.fn();
    const { container } = await render(TextareaComponent, {
      on: { valueChange: valueChangeSpy },
    });
    const textarea = container.querySelector('textarea')!;
    fireEvent.input(textarea, { target: { value: 'new text' } });
    expect(valueChangeSpy).toHaveBeenCalledWith('new text');
  });

  it('emits blurred on blur', async () => {
    const blurredSpy = vi.fn();
    const { container } = await render(TextareaComponent, {
      on: { blurred: blurredSpy },
    });
    const textarea = container.querySelector('textarea')!;
    fireEvent.blur(textarea);
    expect(blurredSpy).toHaveBeenCalled();
  });

  it('sets aria-label when provided', async () => {
    const { container } = await render(TextareaComponent, {
      inputs: { ariaLabel: 'Post body' },
    });
    const textarea = container.querySelector('textarea')!;
    expect(textarea.getAttribute('aria-label')).toBe('Post body');
  });
});
