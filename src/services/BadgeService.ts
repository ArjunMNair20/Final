import { ProgressState } from '../types/progress';

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: (state: ProgressState) => boolean;
}

export interface BadgeRule {
  id: string;
  condition: (state: ProgressState) => boolean;
}

export class BadgeService {
  private badges: Badge[] = [
    // Milestone badges - single completion
    {
      id: 'First Blood',
      name: 'First Blood',
      emoji: '🩸',
      description: 'Completed your first CTF challenge',
      condition: (state) => state.ctf.solvedIds.length >= 1,
    },
    // CTF Challenges - milestone badges every 10
    {
      id: 'CTF Crusader',
      name: 'CTF Crusader',
      emoji: '⚔️',
      description: 'Completed 10 CTF challenges',
      condition: (state) => state.ctf.solvedIds.length >= 10,
    },
    {
      id: 'CTF Conquerer',
      name: 'CTF Conquerer',
      emoji: '👑',
      description: 'Completed 25 CTF challenges',
      condition: (state) => state.ctf.solvedIds.length >= 25,
    },
    // Phish Hunt - milestone badges
    {
      id: 'Phish Whisperer',
      name: 'Phish Whisperer',
      emoji: '🐟',
      description: 'Identified 3 phishing attempts',
      condition: (state) => state.phish.solvedIds.length >= 3,
    },
    {
      id: 'Phish Hunter',
      name: 'Phish Hunter',
      emoji: '🎣',
      description: 'Identified 10 phishing attempts',
      condition: (state) => state.phish.solvedIds.length >= 10,
    },
    // Code & Secure - milestone badges
    {
      id: 'Secure Coder',
      name: 'Secure Coder',
      emoji: '🔒',
      description: 'Completed 3 code security challenges',
      condition: (state) => state.code.solvedIds.length >= 3,
    },
    {
      id: 'Code Master',
      name: 'Code Master',
      emoji: '💻',
      description: 'Completed 10 code security challenges',
      condition: (state) => state.code.solvedIds.length >= 10,
    },
    // Quiz - milestone badges
    {
      id: 'Quiz Novice',
      name: 'Quiz Novice',
      emoji: '📚',
      description: 'Answered 5 quiz questions correctly',
      condition: (state) => state.quiz.correct >= 5,
    },
    {
      id: 'Quiz Expert',
      name: 'Quiz Expert',
      emoji: '🧠',
      description: 'Answered 10 quiz questions correctly',
      condition: (state) => state.quiz.correct >= 10,
    },
    {
      id: 'Quiz Champion',
      name: 'Quiz Champion',
      emoji: '🏆',
      description: 'Answered 25 quiz questions correctly',
      condition: (state) => state.quiz.correct >= 25,
    },
    // Firewall Defender
    {
      id: 'Network Guardian',
      name: 'Network Guardian',
      emoji: '🛡️',
      description: 'Achieved a score of 20 in Firewall Defender',
      condition: (state) => state.firewall.bestScore >= 20,
    },
    {
      id: 'Firewall Master',
      name: 'Firewall Master',
      emoji: '⚡',
      description: 'Achieved a score of 50 in Firewall Defender',
      condition: (state) => state.firewall.bestScore >= 50,
    },
    // Overall badges
    {
      id: 'Cybersecurity Enthusiast',
      name: 'Cybersecurity Enthusiast',
      emoji: '🌟',
      description: 'Completed challenges across multiple categories',
      condition: (state) => 
        state.ctf.solvedIds.length >= 5 &&
        state.phish.solvedIds.length >= 3 &&
        state.code.solvedIds.length >= 3,
    },
    {
      id: 'Security Expert',
      name: 'Security Expert',
      emoji: '🎖️',
      description: 'Mastered all challenge categories',
      condition: (state) =>
        state.ctf.solvedIds.length >= 10 &&
        state.phish.solvedIds.length >= 10 &&
        state.code.solvedIds.length >= 10 &&
        state.quiz.correct >= 10,
    },
  ];

  // Keep backward compatibility with rules
  private get rules(): BadgeRule[] {
    return this.badges.map(badge => ({
      id: badge.id,
      condition: badge.condition,
    }));
  }

  computeBadges(state: ProgressState, existingBadges: string[] = []): string[] {
    const badges = new Set<string>(existingBadges);

    for (const badge of this.badges) {
      if (badge.condition(state)) {
        badges.add(badge.id);
      }
    }

    return Array.from(badges);
  }

  getAllBadges(): Badge[] {
    return [...this.badges];
  }

  getBadgeById(id: string): Badge | undefined {
    return this.badges.find(badge => badge.id === id);
  }

  addCustomRule(rule: BadgeRule): void {
    // For backward compatibility, convert to Badge with placeholder values
    const badge: Badge = {
      id: rule.id,
      name: rule.id,
      emoji: '⭐',
      description: 'Custom badge',
      condition: rule.condition,
    };
    this.badges.push(badge);
  }

  getRules(): BadgeRule[] {
    return [...this.rules];
  }
}
