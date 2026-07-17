import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui';
import { colors, typography } from '@/constants/tokens';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useReactQueryFocusManager } from '@/lib/query/focus';
import { setupOnlineManager } from '@/lib/query/online';
import { queryClient } from '@/lib/query/queryClient';

setupOnlineManager();

export default function RootLayout() {
  useReactQueryFocusManager();
  const authStatus = useAuthStatus();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {authStatus === 'loading' ? (
            <BrandSplash />
          ) : (
            <Stack screenOptions={{ headerShown: false }}>
              {/* M1.1 auth gate: logged-out users can't reach (app), logged-in users skip (auth). */}
              <Stack.Protected guard={authStatus === 'guest'}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
              <Stack.Protected guard={authStatus === 'authed'}>
                <Stack.Screen name="(app)" />
              </Stack.Protected>
            </Stack>
          )}
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

// Shown only while the stored token is being read on cold start, so there is
// never a flash of the wrong (auth) vs (app) screen.
function BrandSplash() {
  return (
    <View style={styles.splash}>
      <Text style={styles.brand}>Lively</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  brand: {
    ...typography.title,
    color: colors.primary,
  },
});
