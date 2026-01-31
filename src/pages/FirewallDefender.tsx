import { useState } from 'react';
import { useProgress, useSyncProgressToLeaderboard } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';

export default function FirewallDefender() {
  const { state, setFirewallBest } = useProgress();
  const syncToLeaderboard = useSyncProgressToLeaderboard();
  const { user } = useAuth();
  const [sessionScore, setSessionScore] = useState(0);
  const [threats, setThreats] = useState<number>(5);

  const block = () => {
    if (threats <= 0) return;
    setThreats((t) => t - 1);
    setSessionScore((s) => s + 1);
  };

  const endWave = () => {
    setFirewallBest(sessionScore);
    setSessionScore(0);
    setThreats(5 + Math.floor(Math.random() * 6));
    try {
      syncToLeaderboard(user || null);
    } catch (_) {}
  };

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-cyan-300">Firewall Defender</h1>
      <p className="text-slate-400">Click to block incoming threats. End the wave to record your best score.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 border border-slate-800 rounded-lg p-4 bg-white/[0.03]">
          <div className="text-sm text-slate-300">Threats remaining: <span className="text-fuchsia-300">{threats}</span></div>
          <div className="text-sm text-slate-300">Wave score: <span className="text-cyan-300">{sessionScore}</span></div>
          <div className="mt-3 flex gap-2">
            <button onClick={block} disabled={threats <= 0} className="px-3 py-1 text-sm rounded bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/30">Block Threat</button>
            <button onClick={endWave} className="px-3 py-1 text-sm rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">End Wave</button>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {Array.from({ length: threats }).map((_, i) => (
              <div key={i} className="h-8 rounded bg-fuchsia-500/20 border border-fuchsia-400/30" />
            ))}
          </div>
        </div>
        <aside className="border border-slate-800 rounded-lg p-4 bg-white/[0.03] space-y-1">
          <div className="font-semibold text-cyan-300">Stats</div>
          <div className="text-sm text-slate-300">Best: <span className="text-cyan-300">{state.firewall.bestScore}</span></div>
        </aside>
      </div>
    </div>
  );
}
