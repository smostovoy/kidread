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
  const [touchDragData, setTouchDragData] = useState<{letter: string, index: number} | null>(null);
  const [dragPreview, setDragPreview] = useState<{x: number, y: number, letter: string} | null>(null);
  
  const wordArray = wordWithExtraLetter.split('');
  const emoji = PICTURE_EMOJIS[word.image] || '❓';

  const handleLetterClick = (letterIndex: number) => {
    if (disabled) return;
    
    const letter = wordArray[letterIndex];
    playLetterSound(letter);
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

  // Touch handlers for mobile (iOS compatible)
  const handleTouchStart = (e: React.TouchEvent, letterIndex: number) => {
    if (disabled) return;
    const letter = wordArray[letterIndex];
    const touch = e.touches[0];
    setTouchDragData({ letter, index: letterIndex });
    setDragPreview({ x: touch.clientX, y: touch.clientY, letter });
    e.stopPropagation();
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragData) return;
    const touch = e.touches[0];
    setDragPreview({ x: touch.clientX, y: touch.clientY, letter: touchDragData.letter });
    e.stopPropagation();
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent, isTrashZone = false) => {
    if (!touchDragData) return;
    
    const touch = e.changedTouches?.[0] || e.touches?.[0];
    
    if (isTrashZone && touch) {
      const isCorrect = touchDragData.index === extraLetterIndex;
      onLetterRemove(touchDragData.index, isCorrect);
    } else if (touch && !isTrashZone) {
      // Try to find trash zone under touch point for iOS
      const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
      const trashZone = elementUnderTouch?.closest('[data-trash-zone]');
      
      if (trashZone) {
        const isCorrect = touchDragData.index === extraLetterIndex;
        onLetterRemove(touchDragData.index, isCorrect);
      }
    }
    
    setTouchDragData(null);
    setDragPreview(null);
    e.stopPropagation();
    e.preventDefault();
  };

  const handleSpeakerClick = () => {
    if (disabled) return;
    
    // Use Web Speech API to pronounce the word
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Picture and Speaker */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-8xl mb-4"
        >
          {emoji}
        </motion.div>
        <motion.div 
          className="text-4xl mb-2 cursor-pointer hover:scale-110 transition-transform"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpeakerClick}
        >
          🔊
        </motion.div>
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
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => handleTouchEnd(e)}
            className={`
              w-16 h-16 flex items-center justify-center text-3xl font-bold
              rounded-lg border-2 transition-all duration-200 cursor-pointer select-none draggable no-select
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
          transition-all duration-200 cursor-pointer drop-zone no-select
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
        onTouchEnd={(e) => handleTouchEnd(e, true)}
        data-trash-zone="true"
      >
        🗑️
      </motion.div>

      {/* Touch Drag Preview */}
      {dragPreview && (
        <motion.div
          className="fixed pointer-events-none z-50 w-20 h-20 bg-red-500 text-white rounded-xl flex items-center justify-center text-3xl font-bold shadow-2xl border-2 border-red-300 opacity-80"
          style={{
            left: dragPreview.x - 40,
            top: dragPreview.y - 40,
            transform: 'translate(0, -20px)', // Поднимаем немного выше пальца
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0 }}
        >
          {dragPreview.letter}
        </motion.div>
      )}
    </div>
  );
}