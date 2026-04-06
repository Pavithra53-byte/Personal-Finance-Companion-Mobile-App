import { useFinanceStore } from '../state/useFinanceStore';

export const lightColors = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  danger: '#EF4444',
  income: '#10B981',
  expense: '#EF4444',
};

export const darkColors = {
  primary: '#B6FF00',  // Neon Lime
  primaryLight: '#FFBE5D', // Peach/Orange accent
  background: '#08080E', // Deep black as requested
  surface: '#22222C', // Dark floating card (slightly lighter)
  text: '#FFFFFF',
  textSecondary: '#A0A5B5',
  border: '#2A2A35',
  success: '#B6FF00', 
  warning: '#FFBE5D',
  danger: '#FD5D5D',
  income: '#B6FF00',
  expense: '#FD5D5D',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};

export const useAppTheme = () => {
  const { themePreference } = useFinanceStore();
  const isDark = themePreference === 'dark';
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    typography,
    spacing,
    borderRadius
  };
};

// Legacy fallback
export const theme = {
  colors: lightColors, 
  typography,
  spacing,
  borderRadius
};
