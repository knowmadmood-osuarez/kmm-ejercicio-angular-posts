import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Avatar component matching the Figma user avatars.
 *
 * Shows the user initial in a circle with pastel background.
 * Figma spec: bg-avatar-bg (#D5E3FD), rounded-full, bold initial text.
 */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="avatarClasses()"
      class="inline-flex items-center justify-center rounded-full bg-avatar-bg"
      [attr.aria-label]="name()"
      role="img"
    >
      @if (src()) {
        <img [src]="src()" [alt]="name()" class="h-full w-full rounded-full object-cover" />
      } @else {
        <span [class]="initialClasses()" class="font-bold text-primary select-none">
          {{ initial() }}
        </span>
      }
    </div>
  `,
})
export class AvatarComponent {
  /** User name — used for initial and aria-label */
  readonly name = input<string>('');

  /** Optional avatar image URL */
  readonly src = input<string>('');

  /** Size preset */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg'>('sm');

  readonly initial = computed(() => {
    const n = this.name();
    return n ? n.charAt(0).toUpperCase() : '?';
  });

  readonly avatarClasses = computed(() => {
    const sizes: Record<string, string> = {
      xs: 'h-5 w-5',
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-10 w-10',
    };
    return sizes[this.size()];
  });

  readonly initialClasses = computed(() => {
    const textSizes: Record<string, string> = {
      xs: 'text-[8px]',
      sm: 'text-[10px]',
      md: 'text-xs',
      lg: 'text-sm',
    };
    return textSizes[this.size()];
  });
}
