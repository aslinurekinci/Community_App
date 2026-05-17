import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { FeedStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<FeedStackParamList, 'UserProfile'>;

export function UserProfileScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcı Profili</Text>
      <Text style={styles.subtitle}>Kullanıcı ID: {route.params.userId}</Text>
      <Text style={styles.hint}>Bu ekran sonraki adımda tasarlanacak.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.textSecondary,
  },
  hint: {
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.textMuted,
  },
});
