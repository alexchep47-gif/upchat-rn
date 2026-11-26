import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/store/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function Shell() {
  const { settings } = useApp();
  return (
    <>
      <StatusBar style={settings.theme === 'light' ? 'dark' : 'light'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
