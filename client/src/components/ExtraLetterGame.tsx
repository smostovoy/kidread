import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";

interface ExtraLetterGameProps {
  word: Word;
  wordWithExtraLetter: string;
  extraLetterIndex: number;
  onLetterRemove: (letterIndex: number, isCorrect: boolean) => void;
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

export function ExtraLetterGame({ word, wordWithExtraLetter, extraLetterIndex, onLetterRemove, disabled }: ExtraLetterGameProps) {
  const { playLetterSound } = useAudio();
  
  const wordArray = wordWithExtraLetter.split('');
  const emoji = PICTURE_EMOJIS[word.image] || '❓';

  const handleLetterClick = (letterIndex: number) => {
    if (disabled) return;
    
    const letter = wordArray[letterIndex];
    playLetterSound(letter);
    const isCorrect = letterIndex === extraLetterIndex;
    onLetterRemove(letterIndex, isCorrect);
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

      {/* Instructions */}
      <div className="text-center mb-4">
        <p className="text-2xl font-bold text-gray-700 mb-2">
          Нажми на лишнюю букву в слове:
        </p>
        <p className="text-lg text-gray-500">
          Одна буква здесь лишняя!
        </p>
      </div>

      {/* Word with extra letter - clickable */}
      <div className="flex gap-2 mb-8">
        {wordArray.map((letter, index) => (
          <motion.button
            key={index}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => handleLetterClick(index)}
            disabled={disabled}
            className={`
              w-16 h-16 flex items-center justify-center text-3xl font-bold
              rounded-lg border-2 transition-all duration-200
              ${disabled 
                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300 bg-white text-gray-800 hover:border-red-400 hover:bg-red-50 hover:text-red-600 cursor-pointer'
              }
            `}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {/* Helper hint */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="text-4xl mb-2">👆</div>
        <p className="text-lg text-gray-600">
          Нажми на букву, которая не нужна
        </p>
      </motion.div>
    </div>
  );
}