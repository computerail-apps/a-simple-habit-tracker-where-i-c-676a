// PR #121: design tokens surfaced to TS. Prefer Tailwind classes for
// styling; import from here only when a runtime value is required (chart
// libraries, animated colors, canvas draws, etc.).

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const durations = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;

export const easings = {
  standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;
