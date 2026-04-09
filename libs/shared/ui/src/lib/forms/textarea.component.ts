import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Textarea component matching the Figma editor.
 *
 * Figma spec: bg-field-bg (#D9E4EA), rounded, p-6, text-lg, placeholder color #717C82.
 */
@Component({
  selector: 'app-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <textarea
      [id]="id()"
      [name]="name()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [rows]="rows()"
      [value]="value()"
      [attr.aria-label]="ariaLabel() || null"
      class="w-full resize-none rounded bg-field-bg px-6 py-6 text-lg leading-[29px] text-text placeholder:text-placeholder transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
      (input)="onInput($event)"
      (blur)="blurred.emit()"
    ></textarea>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class TextareaComponent {
  readonly id = input<string>('');
  readonly name = input<string>('');
  readonly placeholder = input<string>('');
  readonly value = input<string>('');
  readonly disabled = input(false);
  readonly rows = input(10);
  /** Accessible label for screen readers */
  readonly ariaLabel = input<string>('');

  readonly valueChange = output<string>();
  readonly blurred = output<void>();

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.valueChange.emit(textarea.value);
  }
}
