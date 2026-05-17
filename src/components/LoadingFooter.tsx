import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../constants/spacing';

export function LoadingFooter() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.textPrimary} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
