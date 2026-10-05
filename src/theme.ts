export const colors = {
  bg: '#03060F',
  bgMid: '#070D1C',
  bgElevated: '#0A1224',
  surface: 'rgba(14, 22, 40, 0.78)',
  surfaceSolid: '#0E1628',
  surfaceHover: '#152238',
  surfaceBorder: 'rgba(120, 160, 255, 0.12)',
  borderSubtle: 'rgba(140, 170, 255, 0.1)',
  borderGlow: 'rgba(91, 140, 255, 0.35)',
  text: '#F2F6FF',
  textSecondary: '#A9B8D8',
  textMuted: '#6B7C9E',
  textDim: '#455572',
  accent: '#6B9BFF',
  accentHot: '#8B7CFF',
  accentSoft: 'rgba(107, 155, 255, 0.14)',
  accentGlow: 'rgba(107, 155, 255, 0.45)',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  glow: 'rgba(107, 155, 255, 0.4)',
  cyan: '#22D3EE',
  violet: '#A78BFA',
  pink: '#F472B6',
  amber: '#FBBF24',
  grid: 'rgba(120, 160, 255, 0.045)',
  noise: 'rgba(255, 255, 255, 0.02)',
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
  xxxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

export const typography = {
  display: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -1.1 },
  hero: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.8 },
  title: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.35 },
  section: { fontSize: 11, fontWeight: '800' as const, letterSpacing: 1.6 },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  mono: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
  badge: { fontSize: 9, fontWeight: '800' as const, letterSpacing: 1.1 },
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 6,
  }),
  card: {
    shadowColor: '#040814',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
};
