import * as SecureStore from 'expo-secure-store';

// Family-member JWT storage (CORE.md §"Auth model"). Backed by expo-secure-store
// so M1.1 (login/register + session restore) can rely on it directly.
const TOKEN_KEY = 'lively_family_token';

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
  cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  notify();
  return cachedToken;
}

export async function setToken(token: string): Promise<void> {
  cachedToken = token;
  notify();
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  notify();
  await SecureStore.deleteItemAsync(TOKEN_KEY);
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
