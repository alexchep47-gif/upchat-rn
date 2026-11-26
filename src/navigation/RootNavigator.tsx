import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../store/AppContext';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ChatsScreen } from '../screens/ChatsScreen';
import { ProximityScreen } from '../screens/ProximityScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ACCENT } from '../theme/colors';
import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function Tabs() {
  const { colors } = useApp();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ title: 'Échanges', tabBarLabel: 'Échanges' }} />
      <Tab.Screen name="Proximity" component={ProximityScreen} options={{ title: 'Proximité', tabBarLabel: 'Proximité' }} />
      <Tab.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Contacts', tabBarLabel: 'Contacts' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Réglages', tabBarLabel: 'Réglages' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { ready, identity, settings, colors } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={ACCENT} size="large" />
      </View>
    );
  }

  const navTheme = {
    ...(settings.theme === 'light' ? DefaultTheme : DarkTheme),
    colors: {
      ...(settings.theme === 'light' ? DefaultTheme.colors : DarkTheme.colors),
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: ACCENT,
    },
  };

  const showMain = Boolean(identity && settings.onboardingDone);

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        {!showMain ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerBackTitle: 'Retour' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
