import { render, fireEvent } from '@testing-library/angular';
import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  it('renders a select element', async () => {
    const { container } = await render(SelectComponent);
    expect(container.querySelector('select')).toBeTruthy();
  });

  it('sets the disabled state', async () => {
    const { container } = await render(SelectComponent, {
      inputs: { disabled: true },
    });
    const select = container.querySelector('select')!;
    expect(select.disabled).toBe(true);
  });

  it('renders projected options', async () => {
    const { container } = await render(
      `<app-select>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </app-select>`,
      { imports: [SelectComponent] },
    );
    const options = container.querySelectorAll('option');
    expect(options.length).toBe(2);
  });

  it('emits valueChange on change', async () => {
    const valueChangeSpy = vi.fn();
    const { container } = await render(
      `<app-select (valueChange)="onValueChange($event)">
        <option value="a">A</option>
        <option value="b">B</option>
      </app-select>`,
      {
        imports: [SelectComponent],
        componentProperties: { onValueChange: valueChangeSpy },
      },
    );
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'b' } });
    expect(valueChangeSpy).toHaveBeenCalledWith('b');
  });

  it('sets aria-label when provided', async () => {
    const { container } = await render(SelectComponent, {
      inputs: { ariaLabel: 'Filter by author' },
    });
    const select = container.querySelector('select')!;
    expect(select.getAttribute('aria-label')).toBe('Filter by author');
  });

  it('renders a chevron icon', async () => {
    const { container } = await render(SelectComponent);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
