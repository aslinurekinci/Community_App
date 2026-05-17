import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

type TabId = 'home' | 'favorites' | 'shop' | 'profile';

type Props = {
  activeTab?: TabId;
};

export function FeedBottomTab({ activeTab = 'home' }: Props) {
  const insets = useSafeAreaInsets();

  const tabs: { id: TabId; icon: string; filled?: boolean }[] = [
    { id: 'home', icon: 'home', filled: activeTab === 'home' },
    { id: 'favorites', icon: 'heart' },
    { id: 'shop', icon: 'shopping-bag' },
    { id: 'profile', icon: 'user' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            activeOpacity={0.7}
            disabled>
            {isActive ? (
              <View style={styles.activeIconWrap}>
                <Icon name={tab.icon as 'home'} size={20} color={colors.card} />
              </View>
            ) : (
              <Icon
                name={tab.icon as 'home'}
                size={24}
                color={colors.textPrimary}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  activeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
