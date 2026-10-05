export const colors = {
  bg: '#060912',
  bgElevated: '#0B1220',
  surface: '#101827',
  surfaceHover: '#162033',
  surfaceBorder: '#1C2A42',
  borderSubtle: '#243352',
  text: '#EEF3FF',
  textSecondary: '#A8B6D4',
  textMuted: '#6E7F9F',
  textDim: '#4A5A78',
  accent: '#5B8CFF',
  accentSoft: 'rgba(91, 140, 255, 0.15)',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  glow: 'rgba(91, 140, 255, 0.35)',
};

export const roleColors: Record<string, string> = {
  director: '#A78BFA',
  manager: '#38BDF8',
  architect: '#22D3EE',
  backend: '#34D399',
  frontend: '#F472B6',
  qa: '#FBBF24',
};

export const statusColors: Record<string, string> = {
  Thinking: '#A78BFA',
  Writing: '#38BDF8',
  Reviewing: '#FBBF24',
  Idle: '#4A5A78',
  Blocked: '#F87171',
  Speaking: '#34D399',
};

export const stageColors = [
  '#A78BFA',
  '#22D3EE',
  '#38BDF8',
  '#34D399',
  '#F472B6',
  '#FBBF24',
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  hero: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.6 },
  title: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  section: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 1.2 },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  mono: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.4 },
};
