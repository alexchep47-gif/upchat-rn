import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  identity: '@upchat/identity',
  settings: '@upchat/settings',
  conversations: '@upchat/conversations',
  messages: '@upchat/messages',
  peers: '@upchat/peers',
} as const;

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export { KEYS };
