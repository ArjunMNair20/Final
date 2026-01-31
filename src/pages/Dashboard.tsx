import { Link } from 'react-router-dom';
import { useProgress, overallPercent } from '../lib/progress';

const cards = [
  { to: '/ctf', title: 'CTF Challenges', desc: 'Web, Crypto, Forensics, Reverse, Binary' },
  { to: '/phish-hunt', title: 'Phish Hunt', desc: 'Investigate emails and links' },
  { to: '/code-and-secure', title: 'Code & Secure', desc: 'Fix vulnerable code and learn secure patterns' },
  { to: '/ai-quizbot', title: 'Cyber Quiz Lab', desc: 'Timed quiz on passwords, web attacks, crypto, and more' },
];

const tools = [
  { to: '/threat-radar', title: 'ThreatRadar', desc: 'Analyze & identify security threats in real-time' },
  { to: '/steganography', title: 'StegoStudio', desc: 'Hide & extract data inside images' },
];

export default function Dashboard() {
  const { state } = useProgress();
  const percent = overallPercent(state);
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-wide">
          <span className="gradient-text">CyberSec Arena</span>
        </h1>
        <p className="text-slate-400 text-lg">Master cybersecurity through interactive challenges</p>
      </div>

      {/* Progress Card */}
      <div className="modern-card p-6 border-2 border-purple-500/20">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-purple-400 text-lg">Your Progress</h2>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">{percent}%</span>
          </div>
                <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 via-fuchsia-500 to-violet-500 rounded-full progress-smooth" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-sm text-slate-400">Badges earned: <span className="text-fuchsia-300 font-semibold">{state.badges.length}</span> • Rank: <span className="text-purple-400 font-semibold">Rookie</span></p>
          {state.badges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {state.badges.map((b) => (
                <span key={b} className="px-3 py-1 text-xs rounded-full border border-purple-400/50 text-purple-400 bg-purple-500/15 font-medium">{b}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Challenges Grid */}
      <section>
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Choose Your Challenge</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {cards.map((c, idx) => (
            <Link
              key={c.to}
              to={c.to}
                  className="group modern-card p-6 hover:scale-105 transform transition-all duration-300 border-2 border-transparent hover:border-purple-500/50 overflow-hidden relative"
            >
              {/* Gradient background animation */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, rgba(167,139,250,0.08), rgba(236,72,153,0.08))` }} />
              
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, #8B5CF6, #ec4899)' }} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-400">{c.title}</h3>
                  </div>
                  <span className="text-2xl">
                    {idx === 0 ? '🚩' : idx === 1 ? '🎣' : idx === 2 ? '🔒' : '🧠'}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all interactive btn-press focus-ring" tabIndex={0} role="button" aria-label={`Start ${c.title}`}>
                  Start Challenge <span className="text-lg">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section>
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Explore Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {tools.map((tool, idx) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group modern-card p-6 hover:scale-105 transform transition-all duration-300 border-2 border-transparent hover:border-violet-500/50 overflow-hidden relative"
            >
              {/* Gradient background animation */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, rgba(139,92,246,0.1), rgba(168,85,247,0.1))` }} />
              
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-purple-400">{tool.title}</h3>
                  </div>
                  <span className="text-2xl">
                    {idx === 0 ? '🎯' : '🔐'}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{tool.desc}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-violet-300 text-sm font-medium group-hover:gap-3 transition-all">
                  Open Tool <span className="text-lg">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
