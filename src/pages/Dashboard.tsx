import { Link } from 'react-router-dom';
import { useProgress, overallPercent } from '../lib/progress';

const cards = [
  { to: '/ctf', title: 'CTF Challenges', desc: 'Web, Crypto, Forensics, Reverse, Binary' },
  { to: '/phish-hunt', title: 'Phish Hunt', desc: 'Investigate emails and links' },
  { to: '/code-and-secure', title: 'Code & Secure', desc: 'Fix vulnerable code and learn secure patterns' },
  { to: '/ai-quizbot', title: 'Cyber Quiz Lab', desc: 'Timed quiz on passwords, web attacks, crypto, and more' },
];

export default function Dashboard() {
  const { state } = useProgress();
  const percent = overallPercent(state);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-wide">
          <span className="text-cyan-400">CyberSec</span> <span className="text-fuchsia-400">Arena</span>
        </h1>
        <p className="text-slate-400">Learn cybersecurity through games. Choose a mode to begin.</p>
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group border border-slate-800 rounded-lg p-4 bg-white/[0.03] hover:bg-white/[0.06] transition relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(8,247,254,0.08), rgba(246,8,247,0.08))' }} />
            <div className="relative">
              <h3 className="font-semibold text-cyan-300">{c.title}</h3>
              <p className="text-sm text-slate-400">{c.desc}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="border border-slate-800 rounded-lg p-4 bg-white/[0.03]">
        <h2 className="font-semibold text-fuchsia-300">Your Progress</h2>
        <div className="mt-2 h-2 bg-slate-800 rounded">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-1">{percent}% complete • badges: {state.badges.length} • rank: Rookie</p>
        {state.badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {state.badges.map((b) => (
              <span key={b} className="px-2 py-0.5 text-xs rounded border border-cyan-400/30 text-cyan-300 bg-cyan-500/10">{b}</span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
