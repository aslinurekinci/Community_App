import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppBottomTabBar } from '../components/AppBottomTabBar';
import { FeedStack } from './FeedStack';
import { ProfileStack } from './ProfileStack';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <AppBottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="FeedTab" component={FeedStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}
