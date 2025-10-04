import { Store } from './store.js';

class AudioManager {
  constructor() {
    this.context = null;
    this.enabled = Store.getSettings().audio;
  }

  ensureContext() {
    if (!this.context) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.context = new AudioCtx();
      }
    }
    return this.context;
  }

  setEnabled(value) {
    this.enabled = value;
  }

  playTone(frequency, duration) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  play(type) {
    if (type === 'correct') {
      this.playTone(720, 0.18);
      this.playTone(880, 0.12);
    } else if (type === 'wrong') {
      this.playTone(220, 0.2);
    }
  }
}

export const audio = new AudioManager();
