/**
 * Sound Service - Generates and plays sound effects using Web Audio API
 * No external audio files needed - all sounds synthesized in-browser
 */

export class SoundService {
  private audioContext: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Play badge unlock sound - ascending cheerful tones
   */
  playBadgeUnlock(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      
      // Create oscillator and gain for main melody
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Ascending notes for celebration
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setTargetAtTime(659.25, now + 0.1, 0.05); // E5
      osc.frequency.setTargetAtTime(783.99, now + 0.2, 0.05); // G5
      
      // Volume envelope
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.setTargetAtTime(0.5, now + 0.15, 0.05);
      gain.gain.setTargetAtTime(0, now + 0.5, 0.1);
      
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (error) {
      console.error('Failed to play badge unlock sound:', error);
    }
  }

  /**
   * Play badge earned sound - ding effect
   */
  playBadgeEarned(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      
      // Create multiple oscillators for rich ding sound
      const notes = [
        { freq: 800, duration: 0.3 },
        { freq: 1000, duration: 0.25 },
        { freq: 1200, duration: 0.2 },
      ];
      
      notes.forEach((note, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const startTime = now + idx * 0.05;
        
        osc.frequency.setValueAtTime(note.freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.setTargetAtTime(0, startTime + note.duration * 0.7, 0.1);
        
        osc.start(startTime);
        osc.stop(startTime + note.duration);
      });
    } catch (error) {
      console.error('Failed to play badge earned sound:', error);
    }
  }

  /**
   * Play achievement complete sound - triumphant fanfare
   */
  playAchievementComplete(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      
      // Create fanfare sound
      const frequencies = [262, 330, 392, 494, 523]; // C, E, G, B, C (higher)
      
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const startTime = now + idx * 0.08;
        
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.setTargetAtTime(0, startTime + 0.3, 0.15);
        
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (error) {
      console.error('Failed to play achievement sound:', error);
    }
  }

  /**
   * Play success beep
   */
  playSuccess(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.setTargetAtTime(0, now + 0.2, 0.08);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (error) {
      console.error('Failed to play success sound:', error);
    }
  }

  /**
   * Mute/Unmute audio context
   */
  suspend(): void {
    if (this.audioContext?.state === 'running') {
      this.audioContext.suspend();
    }
  }

  resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Export singleton instance
export const soundService = new SoundService();
