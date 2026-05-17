import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { radius } from '../constants/spacing';

type Props = {
  imageUri?: string;
  initials: string;
  size?: number;
};

export function AvatarChip({ imageUri, initials, size = 44 }: Props) {
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

const styles = StyleSheet.create({
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
