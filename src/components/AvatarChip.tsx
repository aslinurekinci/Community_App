import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  imageUri?: string;
  initials: string;
  size?: number;
};

export function AvatarChip({ imageUri, initials, size = 44 }: Props) {
  const styles = useThemedStyles(createStyles);

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}>
      <Text style={[styles.initials, { fontSize: size * 0.32 }]}>{initials}</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    image: {
      backgroundColor: colors.border,
    },
    placeholder: {
      backgroundColor: colors.avatarPlaceholder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initials: {
      color: colors.avatarPlaceholderText,
      fontWeight: '700',
    },
  });
