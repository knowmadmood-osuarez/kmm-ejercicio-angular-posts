import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'h-5 w-5',
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

const TEXT_SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'text-[7px]',
  sm: 'text-[9px]',
  md: 'text-[10px]',
  lg: 'text-xs',
};

/** Pure: first initial of each word (up to 2), or first two letters of a single word, uppercased. */
function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="avatarClasses()"
      class="inline-flex items-center justify-center rounded-full"
      [class.bg-avatar-bg]="color() === 'default'"
      [class.bg-primary]="color() === 'primary'"
      [attr.aria-label]="name()"
      role="img"
    >
      @if (src()) {
        <img [src]="src()" [alt]="name()" class="h-full w-full rounded-full object-cover" />
      } @else {
        <span
          [class]="initialClasses()"
          class="font-bold select-none"
          [class.text-primary]="color() === 'default'"
          [class.text-white]="color() === 'primary'"
        >
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
  readonly size = input<AvatarSize>('sm');

  /** Avatar color preset */
  readonly color = input<'default' | 'primary'>('default');

  readonly initial = computed(() => getInitials(this.name()));
  readonly avatarClasses = computed(() => SIZE_CLASSES[this.size()]);
  readonly initialClasses = computed(() => TEXT_SIZE_CLASSES[this.size()]);
}
