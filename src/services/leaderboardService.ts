import { getSupabase } from '../lib/supabase';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
  total_score: number;
  ctf_score: number;
  phish_score: number;
  code_score: number;
  quiz_score: number;
  firewall_score: number;
  rank: number;
  last_updated: string;
  // Progress data
  ctf_solved_count?: number;
  phish_solved_count?: number;
  code_solved_count?: number;
  quiz_answered?: number;
  quiz_correct?: number;
  firewall_best_score?: number;
  badges?: string[];
}

class LeaderboardService {
  private subscription: any = null;

  /**
   * Fetch leaderboard entries from database
   * Only returns real users who have profiles in the system
   */
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Query leaderboard_view but ensure we only get real users
      // The view already joins with user_profiles, so we filter to ensure profile exists
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('*')
        .not('user_id', 'is', null) // Ensure user_id exists
        .order('total_score', { ascending: false })
        .order('last_updated', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }

      // Additional filtering: Only return entries where user has a profile (real user)
      // This ensures we don't show orphaned leaderboard entries
      const filteredData = (data || []).filter((entry: LeaderboardEntry) => {
        // Ensure the entry has a valid user_id and username
        return entry.user_id && entry.username && entry.username.trim() !== '';
      });

      return filteredData as LeaderboardEntry[];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  /**
   * Sync user's score to the leaderboard
   * Only syncs for real authenticated users who have profiles
   */
  async syncUserScore(
    userId: string,
    username: string,
    scores: {
      total: number;
      ctf: number;
      phish: number;
      code: number;
      quiz: number;
      firewall: number;
    }
  ): Promise<void> {
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        console.warn('Supabase client not available, skipping score sync');
        return;
      }

      // Verify user has a profile (real user) before syncing
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, username')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.warn('User profile not found, skipping leaderboard sync for user:', userId);
        return;
      }

      // Ensure username matches the profile
      const profileUsername = profile.username || username;
      if (!profileUsername || profileUsername.trim() === '') {
        console.warn('Invalid username, skipping leaderboard sync');
        return;
      }

      // Upsert the leaderboard entry
      const { error } = await supabase
        .from('leaderboard_scores')
        .upsert(
          {
            user_id: userId,
            username: profileUsername.toLowerCase(),
            total_score: scores.total,
            ctf_score: scores.ctf,
            phish_score: scores.phish,
            code_score: scores.code,
            quiz_score: scores.quiz,
            firewall_score: scores.firewall,
            last_updated: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        console.error('Error syncing score to leaderboard:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to sync score:', error);
    }
  }

  /**
   * Subscribe to real-time leaderboard updates
   */
  subscribeToLeaderboard(
    callback: (entries: LeaderboardEntry[]) => void
  ): () => void {
    let isSubscribed = true;

    const setupSubscription = async () => {
      try {
        const supabase = await getSupabase();
        if (!supabase) {
          console.warn('Supabase client not available for real-time updates');
          return;
        }

        // Initial fetch
        const entries = await this.getLeaderboard();
        if (isSubscribed) {
          callback(entries);
        }

        // Subscribe to changes in leaderboard_scores and user_progress
        this.subscription = supabase
          .channel('leaderboard_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'leaderboard_scores',
            },
            async () => {
              // Refetch leaderboard when scores change
              const updatedEntries = await this.getLeaderboard();
              if (isSubscribed) {
                callback(updatedEntries);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_progress',
            },
            async () => {
              // Refetch leaderboard when progress changes
              const updatedEntries = await this.getLeaderboard();
              if (isSubscribed) {
                callback(updatedEntries);
              }
            }
          )
          .subscribe();

        console.log('Subscribed to leaderboard real-time updates');
      } catch (error) {
        console.error('Failed to setup leaderboard subscription:', error);
      }
    };

    setupSubscription();

    // Return unsubscribe function
    return () => {
      isSubscribed = false;
      if (this.subscription) {
        getSupabase().then((supabase) => {
          if (supabase && this.subscription) {
            supabase.removeChannel(this.subscription);
          }
        }).catch(() => {
          // Ignore errors during cleanup
        });
        this.subscription = null;
      }
    };
  }

  /**
   * Get current user's rank
   */
  async getUserRank(userId: string): Promise<number | null> {
    try {
      const entries = await this.getLeaderboard();
      const userEntry = entries.find((entry) => entry.user_id === userId);
      return userEntry ? userEntry.rank : null;
    } catch (error) {
      console.error('Failed to get user rank:', error);
      return null;
    }
  }
}

export default new LeaderboardService();

