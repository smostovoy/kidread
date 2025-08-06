import { motion } from "framer-motion";
import { useState } from "react";
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
  const [draggedLetter, setDraggedLetter] = useState<string | null>(null);
  const [touchDragLetter, setTouchDragLetter] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{x: number, y: number, letter: string, offsetX: number, offsetY: number} | null>(null);
  
  const wordArray = word.word.split('');
  const correctLetter = wordArray[missingLetterIndex];
  const emoji = PICTURE_EMOJIS[word.image] || '❓';

  const handleLetterClick = (letter: string) => {
    if (disabled) return;
    playLetterSound(letter);
  };

  const handleWordLetterClick = (letter: string, letterIndex: number) => {
    if (disabled || letterIndex === missingLetterIndex) return;
    playLetterSound(letter);
  };

  const handleDragStart = (letter: string) => {
    if (disabled) return;
    setDraggedLetter(letter);
  };

  const handleDragEnd = () => {
    setDraggedLetter(null);
  };

  const handleDrop = () => {
    if (!draggedLetter || disabled) return;
    
    const isCorrect = draggedLetter === correctLetter;
    onLetterSelect(draggedLetter, isCorrect);
    setDraggedLetter(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Touch handlers for mobile (iOS compatible)
  const handleTouchStart = (e: React.TouchEvent, letter: string) => {
    if (disabled) return;
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    const offsetX = touch.clientX - (rect.left + rect.width / 2);
    const offsetY = touch.clientY - (rect.top + rect.height / 2);
    
    setTouchDragLetter(letter);
    setDragPreview({ 
      x: rect.left + rect.width / 2, 
      y: rect.top + rect.height / 2, 
      letter,
      offsetX,
      offsetY
    });
    e.stopPropagation();
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragLetter || !dragPreview) return;
    const touch = e.touches[0];
    setDragPreview({ 
      ...dragPreview,
      x: touch.clientX - dragPreview.offsetX, 
      y: touch.clientY - dragPreview.offsetY
    });
    e.stopPropagation();
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent, isDropZone = false) => {
    if (!touchDragLetter) return;
    
    const touch = e.changedTouches?.[0] || e.touches?.[0];
    
    if (isDropZone && touch) {
      const correctLetter = wordArray[missingLetterIndex];
      const isCorrect = touchDragLetter === correctLetter;
      onLetterSelect(touchDragLetter, isCorrect);
    } else if (touch && !isDropZone) {
      // Try to find drop zone under touch point for iOS
      const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropZone = elementUnderTouch?.closest('[data-missing-letter]');
      
      if (dropZone) {
        const correctLetter = wordArray[missingLetterIndex];
        const isCorrect = touchDragLetter === correctLetter;
        onLetterSelect(touchDragLetter, isCorrect);
      }
    }
    
    setTouchDragLetter(null);
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
              rounded-lg border-2 transition-colors no-select
              ${index === missingLetterIndex 
                ? 'border-dashed border-blue-400 bg-blue-50 text-transparent cursor-pointer drop-zone' 
                : 'border-gray-300 bg-white text-gray-800 cursor-pointer hover:bg-blue-50'
              }
            `}
            onClick={index !== missingLetterIndex ? () => handleWordLetterClick(letter, index) : undefined}
            onDrop={index === missingLetterIndex ? handleDrop : undefined}
            onDragOver={index === missingLetterIndex ? handleDragOver : undefined}
            onTouchEnd={index === missingLetterIndex ? (e) => handleTouchEnd(e, true) : undefined}
            data-missing-letter={index === missingLetterIndex ? "true" : undefined}
          >
            {index === missingLetterIndex ? '❓' : letter}
          </motion.div>
        ))}
      </div>

      {/* Letter options */}
      <div className="grid grid-cols-2 gap-4">
        {letterOptions.map((letter, index) => (
          <motion.div
            key={letter}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => handleLetterClick(letter)}
            draggable={!disabled}
            onDragStart={() => handleDragStart(letter)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, letter)}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => handleTouchEnd(e)}
            className={`
              w-20 h-20 text-4xl font-bold rounded-xl transition-all duration-200 cursor-pointer select-none draggable no-select
              ${disabled 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-pink-500'
              }
              flex items-center justify-center
            `}
          >
            {letter}
          </motion.div>
        ))}
      </div>

      {/* Touch Drag Preview */}
      {dragPreview && (
        <motion.div
          className="fixed pointer-events-none z-50 w-20 h-20 bg-purple-500 text-white rounded-xl flex items-center justify-center text-4xl font-bold shadow-2xl border-2 border-purple-300 opacity-90"
          style={{
            left: dragPreview.x - 40,
            top: dragPreview.y - 40,
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 0.1 }}
        >
          {dragPreview.letter}
        </motion.div>
      )}
    </div>
  );
}