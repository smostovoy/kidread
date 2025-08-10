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

interface MissingLetterGameProps {
  word: Word;
  letterOptions: string[];
  missingLetterIndex: number;
  onLetterSelect: (letter: string, isCorrect: boolean) => void;
  disabled?: boolean;
}


// Draggable Letter Option Component
function DraggableMissingLetter({ letter, index, disabled }: { letter: string, index: number, disabled: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `missing-letter-${index}`,
    data: { letter, index },
    disabled,
  });

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`draggable-element w-20 h-20 text-4xl font-bold rounded-xl transition-all duration-200 cursor-pointer select-none ${
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

// Droppable Missing Letter Slot Component
function MissingLetterSlot({ isDropZone }: { isDropZone: boolean }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'missing-letter-slot',
    data: { isMissingSlot: true },
    disabled: !isDropZone,
  });

  return (
    <motion.div
      ref={isDropZone ? setNodeRef : undefined}
      className={`w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 transition-all duration-200 ${
        isDropZone
          ? isOver
            ? 'border-green-500 bg-green-50 text-green-600'
            : 'border-dashed border-red-400 bg-red-50 text-red-600'
          : 'border-gray-300 bg-white text-gray-800'
      }`}
      whileHover={isDropZone ? { scale: 1.05 } : {}}
      animate={isDropZone && isOver ? { scale: 1.1 } : { scale: 1 }}
    >
      ?
    </motion.div>
  );
}

export function MissingLetterGame({ word, letterOptions, missingLetterIndex, onLetterSelect, disabled }: MissingLetterGameProps) {
  const { playLetterSound, playTryAgain } = useAudio();
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
  
  const wordArray = word.word.split('');
  const correctLetter = wordArray[missingLetterIndex];
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
    
    // Check if dropped on missing letter slot
    if (dropData?.isMissingSlot && draggedData.letter) {
      const isCorrect = draggedData.letter === correctLetter;
      onLetterSelect(draggedData.letter, isCorrect);
    }
  };

  const getActiveItem = () => {
    if (!activeId) return null;
    const index = parseInt(activeId.replace('missing-letter-', ''));
    return {
      letter: letterOptions[index],
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

        {/* Word with Missing Letter */}
        <div className="flex gap-2 mb-8">
          {wordArray.map((letter, index) => (
            <motion.div
              key={index}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {index === missingLetterIndex ? (
                <MissingLetterSlot isDropZone={!disabled} />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 border-gray-300 bg-white text-gray-800">
                  {letter}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Letter Options */}
        <div className="flex gap-4">
          {letterOptions.map((letter, index) => (
            <DraggableMissingLetter
              key={index}
              letter={letter}
              index={index}
              disabled={disabled || false}
            />
          ))}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className="w-20 h-20 text-4xl font-bold rounded-xl bg-purple-400 text-white shadow-2xl flex items-center justify-center">
            {activeItem.letter}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}