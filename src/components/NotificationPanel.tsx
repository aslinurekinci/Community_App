import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { radius, spacing } from '../constants/spacing';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime } from '../utils/formatDate';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function NotificationPanel({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { notifications, markRead, markAllRead, clearAll } = useNotifications();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.panel, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Bildirimler</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Kapat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.actionText}>Tümünü okundu say</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAll}>
            <Text style={[styles.actionText, styles.clearText]}>Tümünü temizle</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {notifications.length === 0 ? (
            <Text style={styles.empty}>Henüz bildirim yok.</Text>
          ) : (
            notifications.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, !item.read && styles.itemUnread]}
                onPress={() => markRead(item.id)}>
                <Text style={styles.itemText}>{item.text}</Text>
                <Text style={styles.itemTime}>
                  {formatRelativeTime(item.timestamp)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    backgroundColor: colors.card,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  close: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  clearText: {
    color: colors.notificationBadge,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  item: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  itemUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  itemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  itemTime: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textMuted,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: spacing.xxl,
  },
});
