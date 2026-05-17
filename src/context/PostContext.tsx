import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { POSTS_PAGE_SIZE } from '../constants/api';
import { createComment, DEMO_USER_ID, fetchPostComments } from '../services/commentService';
import {
  fetchPostCommentsCount,
  fetchPosts,
  fetchPostsByTag,
  fetchUsersByIds,
  searchPosts,
} from '../services/postService';
import { Comment, EnrichedPost, Post } from '../types';
import { useNotifications } from './NotificationContext';

type PostContextValue = {
  posts: EnrichedPost[];
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  likedPosts: Set<number>;
  bookmarks: Set<number>;
  commentCache: Record<number, Comment[]>;
  userPosts: EnrichedPost[];
  loadMore: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  searchPostsQuery: (query: string) => Promise<void>;
  clearSearch: () => Promise<void>;
  filterByTag: (tag: string | null) => Promise<void>;
  activeTag: string | null;
  likePost: (postId: number) => Promise<void>;
  unlikePost: (postId: number) => Promise<void>;
  bookmarkPost: (postId: number) => void;
  isBookmarked: (postId: number) => boolean;
  isLiked: (postId: number) => boolean;
  getLikeCount: (post: EnrichedPost) => number;
  getCommentCount: (post: EnrichedPost) => number;
  loadComments: (postId: number) => Promise<Comment[]>;
  addComment: (postId: number, body: string) => Promise<void>;
  getCachedComments: (postId: number) => Comment[] | undefined;
  resetPosts: () => void;
};

const PostContext = createContext<PostContextValue | null>(null);

