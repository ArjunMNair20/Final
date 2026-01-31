import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../lib/progress';

/**
 * Custom hook to handle logout with progress synchronization
 * 
 * Ensures all progress is saved to Supabase before logging out
 * so that on next login, the progress is restored
 */
export function useLogoutWithSync() {
  const { logout: authLogout } = useAuth();
  const { syncProgress } = useProgress();

  const logout = useCallback(async () => {
    try {
      // Step 1: Sync all progress to storage (Supabase + localStorage)
      console.debug('Syncing progress before logout...');
      await syncProgress();
      console.debug('Progress synced successfully');

      // Step 2: Perform auth logout
      console.debug('Performing logout...');
      await authLogout();
      console.debug('Logout completed');
    } catch (error) {
      console.error('Error during logout with sync:', error);
      // Still try to logout even if sync fails
      try {
        await authLogout();
      } catch (logoutError) {
        console.error('Logout failed:', logoutError);
        throw error;
      }
    }
  }, [authLogout, syncProgress]);

  return { logout };
}
