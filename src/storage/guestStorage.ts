import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_KEY = '@ucapconnect/guest_session';

export async function setGuestSession(active: boolean): Promise<void> {
  if (active) {
    await AsyncStorage.setItem(GUEST_KEY, '1');
  } else {
    await AsyncStorage.removeItem(GUEST_KEY);
  }
}

export async function loadGuestSession(): Promise<boolean> {
  const v = await AsyncStorage.getItem(GUEST_KEY);
  return v === '1';
}
