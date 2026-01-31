import { useState, useEffect, useMemo } from 'react';
import { useProgress, overallScore } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import leaderboardService, { LeaderboardEntry } from '../services/leaderboardService';
import { CTF_TASKS } from '../data/ctf';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';

export default function Leaderboard() {
  const { state } = useProgress();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate current user's score breakdown
  const userScores = useMemo(() => {
    if (!state) return null;
    const scores = {
      total: overallScore(state),
      ctf: state.ctf.solvedIds.length * 100,
      phish: state.phish.solvedIds.length * 150,
      code: state.code.solvedIds.length * 150,
      quiz: state.quiz.correct * 80,
      firewall: state.firewall.bestScore * 20,
    };
    console.log('[Leaderboard] userScores computed:', scores);
    return scores;
  }, [state]);

  // Sync user's score to database when it changes
  useEffect(() => {
    if (!user || !userScores) {
      console.log('[Leaderboard] Score sync skipped: user or userScores missing', { user: !!user, userScores: !!userScores });
      return;
    }

    const syncScore = async () => {
      try {
        console.log('[Leaderboard] Syncing score to Supabase for user:', user.id, 'scores:', userScores);
        
        // Also pass progress details for richer leaderboard display
        const progressPayload = {
          ctf_solved_count: state.ctf.solvedIds.length,
          phish_solved_count: state.phish.solvedIds.length,
          code_solved_count: state.code.solvedIds.length,
          quiz_answered: state.quiz.answered,
          quiz_correct: state.quiz.correct,
          firewall_best_score: state.firewall.bestScore,
          badges: state.badges,
        };

        await leaderboardService.syncUserScore(
          user.id,
          user.username,
          userScores,
          progressPayload
        );
        console.log('[Leaderboard] Score synced to Supabase successfully');
      } catch (err) {
        console.error('[Leaderboard] Failed to sync score to Supabase:', err);
      }
    };

    // Sync immediately with minimal debounce (300ms) for real-time updates
    const timeoutId = setTimeout(syncScore, 300);
    return () => clearTimeout(timeoutId);
  }, [user, userScores, state]);

  // Load leaderboard and subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    setError(null);

    console.log('[Leaderboard] Loading leaderboard...');

    // IMPORTANT: Sync current user's progress to database IMMEDIATELY on mount
    // This ensures their latest progress is visible even after refresh or sign-out/sign-in
    const syncCurrentUserAndLoad = async () => {
      try {
        if (user && state) {
          console.log('[Leaderboard] Syncing current user progress on mount for:', user.id);
          
          // Calculate and sync current user's scores immediately
          const userScores = {
            total: overallScore(state),
            ctf: state.ctf.solvedIds.length * 100,
            phish: state.phish.solvedIds.length * 150,
            code: state.code.solvedIds.length * 150,
            quiz: state.quiz.correct * 80,
            firewall: state.firewall.bestScore * 20,
          };

          const progressPayload = {
            ctf_solved_count: state.ctf.solvedIds.length,
            phish_solved_count: state.phish.solvedIds.length,
            code_solved_count: state.code.solvedIds.length,
            quiz_answered: state.quiz.answered,
            quiz_correct: state.quiz.correct,
            firewall_best_score: state.firewall.bestScore,
            badges: state.badges,
          };

          // Sync immediately (not debounced) on mount
          await leaderboardService.syncUserScore(user.id, user.username, userScores, progressPayload);
          console.log('[Leaderboard] Current user progress synced on mount');
        }
      } catch (err) {
        console.error('[Leaderboard] Failed to sync current user on mount:', err);
        // Don't block leaderboard load if sync fails
      }
    };

    // Try to read cached leaderboard snapshot to show immediately
    try {
      const cacheRaw = localStorage.getItem('leaderboard_cache_v1');
      if (cacheRaw) {
        const parsed = JSON.parse(cacheRaw);
        if (parsed?.entries && Array.isArray(parsed.entries) && parsed.entries.length > 0) {
          // Map lite entries into LeaderboardEntry-ish objects for immediate display
          const cachedEntries = (parsed.entries as any[]).map((e, idx) => ({
            id: e.id || `cached-${idx}`,
            user_id: e.user_id,
            username: e.username,
            name: e.name || null,
            avatar_url: e.avatar_url || null,
            total_score: e.total_score || 0,
            ctf_score: e.ctf_solved_count ? e.ctf_solved_count * 100 : 0,
            phish_score: e.phish_solved_count ? e.phish_solved_count * 150 : 0,
            code_score: e.code_solved_count ? e.code_solved_count * 150 : 0,
            quiz_score: 0,
            firewall_score: 0,
            rank: e.rank || idx + 1,
            last_updated: parsed.ts ? new Date(parsed.ts).toISOString() : new Date().toISOString(),
            ctf_solved_count: e.ctf_solved_count,
            phish_solved_count: e.phish_solved_count,
            code_solved_count: e.code_solved_count,
          } as LeaderboardEntry));

          if (cachedEntries.length > 0) {
            console.log('[Leaderboard] Loaded cached entries:', cachedEntries.length);
            setEntries(cachedEntries);
            setLoading(false); // show cached immediately
          }
        }
      }
    } catch (err) {
      console.log('[Leaderboard] Cache read error:', err);
      // ignore parse errors
    }

    // Sync current user and ensure leaderboard entry exists
    syncCurrentUserAndLoad();

    // Ensure current user has a leaderboard entry (non-blocking)
    if (user) {
      leaderboardService.ensureLeaderboardEntry(user.id, user.username).catch(() => {
        // Silent fail - doesn't block leaderboard load
      });
    }

    // Load fresh leaderboard in background and update entries when available
    leaderboardService.getLeaderboard(50)
      .then((data) => {
        console.log('[Leaderboard] Fresh leaderboard loaded:', data.length, 'entries');
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[Leaderboard] Failed to load:', err);
        setError('Failed to load leaderboard');
        setLoading(false);
      });

    // Subscribe to real-time updates
    const unsubscribe = leaderboardService.subscribeToLeaderboard((updatedEntries) => {
      console.log('[Leaderboard] Real-time update received:', updatedEntries.length);
      setEntries(updatedEntries);
    });

    return () => {
      unsubscribe();
    };
  }, [user, state]);

  // Find current user's entry
  const currentUserEntry = useMemo(() => {
    if (!user) return null;
    return entries.find((entry) => entry.user_id === user.id);
  }, [entries, user]);

  // Merge local progress into the entries so user's score updates immediately
  useEffect(() => {
    if (!user || !userScores) {
      console.log('[Leaderboard] Merge skipped: user or userScores missing', { user: !!user, userScores: !!userScores });
      return;
    }

    console.log('[Leaderboard] Merging local progress. Current entries:', entries.length, 'New userScores:', userScores);

    // Prepare a local entry object from current progress
    const localEntry: LeaderboardEntry = {
      id: `local-${user.id}`,
      user_id: user.id,
      username: user.username || '',
      name: user.name || null,
      avatar_url: (user as any)?.avatar_url || null,
      total_score: userScores.total,
      ctf_score: userScores.ctf,
      phish_score: userScores.phish,
      code_score: userScores.code,
      quiz_score: userScores.quiz,
      firewall_score: userScores.firewall,
      last_updated: new Date().toISOString(),
      ctf_solved_count: state.ctf.solvedIds.length,
      phish_solved_count: state.phish.solvedIds.length,
      code_solved_count: state.code.solvedIds.length,
      quiz_answered: state.quiz.answered,
      quiz_correct: state.quiz.correct,
      firewall_best_score: state.firewall.bestScore,
      badges: state.badges,
      rank: 0,
    };

    console.log('[Leaderboard] Local entry prepared:', localEntry);

    // Merge and sort
    const withoutLocal = entries.filter(e => e.user_id !== user.id);
    const merged = [...withoutLocal, localEntry].sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

    // Recompute ranks
    merged.forEach((e, idx) => (e.rank = idx + 1));

    console.log('[Leaderboard] Merged entries:', merged);

    // Only update if changed (simple check on user's rank or score)
    const existing = entries.find(e => e.user_id === user.id);
    const needsUpdate = !existing || existing.total_score !== localEntry.total_score || existing.rank !== (merged.findIndex(e => e.user_id === user.id) + 1);
    
    console.log('[Leaderboard] Needs update?', needsUpdate, { existing: !!existing, existingScore: existing?.total_score, newScore: localEntry.total_score });
    
    if (needsUpdate) {
      setEntries(merged);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userScores, state.ctf.solvedIds.length, state.phish.solvedIds.length, state.code.solvedIds.length, state.quiz.answered, state.quiz.correct, state.firewall.bestScore]);

  // Get rank icon
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={20} />;
    if (rank === 2) return <Medal className="text-gray-300" size={20} />;
    if (rank === 3) return <Award className="text-amber-600" size={20} />;
    return <span className="text-slate-400 text-sm font-medium">#{rank}</span>;
  };

  // Get display name
  const getDisplayName = (entry: LeaderboardEntry) => {
    return entry.name || entry.username;
  };

  // Compute total score for an entry, falling back to individual parts if total_score missing
  const getEntryTotal = (entry: LeaderboardEntry) => {
    if (!entry) return 0;
    if (entry.total_score !== undefined && entry.total_score !== null) return entry.total_score;
    const sum = (entry.ctf_score || 0) + (entry.phish_score || 0) + (entry.code_score || 0) + (entry.quiz_score || 0) + (entry.firewall_score || 0);
    return sum;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold score-glow mb-2">Leaderboard</h1>
        <p className="text-slate-400">Top players ranked by total score</p>
      </div>

      {/* Current User's Position */}
      {currentUserEntry && (
        <div className="leaderboard-glow border border-[#8B5CF6]/40 rounded-lg p-4 bg-[#8B5CF6]/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {getRankIcon(currentUserEntry.rank)}
              <div>
                <p className="text-[#8B5CF6] font-semibold">Your Position</p>
                <p className="text-slate-400 text-sm">
                  {getDisplayName(currentUserEntry)} • Rank #{currentUserEntry.rank}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold score-glow">{getEntryTotal(currentUserEntry)}</p>
                <p className="text-xs text-slate-500">Total Score</p>
              </div>
              {(currentUserEntry.ctf_solved_count !== undefined || 
                currentUserEntry.phish_solved_count !== undefined || 
                currentUserEntry.code_solved_count !== undefined) && (
                <div className="hidden md:block border-l border-[#FF6F61]/20 pl-6">
                  <p className="text-xs text-slate-400 mb-2">Your Progress</p>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8B5CF6]">CTF Solved:</span>
                      <span className="text-slate-300">{currentUserEntry.ctf_solved_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-fuchsia-400">Phish Solved:</span>
                      <span className="text-slate-300">{currentUserEntry.phish_solved_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">Code Solved:</span>
                      <span className="text-slate-300">{currentUserEntry.code_solved_count || 0}</span>
                    </div>
                    {currentUserEntry.quiz_answered !== undefined && currentUserEntry.quiz_answered > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">Quiz:</span>
                        <span className="text-slate-300">{currentUserEntry.quiz_correct || 0}/{currentUserEntry.quiz_answered}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#8B5CF6]" size={32} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300">
          {error}
        </div>
      )}

      {/* Leaderboard Table */}
      {!loading && !error && (
        <div className="leaderboard-glow border border-[#FF6F61]/30 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#8B5CF6]/10">
              <tr className="text-left">
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold">Rank</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold">Player</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right">Score</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right hidden md:table-cell">CTF</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right hidden md:table-cell">Phish</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right hidden md:table-cell">Code</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right hidden md:table-cell">Quiz</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right hidden lg:table-cell">Progress</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No players on the leaderboard yet. Be the first!
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isCurrentUser = user && entry.user_id === user.id;
                  return (
                    <tr
                      key={entry.id}
                      className={`border-t border-[#8B5CF6]/20 transition-colors ${
                        isCurrentUser
                          ? 'bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/15'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {entry.avatar_url ? (
                            <img
                              src={entry.avatar_url}
                              alt={getDisplayName(entry)}
                              className="w-8 h-8 rounded-full border border-[#8B5CF6]/30"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] text-xs font-bold border border-[#8B5CF6]/30">
                              {getDisplayName(entry).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <p className={`font-medium ${isCurrentUser ? 'text-[#8B5CF6]' : 'text-slate-200'}`}>
                            {getDisplayName(entry)}
                            {isCurrentUser && <span className="ml-2 text-xs text-[#8B5CF6]">(You)</span>}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold score-glow">{getEntryTotal(entry).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                        {entry.ctf_score}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                        {entry.phish_score}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                        {entry.code_score}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                        {entry.quiz_score}
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <div className="flex flex-col gap-1 text-xs text-slate-400">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[#8B5CF6]">CTF:</span>
                            <span>
                              {entry.ctf_solved_count || 0}
                              {CTF_TASKS && CTF_TASKS.length > 0 ? (
                                <span className="ml-2 text-slate-500">({Math.round(((entry.ctf_solved_count || 0) / CTF_TASKS.length) * 100)}%)</span>
                              ) : null}
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-fuchsia-400">Phish:</span>
                            <span>{entry.phish_solved_count || 0}</span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-green-400">Code:</span>
                            <span>{entry.code_solved_count || 0}</span>
                          </div>
                          {entry.quiz_answered !== undefined && entry.quiz_answered > 0 && (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-yellow-400">Quiz:</span>
                              <span>{entry.quiz_correct || 0}/{entry.quiz_answered}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg leaderboard-glow bg-[#06b6d4]/5 border border-[#06b6d4]/30">
            <p className="text-slate-400 text-xs mb-1">Total Players</p>
            <p className="text-2xl font-bold score-glow">{entries.length}</p>
          </div>
          <div className="p-4 rounded-lg leaderboard-glow bg-[#06b6d4]/5 border border-[#06b6d4]/30">
            <p className="text-slate-400 text-xs mb-1">Top Score</p>
            <p className="text-2xl font-bold score-glow">
              {getEntryTotal(entries[0] || ({} as LeaderboardEntry)).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg leaderboard-glow bg-[#06b6d4]/5 border border-[#06b6d4]/30">
            <p className="text-slate-400 text-xs mb-1">Average Score</p>
            <p className="text-2xl font-bold score-glow">
              {Math.round(entries.reduce((sum, e) => sum + getEntryTotal(e), 0) / entries.length).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg leaderboard-glow bg-[#06b6d4]/5 border border-[#06b6d4]/30">
            <p className="text-slate-400 text-xs mb-1">Your Rank</p>
            <p className="text-2xl font-bold score-glow">
              {currentUserEntry ? `#${currentUserEntry.rank}` : 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
