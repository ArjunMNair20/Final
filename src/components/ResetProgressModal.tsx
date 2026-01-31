import { useState } from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { useProgress } from '../lib/progress';

interface ResetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SectionType = 'ctf' | 'phish' | 'code' | 'quiz' | 'all';

interface Section {
  id: SectionType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

const SECTIONS: Section[] = [
  {
    id: 'ctf',
    label: 'CTF Challenges',
    icon: '🏴‍☠️',
    description: 'Reset all CTF challenge progress',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'phish',
    label: 'Phish Hunt',
    icon: '🎣',
    description: 'Reset all phishing detection progress',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'code',
    label: 'Code & Secure',
    icon: '💻',
    description: 'Reset all code security challenge progress',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'quiz',
    label: 'Cyber Quiz Lab',
    icon: '📚',
    description: 'Reset all quiz progress and statistics',
    color: 'from-purple-500 to-purple-600',
  },
];

export function ResetProgressModal({ isOpen, onClose }: ResetProgressModalProps) {
  const { resetCTF, resetPhish, resetCode, resetQuiz, reset } = useProgress();
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleReset = (section: SectionType) => {
    setSelectedSection(section);
    setIsConfirming(true);
  };

  const confirmReset = () => {
    switch (selectedSection) {
      case 'ctf':
        resetCTF();
        break;
      case 'phish':
        resetPhish();
        break;
      case 'code':
        resetCode();
        break;
      case 'quiz':
        resetQuiz();
        break;
      case 'all':
        reset();
        break;
    }
    setIsConfirming(false);
    setSelectedSection(null);
  };

  const cancelReset = () => {
    setIsConfirming(false);
    setSelectedSection(null);
  };

  if (!isOpen) return null;

  const selectedSectionData = SECTIONS.find(s => s.id === selectedSection);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="text-red-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Reset Progress</h2>
                <p className="text-sm text-slate-400">Choose which sections to reset</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {!isConfirming ? (
              <>
                {/* Individual Section Resets */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Reset Individual Sections
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SECTIONS.map(section => (
                      <button
                        key={section.id}
                        onClick={() => handleReset(section.id)}
                        className="p-4 rounded-lg border border-slate-600 hover:border-red-500/50 bg-slate-800/50 hover:bg-slate-800 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{section.icon}</span>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-200 group-hover:text-red-300 transition-colors">
                              {section.label}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">{section.description}</div>
                          </div>
                          <Trash2 size={16} className="text-slate-500 group-hover:text-red-400 transition-colors mt-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800 text-slate-400">OR</span>
                  </div>
                </div>

                {/* Reset All */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
                    Reset Everything
                  </h3>
                  <button
                    onClick={() => handleReset('all')}
                    className="w-full p-4 rounded-lg border border-red-600/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Trash2 size={18} className="text-red-400 group-hover:text-red-300" />
                      <span className="font-semibold text-red-300 group-hover:text-red-200">
                        Reset All Progress
                      </span>
                    </div>
                    <div className="text-xs text-red-400/70 mt-1">
                      This will reset all sections including badges and scores
                    </div>
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-blue-200">
                    💡 <span className="font-semibold">Tip:</span> Resetting a section will clear all progress for that
                    section. Your badges will be recalculated based on remaining progress.
                  </p>
                </div>
              </>
            ) : (
              /* Confirmation Screen */
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="text-lg font-bold text-red-200 mb-2">
                          {selectedSectionData?.label === 'CTF Challenges'
                            ? 'Reset CTF Challenges?'
                            : selectedSectionData?.label === 'Phish Hunt'
                            ? 'Reset Phish Hunt?'
                            : selectedSectionData?.label === 'Code & Secure'
                            ? 'Reset Code & Secure?'
                            : selectedSectionData?.label === 'Cyber Quiz Lab'
                            ? 'Reset Cyber Quiz Lab?'
                            : 'Reset All Progress?'}
                      </h3>
                      <p className="text-sm text-red-300 mb-3">
                        {selectedSection === 'all'
                          ? 'This will delete ALL your progress including:'
                          : `This will delete your ${selectedSectionData?.label?.toLowerCase()} progress including:`}
                      </p>
                      <ul className="space-y-2">
                        {selectedSection === 'all' ? (
                          <>
                            <li className="text-sm text-red-300">• All CTF challenges completed</li>
                            <li className="text-sm text-red-300">• All phishing detections</li>
                            <li className="text-sm text-red-300">• All code security solutions</li>
                            <li className="text-sm text-red-300">• All quiz answers and statistics</li>
                            
                            <li className="text-sm text-red-300">• All earned badges</li>
                          </>
                        ) : selectedSection === 'ctf' ? (
                          <>
                            <li className="text-sm text-red-300">• All {selectedSectionData?.label} completed</li>
                            <li className="text-sm text-red-300">• Related badges will be removed</li>
                            <li className="text-sm text-red-300">• CTF-related leaderboard entries</li>
                          </>
                        ) : selectedSection === 'quiz' ? (
                          <>
                            <li className="text-sm text-red-300">• All quiz statistics (answered/correct)</li>
                            <li className="text-sm text-red-300">• Quiz difficulty setting</li>
                            <li className="text-sm text-red-300">• Related quiz badges</li>
                          </>
                        ) : (
                          <>
                            <li className="text-sm text-red-300">• All {selectedSectionData?.label} progress</li>
                            <li className="text-sm text-red-300">• Related badges</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Confirmation Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={cancelReset}
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-600 hover:border-slate-500 text-slate-200 hover:bg-slate-700/50 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReset}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold transition-all shadow-lg"
                  >
                    Yes, Reset {selectedSection === 'all' ? 'All' : 'This Section'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetProgressModal;
