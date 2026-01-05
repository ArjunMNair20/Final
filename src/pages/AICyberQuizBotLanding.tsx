import { Difficulty } from '../lib/progress';
import { useNavigate } from 'react-router-dom';

const difficultyCards: { value: Difficulty; label: string; tagline: string; highlight: string }[] = [
  {
    value: 'easy',
    label: 'Beginner',
    tagline: 'Passwords, phishing basics, safe browsing, everyday cyber hygiene.',
    highlight: 'from-emerald-500/10 border-emerald-400/30 text-emerald-300',
  },
  {
    value: 'medium',
    label: 'Intermediate',
    tagline: 'Web attacks, auth & sessions, logging, network defenses, incident basics.',
    highlight: 'from-cyan-500/10 border-cyan-400/30 text-cyan-300',
  },
  {
    value: 'hard',
    label: 'Expert',
    tagline: 'Crypto, zero trust, supply chain, tokens, side-channels, advanced defenses.',
    highlight: 'from-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-300',
  },
];

export default function AICyberQuizBotLanding() {
  const navigate = useNavigate();

  const goToLevel = (difficulty: Difficulty) => {
    navigate(`/ai-quizbot/${difficulty}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-cyan-300">Cyber Quiz Lab</h1>
      <p className="text-slate-400">
        Choose your level and tackle a 25-question cybersecurity quiz covering real-world security topics.
      </p>

      <div className="space-y-2">
        <h2 className="text-sm uppercase tracking-wide text-slate-500">Select Your Level</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {difficultyCards.map((option) => (
            <button
              key={option.value}
              onClick={() => goToLevel(option.value)}
              className={`text-left rounded-lg border bg-gradient-to-br p-4 transition hover:scale-[1.02] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(8,247,254,0.25)] ${option.highlight}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{option.label}</div>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {option.value === 'easy' ? 'Warm-up' : option.value === 'medium' ? 'Challenge' : 'Expert Mode'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{option.tagline}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


