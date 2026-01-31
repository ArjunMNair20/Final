import { useMemo, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

function tipsForPath(pathname: string) {
  if (pathname.startsWith('/ctf')) return [
    'Start with easy tasks to build momentum.',
    'Read the prompt carefully; look for format hints like CSA{...}.',
    'Try common techniques first: view-source, wordlists, strings/hex.',
  ];
  if (pathname.startsWith('/phish')) return [
    'Check sender domain carefully for lookalikes.',
    'Hover links to inspect target domains and protocols.',
    'Beware of urgency and requests for credentials.',
  ];
  if (pathname.startsWith('/code-and-secure')) return [
    'Prefer parameterized queries over string concatenation.',
    'Sanitize untrusted HTML and avoid dangerouslySetInnerHTML.',
    'Hash passwords with salt and strong KDFs like Argon2 or bcrypt.',
  ];
  if (pathname.startsWith('/firewall-defender')) return [
    'Prioritize high-impact threats first.',
    'Defense-in-depth: layer controls for resilience.',
  ];
  if (pathname.startsWith('/ai-quizbot')) return [
    'If unsure, eliminate clearly wrong options first.',
    'Security basics: least privilege, defense in depth, input validation.',
  ];
  return [
    'Welcome to CyberSec Arena! Pick a mode and start learning.',
    'Track your progress on the Dashboard and view the Leaderboard.',
  ];
}

export default function AICoach({ onClose }: { onClose: () => void }) {
  const { pathname } = useLocation();
  const tips = useMemo(() => tipsForPath(pathname), [pathname]);
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg border border-[#FF6F61]/30 rounded-lg bg-[#0b0f1a] p-4 shadow-[0_0_30px_rgba(255,111,97,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#06b6d4] font-semibold">
            <Sparkles size={18} /> AI Coach
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {tips.map((t) => (
            <div key={t} className="text-sm text-slate-300">• {t}</div>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-xs text-slate-400 mb-1">Your notes</label>
          <textarea
            className="w-full h-20 p-2 rounded bg-black/40 border border-slate-800 text-sm"
            placeholder="Write observations or hypotheses here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="mt-3 text-xs text-slate-500">No external AI service used. Tips are built-in.</div>
      </div>
    </div>
  );
}
