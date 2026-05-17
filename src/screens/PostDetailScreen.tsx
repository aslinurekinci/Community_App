import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvatarChip } from '../components/AvatarChip';
import { CommentItem } from '../components/CommentItem';
import { TagBadge } from '../components/TagBadge';
import { useTheme } from '../context/ThemeContext';
import { usePosts } from '../context/PostContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { radius, spacing } from '../constants/spacing';
import { FeedStackParamList, ProfileStackParamList } from '../navigation/types';
import { Comment } from '../types';
import { formatCount } from '../utils/formatNumber';

type Props = NativeStackScreenProps<
  FeedStackParamList | ProfileStackParamList,
  'PostDetail'
>;

export function PostDetailScreen({ navigation, route }: Props) {
  const { post } = route.params;
  const insets = useSafeAreaInsets();
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
    loadComments,
    addComment,
    getCachedComments,
  } = usePosts();

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const liked = isLiked(post.id);
  const bookmarked = isBookmarked(post.id);
  const likeCount = getLikeCount(post);
  const commentCount = getCommentCount(post);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const cached = getCachedComments(post.id);
      if (cached && cached.length > 0) {
        if (mounted) {
          setComments(cached);
          setCommentsLoading(false);
        }
        return;
      }

      try {
        const data = await loadComments(post.id);
        if (mounted) {
          setComments(data);
        }
      } catch {
        if (mounted) {
          setComments([]);
        }
      } finally {
        if (mounted) {
          setCommentsLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const handleLikePress = () => {
    if (liked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };

  const handleSubmitComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await addComment(post.id, trimmed);
      setCommentText('');
      const cached = getCachedComments(post.id);
      if (cached) {
        setComments(cached);
      }
    } catch (error) {
      Alert.alert(
        'Hata',
        error instanceof Error ? error.message : 'Yorum gönderilemedi.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToUser = useCallback(
    (userId: number) => {
      navigation.navigate('UserProfile', { userId });
    },
    [navigation],
  );

  const bodyParagraphs = post.body.split('\n').filter(Boolean);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={12}>
          <Icon name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gönderi Detayı</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={12}>
          <Icon name="more-vertical" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.authorRow}
            onPress={() => navigateToUser(post.userId)}
            activeOpacity={0.7}>
            <AvatarChip
              imageUri={post.authorImage}
              initials={post.authorInitials}
              size={48}
            />
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>{post.authorName}</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.postTitle}>{post.title}</Text>

          {bodyParagraphs.length > 0 ? (
            bodyParagraphs.map((paragraph, index) => (
              <Text key={index} style={styles.postBody}>
                {paragraph}
              </Text>
            ))
          ) : (
            <Text style={styles.postBody}>{post.body}</Text>
          )}

          {post.tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {post.tags.map(tag => (
                <TagBadge key={tag} label={tag} />
              ))}
            </View>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.statsLeft}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={handleLikePress}
                hitSlop={8}>
                <Icon
                  name="heart"
                  size={20}
                  color={liked ? colors.liked : colors.textSecondary}
                />
                <Text style={[styles.statText, liked && styles.statTextLiked]}>
                  {formatCount(likeCount)}
                </Text>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <Icon
                  name="message-circle"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.statText}>{formatCount(commentCount)}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="eye" size={20} color={colors.textSecondary} />
                <Text style={styles.statText}>{formatCount(post.views)}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => bookmarkPost(post.id, post)}
              hitSlop={12}>
              <Icon
                name="bookmark"
                size={20}
                color={bookmarked ? colors.textPrimary : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.commentsTitle}>
            YORUMLAR ({commentCount})
          </Text>

          {commentsLoading ? (
            <ActivityIndicator
              color={colors.textPrimary}
              style={styles.commentsLoader}
            />
          ) : comments.length === 0 ? (
            <Text style={styles.noComments}>Henüz yorum yok.</Text>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={String(comment.id)}
                comment={comment}
                onAuthorPress={navigateToUser}
              />
            ))
          )}
        </ScrollView>

        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, spacing.md) },
          ]}>
          <TextInput
            style={styles.input}
            placeholder="Yorumunuzu yazın..."
            placeholderTextColor={colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
            editable={!submitting}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!commentText.trim() || submitting) && styles.sendBtnDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}>
            {submitting ? (
              <ActivityIndicator color={colors.card} size="small" />
            ) : (
              <Icon name="send" size={18} color={colors.card} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.card,
    },
    flex: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerBtn: {
      width: 36,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    authorMeta: {
      marginLeft: spacing.md,
      flex: 1,
    },
    authorName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    postTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: 30,
      marginBottom: spacing.md,
    },
    postBody: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    statsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xl,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    statTextLiked: {
      color: colors.liked,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: spacing.lg,
    },
    commentsTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.8,
      marginBottom: spacing.lg,
    },
    commentsLoader: {
      marginVertical: spacing.xl,
    },
    noComments: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
      gap: spacing.sm,
    },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 100,
      backgroundColor: colors.inputBg,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: 15,
      color: colors.textPrimary,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.textPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: {
      opacity: 0.45,
    },
  });
