import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/tokens';
import { clearToken } from '@/lib/auth/token';
import { queryClient } from '@/lib/query/queryClient';

// Logout lives here for M1.1 as a temporary but real control; M9.1 (elder
// settings) will build the rest of this screen around it.
export default function SettingsScreen() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await clearToken();
    queryClient.clear();
    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pengaturan</Text>
      <Button label="Keluar" variant="danger" onPress={handleLogout} loading={loggingOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.section,
  },
});
