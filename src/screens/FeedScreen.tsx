import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryFilters } from '../components/CategoryFilters';
import { EmptyState } from '../components/EmptyState';
import { FeedHeader } from '../components/FeedHeader';
import { LoadingFooter } from '../components/LoadingFooter';
import { NotificationPanel } from '../components/NotificationPanel';
import { PostCard } from '../components/PostCard';
import { SearchBar } from '../components/SearchBar';
import { getCategoryApiTag } from '../constants/categories';
import { SEARCH_DEBOUNCE_MS } from '../constants/api';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { usePosts } from '../context/PostContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { spacing } from '../constants/spacing';
import { FeedStackParamList } from '../navigation/types';
import { EnrichedPost } from '../types';
import { debounce } from '../utils/debounce';

type Props = NativeStackScreenProps<FeedStackParamList, 'Feed'>;

type FeedListItem = EnrichedPost & {
  listKey: string;
  showImage: boolean;
};

export function FeedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { unreadCount } = useNotifications();
  const {
    posts,
    hasMore,
    isLoading,
    isRefreshing,
    loadMore,
    refreshPosts,
    searchPostsQuery,
    clearSearch,
    filterByTag,
  } = usePosts();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const initialLoadDone = useRef(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        if (query.trim()) {
          searchPostsQuery(query);
        } else {
          clearSearch();
        }
      }, SEARCH_DEBOUNCE_MS),
    [searchPostsQuery, clearSearch],
  );

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadMore();
    }
  }, [loadMore]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      setActiveCategory(categoryId);
      setSearchQuery('');
      filterByTag(getCategoryApiTag(categoryId));
    },
    [filterByTag],
  );

  const listData = useMemo<FeedListItem[]>(
    () =>
      posts.map((post, index) => ({
        ...post,
        listKey: `${post.id}-${index}`,
        showImage: index % 3 === 1,
      })),
    [posts],
  );

  const handleEndReached = useCallback(() => {
    if (!isLoading && hasMore && !searchQuery.trim()) {
      loadMore();
    }
  }, [isLoading, hasMore, loadMore, searchQuery]);

  const handlePostPress = useCallback(
    (post: EnrichedPost) => {
      navigation.navigate('PostDetail', { post });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<FeedListItem> = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        showImage={item.showImage}
        onPress={() => handlePostPress(item)}
      />
    ),
    [handlePostPress],
  );

  const emptyMessage = searchQuery.trim()
    ? 'Arama kriterlerinize uygun gönderi yok.'
    : activeCategory !== 'all'
      ? 'Bu kategoride gönderi bulunamadı.'
      : 'Henüz gösterilecek gönderi yok.';

  const listHeader = (
    <View>
      <FeedHeader
        unreadCount={unreadCount}
        onNotificationPress={() => setNotificationsVisible(true)}
      />
      <View style={styles.searchSection}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <CategoryFilters
          activeId={activeCategory}
          onSelect={handleCategorySelect}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={listData}
        keyExtractor={item => item.listKey}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState title="Gönderi bulunamadı" message={emptyMessage} />
          ) : null
        }
        ListFooterComponent={isLoading ? <LoadingFooter /> : null}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshPosts}
            tintColor={colors.textPrimary}
            colors={[colors.textPrimary]}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          listData.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <NotificationPanel
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchSection: {
      backgroundColor: colors.card,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    listContent: {
      paddingBottom: spacing.md,
    },
    listContentEmpty: {
      flexGrow: 1,
    },
  });
