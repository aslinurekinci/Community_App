import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

export function LoadingFooter() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
