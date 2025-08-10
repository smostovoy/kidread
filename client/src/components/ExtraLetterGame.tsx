import { motion } from "framer-motion";
import { useState } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { PICTURE_EMOJIS } from "@/lib/constants";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

interface ExtraLetterGameProps {
  word: Word;
  wordWithExtraLetter: string;
  extraLetterIndex: number;
  onLetterRemove: (index: number, isCorrect: boolean) => void;
  disabled?: boolean;
}


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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`draggable-element w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 transition-all duration-200 cursor-pointer select-none ${
        disabled 
          ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
          : isDragging
            ? 'border-red-400 bg-red-50 text-red-600 opacity-50'
            : 'border-gray-300 bg-white text-gray-800 hover:border-red-400 hover:bg-red-50 hover:text-red-600'
      }`}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
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

  // Configure sensors for better touch support
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 50,
      tolerance: 3,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);
  
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
    if (dropData?.isTrash && draggedData.index !== undefined) {
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

  const activeItem = getActiveItem();

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
            <DraggableExtraLetter
              key={index}
              letter={letter}
              index={index}
              disabled={disabled || false}
            />
          ))}
        </div>

        {/* Trash Zone */}
        <TrashZone />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className="w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 border-red-400 bg-red-50 text-red-600 shadow-2xl">
            {activeItem.letter}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}