import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useStackScreenOptions } from '../context/ThemeContext';
import { FeedScreen } from '../screens/FeedScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { FeedStackParamList } from './types';

const Stack = createNativeStackNavigator<FeedStackParamList>();

export function FeedStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
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
