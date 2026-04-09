import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

/** Pure function: normalize Transloco available langs to string[]. */
function normalizeLangs(available: ReturnType<TranslocoService['getAvailableLangs']>): string[] {
  return available.map((l) => (typeof l === 'string' ? l : l.id));
}

@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative flex h-7 items-center rounded-full bg-toggle-bg p-0.5"
      role="radiogroup"
      [attr.aria-label]="'shared.languageSelector' | transloco"
    >
      <!-- Sliding indicator pill -->
      <div
        class="absolute h-5 rounded-full bg-toggle-active transition-all duration-200 ease-in-out"
        [style.width.px]="pillWidth"
        [style.transform]="'translateX(' + activeIndex() * pillWidth + 'px)'"
      ></div>

      @for (lang of langs(); track lang) {
        <button
          type="button"
          class="relative z-10 flex items-center justify-center rounded-full px-3 text-[10px] font-medium leading-5 uppercase transition-colors"
          [style.width.px]="pillWidth"
          [class]="lang === activeLang() ? 'text-white' : 'text-black'"
          role="radio"
          [attr.aria-checked]="lang === activeLang()"
          (click)="setLang(lang)"
        >
          {{ lang }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }
  `,
})
export class LanguageSwitcherComponent {
  private readonly transloco = inject(TranslocoService);

  /** Width of each language pill (px) */
  readonly pillWidth = 48;

  /** Active language signal, updated on lang change */
  readonly activeLang = signal(this.transloco.getActiveLang());

  /** Available languages from Transloco config */
  readonly langs = computed(() => normalizeLangs(this.transloco.getAvailableLangs()));

  /** Index of the active language in the list */
  readonly activeIndex = computed(() => {
    const idx = this.langs().indexOf(this.activeLang());
    return idx >= 0 ? idx : 0;
  });

  setLang(lang: string): void {
    this.transloco.setActiveLang(lang);
    this.activeLang.set(lang);
  }
}