const DEMO_USER = {
  id: DEMO_USER_ID,
  fullName: 'Emily Johnson',
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function enrichPost(
  post: Post,
  userMap: Map<number, { firstName: string; lastName: string; image: string }>,
): EnrichedPost {
  const user = userMap.get(post.userId);
  const firstName = user?.firstName ?? 'Kullanıcı';
  const lastName = user?.lastName ?? String(post.userId);
  return {
    ...post,
    authorName: `${firstName} ${lastName}`,
    authorImage: user?.image,
    authorInitials: getInitials(firstName, lastName),
  };
}

export function PostProvider({ children }: { children: React.ReactNode }) {
  const { addNotification } = useNotifications();
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [likeCountDelta, setLikeCountDelta] = useState<Record<number, number>>({});
  const [commentCountDelta, setCommentCountDelta] = useState<Record<number, number>>({});
  const [commentCache, setCommentCache] = useState<Record<number, Comment[]>>({});
  const [userPosts] = useState<EnrichedPost[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const skipRef = useRef(0);
  const loadingRef = useRef(false);
  const searchQueryRef = useRef('');
  const activeTagRef = useRef<string | null>(null);

  const fetchPage = useCallback(async (skip: number, tag: string | null) => {
    if (tag) {
      return fetchPostsByTag(tag, skip);
    }
    return fetchPosts(skip);
  }, []);

  const enrichPosts = useCallback(async (rawPosts: Post[]): Promise<EnrichedPost[]> => {
    const userMap = await fetchUsersByIds(rawPosts.map(p => p.userId));
    const enriched = rawPosts.map(p => enrichPost(p, userMap));

    const withComments = await Promise.all(
      enriched.map(async post => {
        try {
          const count = await fetchPostCommentsCount(post.id);
          return { ...post, commentsCount: count };
        } catch {
          return { ...post, commentsCount: 0 };
        }
      }),
    );

    return withComments;
  }, []);

  const reloadFeed = useCallback(async () => {
    skipRef.current = 0;
    setHasMore(true);
    setPosts([]);
    loadingRef.current = true;
    setIsLoading(true);
    try {
      const { posts: rawPosts, total } = await fetchPage(0, activeTagRef.current);
      const enriched = await enrichPosts(rawPosts);
      setPosts(enriched);
      skipRef.current = rawPosts.length;
      setHasMore(skipRef.current < total);
    } catch {
      setPosts([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [enrichPosts, fetchPage]);

  const appendPosts = useCallback(
    async (rawPosts: Post[], total: number, skip: number) => {
      if (rawPosts.length === 0) {
        setHasMore(false);
        return;
      }
      const enriched = await enrichPosts(rawPosts);
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const unique = enriched.filter(p => !existingIds.has(p.id));
        return [...prev, ...unique];
      });
      skipRef.current = skip + rawPosts.length;
      setHasMore(skipRef.current < total);
    },
    [enrichPosts],
  );

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || isSearchMode) {
      return;
    }
    loadingRef.current = true;
    setIsLoading(true);
    try {
      const { posts: rawPosts, total } = await fetchPage(
        skipRef.current,
        activeTagRef.current,
      );
      await appendPosts(rawPosts, total, skipRef.current);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [appendPosts, fetchPage, hasMore, isSearchMode]);

  const refreshPosts = useCallback(async () => {
    if (isSearchMode && searchQueryRef.current) {
      return;
    }
    setIsRefreshing(true);
    skipRef.current = 0;
    setHasMore(true);
    try {
      const { posts: rawPosts, total } = await fetchPage(0, activeTagRef.current);
      const enriched = await enrichPosts(rawPosts);
      setPosts(enriched);
      skipRef.current = rawPosts.length;
      setHasMore(skipRef.current < total);
    } finally {
      setIsRefreshing(false);
    }
  }, [enrichPosts, fetchPage, isSearchMode]);

  const filterByTag = useCallback(
    async (tag: string | null) => {
      setIsSearchMode(false);
      searchQueryRef.current = '';
      activeTagRef.current = tag;
      setActiveTag(tag);
      await reloadFeed();
    },
    [reloadFeed],
  );

  const searchPostsQuery = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      searchQueryRef.current = trimmed;
      if (!trimmed) {
        setIsSearchMode(false);
        await reloadFeed();
        return;
      }
      setIsSearchMode(true);
      setIsLoading(true);
      try {
        const { posts: rawPosts } = await searchPosts(trimmed);
        const enriched = await enrichPosts(rawPosts);
        setPosts(enriched);
        setHasMore(false);
      } catch {
        setPosts([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [enrichPosts, reloadFeed],
  );

  const clearSearch = useCallback(async () => {
    searchQueryRef.current = '';
    setIsSearchMode(false);
    await reloadFeed();
  }, [reloadFeed]);

  const likePost = useCallback(
    async (postId: number) => {
      setLikedPosts(prev => new Set(prev).add(postId));
      setLikeCountDelta(prev => ({
        ...prev,
        [postId]: (prev[postId] ?? 0) + 1,
      }));
      addNotification('like');

      try {
        await new Promise<void>(resolve => setTimeout(resolve, 300));
      } catch {
        setLikedPosts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        setLikeCountDelta(prev => ({
          ...prev,
          [postId]: (prev[postId] ?? 0) - 1,
        }));
      }
    },
    [addNotification],
  );

  const unlikePost = useCallback(async (postId: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
    setLikeCountDelta(prev => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) - 1,
    }));
  }, []);

  const bookmarkPost = useCallback(
    (postId: number) => {
      setBookmarks(prev => {
        const next = new Set(prev);
        if (next.has(postId)) {
          next.delete(postId);
        } else {
          next.add(postId);
          addNotification('bookmark');
        }
        return next;
      });
    },
    [addNotification],
  );

  const isBookmarked = useCallback(
    (postId: number) => bookmarks.has(postId),
    [bookmarks],
  );

  const isLiked = useCallback(
    (postId: number) => likedPosts.has(postId),
    [likedPosts],
  );

  const getLikeCount = useCallback(
    (post: EnrichedPost) => {
      const delta = likeCountDelta[post.id] ?? 0;
      return Math.max(0, post.reactions.likes + delta);
    },
    [likeCountDelta],
  );

  const getCommentCount = useCallback(
    (post: EnrichedPost) => {
      const cached = commentCache[post.id];
      if (cached) {
        return cached.length;
      }
      const delta = commentCountDelta[post.id] ?? 0;
      return Math.max(0, (post.commentsCount ?? 0) + delta);
    },
    [commentCache, commentCountDelta],
  );

  const getCachedComments = useCallback(
    (postId: number) => commentCache[postId],
    [commentCache],
  );

  const loadComments = useCallback(async (postId: number): Promise<Comment[]> => {
    let cached: Comment[] | undefined;
    setCommentCache(prev => {
      cached = prev[postId];
      return prev;
    });
    if (cached && cached.length > 0) {
      return cached;
    }

    const comments = await fetchPostComments(postId);
    setCommentCache(prev => ({ ...prev, [postId]: comments }));
    return comments;
  }, []);

  const addComment = useCallback(
    async (postId: number, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) {
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const optimistic: Comment = {
        id: tempId,
        body: trimmed,
        postId,
        likes: 0,
        user: DEMO_USER,
      };

      setCommentCache(prev => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), optimistic],
      }));
      setCommentCountDelta(prev => ({
        ...prev,
        [postId]: (prev[postId] ?? 0) + 1,
      }));
      addNotification('comment');

      try {
        const created = await createComment(postId, trimmed);
        setCommentCache(prev => ({
          ...prev,
          [postId]: (prev[postId] ?? []).map(c =>
            c.id === tempId ? created : c,
          ),
        }));
      } catch {
        setCommentCache(prev => ({
          ...prev,
          [postId]: (prev[postId] ?? []).filter(c => c.id !== tempId),
        }));
        setCommentCountDelta(prev => ({
          ...prev,
          [postId]: (prev[postId] ?? 0) - 1,
        }));
        throw new Error('Yorum gönderilemedi. Lütfen tekrar deneyin.');
      }
    },
    [addNotification],
  );

  const resetPosts = useCallback(() => {
    setPosts([]);
    setHasMore(true);
    setLikedPosts(new Set());
    setBookmarks(new Set());
    setLikeCountDelta({});
    setCommentCountDelta({});
    setCommentCache({});
    skipRef.current = 0;
    setIsSearchMode(false);
    searchQueryRef.current = '';
    activeTagRef.current = null;
    setActiveTag(null);
  }, []);

  const value = useMemo(
    () => ({
      posts,
      hasMore,
      isLoading,
      isRefreshing,
      likedPosts,
      bookmarks,
      commentCache,
      userPosts,
      loadMore,
      refreshPosts,
      searchPostsQuery,
      clearSearch,
      filterByTag,
      activeTag,
      likePost,
      unlikePost,
      bookmarkPost,
      isBookmarked,
      isLiked,
      getLikeCount,
      getCommentCount,
      loadComments,
      addComment,
      getCachedComments,
      resetPosts,
    }),
    [
      posts,
      hasMore,
      isLoading,
      isRefreshing,
      likedPosts,
      bookmarks,
      commentCache,
      userPosts,
      loadMore,
      refreshPosts,
      searchPostsQuery,
      clearSearch,
      filterByTag,
      activeTag,
      likePost,
      unlikePost,
      bookmarkPost,
      isBookmarked,
      isLiked,
      getLikeCount,
      getCommentCount,
      loadComments,
      addComment,
      getCachedComments,
      resetPosts,
    ],
  );

  return (
    <PostContext.Provider value={value}>{children}</PostContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostContext);
  if (!ctx) {
    throw new Error('usePosts must be used within PostProvider');
  }
  return ctx;
}
