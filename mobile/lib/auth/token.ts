import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Family-member JWT storage (CORE.md §"Auth model"). Backed by expo-secure-store
// on native so M1.1 (login/register + session restore) can rely on it directly.
// expo-secure-store has no web implementation (its native module method is
// undefined under react-native-web), so web falls back to localStorage — fine for
// the browser dev/demo build, which is not the shipping secure surface.
const TOKEN_KEY = 'lively_family_token';

type KeyValueStore = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const webStore: KeyValueStore = {
  getItem: (key) => {
    try {
      return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key, value) => {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // storage unavailable (private mode); token stays in the in-memory cache only.
    }
    return Promise.resolve();
  },
  removeItem: (key) => {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // ignore
    }
    return Promise.resolve();
  },
};

const nativeStore: KeyValueStore = {
  getItem: async (key) => {
    if (!(await SecureStore.isAvailableAsync())) return null;
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (!(await SecureStore.isAvailableAsync())) return;
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    if (!(await SecureStore.isAvailableAsync())) return;
    await SecureStore.deleteItemAsync(key);
  },
};

const store: KeyValueStore = Platform.OS === 'web' ? webStore : nativeStore;

let cachedToken: string | null | undefined; // undefined = not read from disk yet

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

// Lets the root layout's auth gate (M1.1) react to login/register/logout
// without screens needing to know about navigation state themselves.
export function subscribeToken(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function getToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;
  cachedToken = await store.getItem(TOKEN_KEY);
  notify();
  return cachedToken;
}

export async function setToken(token: string): Promise<void> {
  cachedToken = token;
  notify();
  await store.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  notify();
  await store.removeItem(TOKEN_KEY);
}

// Sync read for callers that already warmed the cache (e.g. request interceptor
// after the app's initial getToken() call on boot). Falls back to null.
export function getCachedToken(): string | null {
  return cachedToken ?? null;
}

// Raw snapshot (undefined = not read from disk yet) for the auth-gate hook,
// which needs to distinguish "still loading" from "loaded, logged out".
export function getTokenSnapshot(): string | null | undefined {
  return cachedToken;
}
