import { motion } from "framer-motion";
import { useState } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';

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

// Draggable Letter Component for Extra Letter Game
function DraggableExtraLetter({ letter, index, disabled }: { letter: string, index: number, disabled: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `extra-letter-${index}`,
    data: { letter, index },
    disabled,
  });

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-20 h-20 text-4xl font-bold rounded-xl transition-all duration-200 cursor-pointer select-none ${
        disabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : isDragging
            ? 'bg-purple-400 text-white shadow-lg opacity-50'
            : 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-pink-500'
      }`}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {letter}
    </motion.div>
  );
}

// Droppable Trash Zone Component
function TrashZone() {
  const { isOver, setNodeRef } = useDroppable({
    id: 'trash-zone',
    data: { isTrash: true },
  });

  return (
    <motion.div
      ref={setNodeRef}
      className={`w-32 h-32 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center text-center transition-all duration-300 ${
        isOver 
          ? 'border-red-500 bg-red-50 text-red-600' 
          : 'border-gray-400 bg-gray-50 text-gray-500'
      }`}
      whileHover={{ scale: 1.05 }}
      animate={isOver ? { scale: 1.1 } : { scale: 1 }}
    >
      <div className="text-4xl mb-2">🗑️</div>
      <div className="text-sm font-medium">Drop extra letter here</div>
    </motion.div>
  );
}

export function ExtraLetterGame({ word, wordWithExtraLetter, extraLetterIndex, onLetterRemove, disabled }: ExtraLetterGameProps) {
  const { playLetterSound } = useAudio();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const wordArray = wordWithExtraLetter.split('');
  const emoji = PICTURE_EMOJIS[word.image] || '❓';

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const data = event.active.data.current;
    if (data?.letter) {
      playLetterSound(data.letter);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !active.data.current) return;

    const draggedData = active.data.current;
    const dropData = over.data.current;
    
    // Check if dropped on trash zone
    if (dropData.isTrash && draggedData.index !== undefined) {
      const isCorrect = draggedData.index === extraLetterIndex;
      onLetterRemove(draggedData.index, isCorrect);
    }
  };

  const getActiveItem = () => {
    if (!activeId) return null;
    const index = parseInt(activeId.replace('extra-letter-', ''));
    return {
      letter: wordArray[index],
      index
    };
  };

  // Touch handlers for mobile (iOS compatible)
  const handleTouchStart = (e: React.TouchEvent, letterIndex: number) => {
    if (disabled) return;
    const letter = wordArray[letterIndex];
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    
    setTouchDragData({ letter, index: letterIndex });
    setDragPreview({ 
      x: rect.left, 
      y: rect.top, 
      letter,
      offsetX,
      offsetY,
      width: rect.width,
      height: rect.height
    });
    e.stopPropagation();
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragData || !dragPreview) return;
    const touch = e.touches[0];
    setDragPreview({ 
      ...dragPreview,
      x: touch.clientX - dragPreview.offsetX, 
      y: touch.clientY - dragPreview.offsetY
    });
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
          className="fixed pointer-events-none z-50 bg-red-500 text-white rounded-xl flex items-center justify-center font-bold shadow-2xl border-2 border-red-300 opacity-90"
          style={{
            left: dragPreview.x,
            top: dragPreview.y,
            width: dragPreview.width,
            height: dragPreview.height,
            fontSize: `${Math.min(dragPreview.width, dragPreview.height) * 0.4}px`,
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