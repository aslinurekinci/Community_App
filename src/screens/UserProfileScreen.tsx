import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { spacing } from '../constants/spacing';
import { FeedStackParamList, ProfileStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<
  FeedStackParamList | ProfileStackParamList,
  'UserProfile'
>;

export function UserProfileScreen({ route }: Props) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcı Profili</Text>
      <Text style={styles.subtitle}>Kullanıcı ID: {route.params.userId}</Text>
      <Text style={styles.hint}>Bu ekran sonraki adımda tasarlanacak.</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
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
