import { IProgressStorage } from '../services/storage/IProgressStorage';
import { LocalStorageService } from '../services/storage/LocalStorageService';
import { SupabaseStorageService } from '../services/storage/SupabaseStorageService';

export function createStorageService(): IProgressStorage {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && supabaseKey !== 'undefined') {
    try {
      return new SupabaseStorageService();
    } catch (error) {
      console.warn('Failed to initialize Supabase storage, falling back to localStorage:', error);
    }
  }

  return new LocalStorageService();
}
