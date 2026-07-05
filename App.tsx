import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StripeProvider } from '@stripe/stripe-react-native';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ya oculto o no disponible en web */
});

import React, { Component, ReactNode } from 'react';
import { View, Text, ScrollView } from 'react-native';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("APP CRASH:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#900', paddingTop: 60, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold' }}>FATAL ERROR</Text>
          <ScrollView>
            <Text style={{ color: '#fff', marginTop: 10 }}>{this.state.error?.toString()}</Text>
            <Text style={{ color: '#ccc', marginTop: 10 }}>{this.state.error?.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <StripeProvider
        publishableKey="pk_test_51TeeoMQosYfPbGLEWKfBws4tvHYwywQhX64fOKBTrH3AAFywukNUIdsEQYhL9MeRbc9TcsHJcQtiy2ivf9yOEm1m00mMy2MzAv"
      >
        <SafeAreaProvider>
          <AuthProvider>
            <CartProvider>
              <RootNavigator />
              <StatusBar style="light" />
            </CartProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </StripeProvider>
    </ErrorBoundary>
  );
}
