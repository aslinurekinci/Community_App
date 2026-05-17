import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import { radius, spacing } from '../constants/spacing';
import { Comment } from '../types';
import { AvatarChip } from './AvatarChip';

type Props = {
  comment: Comment;
  onAuthorPress?: (userId: number) => void;
};

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
}

export function CommentItem({ comment, onAuthorPress }: Props) {
  return (
    <View style={styles.row}>
      <AvatarChip initials={getInitials(comment.user.fullName)} size={40} />
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => onAuthorPress?.(comment.user.id)}
          disabled={!onAuthorPress}>
          <Text style={styles.authorName}>{comment.user.fullName}</Text>
        </TouchableOpacity>
        <View style={styles.bubble}>
          <Text style={styles.body}>{comment.body}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bubble: {
    backgroundColor: colors.commentBubble,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
  },
});
