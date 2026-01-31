import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { soundService } from '../services/SoundService';
import { BadgeService } from '../services/BadgeService';

interface AchievementNotificationProps {
  badge: string;
  onClose: () => void;
}

export function AchievementNotification({ badge, onClose }: AchievementNotificationProps) {
  const [isExiting, setIsExiting] = useState(false);
  const badgeService = new BadgeService();
  const badgeDetails = badgeService.getBadgeById(badge);

  useEffect(() => {
    // Play sound effect when badge appears
    soundService.playBadgeEarned();
    
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 500);
  };

  return (
    <div
      className={`fixed top-8 right-8 z-50 transform transition-all duration-500 ${
        isExiting ? 'translate-x-96 opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.05}s`,
              '--angle': `${Math.random() * 360}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Main notification card */}
      <div
        className="relative bg-gradient-to-br from-yellow-400/20 via-amber-400/20 to-orange-400/20 
                   border-2 border-yellow-400/50 rounded-xl p-6 shadow-2xl
                   backdrop-blur-sm max-w-sm
                   animate-bounce-in"
      >
        {/* Background glow effect */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 
                     blur-xl animate-pulse -z-10"
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-amber-400/60 hover:text-amber-400 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="text-center space-y-3">
          {/* Trophy icon with rotation */}
          <div className="flex justify-center">
            <div className="animate-bounce-trophy text-5xl">
              {badgeDetails?.emoji || '🏆'}
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-xs font-semibold text-amber-300/70 uppercase tracking-widest">
              Achievement Unlocked
            </p>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
                          from-yellow-300 to-amber-300 mt-1">
              {badgeDetails?.name || badge}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-amber-100/80">
            {badgeDetails?.description || 'Great job! You\'ve earned a new badge!'}
          </p>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-1 pt-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-yellow-400"
                style={{
                  animation: `pulse 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0) translate(-50px, -50px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce-trophy {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(-5deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
          75% {
            transform: translateY(-10px) rotate(-3deg);
          }
        }

        @keyframes confetti {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(100px * cos(var(--angle))),
              calc(100px * sin(var(--angle)))
            ) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-bounce-trophy {
          animation: bounce-trophy 0.8s ease-in-out infinite;
        }

        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

/**
 * Achievement Queue - Manages multiple achievement notifications
 */
interface AchievementQueueProps {
  achievements: string[];
  onAchievementClose: (badge: string) => void;
}

export function AchievementQueue({ achievements, onAchievementClose }: AchievementQueueProps) {
  return (
    <div className="fixed top-8 right-8 z-50 space-y-4 pointer-events-auto">
      {achievements.map((badge, idx) => (
        <div key={`${badge}-${idx}`}>
          <AchievementNotification
            badge={badge}
            onClose={() => onAchievementClose(badge)}
          />
        </div>
      ))}
    </div>
  );
}
