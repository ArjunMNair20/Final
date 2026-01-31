import { useState } from 'react';
import { AlertCircle, Shield, Radar, Zap, CheckCircle } from 'lucide-react';

interface ThreatDetection {
  threat: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  indicators: string[];
}

interface MitigationStrategy {
  step: number;
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  details: string;
}

interface AnalysisResult {
  detected_symptoms: string[];
  threats: ThreatDetection[];
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_percentage: number;
  explanation: string;
  mitigation_strategies: MitigationStrategy[];
  timestamp: string;
}

export default function ThreatRadar() {
  const [userInput, setUserInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!userInput.trim()) {
      setError('Please describe your system issues');
      return;
    }

    setError('');
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/threat-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: userInput })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze threats');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'critical':
        return 'from-red-900 to-red-700';
      case 'high':
        return 'from-orange-700 to-red-600';
      case 'medium':
        return 'from-yellow-600 to-orange-500';
      case 'low':
        return 'from-green-600 to-emerald-500';
      default:
        return 'from-blue-600 to-cyan-500';
    }
  };

  const getRiskBgColor = (level: string): string => {
    switch (level) {
      case 'critical':
        return 'bg-red-900/20 border-red-700';
      case 'high':
        return 'bg-orange-900/20 border-orange-700';
      case 'medium':
        return 'bg-yellow-900/20 border-yellow-700';
      case 'low':
        return 'bg-green-900/20 border-green-700';
      default:
        return 'bg-blue-900/20 border-blue-700';
    }
  };

  const getThreatSeverityIcon = (severity: string) => {
    if (severity === 'critical') return '🔴';
    if (severity === 'high') return '🟠';
    if (severity === 'medium') return '🟡';
    return '🟢';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 animate-pulse">
              <Radar className="w-10 h-10 text-[#8B5CF6]" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-fuchsia-400">
              ThreatRadar
            </h1>
          </div>
          <p className="text-slate-300 text-lg">Real-time threat detection & intelligent analysis engine</p>
          
          {/* Smart Analysis Mode Info */}
          <div className="mt-4 p-4 bg-amber-900/30 border border-amber-600 rounded-lg">
            <p className="text-sm text-amber-200 flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Smart Analysis Mode:</strong> ThreatRadar uses advanced pattern recognition to detect threats. Mitigations are prioritized by criticality. 
                For confirmed infections, consult professional cybersecurity experts.
              </span>
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 mb-8">
          <label className="block text-[#8B5CF6] font-semibold mb-3">Describe Your System Issues</label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Example: My computer is very slow, I see strange pop-ups, antivirus is disabled, high CPU usage at 95%, unknown files in downloads folder, webcam light turns on randomly..."
            className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
            disabled={isAnalyzing}
          />
          
          {error && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-purple-500/50"
          >
            <Radar className="w-5 h-5" />
            {isAnalyzing ? 'Scanning threats...' : 'Run Threat Scan'}
          </button>
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Overall Risk Score */}
            <div className={`bg-gradient-to-r ${getRiskColor(analysisResult.overall_risk_level)} rounded-lg p-8 text-white border border-opacity-30`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm opacity-75 mb-2 font-medium">THREAT SCORE</p>
                  <h2 className="text-3xl font-bold">Risk Level Assessment</h2>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold tabular-nums">{analysisResult.risk_percentage}</div>
                  <div className="text-sm opacity-75 mt-1">/100</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white border-opacity-20">
                <div className="w-3 h-3 rounded-full" style={{
                  backgroundColor: analysisResult.overall_risk_level === 'critical' ? '#ff1744' :
                                  analysisResult.overall_risk_level === 'high' ? '#ff9100' :
                                  analysisResult.overall_risk_level === 'medium' ? '#ffd600' : '#00e676'
                }}></div>
                <span className="text-lg font-bold uppercase tracking-wide capitalize">{analysisResult.overall_risk_level} RISK</span>
                <span className="ml-auto text-sm opacity-75">
                  {analysisResult.risk_percentage >= 80 ? 'CRITICAL - Immediate Action Required' :
                   analysisResult.risk_percentage >= 60 ? 'HIGH - Take Action Today' :
                   analysisResult.risk_percentage >= 40 ? 'MEDIUM - Recommended Actions' : 'LOW - Continue Monitoring'}
                </span>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">{analysisResult.explanation}</p>
            </div>

            {/* Detected Symptoms */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-[#8B5CF6] mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Detected Symptoms
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {analysisResult.detected_symptoms.map((symptom, idx) => (
                  <div key={idx} className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                    <p className="text-sm text-slate-200">{symptom}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Threat Detections - Ranked by Probability */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Predicted Threats (Ranked by Likelihood)
              </h3>
              <div className="space-y-4">
                {analysisResult.threats.map((threat, idx) => (
                  <div
                    key={idx}
                    className={`border-l-4 ${getRiskBgColor(threat.severity)} p-4 rounded-lg transition-all hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getThreatSeverityIcon(threat.severity)}</span>
                        <div>
                          <h4 className="font-bold text-white text-lg">{threat.threat}</h4>
                          <p className="text-sm text-slate-400 capitalize">{threat.severity} Severity</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#8B5CF6]">{threat.probability}%</div>
                        <p className="text-xs text-slate-400">Probability</p>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm mb-3">{threat.description}</p>

                    {threat.indicators.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <p className="text-xs font-semibold text-slate-400 mb-2">Potential Indicators:</p>
                        <div className="flex flex-wrap gap-2">
                          {threat.indicators.map((indicator, i) => (
                            <span key={i} className="text-xs bg-slate-900/50 text-slate-300 px-2 py-1 rounded">
                              • {indicator}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mitigation Strategies */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recommended Mitigation Strategies
              </h3>
              <div className="space-y-4">
                {analysisResult.mitigation_strategies.map((strategy) => (
                  <div key={strategy.step} className="border-l-4 border-green-600 bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-green-300 text-lg">
                          Step {strategy.step}: {strategy.action}
                        </h4>
                        <p className="text-xs text-green-200 capitalize">Priority: {strategy.priority}</p>
                      </div>
                      {strategy.priority === 'critical' && <span className="text-red-400 font-bold">⚠️ CRITICAL</span>}
                    </div>
                    <p className="text-slate-300 text-sm">{strategy.details}</p>
                  </div>
                ))}
              </div>

              {/* Additional Security Tips */}
              <div className="mt-6 p-4 bg-[#8B5CF6]/20 border border-[#8B5CF6] rounded-lg">
                <p className="text-[#c4b5fd] text-sm">
                  <strong>💡 Pro Tip:</strong> Keep your operating system and software updated, maintain regular backups, 
                  use strong unique passwords, enable multi-factor authentication, and avoid suspicious downloads.
                </p>
              </div>
            </div>

            {/* Analysis Timestamp */}
            <div className="text-center text-slate-400 text-xs">
              Analysis completed at: {new Date(analysisResult.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysisResult && !isAnalyzing && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400">Enter your system issues above to get a threat analysis</p>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
            </div>
            <p className="text-slate-300 mt-4">Analyzing your system health...</p>
          </div>
        )}
      </div>
    </div>
  );
}
