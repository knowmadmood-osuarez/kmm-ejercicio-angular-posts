import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

function normalizeLangs(available: ReturnType<TranslocoService['getAvailableLangs']>): string[] {
  return available.map((l) => (typeof l === 'string' ? l : l.id));
}

function computePillTranslateX(
  activeIndex: number,
  slotWidth: number,
  pillOffsetX: number,
): number {
  return pillOffsetX + activeIndex * slotWidth;
}

@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative flex h-7 items-center rounded-[10px] bg-toggle-bg"
      style="width: 144px"
      role="radiogroup"
      [attr.aria-label]="'shared.languageSelector' | transloco"
    >
      <div
        class="absolute rounded-[10px] bg-toggle-active transition-all duration-200 ease-in-out"
        style="width: 45px; height: 19px; top: 4.5px"
        [style.transform]="indicatorTransform()"
      ></div>

      @for (lang of langs(); track lang) {
        <button
          type="button"
          class="relative z-10 flex h-full items-center justify-center text-[10px] font-medium leading-5 uppercase transition-colors"
          style="width: 72px"
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
  private readonly slotWidth = 72;
  private readonly pillOffsetX = 13.5;

  readonly activeLang = signal(this.transloco.getActiveLang());
  readonly langs = computed(() => normalizeLangs(this.transloco.getAvailableLangs()));

  readonly activeIndex = computed(() => {
    const idx = this.langs().indexOf(this.activeLang());
    return idx >= 0 ? idx : 0;
  });

  readonly indicatorTransform = computed(() => {
    const x = computePillTranslateX(this.activeIndex(), this.slotWidth, this.pillOffsetX);
    return `translateX(${x}px)`;
  });

  setLang(lang: string): void {
    this.transloco.setActiveLang(lang);
    this.activeLang.set(lang);
  }
}
