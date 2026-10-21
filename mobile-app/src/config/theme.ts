/**
 * Hệ thống Theme & Design Tokens chuẩn thể thao AP Sports
 * Đồng bộ 100% màu sắc và phong cách giao diện với AP Sports Web Client
 */

export const LightColors = {
  // Brand colors
  primary: '#ea580c', // Orange-600
  primaryLight: '#f97316', // Orange-500
  primaryDark: '#c2410c', // Orange-700
  primaryMuted: '#ffedd5', // Orange-100

  // Secondary & Accents
  secondary: '#0284c7', // Sky-600
  accent: '#10b981', // Emerald-500
  accentMuted: '#ecfdf5',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutrals
  slate950: '#020617',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
  white: '#ffffff',

  // Semantic tokens matching Frontend :root
  background: '#f1f5f9', // --bg-page
  surface: '#ffffff', // --bg-surface
  card: '#ffffff', // --card-bg
  surface2: '#f8fafc', // --bg-surface-2
  text: '#0f172a', // --text-primary
  textSecondary: '#334155', // --text-secondary
  textMuted: '#64748b', // --text-muted
  textFaint: '#94a3b8', // --text-faint
  border: '#e2e8f0', // --card-border / --bg-border
  borderSubtle: '#f1f5f9',
  inputBg: '#f8fafc', // --input-bg
  inputBorder: '#cbd5e1', // --input-border
  shadow: '#000000',
  isDark: false,
};

export const DarkColors = {
  // Brand colors matching Frontend .dark
  primary: '#f97316', // Orange-500
  primaryLight: '#fb923c', // Orange-400
  primaryDark: '#ea580c',
  primaryMuted: 'rgba(249, 115, 22, 0.2)',

  // Secondary & Accents
  secondary: '#38bdf8', // Sky-400
  accent: '#34d399', // Emerald-400
  accentMuted: 'rgba(16, 185, 129, 0.15)',

  // Status colors
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',

  // Neutrals
  slate950: '#ffffff',
  slate900: '#f8fafc',
  slate800: '#f1f5f9',
  slate700: '#e2e8f0',
  slate600: '#cbd5e1',
  slate500: '#94a3b8',
  slate400: '#64748b',
  slate300: '#475569',
  slate200: '#334155',
  slate100: '#1e293b',
  slate50: '#0f172a',
  white: '#0f172a',

  // Semantic tokens matching Frontend .dark
  background: '#090d16', // --bg-page (#090d16)
  surface: '#0f172a', // --bg-surface (#0f172a)
  card: '#0f172a', // --card-bg (#0f172a)
  surface2: '#1e293b', // --bg-surface-2 (#1e293b)
  text: '#f8fafc', // --text-primary (#f8fafc)
  textSecondary: '#e2e8f0', // --text-secondary (#e2e8f0)
  textMuted: '#94a3b8', // --text-muted (#94a3b8)
  textFaint: '#64748b', // --text-faint (#64748b)
  border: '#1e293b', // --card-border / --bg-border (#1e293b)
  borderSubtle: '#334155',
  inputBg: '#020617', // --input-bg (#020617)
  inputBorder: '#1e293b', // --input-border
  shadow: '#000000',
  isDark: true,
};

// Mặc định ban đầu tương thích ngược
export const Colors = LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  fontFamily: undefined, // Dùng system font (San Francisco trên iOS, Roboto trên Android)
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
};
