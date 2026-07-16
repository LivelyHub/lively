import { useEffect, useSyncExternalStore } from 'react';

import { getToken, getTokenSnapshot, subscribeToken } from '@/lib/auth/token';

export type AuthStatus = 'loading' | 'authed' | 'guest';

// Drives the root layout's Stack.Protected auth gate (M1.1). Backed by the
// token module's own pub-sub so login/register/logout (which just call
// setToken/clearToken) redirect the router without screens touching navigation.
export function useAuthStatus(): AuthStatus {
  useEffect(() => {
    if (getTokenSnapshot() === undefined) {
      void getToken();
    }
  }, []);

  const snapshot = useSyncExternalStore(subscribeToken, getTokenSnapshot);

  if (snapshot === undefined) return 'loading';
  return snapshot ? 'authed' : 'guest';
}
