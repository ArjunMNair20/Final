import { useMemo, useState } from 'react';
import { useProgress } from '../lib/progress';
import { CTF_TASKS } from '../data/ctf';
import { Flag, Lightbulb, CheckCircle, XCircle, Filter, Trophy, Lock, Unlock } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard' | 'all';
type Category = 'Web' | 'Cryptography' | 'Forensics' | 'Reverse' | 'Binary' | 'all';

export default function CTF() {
  const { state, markCTFSolved } = useProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong' | ''>>({});
  const [hintIndices, setHintIndices] = useState<Record<string, number>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const filteredTasks = useMemo(() => {
    return CTF_TASKS.filter(t => {
      const difficultyMatch = selectedDifficulty === 'all' || t.difficulty === selectedDifficulty;
      const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
      return difficultyMatch && categoryMatch;
    });
  }, [selectedDifficulty, selectedCategory]);

  const difficultyCounts = useMemo(() => {
    return {
      easy: CTF_TASKS.filter(t => t.difficulty === 'easy').length,
      medium: CTF_TASKS.filter(t => t.difficulty === 'medium').length,
      hard: CTF_TASKS.filter(t => t.difficulty === 'hard').length,
      all: CTF_TASKS.length,
    };
  }, []);

  const categoryCounts = useMemo(() => {
    return {
      Web: CTF_TASKS.filter(t => t.category === 'Web').length,
      Cryptography: CTF_TASKS.filter(t => t.category === 'Cryptography').length,
      Forensics: CTF_TASKS.filter(t => t.category === 'Forensics').length,
      Reverse: CTF_TASKS.filter(t => t.category === 'Reverse').length,
      Binary: CTF_TASKS.filter(t => t.category === 'Binary').length,
      all: CTF_TASKS.length,
    };
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'hard':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Web':
        return '🌐';
      case 'Cryptography':
        return '🔐';
      case 'Forensics':
        return '🔍';
      case 'Reverse':
        return '🔄';
      case 'Binary':
        return '💻';
      default:
        return '📋';
    }
  };

  const submit = (id: string, expected: string) => {
    const val = (answers[id] || '').trim();
    // Extract content from CSA{...} format if present, or use as-is
    const expectedContent = expected.replace(/^CSA\{|\}$/g, '');
    // Accept answer with or without CSA{} wrapper
    const ok = val === expected || val === expectedContent || 
               val.toLowerCase() === expected.toLowerCase() || 
               val.toLowerCase() === expectedContent.toLowerCase();
    setFeedback((f) => ({ ...f, [id]: ok ? 'correct' : 'wrong' }));
    if (ok) markCTFSolved(id);
  };

  const showNextHint = (id: string, totalHints: number) => {
    setHintIndices((prev) => {
      const current = prev[id] || 0;
      if (current < totalHints) {
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  const solvedCount = state.ctf.solvedIds.length;
  const totalCount = CTF_TASKS.length;
  const progress = Math.round((solvedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-cyan-300 mb-2 flex items-center gap-2">
          <Flag className="text-cyan-400" size={32} />
          CTF Challenges
        </h1>
        <p className="text-slate-400 mb-4">
          Practice Web, Cryptography, Forensics, Reverse Engineering, and Binary Exploitation. 
          Problems look complex but have simple solutions!
        </p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-semibold text-cyan-400">{solvedCount} / {totalCount} solved ({progress}%)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Difficulty Filter */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={18} />
            <span className="text-sm font-medium">Difficulty:</span>
          </div>
          {(['all', 'easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                selectedDifficulty === diff
                  ? getDifficultyColor(diff) + ' shadow-lg scale-105'
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              <span className="ml-2 text-xs">({difficultyCounts[diff]})</span>
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={18} />
            <span className="text-sm font-medium">Category:</span>
          </div>
          {(['all', 'Web', 'Cryptography', 'Forensics', 'Reverse', 'Binary'] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30 shadow-lg scale-105'
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All' : getCategoryIcon(cat) + ' ' + cat}
              <span className="ml-2 text-xs">({categoryCounts[cat]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            No challenges found for selected filters.
          </div>
        ) : (
          filteredTasks.map((t) => {
            const solved = state.ctf.solvedIds.includes(t.id);
            const currentHintIndex = hintIndices[t.id] || 0;
            const hintsShown = currentHintIndex > 0;
            const allHintsShown = currentHintIndex >= t.hints.length;
            const isCorrect = feedback[t.id] === 'correct';
            const isWrong = feedback[t.id] === 'wrong';
            
            return (
              <div 
                key={t.id} 
                className={`border rounded-lg p-5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] transition-all space-y-3 ${
                  solved 
                    ? 'border-cyan-400/30 bg-cyan-500/5' 
                    : isWrong
                    ? 'border-red-400/30 bg-red-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(t.category)}</span>
                      <h3 className="font-semibold text-fuchsia-300 text-lg">{t.title}</h3>
                      {solved && <CheckCircle className="text-cyan-400" size={18} />}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(t.difficulty)}`}>
                        {t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1)}
                      </span>
                      <span className="text-xs text-slate-400">{t.category}</span>
                    </div>
                  </div>
                </div>

                {/* Prompt */}
                <p className="text-sm text-slate-300 leading-relaxed">{t.prompt}</p>
                
                {/* Hints Section */}
                {hintsShown && (
                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <Lightbulb size={14} />
                      <span>Hints ({currentHintIndex}/{t.hints.length}):</span>
                    </div>
                    {t.hints.slice(0, currentHintIndex).map((hint, idx) => (
                      <div key={idx} className="text-xs text-slate-300 bg-slate-900/70 p-3 rounded-lg border border-slate-700/50">
                        <span className="text-cyan-400 font-medium">Hint {idx + 1}:</span> <span className="ml-1">{hint}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Hint and Answer Buttons */}
                <div className="flex gap-2">
                  <button
                    disabled={allHintsShown || solved}
                    onClick={() => showNextHint(t.id, t.hints.length)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      allHintsShown || solved
                        ? 'bg-slate-700/30 text-slate-500 border-slate-600 cursor-not-allowed'
                        : 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30 hover:bg-fuchsia-500/30'
                    }`}
                  >
                    <Lightbulb size={16} />
                    {allHintsShown ? 'All hints' : `Hint ${currentHintIndex + 1}`}
                  </button>
                  <button
                    disabled={solved || showAnswer[t.id]}
                    onClick={() => setShowAnswer((prev) => ({ ...prev, [t.id]: true }))}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      solved || showAnswer[t.id]
                        ? 'bg-green-500/20 text-green-300 border-green-400/30'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30 hover:bg-yellow-500/30'
                    }`}
                  >
                    {showAnswer[t.id] ? <CheckCircle size={16} /> : <Unlock size={16} />}
                    {showAnswer[t.id] ? 'Answer Shown' : 'Show Answer'}
                  </button>
                </div>

                {/* Answer Display */}
                {showAnswer[t.id] && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
                    <div className="flex items-start gap-2">
                      <Unlock className="text-yellow-400 mt-0.5" size={18} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-300 mb-1">Answer:</p>
                        <p className="text-sm text-yellow-200 font-mono bg-black/30 p-2 rounded border border-yellow-400/20">
                          {t.flag.replace(/^CSA\{|\}$/g, '')}
                        </p>
                        <p className="text-xs text-yellow-400/70 mt-1">(Submit only the content, without CSA{})</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Answer Input */}
                <div className="flex items-center gap-2">
                  <input
                    disabled={solved}
                    value={answers[t.id] || ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [t.id]: e.target.value }))}
                    placeholder="Answer Here"
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-all ${
                      solved
                        ? 'bg-green-500/10 border-green-400/30 text-green-300'
                        : isWrong
                        ? 'bg-red-500/10 border-red-400/30'
                        : 'bg-black/30 border-slate-800 text-slate-200 focus:border-cyan-400/50 focus:bg-black/40'
                    }`}
                  />
                  <button
                    disabled={solved || !answers[t.id]?.trim()}
                    onClick={() => submit(t.id, t.flag)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      solved
                        ? 'bg-green-500/20 text-green-300 border-green-400/30'
                        : !answers[t.id]?.trim()
                        ? 'bg-slate-700/50 text-slate-500 border-slate-600 cursor-not-allowed'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/30'
                    }`}
                  >
                    {solved ? <CheckCircle size={18} /> : 'Submit'}
                  </button>
                </div>

                {/* Feedback */}
                {solved && (
                  <div className="flex items-center gap-2 text-sm text-green-300">
                    <CheckCircle size={16} />
                    <span>Solved! ✓</span>
                  </div>
                )}
                {!solved && isWrong && (
                  <div className="flex items-center gap-2 text-sm text-red-300">
                    <XCircle size={16} />
                    <span>Not quite. Keep trying!</span>
                  </div>
                )}
                {!solved && isCorrect && (
                  <div className="flex items-center gap-2 text-sm text-green-300">
                    <CheckCircle size={16} />
                    <span>Correct! Challenge solved.</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Completion Message */}
      {solvedCount === totalCount && (
        <div className="p-6 rounded-lg bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-400/30 text-center">
          <Trophy className="text-cyan-400 mx-auto mb-2" size={32} />
          <h3 className="text-xl font-bold text-cyan-300 mb-2">Congratulations!</h3>
          <p className="text-slate-300">
            You've completed all CTF challenges! You're now a master of capture the flag challenges.
          </p>
        </div>
      )}
    </div>
  );
}
