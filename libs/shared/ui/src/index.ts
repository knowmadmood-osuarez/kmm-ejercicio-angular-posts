// ── Icons ──
export { IconComponent } from './lib/icons/icon.component';
export type { IconName, IconDef } from './lib/icons/icon-registry';
export { ICON_DEFS } from './lib/icons/icon-registry';

// ── Primitives ──
export {
  ButtonComponent,
  type ButtonVariant,
  type ButtonSize,
} from './lib/primitives/button.component';
export { CardComponent, type CardVariant } from './lib/primitives/card.component';
export { BadgeComponent } from './lib/primitives/badge.component';
export { AvatarComponent } from './lib/primitives/avatar.component';

// ── Forms ──
export { LabelComponent } from './lib/forms/label.component';
export { InputComponent, type InputVariant } from './lib/forms/input.component';
export { TextareaComponent } from './lib/forms/textarea.component';
export { SelectComponent } from './lib/forms/select.component';

// ── Feedback / state ──
export { LoadingComponent } from './lib/feedback/loading.component';
export { EmptyStateComponent } from './lib/feedback/empty-state.component';
export { ErrorStateComponent } from './lib/feedback/error-state.component';
export { ForbiddenStateComponent } from './lib/feedback/forbidden-state.component';
export { LinearProgressComponent } from './lib/feedback/linear-progress.component';

// ── Layout ──
export { PageHeaderComponent } from './lib/layout/page-header.component';
export { SectionHeaderComponent } from './lib/layout/section-header.component';
export { LanguageSwitcherComponent } from './lib/layout/language-switcher.component';

// ── Overlays ──
export { ConfirmDialogComponent } from './lib/overlays/confirm-dialog.component';
