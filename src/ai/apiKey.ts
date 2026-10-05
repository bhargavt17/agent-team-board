import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'anthropic_api_key';

export function envApiKey(): string {
  const fromExpo = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY?.trim();
  if (fromExpo) return fromExpo;
  return '';
}

export async function loadApiKey(): Promise<string> {
  const fromEnv = envApiKey();
  if (fromEnv) return fromEnv;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored?.trim() ?? '';
  } catch {
    return '';
  }
}

export async function saveApiKey(key: string): Promise<void> {
  const trimmed = key.trim();
  try {
    if (trimmed) {
      await AsyncStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures (e.g. private mode); in-memory usage still works.
  }
}
