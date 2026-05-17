import 'react-native-gesture-handler'; // Stack Navigator için — EN ÜSTTE OLMALI
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PostProvider } from './src/context/PostContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import Login from './src/screens/Login';
import Discover from './src/screens/Discover';
import CreatePost from './src/screens/CreatePost';

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const DiscoverStack = createStackNavigator();

const TabIcon = ({ label }) => <Text style={styles.tabIcon}>{label}</Text>;

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={Login} />
  </AuthStack.Navigator>
);

const DiscoverNavigator = () => (
  <DiscoverStack.Navigator screenOptions={{ headerShown: false }}>
    <DiscoverStack.Screen name="Discover" component={Discover} />
  </DiscoverStack.Navigator>
);

const MainTabNavigator = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subText,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverNavigator}
        options={{
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color }) => <TabIcon label="🔍" color={color} />,
        }}
      />
      <Tab.Screen
        name="CreatePostTab"
        component={CreatePost}
        options={{
          tabBarLabel: 'Paylaş',
          tabBarIcon: ({ color }) => <TabIcon label="➕" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { token, bootstrapping } = useAuth();
  const { theme } = useTheme();

  if (bootstrapping) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <RootStack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

const App = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <AuthProvider>
        <PostProvider>
          <NotificationProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </NotificationProvider>
        </PostProvider>
      </AuthProvider>
    </ThemeProvider>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabIcon: { fontSize: 20 },
});

export default App;
