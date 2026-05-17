import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvatarChip } from '../components/AvatarChip';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { usePosts } from '../context/PostContext';
import { useTheme } from '../context/ThemeContext';
import { ProfileStackParamList } from '../navigation/types';
import { EnrichedPost } from '../types';
import { formatCount } from '../utils/formatNumber';
import { formatRelativeTime } from '../utils/formatDate';
import { radius, spacing } from '../constants/spacing';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

type ProfileTab = 'posts' | 'bookmarks' | 'notifications';

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, theme, toggleTheme } = useTheme();
  const { user, refreshUser, logout } = useAuth();
  const {
    userPosts,
    userPostsLoading,
    loadUserPosts,
    getBookmarkedPosts,
    getProfileStats,
    bookmarkPost,
    resetPosts,
  } = usePosts();
  const {
    notifications,
    markAllRead,
    clearAll,
    markRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [profileLoading, setProfileLoading] = useState(true);

  const stats = getProfileStats();
  const bookmarkedPosts = getBookmarkedPosts();
  const styles = createStyles(colors);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setProfileLoading(true);
      try {
        await refreshUser();
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  useEffect(() => {
    if (user?.id) {
      loadUserPosts(user.id);
    }
  }, [user?.id, loadUserPosts]);

  const handleLogout = () => {
    logout();
    resetPosts();
    clearAll();
  };

  const handlePostPress = (post: EnrichedPost) => {
    navigation.navigate('PostDetail', { post });
  };

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : '?';

  const tabs: { id: ProfileTab; label: string; icon: string }[] = [
    { id: 'posts', label: 'Gönderilerim', icon: 'grid' },
    { id: 'bookmarks', label: 'Yer İmleri', icon: 'bookmark' },
    { id: 'notifications', label: 'Bildirimler', icon: 'bell' },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profil & Ayarlar</Text>

        <View style={styles.profileCard}>
          {profileLoading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <>
              <AvatarChip imageUri={user?.image} initials={initials} size={80} />
              <Text style={styles.userName}>
                {user ? `${user.firstName} ${user.lastName}` : '—'}
              </Text>
              {user?.email ? (
                <Text style={styles.userMeta}>{user.email}</Text>
              ) : null}
              {user?.username ? (
                <Text style={styles.userHandle}>@{user.username}</Text>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Icon name="heart" size={20} color={colors.textPrimary} />
            <Text style={styles.statValue}>{formatCount(stats.totalLikes)}</Text>
            <Text style={styles.statLabel}>Toplam beğeni</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Icon name="bookmark" size={20} color={colors.textPrimary} />
            <Text style={styles.statValue}>{stats.bookmarksCount}</Text>
            <Text style={styles.statLabel}>Kaydedilen</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}>
                <Icon
                  name={tab.icon}
                  size={16}
                  color={isActive ? colors.card : colors.textMuted}
                />
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'posts' && (
            userPostsLoading ? (
              <ActivityIndicator
                color={colors.textPrimary}
                style={styles.loader}
              />
            ) : userPosts.length === 0 ? (
              <EmptyState
                title="Gönderi yok"
                message="Henüz paylaşılmış gönderiniz bulunmuyor."
              />
            ) : (
              userPosts.map((post, index) => (
                <PostCard
                  key={`${post.id}-${index}`}
                  post={post}
                  showImage={index % 2 === 0}
                  onPress={() => handlePostPress(post)}
                />
              ))
            )
          )}

          {activeTab === 'bookmarks' && (
            bookmarkedPosts.length === 0 ? (
              <EmptyState
                title="Yer imi yok"
                message="Kaydettiğiniz gönderiler burada görünür."
              />
            ) : (
              bookmarkedPosts.map((post, index) => (
                <View key={`bm-${post.id}-${index}`}>
                  <PostCard
                    post={post}
                    onPress={() => handlePostPress(post)}
                  />
                  <TouchableOpacity
                    style={styles.removeBookmark}
                    onPress={() => bookmarkPost(post.id, post)}>
                    <Icon name="bookmark" size={14} color={colors.textPrimary} />
                    <Text style={styles.removeBookmarkText}>
                      Yer iminden kaldır
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )
          )}

          {activeTab === 'notifications' && (
            <View>
              <View style={styles.notifActions}>
                <TouchableOpacity
                  style={styles.actionChip}
                  onPress={markAllRead}>
                  <Text style={styles.actionChipText}>Tümünü okundu say</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionChip, styles.actionChipDanger]}
                  onPress={clearAll}>
                  <Text style={[styles.actionChipText, styles.actionChipDangerText]}>
                    Tümünü temizle
                  </Text>
                </TouchableOpacity>
              </View>
              {notifications.length === 0 ? (
                <EmptyState
                  title="Bildirim yok"
                  message="Henüz bildiriminiz bulunmuyor."
                />
              ) : (
                notifications.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.notifItem,
                      !item.read && styles.notifItemUnread,
                    ]}
                    onPress={() => markRead(item.id)}>
                    <Text style={styles.notifText}>{item.text}</Text>
                    <Text style={styles.notifTime}>
                      {formatRelativeTime(item.timestamp)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>AYARLAR</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Icon
                  name={theme === 'dark' ? 'moon' : 'sun'}
                  size={18}
                  color={colors.textPrimary}
                />
              </View>
              <Text style={styles.settingLabel}>Karanlık mod</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.textPrimary }}
            />
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Icon name="log-out" size={18} color={colors.notificationBadge} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingBottom: spacing.xxl,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    profileCard: {
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: spacing.lg,
      borderRadius: radius.lg,
      padding: spacing.xl,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userName: {
      marginTop: spacing.md,
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    userMeta: {
      marginTop: spacing.xs,
      fontSize: 14,
      color: colors.textSecondary,
    },
    userHandle: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
    statsRow: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      marginHorizontal: spacing.lg,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },
    tabs: {
      flexDirection: 'row',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.filterInactiveBg,
    },
    tabActive: {
      backgroundColor: colors.textPrimary,
    },
    tabText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.filterInactiveText,
    },
    tabTextActive: {
      color: colors.card,
    },
    tabContent: {
      minHeight: 160,
    },
    loader: {
      marginVertical: spacing.xl,
    },
    removeBookmark: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      marginTop: -spacing.sm,
      marginBottom: spacing.md,
    },
    removeBookmarkText: {
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    notifActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    actionChip: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.filterInactiveBg,
      alignItems: 'center',
    },
    actionChipDanger: {
      backgroundColor: colors.dangerSoft,
    },
    actionChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    actionChipDangerText: {
      color: colors.notificationBadge,
    },
    notifItem: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    notifItemUnread: {
      borderLeftWidth: 3,
      borderLeftColor: colors.textPrimary,
    },
    notifText: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    notifTime: {
      marginTop: spacing.xs,
      fontSize: 12,
      color: colors.textMuted,
    },
    settingsSection: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingsTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.8,
      marginBottom: spacing.md,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    settingIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.filterInactiveBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.notificationBadge,
    },
    logoutText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.notificationBadge,
    },
  });
}
