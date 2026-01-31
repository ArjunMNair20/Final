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

  /**
   * Fetch leaderboard entries from database
   * Query leaderboard scores and profiles efficiently
   */
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Get leaderboard scores
      const { data: scores, error } = await supabase
        .from('leaderboard_scores')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(limit);

      console.log('[leaderboardService] Fetched leaderboard_scores from Supabase:', { count: scores?.length, error });
      if (error) {
        console.error('[leaderboardService] Fetch error details:', error);
      }
      
      if (scores && scores.length > 0) {
        console.log('[leaderboardService] First 3 entries:', scores.slice(0, 3));
        // Log the actual score values to debug
        scores.slice(0, 3).forEach((s: any, i: number) => {
          console.log(`[leaderboardService] Entry ${i}: user_id=${s.user_id}, username=${s.username}, total_score=${s.total_score}, ctf_score=${s.ctf_score}`);
        });
      }

      if (!scores || scores.length === 0) {
        console.log('[leaderboardService] No leaderboard entries found');
        return [];
      }

      // Get profiles in parallel
      const userIds = scores.map((s: { user_id: string }) => s.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      console.log('[leaderboardService] Fetched profiles:', { count: profiles?.length, error: profilesError, profiles });

      // Map profiles by ID
      const profileMap = new Map(
        (profiles || []).map((p: { id: string; name: string | null; avatar_url: string | null }) => [p.id, p])
      );
      
      console.log('[leaderboardService] Profile map size:', profileMap.size, 'Entries:', Array.from(profileMap.entries()).slice(0, 3));

      interface ScoreRecord {
        user_id: string;
        id: string;
        username: string;
        total_score: number;
        ctf_score: number;
        phish_score: number;
        code_score: number;
        quiz_score: number;
        firewall_score: number;
        last_updated: string;
      }

      const result = (scores as ScoreRecord[]).map((score: ScoreRecord, index: number) => {
        const profile = profileMap.get(score.user_id);
        const entry = {
          id: score.id,
          user_id: score.user_id,
          username: score.username,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: (profile as any)?.name || null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          avatar_url: (profile as any)?.avatar_url || null,
          total_score: score.total_score || 0,
          ctf_score: score.ctf_score || 0,
          phish_score: score.phish_score || 0,
          code_score: score.code_score || 0,
          quiz_score: score.quiz_score || 0,
          firewall_score: score.firewall_score || 0,
          last_updated: score.last_updated,
          // Pass through progress columns if present in the scores table
          ctf_solved_count: // @ts-ignore
            (score as any).ctf_solved_count !== undefined ? (score as any).ctf_solved_count : undefined,
          phish_solved_count: // @ts-ignore
            (score as any).phish_solved_count !== undefined ? (score as any).phish_solved_count : undefined,
          code_solved_count: // @ts-ignore
            (score as any).code_solved_count !== undefined ? (score as any).code_solved_count : undefined,
          quiz_answered: // @ts-ignore
            (score as any).quiz_answered !== undefined ? (score as any).quiz_answered : undefined,
          quiz_correct: // @ts-ignore
            (score as any).quiz_correct !== undefined ? (score as any).quiz_correct : undefined,
          firewall_best_score: // @ts-ignore
            (score as any).firewall_best_score !== undefined ? (score as any).firewall_best_score : undefined,
          badges: // @ts-ignore
            (score as any).badges !== undefined ? (score as any).badges : undefined,
          rank: index + 1,
        };
        
        if (index < 3) {
          console.log(`[leaderboardService] Entry ${index}: name="${entry.name}", username="${entry.username}", profile=${profile ? 'found' : 'NOT FOUND'}`);
        }
        
        return entry;
      });

      try {
        // Cache a lightweight copy to localStorage to improve perceived load time
        const cacheKey = 'leaderboard_cache_v1';
        const lite = result.map(e => ({
          id: e.id,
          user_id: e.user_id,
          username: e.username,
          name: e.name,
          avatar_url: e.avatar_url,
          total_score: e.total_score,
          rank: e.rank,
          ctf_solved_count: e.ctf_solved_count,
          phish_solved_count: e.phish_solved_count,
          code_solved_count: e.code_solved_count,
        }));
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), entries: lite }));
        } catch (err) {
          // ignore storage errors (private mode, quota)
        }
      } catch (err) {
        // ignore cache errors
      }

      console.log('[leaderboardService] Returning', result.length, 'leaderboard entries');
      return result;
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
    },
    progress?: {
      ctf_solved_count?: number;
      phish_solved_count?: number;
      code_solved_count?: number;
      quiz_answered?: number;
      quiz_correct?: number;
      firewall_best_score?: number;
      badges?: string[];
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
        console.warn('User profile not found, skipping leaderboard sync for user:', userId, profileError);
        return;
      }

      // Ensure username matches the profile
      const profileUsername = profile.username || username;
      if (!profileUsername || profileUsername.trim() === '') {
        console.warn('Invalid username, skipping leaderboard sync');
        return;
      }

      console.log('Syncing score for user:', userId, profileUsername, 'with scores:', scores);

      // Use upsert with proper conflict handling
      // Build payload including optional progress fields for richer realtime display
      // Ensure total_score is always the sum of component scores for consistency
      const calculatedTotal = scores.ctf + scores.phish + scores.code + scores.quiz + scores.firewall;
      
      const payload: any = {
        user_id: userId,
        username: profileUsername.toLowerCase(),
        total_score: calculatedTotal,  // Use calculated sum instead of user input
        ctf_score: scores.ctf,
        phish_score: scores.phish,
        code_score: scores.code,
        quiz_score: scores.quiz,
        firewall_score: scores.firewall,
        last_updated: new Date().toISOString(),
      };

      console.log('[leaderboardService] Calculated total_score:', calculatedTotal, 'from components:', { ctf: scores.ctf, phish: scores.phish, code: scores.code, quiz: scores.quiz, firewall: scores.firewall });

      if (progress) {
        if (progress.ctf_solved_count !== undefined) payload.ctf_solved_count = progress.ctf_solved_count;
        if (progress.phish_solved_count !== undefined) payload.phish_solved_count = progress.phish_solved_count;
        if (progress.code_solved_count !== undefined) payload.code_solved_count = progress.code_solved_count;
        if (progress.quiz_answered !== undefined) payload.quiz_answered = progress.quiz_answered;
        if (progress.quiz_correct !== undefined) payload.quiz_correct = progress.quiz_correct;
        if (progress.firewall_best_score !== undefined) payload.firewall_best_score = progress.firewall_best_score;
        if (progress.badges !== undefined) payload.badges = progress.badges;
      }

      console.log('Upserting to leaderboard_scores with payload:', payload);

      // Try upsert with onConflict
      const { error: upsertError, data: upsertData } = await supabase
        .from('leaderboard_scores')
        .upsert(payload, {
          onConflict: 'user_id',
        });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        // If upsert fails, try explicit update then insert
        console.log('Upsert failed, attempting explicit update...');
        
        // Try to update first
        const { error: updateError } = await supabase
          .from('leaderboard_scores')
          .update(payload)
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Update error:', updateError);
          console.log('Attempting insert instead...');
          
          // If update fails, try insert
          const { error: insertError } = await supabase
            .from('leaderboard_scores')
            .insert(payload);
          
          if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
          }
        }
      }

      console.log('Score synced successfully for user:', userId, 'Payload:', payload);
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
    let refetchTimeout: NodeJS.Timeout | null = null;

    const setupSubscription = async () => {
      try {
        const supabase = await getSupabase();
        if (!supabase) {
          console.error('[leaderboardService] Supabase client not available for subscriptions');
          return;
        }

        console.log('[leaderboardService] Setting up real-time subscriptions');

        // Initial fetch
        const entries = await this.getLeaderboard();
        if (isSubscribed) {
          console.log('[leaderboardService] Initial leaderboard fetch:', entries.length, 'entries');
          callback(entries);
        }

        // Debounced refetch function - waits 500ms for multiple changes before refetching (faster real-time updates)
        const debouncedRefetch = () => {
          if (refetchTimeout) clearTimeout(refetchTimeout);
          refetchTimeout = setTimeout(async () => {
            console.log('[leaderboardService] Real-time update triggered, refetching leaderboard...');
            const updatedEntries = await this.getLeaderboard();
            if (isSubscribed) {
              console.log('[leaderboardService] Broadcasting updated entries:', updatedEntries.length);
              callback(updatedEntries);
            }
          }, 500);  // Reduced from 2000ms for real-time updates
        };

        // Subscribe to leaderboard_scores changes (debounced)
        supabase
          .channel('leaderboard_scores_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'leaderboard_scores',
            },
            (payload) => {
              console.log('[leaderboardService] leaderboard_scores change detected:', payload.eventType);
              debouncedRefetch();
            }
          )
          .subscribe((status) => {
            console.log('[leaderboardService] leaderboard_scores subscription status:', status);
          });

        // Subscribe to user_progress changes (debounced)
        supabase
          .channel('leaderboard_progress_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_progress',
            },
            (payload) => {
              console.log('[leaderboardService] user_progress change detected:', payload.eventType);
              debouncedRefetch();
            }
          )
          .subscribe((status) => {
            console.log('[leaderboardService] user_progress subscription status:', status);
          });

        console.log('[leaderboardService] Real-time subscriptions established');
      } catch (error) {
        console.error('[leaderboardService] Failed to setup subscriptions:', error);
      }
    };

    setupSubscription();

    // Return unsubscribe function
    return () => {
      isSubscribed = false;
      if (refetchTimeout) clearTimeout(refetchTimeout);
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

  /**
   * Ensure a leaderboard entry exists for a user
   * This is useful for existing users who may not have a leaderboard entry yet
   */
  async ensureLeaderboardEntry(userId: string, username: string): Promise<void> {
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        console.warn('Supabase client not available');
        return;
      }

      console.log('Ensuring leaderboard entry for user:', userId, username);

      // Try upsert - this is safer and simpler
      const { error } = await supabase
        .from('leaderboard_scores')
        .upsert(
          {
            user_id: userId,
            username: username.toLowerCase(),
            total_score: 0,
            ctf_score: 0,
            phish_score: 0,
            code_score: 0,
            quiz_score: 0,
            firewall_score: 0,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        console.error('Error ensuring leaderboard entry:', error);
        return;
      }

      console.log('Leaderboard entry ensured for user:', userId);
    } catch (error) {
      console.error('Failed to ensure leaderboard entry:', error);
    }
  }
}

export default new LeaderboardService();

