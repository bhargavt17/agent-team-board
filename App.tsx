import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LaunchScreen, LaunchPayload } from './src/screens/LaunchScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

export default function App() {
  const [session, setSession] = useState<LaunchPayload | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {session ? (
        <DashboardScreen
          brief={session.brief}
          apiKey={session.apiKey}
          onReset={() => setSession(null)}
        />
      ) : (
        <LaunchScreen onStart={setSession} />
      )}
    </SafeAreaProvider>
  );
}
