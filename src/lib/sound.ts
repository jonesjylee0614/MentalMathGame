import { useEffect, useMemo } from 'react';

const createOscillator = (context: AudioContext, frequency: number, duration = 0.25) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = 'triangle';
  oscillator.connect(gain);
  gain.connect(context.destination);
  const now = context.currentTime;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.start(now);
  oscillator.stop(now + duration);
};

export const useFeedbackSound = (enabled: boolean) => {
  const context = useMemo(() => {
    if (typeof window === 'undefined' || !enabled) return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    return AudioCtx ? new AudioCtx() : null;
  }, [enabled]);

  useEffect(() => {
    return () => {
      context?.close().catch(() => undefined);
    };
  }, [context]);

  const play = (type: 'success' | 'error') => {
    if (!enabled || !context) return;
    if (context.state === 'suspended') {
      context.resume().catch(() => undefined);
    }
    const base = type === 'success' ? 880 : 220;
    createOscillator(context, base, 0.18);
    if (type === 'success') {
      setTimeout(() => createOscillator(context, base * 1.5, 0.15), 120);
    } else {
      setTimeout(() => createOscillator(context, base * 0.75, 0.2), 80);
    }
  };

  return play;
};
