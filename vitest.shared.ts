/**
 * Shared Vitest coverage configuration for all libs.
 * Each lib's vite.config.mts imports this and only overrides what's specific (name, dirs).
 */
/**
 * Angular v8 coverage counts compiled @if/@for template branches.
 * Branches threshold is set lower (75%) because these template branches
 * require exhaustive DOM rendering of every view state to cover.
 */
const GLOBAL_THRESHOLDS = {
  branches: 75,
  functions: 90,
  lines: 90,
  statements: 90,
} as const;

const GLOBAL_EXCLUDE = ['src/lib/**/*.spec.ts', 'src/test-setup.ts', 'src/index.ts'];

export interface CoverageOverrides {
  reportsDirectory: string;
  include?: string[];
  exclude?: string[];
  thresholds?: Partial<typeof GLOBAL_THRESHOLDS>;
}

export function sharedCoverage(overrides: CoverageOverrides) {
  return {
    provider: 'v8' as const,
    reporter: ['text', 'lcov', 'html'],
    include: overrides.include ?? ['src/lib/**/*.ts'],
    exclude: [...GLOBAL_EXCLUDE, ...(overrides.exclude ?? [])],
    reportsDirectory: overrides.reportsDirectory,
    thresholds: { ...GLOBAL_THRESHOLDS, ...overrides.thresholds },
  };
}
