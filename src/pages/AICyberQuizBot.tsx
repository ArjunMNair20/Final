import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Difficulty, useProgress, useSyncProgressToLeaderboard } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import { QUIZ_QUESTIONS } from '../data/quiz';

const QUIZ_LENGTH = 25;

function shuffleQuestions<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getMotivationMessage(scorePct: number): string {
  if (scorePct === 100) return 'Perfect score! You are a cyber defender legend. Keep pushing the limits.';
  if (scorePct >= 80) return 'Awesome work! You have strong fundamentals—keep sharpening those skills.';
  if (scorePct >= 60) return 'Nice job! You are on the right track. Review the explanations to level up even more.';
  if (scorePct >= 40) return 'Good effort! Focus on the questions you missed and try another run.';
  return 'Every pro starts somewhere. Study the explanations and try again—you\'re building real skills.';
}

export default function AICyberQuizBot() {
  const { state, recordQuiz, setQuizDifficulty } = useProgress();
  const syncToLeaderboard = useSyncProgressToLeaderboard();
  const { user } = useAuth();
  const params = useParams<{ difficulty?: Difficulty }>();
  const navigate = useNavigate();

  const urlDifficulty: Difficulty =
    (params.difficulty === 'easy' || params.difficulty === 'medium' || params.difficulty === 'hard'
      ? params.difficulty
      : 'easy');

  // Keep global quiz difficulty in sync with URL
  useEffect(() => {
    if (state.quiz.difficulty !== urlDifficulty) {
      setQuizDifficulty(urlDifficulty);
    }
  }, [urlDifficulty, setQuizDifficulty, state.quiz.difficulty]);

  const pools = useMemo<Record<Difficulty, typeof QUIZ_QUESTIONS>>(
    () => ({
      easy: QUIZ_QUESTIONS.filter((q) => q.difficulty === 'easy'),
      medium: QUIZ_QUESTIONS.filter((q) => q.difficulty === 'medium'),
      hard: QUIZ_QUESTIONS.filter((q) => q.difficulty === 'hard'),
    }),
    []
  );

  const pool = pools[urlDifficulty];
  const questions = useMemo(
    () => {
      const shuffled = shuffleQuestions(pool);
      const length = Math.min(QUIZ_LENGTH, shuffled.length);
      return shuffled.slice(0, length);
    },
    [pool]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(QUIZ_LENGTH).fill(null));
  const [checked, setChecked] = useState<boolean[]>(() => Array(QUIZ_LENGTH).fill(false));
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  useEffect(() => {
    // reset session when question pool / difficulty changes
    setCurrentIndex(0);
    setAnswers(Array(QUIZ_LENGTH).fill(null));
    setChecked(Array(QUIZ_LENGTH).fill(false));
    setHasSubmittedQuiz(false);
    setFinalScore(null);
  }, [pool]);

  const currentQuestion = questions[currentIndex];
  const selected = answers[currentIndex];
  const isChecked = checked[currentIndex];

  const answeredCount = answers.filter((a) => a !== null).length;
  const canSubmitQuiz = answeredCount === questions.length && !hasSubmittedQuiz;

  const handleSelect = (idx: number) => {
    if (hasSubmittedQuiz) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = idx;
      return next;
    });
  };

  const handleCheck = () => {
    if (selected == null) return;
    setChecked((prev) => {
      const next = [...prev];
      next[currentIndex] = true;
      return next;
    });
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) return;
    setCurrentIndex((i) => i + 1);
  };

  const handleSubmitQuiz = () => {
    if (!canSubmitQuiz) return;

    let correctCount = 0;
    questions.forEach((q, i) => {
      const isCorrect = answers[i] === q.answer;
      if (isCorrect) correctCount += 1;
      // record result in overall progress
      recordQuiz(isCorrect);
    });

    // Sync aggregated quiz progress to leaderboard once after recording
    try {
      syncToLeaderboard(user || null);
    } catch (_) {}

    const pct = Math.round((correctCount / questions.length) * 100);
    setFinalScore(pct);
    setHasSubmittedQuiz(true);
  };

  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-bold text-purple-400">Cyber Quiz Lab</h1>
      <p className="text-slate-400">
        You are taking the <span className="capitalize">{urlDifficulty}</span> level quiz. Answer {QUIZ_LENGTH} questions; each correct answer is marked, and when you finish all questions you can submit to see your total score.
      </p>

      <button
        onClick={() => navigate('/ai-quizbot')}
        className="text-xs text-purple-400 underline underline-offset-2 hover:text-purple-300"
      >
        ← Back to level selection
      </button>

      <div className="border border-slate-800 rounded-lg p-4 bg-white/[0.03] space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div>
            Difficulty:{' '}
            <span className="text-cyan-300 capitalize">{state.quiz.difficulty}</span>
          </div>
          <div>
            Question{' '}
            <span className="text-cyan-300">
              {currentIndex + 1}/{questions.length}
            </span>{' '}
            • Answered{' '}
            <span className="text-fuchsia-300">
              {answeredCount}/{questions.length}
            </span>
          </div>
        </div>

        {currentQuestion ? (
          <>
            <div className="font-semibold text-fuchsia-300">{currentQuestion.prompt}</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {currentQuestion.choices.map((c, idx) => {
                const isSelected = selected === idx;
                const isCorrect = currentQuestion.answer === idx;
                const showCorrect = isChecked && isCorrect;
                const showIncorrect = isChecked && isSelected && !isCorrect;

                let borderClass = 'border-slate-800';
                let bgClass = 'bg-black/30';
                if (isSelected && !isChecked) {
                  borderClass = 'border-cyan-400/40';
                  bgClass = 'bg-cyan-500/10';
                }
                if (showCorrect) {
                  borderClass = 'border-emerald-400/60';
                  bgClass = 'bg-emerald-500/10';
                } else if (showIncorrect) {
                  borderClass = 'border-red-400/60';
                  bgClass = 'bg-red-500/10';
                }

                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-2 p-2 rounded border ${borderClass} ${bgClass} cursor-pointer`}
                  >
                    <input
                      type="radio"
                      name={`quiz-${currentIndex}`}
                      checked={isSelected}
                      onChange={() => handleSelect(idx)}
                      disabled={hasSubmittedQuiz}
                    />
                    <span className="text-sm">{c}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={handleCheck}
                disabled={selected == null || hasSubmittedQuiz}
                className="px-3 py-1 text-sm rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 disabled:opacity-50"
              >
                Check Answer
              </button>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3 py-1 text-sm rounded bg-slate-800/60 text-slate-200 border border-slate-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-3 py-1 text-sm rounded bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/30 disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {isChecked && (
              <div className="text-xs text-slate-400">
                Explanation: {currentQuestion.explain}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-slate-400">No questions found for this difficulty.</div>
        )}

        <div className="border-t border-slate-800 pt-3 mt-1 flex flex-col gap-2">
          <button
            onClick={handleSubmitQuiz}
            disabled={!canSubmitQuiz}
            className="w-full px-4 py-2 text-sm rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasSubmittedQuiz ? 'Quiz Submitted' : `Submit Answers (${answeredCount}/${questions.length})`}
          </button>

          {finalScore !== null && (
            <div className="mt-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm">
              <div className="font-semibold text-emerald-300">
                Total Score: {finalScore}% ({Math.round((finalScore / 100) * questions.length)} / {questions.length}{' '}
                correct)
              </div>
              <p className="mt-1 text-emerald-100/90 text-xs">{getMotivationMessage(finalScore)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
