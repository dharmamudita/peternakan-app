/**
 * Peternakan App
 * Main Entry Point
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation';
import { COLORS } from './src/constants/theme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

import { Platform } from 'react-native';

export default function App() {
  // Handle Facebook Auth Popup Callback (Web Only)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const url = window.location.href;
    if (url.includes('access_token=') || url.includes('error=')) {
      // PENTING: Jangan tutup window di sini!
      // Biarkan polling di window utama yang membaca URL token dan menutup popup ini.
      // Kita hanya render layar kosong agar user tidak bingung.
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }} />
      );
    }
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
