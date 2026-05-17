import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { radius, spacing } from '../constants/spacing';

type Props = {
  label: string;
  variant?: 'tech' | 'software' | 'default';
};

const VARIANT_STYLES = {
  tech: { bg: colors.tagTechBg, text: colors.tagTechText },
  software: { bg: colors.tagSoftwareBg, text: colors.tagSoftwareText },
  default: { bg: colors.tagDefaultBg, text: colors.tagDefaultText },
};

function getVariant(tag: string): 'tech' | 'software' | 'default' {
  const lower = tag.toLowerCase();
  if (lower.includes('tech') || lower.includes('history') || lower.includes('science')) {
    return 'tech';
  }
  if (lower.includes('soft') || lower.includes('code') || lower.includes('crime')) {
    return 'software';
  }
  return 'default';
}

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

export function TagBadge({ label, variant }: Props) {
  const resolvedVariant = variant ?? getVariant(label);
  const palette = VARIANT_STYLES[resolvedVariant];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>
        {formatTagLabel(label)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
