import React from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AlertProvider } from './src/context/AlertContext';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const AppContent: React.FC = () => {
  const { isDarkMode, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const androidBottomSafe = Platform.OS === 'android' ? Math.max(insets.bottom, 48) : 0;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingBottom: androidBottomSafe,
      }}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <AppNavigator />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <AuthProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </AuthProvider>
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
