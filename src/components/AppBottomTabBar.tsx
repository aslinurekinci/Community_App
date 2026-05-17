import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { spacing } from '../constants/spacing';
import { MainTabParamList } from '../navigation/types';

type TabItem = {
  key: string;
  routeName?: keyof MainTabParamList;
  accessibilityLabel: string;
  activeIcon: string;
  inactiveIcon: string;
};

const TABS: TabItem[] = [
  {
    key: 'feed',
    routeName: 'FeedTab',
    accessibilityLabel: 'Ana Akış',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  {
    key: 'favorites',
    accessibilityLabel: 'Beğeniler',
    activeIcon: 'heart',
    inactiveIcon: 'heart-outline',
  },
  {
    key: 'explore',
    accessibilityLabel: 'Keşfet',
    activeIcon: 'compass',
    inactiveIcon: 'compass-outline',
  },
  {
    key: 'profile',
    routeName: 'ProfileTab',
    accessibilityLabel: 'Profil',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
];

export function AppBottomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const activeRouteName = state.routes[state.index]?.name as
    | keyof MainTabParamList
    | undefined;

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}>
      <View style={styles.bar}>
        {TABS.map(tab => {
          const isFocused = tab.routeName
            ? activeRouteName === tab.routeName
            : false;
          const iconName = isFocused ? tab.activeIcon : tab.inactiveIcon;
          const iconColor = isFocused ? colors.textPrimary : colors.textMuted;
          const isDisabled = !tab.routeName;

          const onPress = () => {
            if (!tab.routeName) {
              return;
            }
            const route = state.routes.find(r => r.name === tab.routeName);
            if (!route) {
              return;
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.routeName);
            }
          };

          return (
            <Pressable
              key={tab.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={
                isFocused ? { selected: true } : { disabled: isDisabled }
              }
              accessibilityLabel={tab.accessibilityLabel}>
              <View
                style={[
                  styles.iconShell,
                  isFocused && styles.iconShellActive,
                  isDisabled && styles.iconShellDisabled,
                ]}>
                <Ionicons name={iconName} size={26} color={iconColor} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: colors.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 12,
    },
    bar: {
      flexDirection: 'row',
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
    },
    iconShell: {
      width: 52,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },
    iconShellActive: {
      backgroundColor: colors.filterInactiveBg,
    },
    iconShellDisabled: {
      opacity: 0.85,
    },
  });
