import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";

interface MissingLetterGameProps {
  word: Word;
  letterOptions: string[];
  missingLetterIndex: number;
  onLetterSelect: (letter: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

const PICTURE_EMOJIS: Record<string, string> = {
  'elephant': '🐘',
  'cat': '🐱',
  'house': '🏠',
  'ball': '⚽',
  'fox': '🦊',
  'table': '📋',
  'fish': '🐟',
  'dog': '🐕',
  'flower': '🌸',
  'car': '🚗',
  'tree': '🌳',
  'sun': '☀️',
  'moon': '🌙',
  'star': '⭐',
  'cloud': '☁️',
  'bird': '🐦',
  'bread': '🍞',
  'milk': '🥛',
  'apple': '🍎',
  'book': '📖',
  'pencil': '✏️',
  'chair': '🪑',
  'window': '🪟',
  'door': '🚪',
  'lamp': '💡',
  'clock': '🕐',
  'phone': '📱',
  'tv': '📺',
  'computer': '💻',
  'airplane': '✈️',
  'train': '🚂',
  'bus': '🚌',
  'bicycle': '🚲',
  'ship': '🚢',
  'bear': '🐻',
  'rabbit': '🐰',
  'wolf': '🐺',
  'frog': '🐸',
  'butterfly': '🦋',
  'bee': '🐝'
};

export function MissingLetterGame({ word, letterOptions, missingLetterIndex, onLetterSelect, disabled }: MissingLetterGameProps) {
  const { playLetterSound } = useAudio();
  
  // Play letter sound from рос folder
  const playRussianLetterSound = (letter: string) => {
    const audio = new Audio(`/audio/letters/рос/${letter}.mp3`);
    
    audio.addEventListener('error', () => {
      console.log(`Russian audio not found for letter: ${letter}, using Web Speech API`);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.7;
        speechSynthesis.speak(utterance);
      }
    });
    
    audio.addEventListener('canplaythrough', () => {
      console.log(`Playing Russian audio for letter: ${letter}`);
    });

    audio.play().catch(() => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.7;
        speechSynthesis.speak(utterance);
      }
    });
  };
  
  const wordArray = word.word.split('');
  const correctLetter = wordArray[missingLetterIndex];
  const emoji = PICTURE_EMOJIS[word.image] || '❓';

  const handleLetterClick = (letter: string) => {
    if (disabled) return;
    
    playRussianLetterSound(letter);
    const isCorrect = letter === correctLetter;
    onLetterSelect(letter, isCorrect);
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Picture */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-8xl mb-4"
      >
        {emoji}
      </motion.div>

      {/* Word with missing letter */}
      <div className="flex gap-2 mb-8">
        {wordArray.map((letter, index) => (
          <motion.div
            key={index}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              w-16 h-16 flex items-center justify-center text-3xl font-bold
              rounded-lg border-2 transition-colors
              ${index === missingLetterIndex 
                ? 'border-dashed border-blue-400 bg-blue-50 text-transparent' 
                : 'border-gray-300 bg-white text-gray-800'
              }
            `}
          >
            {index === missingLetterIndex ? '❓' : letter}
          </motion.div>
        ))}
      </div>

      {/* Letter options */}
      <div className="grid grid-cols-2 gap-4">
        {letterOptions.map((letter, index) => (
          <motion.button
            key={letter}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => handleLetterClick(letter)}
            disabled={disabled}
            className={`
              w-20 h-20 text-4xl font-bold rounded-xl transition-all duration-200
              ${disabled 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-pink-500'
              }
              flex items-center justify-center
            `}
          >
            {letter}
          </motion.button>
        ))}
      </div>
    </div>
  );
}