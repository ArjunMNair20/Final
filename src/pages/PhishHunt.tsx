import { useState, useEffect, useMemo } from 'react';
import { useProgress } from '../lib/progress';
import { PHISH_EMAILS, PhishEmail } from '../data/phish';
import { Mail, Shield, AlertTriangle, CheckCircle, XCircle, Eye, Search, Link as LinkIcon, Clock, User, Lock, AlertCircle } from 'lucide-react';

interface AnalysisState {
  [key: string]: {
    checkedIndicators: string[];
    analyzed: boolean;
    suspiciousScore: number;
  };
}

// Fisher-Yates shuffle algorithm for randomizing array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Select a random subset of emails (always shows mix of solved and unsolved)
function getRandomizedEmails(allEmails: PhishEmail[], solvedIds: string[], count: number = 12): PhishEmail[] {
  const shuffled = shuffleArray(allEmails);
  
  // Always show a mix of solved and unsolved for variety
  const unsolved = shuffled.filter(email => !solvedIds.includes(email.id));
  const solved = shuffled.filter(email => solvedIds.includes(email.id));
  
  // Prioritize unsolved emails, but include some solved ones for variety
  const unsolvedCount = Math.min(unsolved.length, Math.ceil(count * 0.7));
  const solvedCount = Math.min(solved.length, count - unsolvedCount);
  
  const selected = [
    ...shuffleArray(unsolved).slice(0, unsolvedCount),
    ...shuffleArray(solved).slice(0, solvedCount)
  ];
  
  // Fill remaining slots with any emails if needed
  if (selected.length < count) {
    const remaining = shuffled.filter(email => !selected.find(e => e.id === email.id));
    selected.push(...shuffleArray(remaining).slice(0, count - selected.length));
  }
  
  return shuffleArray(selected).slice(0, count);
}

