import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  DarkTheme,
  DefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { colors as lightColors } from '../constants/colors';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = { [K in keyof typeof lightColors]: string };

const darkColors: ThemeColors = {
  primary: '#4B8BF5',
  primaryDark: '#3A7AE8',
  background: '#000000',
  card: '#121212',
  textPrimary: '#FFFFFF',
  textSecondary: '#A8A8A8',
  textMuted: '#6B6B6B',
  border: '#262626',
  notificationBadge: '#FF453A',
  tagTechBg: '#0F1A2E',
  tagTechText: '#6BA3FF',
  tagSoftwareBg: '#0A1F17',
  tagSoftwareText: '#34D399',
  tagDefaultBg: '#1C1C1C',
  tagDefaultText: '#D4D4D4',
  filterInactiveBg: '#1C1C1C',
  filterInactiveText: '#ABABAB',
  searchBg: '#1C1C1C',
  avatarPlaceholder: '#1A2332',
  avatarPlaceholderText: '#6BA3FF',
  liked: '#FF6B6B',
  shadow: '#000000',
  commentBubble: '#1C1C1C',
  inputBg: '#1C1C1C',
  verified: '#4B8BF5',
  primarySoft: '#161B26',
  primaryMuted: '#1E2A3D',
  iconButtonBg: '#1C1C1C',
  iconButtonBorder: '#333333',
  dangerSoft: '#2A1414',
};

type ThemeContextValue = {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      colors: theme === 'light' ? lightColors : darkColors,
      toggleTheme,
    }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export function useAppNavigationTheme(): NavigationTheme {
  const { theme, colors } = useTheme();
  const base = theme === 'dark' ? DarkTheme : DefaultTheme;
  return useMemo(
    () => ({
      ...base,
      dark: theme === 'dark',
      colors: {
        ...base.colors,
        primary: colors.textPrimary,
        background: colors.background,
        card: colors.card,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.notificationBadge,
      },
    }),
    [theme, colors, base],
  );
}

export function useStackScreenOptions() {
  const { colors } = useTheme();
  return useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.card },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: {
        color: colors.textPrimary,
        fontWeight: '700' as const,
      },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background },
    }),
    [colors],
  );
}
