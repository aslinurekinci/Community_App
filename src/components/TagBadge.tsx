import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors, useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { radius, spacing } from '../constants/spacing';

type Props = {
  label: string;
};

function formatTagLabel(tag: string): string {
  const map: Record<string, string> = {
    history: 'Tarih',
    american: 'Amerikan',
    crime: 'Suç',
    fiction: 'Kurgu',
    classic: 'Klasik',
    love: 'Aşk',
    technology: 'Teknoloji',
    travel: 'Gezi',
    art: 'Sanat',
    life: 'Yaşam',
  };
  return map[tag.toLowerCase()] ?? tag.charAt(0).toUpperCase() + tag.slice(1);
}

function getVariantPalette(colors: ThemeColors) {
  return {
    bg: colors.filterInactiveBg,
    text: colors.textPrimary,
  };
}

export function TagBadge({ label }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const palette = useMemo(() => getVariantPalette(colors), [colors]);

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>
        {formatTagLabel(label)}
      </Text>
    </View>
  );
}

const createStyles = (_colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    badge: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    text: {
      fontSize: 12,
      fontWeight: '600',
    },
  });
