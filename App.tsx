import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LaunchScreen } from './src/screens/LaunchScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ProductBrief } from './src/types';

export default function App() {
  const [brief, setBrief] = useState<ProductBrief | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {brief ? (
        <DashboardScreen brief={brief} onReset={() => setBrief(null)} />
      ) : (
        <LaunchScreen onStart={setBrief} />
      )}
    </SafeAreaProvider>
  );
}
