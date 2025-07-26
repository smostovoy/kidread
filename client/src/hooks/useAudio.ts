import { useCallback, useRef } from 'react';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playLetterSound = useCallback((letter: string) => {
    // For now, we'll use Web Speech API as a fallback
    // In production, you would load actual audio files
    try {
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis not available:', error);
    }
  }, []);

  const playApplause = useCallback(() => {
    try {
      // Create applause sound effect using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Generate clapping sound
      const duration = 1.5;
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Create applause-like noise bursts
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        // Multiple noise bursts to simulate clapping
        const burst1 = Math.random() * 0.3 * Math.exp(-time * 8) * (Math.sin(time * 50) > 0.3 ? 1 : 0);
        const burst2 = Math.random() * 0.2 * Math.exp(-(time - 0.3) * 6) * (Math.sin((time - 0.3) * 45) > 0.4 ? 1 : 0);
        const burst3 = Math.random() * 0.15 * Math.exp(-(time - 0.6) * 4) * (Math.sin((time - 0.6) * 40) > 0.5 ? 1 : 0);
        data[i] = burst1 + burst2 + burst3;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Web Audio API not available, using fallback sound:', error);
      // Fallback: create a simple beep sound
      try {
        const oscillator = new (window.AudioContext || (window as any).webkitAudioContext)().createOscillator();
        const gainNode = new (window.AudioContext || (window as any).webkitAudioContext)().createGain();
        oscillator.connect(gainNode);
        gainNode.connect(new (window.AudioContext || (window as any).webkitAudioContext)().destination);
        oscillator.frequency.setValueAtTime(800, 0);
        gainNode.gain.setValueAtTime(0.3, 0);
        gainNode.gain.exponentialRampToValueAtTime(0.01, 0.5);
        oscillator.start();
        oscillator.stop(0.5);
      } catch (fallbackError) {
        console.warn('Audio not available:', fallbackError);
      }
    }
  }, []);

  const playTryAgain = useCallback(() => {
    try {
      const utterance = new SpeechSynthesisUtterance('Попробуй ещё раз');
      utterance.lang = 'ru-RU';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis not available:', error);
    }
  }, []);

  return {
    playLetterSound,
    playApplause,
    playTryAgain
  };
}
