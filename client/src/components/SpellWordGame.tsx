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
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  const { playLetterSound } = useAudio();

  const handleLetterSelect = (letter: string, index: number) => {
    if (disabled || usedLetterIndices.has(index) || showResult) return;

    playLetterSound(letter);
    
    const newSelectedLetters = [...selectedLetters, letter];
    const newUsedIndices = new Set(Array.from(usedLetterIndices).concat([index]));
    
    setSelectedLetters(newSelectedLetters);
    setUsedLetterIndices(newUsedIndices);

    // Check if word is complete
    if (newSelectedLetters.length === word.word.length) {
      const spelledWord = newSelectedLetters.join('');
      const isCorrect = spelledWord === word.word;
      
      // Show result immediately
      setShowResult(isCorrect ? 'correct' : 'incorrect');
      
      // Wait a moment to show result, then proceed
      setTimeout(() => {
        setShowResult(null);
        onWordComplete(isCorrect);
      }, isCorrect ? 1500 : 2500);
    }
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

  const handlePictureClick = () => {
    if (disabled || showResult) return;
    
    // Use Web Speech API to pronounce the word
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-8">
      {/* Picture Display */}
      <div className="text-center">
        <motion.div 
          className="text-8xl mb-4 cursor-pointer hover:scale-110 transition-transform"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePictureClick}
        >
          {getPictureEmoji(word)}
        </motion.div>
        <div className="text-4xl mb-2">🔊</div>
      </div>

      {/* Selected Letters Display */}
      <div className="flex justify-center gap-3 min-h-[100px] items-center">
        {Array.from({ length: word.word.length }).map((_, index) => (
          <motion.div
            key={index}
            className="w-20 h-20 border-4 border-blue-500 rounded-xl flex items-center justify-center bg-gray-100 text-4xl font-black text-black cursor-pointer hover:bg-blue-100 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectedLetters[index] && handleLetterRemove(index)}
          >
            {selectedLetters[index] || ''}
          </motion.div>
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
      <div className="grid grid-cols-5 gap-4 max-w-lg mx-auto">
        {availableLetters.map((letter, index) => (
          <motion.button
            key={index}
            className={`w-20 h-20 rounded-xl text-3xl font-black transition-all shadow-lg ${
              usedLetterIndices.has(index)
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed border-2 border-gray-400'
                : 'bg-blue-500 text-white hover:bg-blue-600 border-2 border-blue-500 hover:border-blue-600'
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
  );
}