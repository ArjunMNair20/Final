import { useState, useMemo } from 'react';
import { CODE_CHALLENGES } from '../data/code';
import { useProgress } from '../lib/progress';
import { Code, Shield, AlertTriangle, CheckCircle, XCircle, Filter } from 'lucide-react';

type Difficulty = 'beginner' | 'intermediate' | 'expert' | 'all';

export default function CodeAndSecure() {
  const { state, markCodeSolved } = useProgress();
  const [choice, setChoice] = useState<Record<string, number | null>>({});
  const [showExplain, setShowExplain] = useState<Record<string, boolean>>({});
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);

  const submit = (id: string, answer: number) => {
    const c = choice[id];
    if (c === answer) {
      markCodeSolved(id);
    }
    setShowExplain((s) => ({ ...s, [id]: true }));
  };

  // Filter challenges by difficulty
  const filteredChallenges = useMemo(() => {
    if (selectedDifficulty === 'all') {
      return CODE_CHALLENGES;
    }
    return CODE_CHALLENGES.filter(c => c.difficulty === selectedDifficulty);
  }, [selectedDifficulty]);

  // Count challenges by difficulty
  const difficultyCounts = useMemo(() => {
    return {
      beginner: CODE_CHALLENGES.filter(c => c.difficulty === 'beginner').length,
      intermediate: CODE_CHALLENGES.filter(c => c.difficulty === 'intermediate').length,
      expert: CODE_CHALLENGES.filter(c => c.difficulty === 'expert').length,
      all: CODE_CHALLENGES.length,
    };
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'expert':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '🟢';
      case 'intermediate':
        return '🟡';
      case 'expert':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const solvedCount = state.code.solvedIds.length;
  const totalCount = CODE_CHALLENGES.length;
  const progress = Math.round((solvedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-cyan-300 mb-2 flex items-center gap-2">
          <Code className="text-cyan-400" size={32} />
          Code & Secure
        </h1>
        <p className="text-slate-400 mb-4">
          Fix vulnerable code, learn secure coding practices, and master security concepts. Problems look complex but have simple solutions!
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

      {/* Difficulty Filter */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter size={18} />
          <span className="text-sm font-medium">Filter by difficulty:</span>
        </div>
        {(['all', 'beginner', 'intermediate', 'expert'] as Difficulty[]).map((diff) => (
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
            <span className="ml-2 text-xs">
              ({difficultyCounts[diff]})
            </span>
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No challenges found for selected difficulty.
          </div>
        ) : (
          filteredChallenges.map((q) => {
            const solved = state.code.solvedIds.includes(q.id);
            const isExpanded = expandedChallenge === q.id;
            const isCorrect = showExplain[q.id] && choice[q.id] === q.answer;
            const isWrong = showExplain[q.id] && choice[q.id] !== q.answer && choice[q.id] !== null;
            
            return (
              <div 
                key={q.id} 
                className={`border rounded-lg p-5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] transition-all ${
                  solved 
                    ? 'border-cyan-400/30 bg-cyan-500/5' 
                    : isWrong
                    ? 'border-red-400/30 bg-red-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Challenge Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getDifficultyIcon(q.difficulty)}</span>
                      <h3 className="font-semibold text-fuchsia-300 text-lg">{q.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                      </span>
                      {solved && (
                        <CheckCircle className="text-cyan-400" size={20} />
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{q.question}</p>
                  </div>
                </div>

                {/* Code Snippet */}
                <div className="mt-3 relative group">
                  <button
                    onClick={() => setExpandedChallenge(isExpanded ? null : q.id)}
                    className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-slate-800/80 text-slate-300 hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                  <pre className={`p-4 rounded-lg bg-black/60 border border-slate-800 text-xs overflow-auto font-mono ${
                    isExpanded ? 'max-h-none' : 'max-h-48'
                  }`}>
                    <code className="text-cyan-200">{q.snippet}</code>
                  </pre>
                </div>

                {/* Options */}
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {q.options.map((opt, idx) => {
                    const isSelected = choice[q.id] === idx;
                    const isCorrectAnswer = showExplain[q.id] && idx === q.answer;
                    const isWrongAnswer = showExplain[q.id] && isSelected && idx !== q.answer;
                    
                    return (
                      <label 
                        key={idx} 
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isCorrectAnswer
                            ? 'border-green-400/50 bg-green-500/10'
                            : isWrongAnswer
                            ? 'border-red-400/50 bg-red-500/10'
                            : isSelected
                            ? 'border-cyan-400/40 bg-cyan-500/10'
                            : 'border-slate-800 bg-black/30 hover:bg-black/40'
                        } ${solved ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          disabled={solved}
                          checked={isSelected}
                          onChange={() => setChoice((c) => ({ ...c, [q.id]: idx }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <span className={`text-sm ${isCorrectAnswer ? 'text-green-300 font-medium' : isWrongAnswer ? 'text-red-300' : 'text-slate-200'}`}>
                            {opt}
                          </span>
                          {isCorrectAnswer && showExplain[q.id] && (
                            <CheckCircle className="inline ml-2 text-green-400" size={16} />
                          )}
                          {isWrongAnswer && (
                            <XCircle className="inline ml-2 text-red-400" size={16} />
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Action Button */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    disabled={solved || choice[q.id] == null}
                    onClick={() => submit(q.id, q.answer)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      solved
                        ? 'bg-green-500/20 text-green-300 border-green-400/30'
                        : choice[q.id] == null
                        ? 'bg-slate-700/50 text-slate-400 border-slate-600 cursor-not-allowed'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/30'
                    }`}
                  >
                    {solved ? '✓ Solved' : 'Check Answer'}
                  </button>
                  
                  {showExplain[q.id] && (
                    <span className={`text-sm font-medium ${
                      isCorrect ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </span>
                  )}
                </div>

                {/* Explanation */}
                {showExplain[q.id] && (
                  <div className={`mt-4 p-4 rounded-lg border ${
                    isCorrect 
                      ? 'bg-green-500/10 border-green-400/30' 
                      : 'bg-blue-500/10 border-blue-400/30'
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`mt-0.5 ${isCorrect ? 'text-green-400' : 'text-blue-400'}`} size={18} />
                      <div>
                        <p className={`text-sm font-medium mb-1 ${
                          isCorrect ? 'text-green-300' : 'text-blue-300'
                        }`}>
                          {isCorrect ? 'Correct Answer!' : 'Explanation'}
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
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
          <CheckCircle className="text-cyan-400 mx-auto mb-2" size={32} />
          <h3 className="text-xl font-bold text-cyan-300 mb-2">Congratulations!</h3>
          <p className="text-slate-300">
            You've completed all secure coding challenges! You're now equipped with knowledge to write secure code.
          </p>
        </div>
      )}
    </div>
  );
}
