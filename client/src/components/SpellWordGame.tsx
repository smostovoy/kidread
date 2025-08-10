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
} from '@dnd-kit/core';

interface SpellWordGameProps {
  word: Word;
  availableLetters: string[];
  onWordComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}


// Draggable Letter Component
function DraggableLetter({ letter, index, disabled, used }: { letter: string, index: number, disabled: boolean, used: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `letter-${index}`,
    data: { letter, index },
    disabled: disabled || used,
  });

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-20 h-20 rounded-xl text-3xl font-black transition-all shadow-lg cursor-pointer select-none ${
        used
          ? 'bg-gray-300 text-gray-600 border-2 border-gray-400 cursor-not-allowed'
          : isDragging
            ? 'bg-blue-400 text-white border-2 border-blue-300 opacity-50'
            : 'bg-blue-500 text-white hover:bg-blue-600 border-2 border-blue-500 hover:border-blue-600'
      }`}
      whileHover={!used && !disabled ? { scale: 1.1 } : {}}
      whileTap={!used && !disabled ? { scale: 0.9 } : {}}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: used ? 0.5 : 1,
      }}
    >
      {letter}
    </motion.div>
  );
}

// Droppable Position Component
function DroppablePosition({ index, letter, isIncorrect, onRemove }: { index: number, letter?: string, isIncorrect: boolean, onRemove: () => void }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `position-${index}`,
    data: { index },
  });

  return (
    <motion.div
      ref={setNodeRef}
      className={`w-20 h-20 border-4 rounded-xl flex items-center justify-center text-4xl font-black text-black shadow-lg transition-all duration-300 ${
        isIncorrect
          ? 'border-red-500 bg-red-100 animate-pulse'
          : letter 
            ? 'border-blue-500 bg-gray-100 cursor-pointer hover:bg-blue-100' 
            : isOver
              ? 'border-green-500 bg-green-50'
              : 'border-dashed border-gray-400 bg-gray-50'
      }`}
      whileHover={{ scale: letter ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={letter ? onRemove : undefined}
      animate={isIncorrect ? { 
        x: [-10, 10, -10, 10, 0],
        scale: [1, 1.1, 1]
      } : {}}
      transition={{ duration: 0.6 }}
    >
      {letter || ''}
    </motion.div>
  );
}

export function SpellWordGame({ word, availableLetters, onWordComplete, disabled }: SpellWordGameProps) {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [usedLetterIndices, setUsedLetterIndices] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  const [incorrectLetterIndex, setIncorrectLetterIndex] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { playLetterSound, playTryAgain } = useAudio();

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
    
    if (!draggedData.letter || dropData?.index === undefined) return;

    const { letter, index: sourceIndex } = draggedData;
    const dropIndex = dropData.index;
    
    // Check if this letter is correct for this position
    const correctLetter = word.word[dropIndex];
    const isCorrect = letter === correctLetter;
    
    if (!isCorrect) {
      // Show red highlight and play error sound
      setIncorrectLetterIndex(dropIndex);
      playTryAgain();
      
      // Remove the highlight after animation
      setTimeout(() => {
        setIncorrectLetterIndex(null);
      }, 800);
      
      return;
    }
    
    // Letter is correct, add it
    const newSelectedLetters = [...selectedLetters];
    newSelectedLetters[dropIndex] = letter;
    
    const newUsedIndices = new Set(Array.from(usedLetterIndices).concat([sourceIndex]));
    
    setSelectedLetters(newSelectedLetters);
    setUsedLetterIndices(newUsedIndices);

    // Check if word is complete
    const filledPositions = newSelectedLetters.filter(l => l).length;
    if (filledPositions === word.word.length) {
      // Show result immediately
      setShowResult('correct');
      
      // Wait a moment to show result, then proceed
      setTimeout(() => {
        setShowResult(null);
        onWordComplete(true);
      }, 1500);
    }
  };

  const getActiveItem = () => {
    if (!activeId) return null;
    const index = parseInt(activeId.replace('letter-', ''));
    return {
      letter: availableLetters[index],
      index
    };
  };

  const handleLetterRemove = (removeIndex: number) => {
    if (disabled || showResult) return;

    const newSelectedLetters = selectedLetters.filter((_, i) => i !== removeIndex);
    
    // Find the letter we're removing and its original index
    const removedLetter = selectedLetters[removeIndex];
    const originalIndex = availableLetters.findIndex((letter, idx) => 
      letter === removedLetter && usedLetterIndices.has(idx)
    );
    
    const newUsedIndices = new Set(Array.from(usedLetterIndices));
    newUsedIndices.delete(originalIndex);
    
    setSelectedLetters(newSelectedLetters);
    setUsedLetterIndices(newUsedIndices);
  };

  const handleBackspace = () => {
    if (disabled || showResult || selectedLetters.length === 0) return;
    
    // Remove the last letter
    const lastIndex = selectedLetters.length - 1;
    const lastLetter = selectedLetters[lastIndex];
    
    // Find the original index of this letter in availableLetters
    const originalIndex = availableLetters.findIndex((letter, idx) => 
      letter === lastLetter && usedLetterIndices.has(idx)
    );
    
    const newSelectedLetters = selectedLetters.slice(0, -1);
    const newUsedIndices = new Set(Array.from(usedLetterIndices));
    newUsedIndices.delete(originalIndex);
    
    setSelectedLetters(newSelectedLetters);
    setUsedLetterIndices(newUsedIndices);
  };

  const getPictureEmoji = (word: Word) => {
    return PICTURE_EMOJIS[word.image] || '❓';
  };

  const handleSpeakerClick = () => {
    if (disabled || showResult) return;
    
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
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        {/* Picture Display */}
        <div className="text-center">
          <div className="text-8xl mb-4">
            {getPictureEmoji(word)}
          </div>
          <motion.div 
            className="text-4xl mb-2 cursor-pointer hover:scale-110 transition-transform"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpeakerClick}
          >
            🔊
          </motion.div>
        </div>

        {/* Selected Letters Display */}
        <div className="flex justify-center gap-3 min-h-[100px] items-center">
          {Array.from({ length: word.word.length }).map((_, index) => (
            <DroppablePosition
              key={index}
              index={index}
              letter={selectedLetters[index]}
              isIncorrect={incorrectLetterIndex === index}
              onRemove={() => handleLetterRemove(index)}
            />
          ))}
          
          {/* Backspace Button */}
          {selectedLetters.length > 0 && !showResult && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBackspace}
              className="w-20 h-20 bg-orange-500 text-white rounded-xl text-3xl font-bold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-500 hover:border-orange-600 ml-2"
              disabled={disabled}
            >
              ⌫
            </motion.button>
          )}
        </div>

        {/* Available Letters */}
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
          {availableLetters.map((letter, index) => (
            <DraggableLetter
              key={index}
              letter={letter}
              index={index}
              disabled={disabled || !!showResult}
              used={usedLetterIndices.has(index)}
            />
          ))}
        </div>

        {/* Result Display */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-4"
          >
            {showResult === 'correct' ? (
              <div className="text-6xl text-green-500">
                <div className="text-8xl mb-2">🎉</div>
              </div>
            ) : (
              <div className="text-6xl text-red-500">
                <div className="text-8xl mb-2">❌</div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{word.word}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Progress indicator */}
        {!showResult && (
          <div className="text-center text-child-text">
            <div className="flex justify-center gap-2">
              {Array.from({ length: word.word.length }).map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${i < selectedLetters.length ? 'bg-blue-500' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className="w-20 h-20 rounded-xl text-3xl font-black bg-blue-400 text-white border-2 border-blue-300 flex items-center justify-center shadow-2xl">
            {activeItem.letter}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}