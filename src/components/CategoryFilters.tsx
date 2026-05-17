import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FEED_CATEGORIES } from '../constants/categories';
import { colors } from '../constants/colors';
import { radius, spacing } from '../constants/spacing';

type Props = {
  activeId: string;
  onSelect: (id: string) => void;
};

export function CategoryFilters({ activeId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      {FEED_CATEGORIES.map(category => {
        const isActive = category.id === activeId;
        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelect(category.id)}
            activeOpacity={0.8}>
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      <View style={styles.trailingSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.filterInactiveBg,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.filterInactiveText,
  },
  pillTextActive: {
    color: colors.card,
  },
  trailingSpace: {
    width: spacing.sm,
  },
});
