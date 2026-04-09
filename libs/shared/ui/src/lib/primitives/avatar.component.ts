import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'h-5 w-5',
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

const TEXT_SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'text-[8px]',
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};

/** Pure function: first char uppercase, or fallback. */
function getInitial(name: string): string {
  return name ? name.charAt(0).toUpperCase() : '?';
}
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
  readonly size = input<AvatarSize>('sm');

  readonly initial = computed(() => getInitial(this.name()));
  readonly avatarClasses = computed(() => SIZE_CLASSES[this.size()]);
  readonly initialClasses = computed(() => TEXT_SIZE_CLASSES[this.size()]);
}
