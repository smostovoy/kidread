import { motion } from "framer-motion";
import { useState } from "react";
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
  const [draggedLetter, setDraggedLetter] = useState<{letter: string, index: number} | null>(null);
  
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
  
  const wordArray = wordWithExtraLetter.split('');
  const emoji = PICTURE_EMOJIS[word.image] || '❓';

  const handleLetterClick = (letterIndex: number) => {
    if (disabled) return;
    
    const letter = wordArray[letterIndex];
    playRussianLetterSound(letter);
  };

  const handleDragStart = (letterIndex: number) => {
    if (disabled) return;
    const letter = wordArray[letterIndex];
    setDraggedLetter({ letter, index: letterIndex });
  };

  const handleDragEnd = () => {
    setDraggedLetter(null);
  };

  const handleDropOnTrash = () => {
    if (!draggedLetter || disabled) return;
    
    const isCorrect = draggedLetter.index === extraLetterIndex;
    onLetterRemove(draggedLetter.index, isCorrect);
    setDraggedLetter(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
          Перетащи лишнюю букву в корзину:
        </p>
        <p className="text-lg text-gray-500">
          Одна буква здесь лишняя!
        </p>
      </div>

      {/* Word with extra letter - draggable */}
      <div className="flex gap-2 mb-8">
        {wordArray.map((letter, index) => (
          <motion.div
            key={index}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => handleLetterClick(index)}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            className={`
              w-16 h-16 flex items-center justify-center text-3xl font-bold
              rounded-lg border-2 transition-all duration-200 cursor-pointer select-none
              ${disabled 
                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300 bg-white text-gray-800 hover:border-red-400 hover:bg-red-50 hover:text-red-600'
              }
            `}
          >
            {letter}
          </motion.div>
        ))}
      </div>

      {/* Trash can */}
      <motion.div
        className={`
          w-32 h-32 flex items-center justify-center text-6xl rounded-2xl border-4 border-dashed
          transition-all duration-200 cursor-pointer
          ${draggedLetter 
            ? 'border-red-400 bg-red-50 scale-110' 
            : 'border-gray-400 bg-gray-50'
          }
        `}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: draggedLetter ? 1.1 : 1 }}
        transition={{ delay: 1 }}
        onDrop={handleDropOnTrash}
        onDragOver={handleDragOver}
      >
        🗑️
      </motion.div>

      {/* Helper hint */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="text-4xl mb-2">👆</div>
        <p className="text-lg text-gray-600">
          Перетащи лишнюю букву в корзину
        </p>
      </motion.div>
    </div>
  );
}