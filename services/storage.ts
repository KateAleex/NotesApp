import { Platform } from 'react-native';
import { IStorageService, StorageType } from '../types';
import { FileStorage } from './fileStorage';

export async function createStorage(type: StorageType): Promise<IStorageService> {
  // SQLite not supported on web — use file storage as fallback
  if (type === 'sqlite' && Platform.OS !== 'web') {
    const { SQLiteStorage } = await import('./sqliteStorage');
    return new SQLiteStorage();
  }

  if (type === 'sqlite' && Platform.OS === 'web') {
    // On web, fallback to a simple in-memory/localStorage storage
    const { WebStorage } = await import('./webStorage');
    return new WebStorage();
  }

  if (Platform.OS === 'web') {
    const { WebStorage } = await import('./webStorage');
    return new WebStorage();
  }

  return new FileStorage();
}
