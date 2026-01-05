import { useState, useEffect, useMemo } from 'react';
import { useProgress, overallScore } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import leaderboardService, { LeaderboardEntry } from '../services/leaderboardService';
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
    return {
      total: overallScore(state),
      ctf: state.ctf.solvedIds.length * 100,
      phish: state.phish.solvedIds.length * 150,
      code: state.code.solvedIds.length * 150,
      quiz: state.quiz.correct * 80,
      firewall: state.firewall.bestScore * 20,
    };
  }, [state]);

  // Sync user's score to database when it changes
  useEffect(() => {
    if (!user || !userScores) return;

    const syncScore = async () => {
      try {
        await leaderboardService.syncUserScore(
          user.id,
          user.username,
          userScores
        );
      } catch (err) {
        console.error('Failed to sync score:', err);
      }
    };

    // Debounce sync to avoid too many updates
    const timeoutId = setTimeout(syncScore, 1000);
    return () => clearTimeout(timeoutId);
  }, [user, userScores]);

  // Load leaderboard and subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Initial load
    leaderboardService.getLeaderboard(50).then((data) => {
      setEntries(data);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load leaderboard:', err);
      setError('Failed to load leaderboard');
      setLoading(false);
    });

    // Subscribe to real-time updates
    const unsubscribe = leaderboardService.subscribeToLeaderboard((updatedEntries) => {
      setEntries(updatedEntries);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Find current user's entry
  const currentUserEntry = useMemo(() => {
    if (!user) return null;
    return entries.find((entry) => entry.user_id === user.id);
  }, [entries, user]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">Leaderboard</h1>
        <p className="text-slate-400">Compete with other players and climb the ranks!</p>
      </div>

      {/* Current User's Position */}
      {currentUserEntry && (
        <div className="border border-cyan-400/30 rounded-lg p-4 bg-cyan-500/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {getRankIcon(currentUserEntry.rank)}
              <div>
                <p className="text-cyan-300 font-semibold">Your Position</p>
                <p className="text-slate-400 text-sm">
                  {getDisplayName(currentUserEntry)} • Rank #{currentUserEntry.rank}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-400">{currentUserEntry.total_score}</p>
                <p className="text-xs text-slate-500">Total Score</p>
              </div>
              {(currentUserEntry.ctf_solved_count !== undefined || 
                currentUserEntry.phish_solved_count !== undefined || 
                currentUserEntry.code_solved_count !== undefined) && (
                <div className="hidden md:block border-l border-cyan-400/20 pl-6">
                  <p className="text-xs text-slate-400 mb-2">Your Progress</p>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">CTF Solved:</span>
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
          <Loader2 className="animate-spin text-cyan-400" size={32} />
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
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.06]">
              <tr className="text-left">
                <th className="px-4 py-3 text-slate-300 font-semibold">Rank</th>
                <th className="px-4 py-3 text-slate-300 font-semibold">Player</th>
                <th className="px-4 py-3 text-slate-300 font-semibold text-right">Total Score</th>
                <th className="px-4 py-3 text-slate-300 font-semibold text-right hidden md:table-cell">CTF</th>
                <th className="px-4 py-3 text-slate-300 font-semibold text-right hidden md:table-cell">Phish</th>
                <th className="px-4 py-3 text-slate-300 font-semibold text-right hidden md:table-cell">Code</th>
                <th className="px-4 py-3 text-slate-300 font-semibold text-right hidden md:table-cell">Quiz</th>
                <th className="px-4 py-3 text-slate-300 font-semibold text-right hidden lg:table-cell">Progress</th>
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
                      className={`border-t border-slate-800/50 transition-colors ${
                        isCurrentUser
                          ? 'bg-cyan-500/10 hover:bg-cyan-500/15'
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
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                              {getDisplayName(entry).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className={`font-medium ${isCurrentUser ? 'text-cyan-300' : 'text-slate-200'}`}>
                              {getDisplayName(entry)}
                              {isCurrentUser && <span className="ml-2 text-xs text-cyan-400">(You)</span>}
                            </p>
                            {entry.username && entry.username !== getDisplayName(entry) && (
                              <p className="text-xs text-slate-500">@{entry.username}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-cyan-400">{entry.total_score.toLocaleString()}</span>
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
                            <span className="text-cyan-400">CTF:</span>
                            <span>{entry.ctf_solved_count || 0}</span>
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
          <div className="p-4 rounded-lg bg-white/[0.02] border border-slate-800">
            <p className="text-slate-400 text-xs mb-1">Total Players</p>
            <p className="text-2xl font-bold text-cyan-400">{entries.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.02] border border-slate-800">
            <p className="text-slate-400 text-xs mb-1">Top Score</p>
            <p className="text-2xl font-bold text-cyan-400">
              {entries[0]?.total_score.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.02] border border-slate-800">
            <p className="text-slate-400 text-xs mb-1">Average Score</p>
            <p className="text-2xl font-bold text-cyan-400">
              {Math.round(entries.reduce((sum, e) => sum + e.total_score, 0) / entries.length).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.02] border border-slate-800">
            <p className="text-slate-400 text-xs mb-1">Your Rank</p>
            <p className="text-2xl font-bold text-cyan-400">
              {currentUserEntry ? `#${currentUserEntry.rank}` : 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
