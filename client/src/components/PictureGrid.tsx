import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";

interface PictureGridProps {
  correctWord: Word;
  distractors: Word[];
  onPictureSelect: (word: Word, isCorrect: boolean) => void;
  disabled?: boolean;
}

const PICTURE_EMOJIS: Record<string, string> = {
  'elephant': '🐘',
  'cat': '🐱',
  'house': '🏠',
  'ball': '⚽',
  'fox': '🦊',
  'table': '🪑',
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

export function PictureGrid({ correctWord, distractors, onPictureSelect, disabled }: PictureGridProps) {
  const { playTryAgain } = useAudio();
  
  // Combine correct word with distractors and shuffle
  const allOptions = [correctWord, ...distractors].sort(() => Math.random() - 0.5);

  const handlePictureClick = (word: Word) => {
    if (disabled) return;
    
    const isCorrect = word.id === correctWord.id;
    if (!isCorrect) {
      playTryAgain();
    }
    onPictureSelect(word, isCorrect);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      {allOptions.map((word, index) => {
        const isCorrect = word.id === correctWord.id;
        
        return (
          <motion.div
            key={word.id}
            onClick={() => handlePictureClick(word)}
            className={`picture-option bg-white rounded-3xl p-6 shadow-xl cursor-pointer border-4 border-transparent hover:border-secondary ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="w-full h-32 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
              <span className="text-6xl">
                {PICTURE_EMOJIS[word.image] || '❓'}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
