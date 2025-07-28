import { motion } from "framer-motion";
import { useState } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";

interface SpellWordGameProps {
  word: Word;
  availableLetters: string[];
  onWordComplete: (isCorrect: boolean) => void;
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
  'mouse': '🐭',
  'frog': '🐸',
  'butterfly': '🦋',
};

export function SpellWordGame({ word, availableLetters, onWordComplete, disabled }: SpellWordGameProps) {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [usedLetterIndices, setUsedLetterIndices] = useState<Set<number>>(new Set());
  const { playLetterSound } = useAudio();

  const handleLetterSelect = (letter: string, index: number) => {
    if (disabled || usedLetterIndices.has(index)) return;

    playLetterSound(letter);
    
    const newSelectedLetters = [...selectedLetters, letter];
    const newUsedIndices = new Set(Array.from(usedLetterIndices).concat([index]));
    
    setSelectedLetters(newSelectedLetters);
    setUsedLetterIndices(newUsedIndices);

    // Check if word is complete
    if (newSelectedLetters.length === word.word.length) {
      const spelledWord = newSelectedLetters.join('');
      const isCorrect = spelledWord === word.word;
      
      setTimeout(() => {
        onWordComplete(isCorrect);
      }, 500);
    }
  };

  const handleLetterRemove = (removeIndex: number) => {
    if (disabled) return;

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

  const getPictureEmoji = (word: Word) => {
    return PICTURE_EMOJIS[word.image] || '❓';
  };

  return (
    <div className="space-y-8">
      {/* Picture Display */}
      <div className="text-center">
        <div className="text-8xl mb-4">{getPictureEmoji(word)}</div>
        <p className="text-xl text-child-text">Составь слово по картинке</p>
      </div>

      {/* Selected Letters Display */}
      <div className="flex justify-center gap-3 min-h-[100px] items-center">
        {Array.from({ length: word.word.length }).map((_, index) => (
          <motion.div
            key={index}
            className="w-20 h-20 border-4 border-child-primary rounded-xl flex items-center justify-center bg-white text-4xl font-black cursor-pointer hover:bg-child-secondary/20 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectedLetters[index] && handleLetterRemove(index)}
          >
            {selectedLetters[index] || ''}
          </motion.div>
        ))}
      </div>

      {/* Available Letters */}
      <div className="grid grid-cols-5 gap-4 max-w-lg mx-auto">
        {availableLetters.map((letter, index) => (
          <motion.button
            key={index}
            className={`w-20 h-20 rounded-xl text-3xl font-black transition-all shadow-lg ${
              usedLetterIndices.has(index)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-400'
                : 'bg-child-primary text-white hover:bg-child-primary/80 border-2 border-child-primary hover:border-child-primary/80'
            }`}
            whileHover={!usedLetterIndices.has(index) && !disabled ? { scale: 1.1 } : {}}
            whileTap={!usedLetterIndices.has(index) && !disabled ? { scale: 0.9 } : {}}
            onClick={() => !usedLetterIndices.has(index) && handleLetterSelect(letter, index)}
            disabled={disabled || usedLetterIndices.has(index)}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="text-center text-child-text">
        <p className="text-xl font-bold">{selectedLetters.length} / {word.word.length} букв</p>
      </div>
    </div>
  );
}