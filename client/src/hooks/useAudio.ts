import { useCallback, useRef } from 'react';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playCustomAudio = useCallback((audioFile: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioFile);
      audio.volume = 0.7;
      audioRef.current = audio;
      audio.play().catch(error => {
        console.warn('Failed to play custom audio:', error);
      });
    } catch (error) {
      console.warn('Custom audio not available:', error);
    }
  }, []);

  const playLetterSound = useCallback((letter: string) => {
    // Try to play custom audio first, fallback to Web Speech API
    const customAudioPath = `/audio/letters/${letter.toLowerCase()}.mp3`;
    
    // Check if custom audio exists
    fetch(customAudioPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          playCustomAudio(customAudioPath);
        } else {
          // Fallback to Web Speech API
          try {
            const utterance = new SpeechSynthesisUtterance(letter);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.7;
            utterance.pitch = 1.2;
            speechSynthesis.speak(utterance);
          } catch (error) {
            console.warn('Speech synthesis not available:', error);
          }
        }
      })
      .catch(() => {
        // Fallback to Web Speech API
        try {
          const utterance = new SpeechSynthesisUtterance(letter);
          utterance.lang = 'ru-RU';
          utterance.rate = 0.7;
          utterance.pitch = 1.2;
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.warn('Speech synthesis not available:', error);
        }
      });
  }, [playCustomAudio]);

  const playApplause = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a pleasant success sound - ascending musical notes
      const duration = 0.8;
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate a pleasant "ding" sound with three ascending notes
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // Three pleasant tones: C5, E5, G5 (major chord)
        if (time < 0.3) {
          sample += Math.sin(2 * Math.PI * 523.25 * time) * Math.exp(-time * 3) * 0.3; // C5
        }
        if (time >= 0.2 && time < 0.5) {
          sample += Math.sin(2 * Math.PI * 659.25 * (time - 0.2)) * Math.exp(-(time - 0.2) * 3) * 0.3; // E5
        }
        if (time >= 0.4 && time < 0.8) {
          sample += Math.sin(2 * Math.PI * 783.99 * (time - 0.4)) * Math.exp(-(time - 0.4) * 3) * 0.3; // G5
        }
        
        data[i] = sample;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Web Audio API not available:', error);
    }
  }, []);

  const playTryAgain = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a gentle "try again" sound - descending notes
      const duration = 0.6;
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate a gentle descending sound
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // Two descending tones: G4 to E4 (gentle disappointment)
        if (time < 0.3) {
          sample += Math.sin(2 * Math.PI * 392 * time) * Math.exp(-time * 4) * 0.2; // G4
        }
        if (time >= 0.2 && time < 0.6) {
          sample += Math.sin(2 * Math.PI * 329.63 * (time - 0.2)) * Math.exp(-(time - 0.2) * 4) * 0.2; // E4
        }
        
        data[i] = sample;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Web Audio API not available:', error);
    }
  }, []);

  return {
    playLetterSound,
    playApplause,
    playTryAgain
  };
}
