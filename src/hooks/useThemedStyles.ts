import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeColors, useTheme } from '../context/ThemeContext';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  create: (colors: ThemeColors) => T,
): T {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(create(colors)), [colors]);
}
