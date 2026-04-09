/**
 * Centralized SVG icon registry.
 *
 * Each icon is defined by its viewBox and SVG inner content (paths, circles, etc.).
 * This avoids inline SVGs scattered across components and keeps icons in one place.
 *
 * To add a new icon: add a new entry to `ICON_DEFS`.
 */

export interface IconDef {
  /** SVG viewBox attribute value */
  viewBox: string;
  /** Raw SVG inner content (paths, circles, etc.) — no wrapping <svg> */
  content: string;
}

export const ICON_DEFS: Record<string, IconDef> = {
  // ── Navigation / actions ──
  search: {
    viewBox: '0 0 14 14',
    content: `<circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M10 10l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  },
  logout: {
    viewBox: '0 0 16 16',
    content: `<path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M5 8h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  },
  menu: {
    viewBox: '0 0 20 20',
    content: `<path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
  },
  close: {
    viewBox: '0 0 20 20',
    content: `<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
  },
  'chevron-left': {
    viewBox: '0 0 10 10',
    content: `<path d="M7 1L3 5l4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  'chevron-right': {
    viewBox: '0 0 10 10',
    content: `<path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  'chevron-down': {
    viewBox: '0 0 10 10',
    content: `<path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  },
  retry: {
    viewBox: '0 0 16 16',
    content: `<path d="M2 8a6 6 0 0 1 10.3-4.1L14 2v4h-4l1.7-1.7A4.5 4.5 0 1 0 12.5 8h1.5A6 6 0 0 1 2 8z" fill="currentColor"/>`,
  },
  edit: {
    viewBox: '0 0 16 16',
    content: `<path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  },
  delete: {
    viewBox: '0 0 16 16',
    content: `<path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  },
  plus: {
    viewBox: '0 0 16 16',
    content: `<path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
  },
  'arrow-left': {
    viewBox: '0 0 16 16',
    content: `<path d="M10 2L4 8l6 6M4 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  },

  // ── Illustrations (large, for states) ──
  'empty-box': {
    viewBox: '0 0 96 96',
    content: `<rect x="16" y="24" width="64" height="48" rx="6" stroke="currentColor" stroke-width="2" fill="none"/><path d="M16 40h64" stroke="currentColor" stroke-width="2"/><circle cx="48" cy="56" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M44 64c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" stroke-width="2" fill="none"/>`,
  },
  'error-circle': {
    viewBox: '0 0 80 80',
    content: `<circle cx="40" cy="40" r="32" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M40 26v18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="40" cy="52" r="2" fill="currentColor"/>`,
  },
  'shield-lock': {
    viewBox: '0 0 96 96',
    content: `<path d="M48 12L20 24v20c0 17.7 12 33.3 28 38 16-4.7 28-20.3 28-38V24L48 12z" stroke="currentColor" stroke-width="2.5" fill="none"/><rect x="38" y="42" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M42 42v-4a6 6 0 0 1 12 0v4" stroke="currentColor" stroke-width="2.5" fill="none"/><circle cx="48" cy="50" r="2" fill="currentColor"/>`,
  },
} as const;

export type IconName = keyof typeof ICON_DEFS;
