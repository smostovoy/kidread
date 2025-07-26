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
      const utterance = new SpeechSynthesisUtterance('Отлично! Молодец!');
      utterance.lang = 'ru-RU';
      utterance.rate = 0.8;
      utterance.pitch = 1.3;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis not available:', error);
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
