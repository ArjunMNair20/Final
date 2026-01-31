import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ProgressState, defaultProgress } from '../types/progress';
import { IProgressStorage } from '../services/storage/IProgressStorage';
import { BadgeService } from '../services/BadgeService';
import { ProgressCalculationService } from '../services/ProgressCalculationService';
import { createStorageService } from '../config/storage';
import leaderboardService from '../services/leaderboardService';
import { soundService } from '../services/SoundService';

export type { Difficulty } from '../types/progress';
export { defaultProgress, type ProgressState } from '../types/progress';

export type ProgressContextType = {
  state: ProgressState;
  setState: React.Dispatch<React.SetStateAction<ProgressState>>;
  markCTFSolved: (id: string) => void;
  markPhishSolved: (id: string) => void;
  markCodeSolved: (id: string) => void;
  recordQuiz: (correct: boolean) => void;
  setQuizDifficulty: (difficulty: Difficulty) => void;
  setFirewallBest: (score: number) => void;
  reset: () => void;
  resetCTF: () => void;
  resetPhish: () => void;
  resetCode: () => void;
  resetQuiz: () => void;
  resetFirewall: () => void;
  syncProgress: () => Promise<void>;
  newBadges: string[];
};

export interface AchievementContextType {
  achievements: string[];
  addAchievement: (badge: string) => void;
  removeAchievement: (badge: string) => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);
const AchievementContext = createContext<AchievementContextType | null>(null);

export function overallPercent(state: ProgressState): number {
  const service = new ProgressCalculationService();
  return service.calculateOverallPercent(state);
}

export function overallScore(state: ProgressState): number {
  const service = new ProgressCalculationService();
  return service.calculateOverallScore(state);
}

interface ProgressProviderProps {
  children: React.ReactNode;
  storage?: IProgressStorage;
}

export function ProgressProvider({ children, storage }: ProgressProviderProps) {
  const storageService = useMemo<IProgressStorage>(() => storage || createStorageService(), [storage]);
  const badgeService = useMemo(() => new BadgeService(), []);

  const [state, setState] = useState<ProgressState>(() => defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);
  const [previousBadges, setPreviousBadges] = useState<Set<string>>(new Set());
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    // Load progress - prioritize actual loading over idle callback
    const loadProgress = async () => {
      try {
        const loaded = await storageService.load();
        if (loaded) {
          setState(loaded);
          setPreviousBadges(new Set(loaded.badges));
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
        // Keep default progress on error
      } finally {
        setIsLoaded(true);
      }
    };

    // Start loading immediately with slight deferral for non-blocking behavior
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadProgress, { timeout: 1000 });
    } else {
      // Fallback: use setTimeout with 0 delay for immediate but non-blocking execution
      const timer = setTimeout(loadProgress, 0);
      return () => clearTimeout(timer);
    }
  }, [storageService]);

  useEffect(() => {
    if (!isLoaded) return;

    const saveProgress = async () => {
      try {
        const stateWithBadges = {
          ...state,
          badges: badgeService.computeBadges(state, state.badges),
        };

        // Check for newly earned badges
        const newlyEarned = stateWithBadges.badges.filter(
          badge => !previousBadges.has(badge)
        );

        if (newlyEarned.length > 0) {
          // Update previous badges set
          setPreviousBadges(new Set(stateWithBadges.badges));
          setNewBadges(newlyEarned);

          // Add to achievements queue
          setAchievements(prev => [...prev, ...newlyEarned]);

          // Play sound effect for each badge
          newlyEarned.forEach(() => {
            soundService.playBadgeUnlock();
          });
        }

        // Update state if badges were added
        if (JSON.stringify(stateWithBadges) !== JSON.stringify(state)) {
          setState(stateWithBadges);
        }

        // Save to storage
        await storageService.save(stateWithBadges);
      } catch (error) {
        console.error('Failed to save progress:', error);
        // Continue operation even if save fails
      }
    };

    // Debounce saves to avoid excessive requests
    const timeoutId = setTimeout(saveProgress, 100);
    return () => clearTimeout(timeoutId);
  }, [state, isLoaded, storageService, badgeService, previousBadges]);

  const api = useMemo<ProgressContextType>(
    () => ({
      state,
      setState,
      markCTFSolved: (id) =>
        setState((s) => ({
          ...s,
          ctf: { solvedIds: Array.from(new Set([...s.ctf.solvedIds, id])) },
        })),
      markPhishSolved: (id) =>
        setState((s) => ({
          ...s,
          phish: { solvedIds: Array.from(new Set([...s.phish.solvedIds, id])) },
        })),
      markCodeSolved: (id) =>
        setState((s) => ({
          ...s,
          code: { solvedIds: Array.from(new Set([...s.code.solvedIds, id])) },
        })),
      recordQuiz: (correct) =>
        setState((s) => {
          const answered = s.quiz.answered + 1;
          const correctCount = s.quiz.correct + (correct ? 1 : 0);
          return {
            ...s,
            quiz: { ...s.quiz, answered, correct: correctCount },
          };
        }),
      setQuizDifficulty: (difficulty) =>
        setState((s) => ({
          ...s,
          quiz: { ...s.quiz, difficulty },
        })),
      setFirewallBest: (score) =>
        setState((s) => ({
          ...s,
          firewall: { bestScore: Math.max(s.firewall.bestScore, score) },
        })),
      reset: () => {
        setState(defaultProgress);
        storageService.clear();
      },
      resetCTF: () => {
        setState(s => ({
          ...s,
          ctf: defaultProgress.ctf,
        }));
      },
      resetPhish: () => {
        setState(s => ({
          ...s,
          phish: defaultProgress.phish,
        }));
      },
      resetCode: () => {
        setState(s => ({
          ...s,
          code: defaultProgress.code,
        }));
      },
      resetQuiz: () => {
        setState(s => ({
          ...s,
          quiz: defaultProgress.quiz,
        }));
      },
      resetFirewall: () => {
        setState(s => ({
          ...s,
          firewall: defaultProgress.firewall,
        }));
      },
      // Explicit sync method to save progress immediately (e.g., before logout)
      syncProgress: async () => {
        try {
          const stateWithBadges = {
            ...state,
            badges: badgeService.computeBadges(state, state.badges),
          };
          await storageService.save(stateWithBadges);
        } catch (error) {
          console.error('Failed to sync progress:', error);
          throw error;
        }
      },
      newBadges,
    }),
    [state, storageService, newBadges, badgeService]
  );

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}

// Hook to sync progress to leaderboard (should be called from a component that has access to useAuth)
export function useSyncProgressToLeaderboard() {
  const { state } = useProgress();

  return useCallback(async (user: { id: string; username: string } | null) => {
    if (!user) return;

    try {
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

      console.log('[useSyncProgressToLeaderboard] Syncing progress for user:', user.username, 'scores:', userScores);
      await leaderboardService.syncUserScore(user.id, user.username, userScores, progressPayload);
      console.log('[useSyncProgressToLeaderboard] Progress synced successfully');
    } catch (err) {
      console.error('[useSyncProgressToLeaderboard] Failed to sync progress:', err);
    }
  }, [state]);
}
