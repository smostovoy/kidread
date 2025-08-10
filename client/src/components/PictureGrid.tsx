import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { PICTURE_EMOJIS, ANIMATION_VARIANTS, GAME_CONFIG } from "@/lib/constants";

interface PictureGridProps {
  correctWord: Word;
  distractors: Word[];
  onPictureSelect: (word: Word, isCorrect: boolean) => void;
  disabled?: boolean;
  selectedPicture?: Word | null;
}

export function PictureGrid({ 
  correctWord, 
  distractors, 
  onPictureSelect, 
  disabled,
  selectedPicture 
}: PictureGridProps) {
  const { playTryAgain } = useAudio();

  // Memoize shuffled options to prevent unnecessary reshuffling
  const shuffledOptions = useMemo(() => {
    if (correctWord && distractors.length > 0) {
      const allOptions = [correctWord, ...distractors];
      return [...allOptions].sort(() => Math.random() - 0.5);
    }
    return [];
  }, [correctWord.id, distractors.length]);

  const handlePictureClick = useCallback((word: Word) => {
    if (disabled) return;
    
    const isCorrect = word.id === correctWord.id;
    if (!isCorrect) {
      playTryAgain();
    }
    onPictureSelect(word, isCorrect);
  }, [disabled, correctWord.id, playTryAgain, onPictureSelect]);

  // Memoize grid classes to prevent recalculation
  const gridClasses = useMemo(() => {
    const optionCount = shuffledOptions.length;
    if (optionCount <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (optionCount <= 4) return "grid-cols-2 sm:grid-cols-4";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  }, [shuffledOptions.length]);

  if (!correctWord || shuffledOptions.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className={`grid ${gridClasses} gap-4 sm:gap-6 max-w-4xl mx-auto`}
      {...ANIMATION_VARIANTS.stagger}
    >
      {shuffledOptions.map((word, index) => {
        const isCorrect = word.id === correctWord.id;
        const isSelected = selectedPicture?.id === word.id;
        const showFeedback = isSelected && selectedPicture;
        
        return (
          <motion.div
            key={word.id}
            onClick={() => handlePictureClick(word)}
            className={`
              picture-option card-modern aspect-square p-4 sm:p-6 cursor-pointer 
              transition-all duration-300 gpu-accelerated select-none
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              ${showFeedback ? (isCorrect ? 'correct' : 'incorrect') : ''}
              ${isSelected ? 'ring-4 ring-offset-2' : ''}
            `}
            variants={ANIMATION_VARIANTS.fadeIn}
            custom={index}
            initial="initial"
            animate="animate"
            whileHover={disabled ? {} : { 
              scale: 1.05, 
              y: -4,
              transition: { duration: 0.2 }
            }}
            whileTap={disabled ? {} : { 
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.3,
              ease: [0.19, 1, 0.22, 1]
            }}
          >
            <div className="w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
              {/* Background glow effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Emoji */}
              <motion.span 
                className="text-4xl sm:text-6xl relative z-10"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                }}
              >
                {PICTURE_EMOJIS[word.image] || '❓'}
              </motion.span>
              
              {/* Success/Error overlay */}
              {showFeedback && (
                <motion.div
                  className={`
                    absolute inset-0 flex items-center justify-center text-4xl font-bold
                    ${isCorrect ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}
                  `}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isCorrect ? '✅' : '❌'}
                </motion.div>
              )}
            </div>
            
          </motion.div>
        );
      })}
    </motion.div>
  );
}