export default function PhishHunt() {
  const { state, markPhishSolved } = useProgress();
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({});
  const [showAnalysis, setShowAnalysis] = useState<Record<string, boolean>>({});
  
  // Randomize emails each time component mounts or when solved count changes
  const randomizedEmails = useMemo(() => {
    // Show 12-15 random emails each time
    // After 8 solved, only show unsolved problems
    const count = Math.min(PHISH_EMAILS.length, 15);
    return getRandomizedEmails(PHISH_EMAILS, state.phish.solvedIds, count);
  }, [state.phish.solvedIds.length, state.phish.solvedIds.join(',')]); // Re-randomize when solved count or IDs change

  const solvedCount = state.phish.solvedIds.length;
  const totalCount = PHISH_EMAILS.length;
  const progress = Math.round((solvedCount / totalCount) * 100);
  
  // Reset analysis and feedback when emails change
  useEffect(() => {
    setAnalysis({});
    setFeedback({});
    setSelectedEmail(null);
    setShowAnalysis({});
  }, [randomizedEmails.map(e => e.id).join(',')]);

  // Suspicious indicators to check
  const suspiciousIndicators = [
    { id: 'urgent', label: 'Extreme urgency or threats', icon: Clock },
    { id: 'domain', label: 'Suspicious or misspelled domain', icon: LinkIcon },
    { id: 'http', label: 'HTTP instead of HTTPS link', icon: Lock },
    { id: 'grammar', label: 'Poor grammar or spelling errors', icon: AlertCircle },
    { id: 'request', label: 'Requests sensitive information', icon: User },
    { id: 'sender', label: 'Sender email doesn\'t match company', icon: Mail },
  ];

  const getSuspiciousIndicators = (email: any): string[] => {
    const indicators: string[] = [];
    const domain = extractDomain(email.from);
    const body = email.body.toLowerCase();
    const subject = email.subject.toLowerCase();

    // Check for urgency
    if (subject.includes('urgent') || subject.includes('immediate') || subject.includes('critical') || 
        subject.includes('⚠️') || subject.includes('action required')) {
      indicators.push('urgent');
    }

    // Check domain
    if (domain.includes('0') || domain.includes('1') || domain.includes('-security') || 
        domain.includes('-verify') || domain.includes('-bank') || 
        !domain.match(/^[a-z0-9.-]+\.[a-z]{2,}$/i)) {
      indicators.push('domain');
    }

    // Check HTTP
    if (body.includes('http://') && !body.includes('https://')) {
      indicators.push('http');
    }

    // Check grammar (simple check)
    if (body.includes('click here') || body.includes('verify now') || 
        body.includes('update immediately')) {
      indicators.push('grammar');
    }

    // Check for sensitive info requests
    if (body.includes('password') || body.includes('credit card') || 
        body.includes('ssn') || body.includes('social security')) {
      indicators.push('request');
    }

    // Check sender mismatch
    const companyDomains: { [key: string]: string[] } = {
      'microsoft': ['microsoft.com'],
      'amazon': ['amazon.com', 'amazon.co.uk'],
      'apple': ['apple.com'],
      'paypal': ['paypal.com'],
      'netflix': ['netflix.com'],
      'google': ['google.com', 'gmail.com'],
    };
    
    for (const [company, validDomains] of Object.entries(companyDomains)) {
      if (subject.toLowerCase().includes(company) || body.includes(company)) {
        const isValid = validDomains.some(valid => domain.includes(valid));
        if (!isValid) {
          indicators.push('sender');
        }
      }
    }

    return indicators;
  };

  const toggleIndicator = (emailId: string, indicatorId: string) => {
    setAnalysis(prev => {
      const current = prev[emailId] || { checkedIndicators: [], analyzed: false, suspiciousScore: 0 };
      const checked = current.checkedIndicators.includes(indicatorId)
        ? current.checkedIndicators.filter(id => id !== indicatorId)
        : [...current.checkedIndicators, indicatorId];
      
      return {
        ...prev,
        [emailId]: {
          ...current,
          checkedIndicators: checked,
          suspiciousScore: checked.length,
        }
      };
    });
  };

  const analyzeEmail = (emailId: string, email: any) => {
    const actualIndicators = getSuspiciousIndicators(email);
    setAnalysis(prev => ({
      ...prev,
      [emailId]: {
        checkedIndicators: [],
        analyzed: true,
        suspiciousScore: 0,
      }
    }));
    setShowAnalysis(prev => ({ ...prev, [emailId]: true }));
  };

  const answer = (id: string, guessPhish: boolean, actual: boolean, hint: string, email: any) => {
    const emailAnalysis = analysis[id];
    const hasAnalyzed = emailAnalysis?.analyzed;
    const suspiciousScore = emailAnalysis?.suspiciousScore || 0;

    if (!hasAnalyzed) {
      setFeedback((f) => ({ ...f, [id]: '⚠️ Please analyze the email first by checking suspicious indicators!' }));
      return;
    }

    if (guessPhish === actual) {
      setFeedback((f) => ({ 
        ...f, 
        [id]: `✓ Correct! Well done! ${actual ? 'This was indeed a phishing attempt.' : 'This email was legitimate.'}` 
      }));
      markPhishSolved(id);
    } else {
      const analysisHint = suspiciousScore > 0 
        ? `You found ${suspiciousScore} suspicious indicator(s). ${hint}`
        : hint;
      setFeedback((f) => ({ ...f, [id]: `✗ Not quite. ${analysisHint}` }));
    }
  };

  const extractDomain = (email: string): string => {
    const match = email.match(/@([^\s>]+)/);
    return match ? match[1] : '';
  };

  const isSuspiciousDomain = (domain: string): boolean => {
    return domain.includes('0') || domain.includes('1') || domain.includes('-security') ||
           domain.includes('-verify') || domain.includes('-bank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-cyan-300 mb-2 flex items-center gap-2">
          <Shield className="text-cyan-400" size={32} />
          Phish Hunt
        </h1>
        <p className="text-slate-400 mb-4">
          Analyze emails, detect phishing attempts, and learn to spot social engineering tactics.
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

      {/* Tips Section */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/30">
        <div className="flex items-start gap-3">
          <Eye className="text-blue-400 mt-0.5" size={20} />
          <div>
            <h3 className="text-blue-300 font-semibold mb-1">What to Look For:</h3>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
              <li>Check the sender's domain for misspellings (e.g., micr0soft, amaz0n)</li>
              <li>Look for HTTP instead of HTTPS in links</li>
              <li>Watch for extreme urgency or threats</li>
              <li>Verify the domain matches the company's official website</li>
              <li>Legitimate companies rarely ask for sensitive info via email</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Email Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {randomizedEmails.map((m) => {
          const solved = state.phish.solvedIds.includes(m.id);
          const domain = extractDomain(m.from);
          const suspicious = isSuspiciousDomain(domain);
          
          return (
            <div 
              key={m.id} 
              className={`border rounded-lg p-5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] space-y-3 transition-all ${
                solved 
                  ? 'border-cyan-400/30 bg-cyan-500/5' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Email Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="text-slate-400" size={16} />
                    <div className="text-xs text-slate-400 break-all">From: {m.from}</div>
                  </div>
                  {solved && (
                    <CheckCircle className="text-cyan-400 flex-shrink-0" size={18} />
                  )}
                </div>
                
                <div className={`font-semibold ${m.isPhish ? 'text-fuchsia-300' : 'text-cyan-300'}`}>
                  {m.subject}
                </div>
              </div>

              {/* Email Body */}
              <div 
                className="text-sm text-slate-300 leading-relaxed cursor-pointer"
                onClick={() => setSelectedEmail(selectedEmail === m.id ? null : m.id)}
              >
                {selectedEmail === m.id ? (
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-xs text-slate-500">Click to collapse</p>
                    </div>
                  </div>
                ) : (
                  <p className="line-clamp-3">{m.body}</p>
                )}
              </div>

              {/* Analysis Section */}
              {!solved && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  {!analysis[m.id]?.analyzed ? (
                    <button
                      onClick={() => analyzeEmail(m.id, m)}
                      className="w-full px-4 py-2 text-sm rounded-lg bg-blue-500/10 text-blue-300 border border-blue-400/30 hover:bg-blue-500/20 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Search size={16} />
                      Analyze Email for Suspicious Indicators
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Check suspicious indicators:</span>
                        {analysis[m.id]?.suspiciousScore > 0 && (
                          <span className="text-xs font-bold text-yellow-400">
                            {analysis[m.id].suspiciousScore} indicator(s) found
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {suspiciousIndicators.map((indicator) => {
                          const Icon = indicator.icon;
                          const isChecked = analysis[m.id]?.checkedIndicators.includes(indicator.id) || false;
                          const actualIndicators = getSuspiciousIndicators(m);
                          const isActual = actualIndicators.includes(indicator.id);
                          
                          return (
                            <button
                              key={indicator.id}
                              onClick={() => toggleIndicator(m.id, indicator.id)}
                              className={`p-2 rounded-lg border text-xs text-left transition-all ${
                                isChecked
                                  ? isActual
                                    ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300'
                                    : 'bg-red-500/10 border-red-400/30 text-red-300'
                                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <div className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${
                                  isChecked ? 'bg-cyan-400 border-cyan-400' : 'border-slate-600'
                                }`}>
                                  {isChecked && <CheckCircle size={10} className="text-slate-900" />}
                                </div>
                                <Icon size={12} />
                                <span className="truncate">{indicator.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2 space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => answer(m.id, true, m.isPhish, m.hint, m)}
                            className={`flex-1 px-4 py-2.5 text-sm rounded-lg border transition-all font-semibold ${
                              analysis[m.id]?.suspiciousScore >= 2
                                ? 'bg-red-500/20 text-red-300 border-red-400/50 hover:bg-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                : 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/30 hover:bg-fuchsia-500/20'
                            }`}
                          >
                            🚨 This is PHISHING
                          </button>
                          <button
                            onClick={() => answer(m.id, false, m.isPhish, m.hint, m)}
                            className={`flex-1 px-4 py-2.5 text-sm rounded-lg border transition-all font-semibold ${
                              analysis[m.id]?.suspiciousScore === 0
                                ? 'bg-green-500/20 text-green-300 border-green-400/50 hover:bg-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                : 'bg-cyan-500/10 text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/20'
                            }`}
                          >
                            ✅ This is LEGITIMATE
                          </button>
                        </div>
                        
                        {analysis[m.id]?.suspiciousScore > 0 && analysis[m.id]?.suspiciousScore < 2 && (
                          <p className="text-xs text-yellow-400 text-center">
                            ⚠️ You found {analysis[m.id].suspiciousScore} suspicious indicator(s). Review carefully before deciding.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback */}
              {feedback[m.id] && (
                <div className={`text-sm p-3 rounded-lg ${
                  feedback[m.id].startsWith('✓')
                    ? 'bg-green-500/10 border border-green-400/30 text-green-300'
                    : 'bg-red-500/10 border border-red-400/30 text-red-300'
                }`}>
                  {feedback[m.id]}
                </div>
              )}

              {/* Solved Badge */}
              {solved && (
                <div className="flex items-center gap-2 text-xs text-cyan-300 pt-2 border-t border-slate-800">
                  <CheckCircle size={14} />
                  <span>Solved! {m.isPhish ? 'This was a phishing attempt.' : 'This email was legitimate.'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {solvedCount === totalCount && (
        <div className="p-6 rounded-lg bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-400/30 text-center">
          <CheckCircle className="text-cyan-400 mx-auto mb-2" size={32} />
          <h3 className="text-xl font-bold text-cyan-300 mb-2">Congratulations!</h3>
          <p className="text-slate-300">
            You've completed all phishing detection challenges. You're now better equipped to spot phishing attempts in real emails!
          </p>
        </div>
      )}
    </div>
  );
}
