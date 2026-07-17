import { Stack } from 'expo-router';
import { View } from 'react-native';

import { OfflineBanner } from '@/components/OfflineBanner';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </View>
  );
}
