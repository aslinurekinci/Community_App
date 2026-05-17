import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useStackScreenOptions } from '../context/ThemeContext';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          ...screenOptions,
          headerShown: true,
          title: 'Gönderi',
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          ...screenOptions,
          headerShown: true,
          title: 'Profil',
        }}
      />
    </Stack.Navigator>
  );
}
