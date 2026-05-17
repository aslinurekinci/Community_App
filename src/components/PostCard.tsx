import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { usePosts } from '../context/PostContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { radius, spacing } from '../constants/spacing';
import { EnrichedPost } from '../types';
import { formatCount } from '../utils/formatNumber';
import { truncateText } from '../utils/truncateText';
import { AvatarChip } from './AvatarChip';
import { TagBadge } from './TagBadge';

type Props = {
  post: EnrichedPost;
  onPress: () => void;
  showImage?: boolean;
};

export function PostCard({ post, onPress, showImage }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const {
    isLiked,
    isBookmarked,
    getLikeCount,
    getCommentCount,
    likePost,
    unlikePost,
    bookmarkPost,
  } = usePosts();

  const liked = isLiked(post.id);
  const bookmarked = isBookmarked(post.id);
  const likeCount = getLikeCount(post);
  const commentCount = getCommentCount(post);
  const viewCount = post.views;

  const imageUri = useMemo(() => {
    if (!showImage) {
      return null;
    }
    return `https://picsum.photos/seed/post-${post.id}/800/480`;
  }, [post.id, showImage]);

  const handleLikePress = () => {
    if (liked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.authorRow}>
          <AvatarChip
            imageUri={post.authorImage}
            initials={post.authorInitials}
            size={44}
          />
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{post.authorName}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => bookmarkPost(post.id, post)}
          hitSlop={12}
          accessibilityLabel="Yer imi">
          <Icon
            name="bookmark"
            size={20}
            color={bookmarked ? colors.textPrimary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{post.title}</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      ) : null}

      <Text style={styles.body} numberOfLines={2}>
        {truncateText(post.body, 2)}
      </Text>

      {post.tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {post.tags.slice(0, 2).map(tag => (
            <TagBadge key={tag} label={tag} />
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.statsLeft}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={handleLikePress}
            hitSlop={8}>
            <Icon
              name="heart"
              size={18}
              color={liked ? colors.liked : colors.textSecondary}
            />
            <Text style={[styles.statText, liked && styles.statTextLiked]}>
              {formatCount(likeCount)}
            </Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Icon name="message-circle" size={18} color={colors.textSecondary} />
            <Text style={styles.statText}>{formatCount(commentCount)}</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <Icon name="eye" size={18} color={colors.textSecondary} />
          <Text style={styles.statText}>{formatCount(viewCount)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      padding: spacing.lg,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardPressed: {
      opacity: 0.96,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    authorMeta: {
      marginLeft: spacing.md,
      flex: 1,
    },
    authorName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      lineHeight: 24,
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: radius.md,
      marginBottom: spacing.md,
      backgroundColor: colors.border,
    },
    body: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: spacing.md,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.xs,
    },
    statsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    statTextLiked: {
      color: colors.liked,
    },
  });
