import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { inject } from '@angular/core';

import { ICON_DEFS, type IconName } from './icon-registry';

/**
 * Reusable icon component that renders SVGs from the centralized icon registry.
 *
 * Usage:
 *   <app-icon name="search" class="h-4 w-4 text-text-secondary" />
 *   <app-icon name="empty-box" size="xl" />
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    role: 'img',
    '[attr.aria-hidden]': 'ariaHidden()',
    '[innerHTML]': 'svgContent()',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
    :host ::ng-deep svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Icon name from the registry */
  readonly name = input.required<IconName>();

  /** Accessible label — if provided, aria-hidden is false */
  readonly label = input<string>('');

  readonly ariaHidden = computed(() => (this.label() ? 'false' : 'true'));

  readonly svgContent = computed(() => {
    const def = ICON_DEFS[this.name()];
    if (!def) {
      return '';
    }
    const labelAttr = this.label() ? `aria-label="${this.label()}"` : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${def.viewBox}" fill="none" ${labelAttr}>${def.content}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });
}
